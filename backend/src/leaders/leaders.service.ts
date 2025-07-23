// backend/src/leaders/leaders.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Like, In } from 'typeorm';
import { Leader } from './entities/leader.entity';
import { Group } from '../groups/entities/group.entity';
import { CreateLeaderDto, UpdateLeaderDto, LeaderFiltersDto, LeaderStatsDto } from './dto/leader.dto';
import { Planillado } from '../planillados/entities/planillado.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PlanilladosService } from 'src/planillados/planillados.service';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable()
export class LeadersService {
  constructor(
    @InjectRepository(Planillado)
    private planilladoRepository: Repository<Planillado>,
    @InjectRepository(Leader)
    private leaderRepository: Repository<Leader>,
    private planilladosService: PlanilladosService, // ✅ Inyectar servicio de planillados
    private eventEmitter: EventEmitter2,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
  ) {}

  // ✅ Obtener todos los líderes con filtros y paginación - CORREGIDO
  async findAll(
  filters: LeaderFiltersDto = {}, 
  page: number = 1, 
  limit: number = 20
): Promise<PaginatedResponse<Leader>> {
  try {
    // Crear query builder con filtros
    const queryBuilder = this.createQueryBuilder(filters);
    
    // Incluir relaciones
    queryBuilder.leftJoinAndSelect('leader.group', 'group');
    queryBuilder.leftJoinAndSelect('leader.planillados', 'planillados');
    
    // Contar planillados para cada líder
    queryBuilder.loadRelationCountAndMap('leader.planilladosCount', 'leader.planillados');
    
    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    // Ordenamiento
    queryBuilder.orderBy('leader.firstName', 'ASC');
    queryBuilder.addOrderBy('leader.lastName', 'ASC');
    
    // Ejecutar consulta
    const [leaders, total] = await queryBuilder.getManyAndCount();

    return {
      data: leaders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error('Error en findAll:', error);
    throw error;
  }
}

  // ✅ Obtener estadísticas de líderes
  async getStats(filters: LeaderFiltersDto = {}): Promise<LeaderStatsDto> {
    try {
      console.log('Calculando estadísticas con filtros:', filters);

      // Query base con filtros
      const queryBuilder = this.createQueryBuilder(filters);
      
      // 1. Estadísticas básicas
      const totalQuery = queryBuilder.clone();
      const total = await totalQuery.getCount();

      const activosQuery = queryBuilder.clone();
      activosQuery.andWhere('leader.isActive = :isActive', { isActive: true });
      const activos = await activosQuery.getCount();

      const verificadosQuery = queryBuilder.clone();
      verificadosQuery.andWhere('leader.isVerified = :isVerified', { isVerified: true });
      const verificados = await verificadosQuery.getCount();

      // 2. Promedio de planillados por líder
      let promedioVotantes = 0;
      if (total > 0) {
        const avgQuery = this.planilladoRepository
          .createQueryBuilder('planillado')
          .select('COUNT(planillado.id)', 'count')
          .leftJoin('planillado.lider', 'leader');

        // Aplicar los mismos filtros que en el query principal
        if (filters.buscar) {
          avgQuery.andWhere(
            '(leader.firstName LIKE :search OR leader.lastName LIKE :search OR leader.cedula LIKE :search)',
            { search: `%${filters.buscar}%` }
          );
        }
        if (filters.isActive !== undefined) {
          avgQuery.andWhere('leader.isActive = :isActive', { isActive: filters.isActive });
        }
        if (filters.isVerified !== undefined) {
          avgQuery.andWhere('leader.isVerified = :isVerified', { isVerified: filters.isVerified });
        }
        if (filters.groupId) {
          avgQuery.andWhere('leader.groupId = :groupId', { groupId: filters.groupId });
        }
        if (filters.neighborhood) {
          avgQuery.andWhere('leader.neighborhood = :neighborhood', { neighborhood: filters.neighborhood });
        }
        if (filters.municipality) {
          avgQuery.andWhere('leader.municipality = :municipality', { municipality: filters.municipality });
        }
        if (filters.gender) {
          avgQuery.andWhere('leader.gender = :gender', { gender: filters.gender });
        }

        const avgResult = await avgQuery.getRawOne();
        promedioVotantes = Math.round((avgResult?.count || 0) / total);
      }

      // 3. Estadísticas por grupo
      const porGrupoQuery = this.leaderRepository
        .createQueryBuilder('leader')
        .select('group.name', 'groupName')
        .addSelect('COUNT(leader.id)', 'count')
        .leftJoin('leader.group', 'group')
        .groupBy('group.id')
        .addGroupBy('group.name');

      // Aplicar filtros a estadísticas por grupo
      if (filters.buscar) {
        porGrupoQuery.andWhere(
          '(leader.firstName LIKE :search OR leader.lastName LIKE :search OR leader.cedula LIKE :search)',
          { search: `%${filters.buscar}%` }
        );
      }
      if (filters.isActive !== undefined) {
        porGrupoQuery.andWhere('leader.isActive = :isActive', { isActive: filters.isActive });
      }
      if (filters.isVerified !== undefined) {
        porGrupoQuery.andWhere('leader.isVerified = :isVerified', { isVerified: filters.isVerified });
      }
      if (filters.neighborhood) {
        porGrupoQuery.andWhere('leader.neighborhood = :neighborhood', { neighborhood: filters.neighborhood });
      }
      if (filters.municipality) {
        porGrupoQuery.andWhere('leader.municipality = :municipality', { municipality: filters.municipality });
      }
      if (filters.gender) {
        porGrupoQuery.andWhere('leader.gender = :gender', { gender: filters.gender });
      }

      const porGrupoRaw = await porGrupoQuery.getRawMany();
      const porGrupo = porGrupoRaw.reduce((acc, item) => {
        acc[item.groupName || 'Sin Grupo'] = parseInt(item.count);
        return acc;
      }, {});

      // 4. Estadísticas por barrio
      const porBarrioQuery = this.leaderRepository
        .createQueryBuilder('leader')
        .select('leader.neighborhood', 'neighborhood')
        .addSelect('COUNT(leader.id)', 'count')
        .where('leader.neighborhood IS NOT NULL')
        .groupBy('leader.neighborhood');

      // Aplicar filtros a estadísticas por barrio
      if (filters.buscar) {
        porBarrioQuery.andWhere(
          '(leader.firstName LIKE :search OR leader.lastName LIKE :search OR leader.cedula LIKE :search)',
          { search: `%${filters.buscar}%` }
        );
      }
      if (filters.isActive !== undefined) {
        porBarrioQuery.andWhere('leader.isActive = :isActive', { isActive: filters.isActive });
      }
      if (filters.isVerified !== undefined) {
        porBarrioQuery.andWhere('leader.isVerified = :isVerified', { isVerified: filters.isVerified });
      }
      if (filters.groupId) {
        porBarrioQuery.andWhere('leader.groupId = :groupId', { groupId: filters.groupId });
      }
      if (filters.municipality) {
        porBarrioQuery.andWhere('leader.municipality = :municipality', { municipality: filters.municipality });
      }
      if (filters.gender) {
        porBarrioQuery.andWhere('leader.gender = :gender', { gender: filters.gender });
      }

      const porBarrioRaw = await porBarrioQuery.getRawMany();
      const porBarrio = porBarrioRaw.reduce((acc, item) => {
        acc[item.neighborhood] = parseInt(item.count);
        return acc;
      }, {});

      // 5. Top líderes (por cantidad de planillados)
      const topLideresQuery = this.leaderRepository
        .createQueryBuilder('leader')
        .select('CONCAT(leader.firstName, " ", leader.lastName)', 'name')
        .addSelect('COUNT(planillado.id)', 'count')
        .leftJoin('leader.planillados', 'planillado')
        .groupBy('leader.id')
        .orderBy('COUNT(planillado.id)', 'DESC')
        .limit(10);

      // Aplicar filtros a top líderes
      if (filters.buscar) {
        topLideresQuery.andWhere(
          '(leader.firstName LIKE :search OR leader.lastName LIKE :search OR leader.cedula LIKE :search)',
          { search: `%${filters.buscar}%` }
        );
      }
      if (filters.isActive !== undefined) {
        topLideresQuery.andWhere('leader.isActive = :isActive', { isActive: filters.isActive });
      }
      if (filters.isVerified !== undefined) {
        topLideresQuery.andWhere('leader.isVerified = :isVerified', { isVerified: filters.isVerified });
      }
      if (filters.groupId) {
        topLideresQuery.andWhere('leader.groupId = :groupId', { groupId: filters.groupId });
      }
      if (filters.neighborhood) {
        topLideresQuery.andWhere('leader.neighborhood = :neighborhood', { neighborhood: filters.neighborhood });
      }
      if (filters.municipality) {
        topLideresQuery.andWhere('leader.municipality = :municipality', { municipality: filters.municipality });
      }
      if (filters.gender) {
        topLideresQuery.andWhere('leader.gender = :gender', { gender: filters.gender });
      }

      const topLideresRaw = await topLideresQuery.getRawMany();
      const topLideres = topLideresRaw.reduce((acc, item) => {
        acc[item.name] = parseInt(item.count);
        return acc;
      }, {});

      const stats: LeaderStatsDto = {
        total,
        activos,
        verificados,
        promedioVotantes,
        porGrupo,
        porBarrio,
        topLideres,
      };

      console.log('Estadísticas calculadas:', stats);
      return stats;

    } catch (error) {
      console.error('Error calculando estadísticas de líderes:', error);
      throw new Error('Error interno al calcular estadísticas');
    }
  }

  // ✅ Query builder con filtros
  private createQueryBuilder(filters: LeaderFiltersDto): SelectQueryBuilder<Leader> {
    const queryBuilder = this.leaderRepository.createQueryBuilder('leader');
    
    // Aplicar filtros
    if (filters.buscar) {
      queryBuilder.andWhere(
        '(leader.firstName LIKE :search OR leader.lastName LIKE :search OR leader.cedula LIKE :search)',
        { search: `%${filters.buscar}%` }
      );
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('leader.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.isVerified !== undefined) {
      queryBuilder.andWhere('leader.isVerified = :isVerified', { isVerified: filters.isVerified });
    }

    if (filters.groupId) {
      queryBuilder.andWhere('leader.groupId = :groupId', { groupId: filters.groupId });
    }

    if (filters.neighborhood) {
      queryBuilder.andWhere('leader.neighborhood = :neighborhood', { neighborhood: filters.neighborhood });
    }

    if (filters.municipality) {
      queryBuilder.andWhere('leader.municipality = :municipality', { municipality: filters.municipality });
    }

    if (filters.gender) {
      queryBuilder.andWhere('leader.gender = :gender', { gender: filters.gender });
    }

    if (filters.fechaDesde) {
      queryBuilder.andWhere('leader.createdAt >= :fechaDesde', { fechaDesde: filters.fechaDesde });
    }

    if (filters.fechaHasta) {
      queryBuilder.andWhere('leader.createdAt <= :fechaHasta', { fechaHasta: filters.fechaHasta });
    }

    return queryBuilder;
  }

  // ✅ Obtener líder por ID
  async findOne(id: number): Promise<Leader> {
    try {
      const leader = await this.leaderRepository.findOne({
        where: { id },
        relations: ['group', 'planillados']
      });

      if (!leader) {
        throw new NotFoundException(`Líder con ID ${id} no encontrado`);
      }

      return leader;
    } catch (error) {
      throw error;
    }
  }

  // ✅ Obtener planillados del líder
  async getPlanillados(id: number): Promise<Planillado[]> {
    const leader = await this.leaderRepository.findOne({
      where: { id },
      relations: ['planillados'], // ✅ CAMBIÉ 'voters' por 'planillados'
    });

    if (!leader) {
      throw new NotFoundException(`Líder con ID ${id} no encontrado`);
    }

    return leader.planillados || [];
  }

  // ✅ Crear nuevo líder
  async create(createLeaderDto: CreateLeaderDto): Promise<Leader> {
    try {
      // 1. Verificar si ya existe un líder con esa cédula
      const existingLeader = await this.leaderRepository.findOne({
        where: { cedula: createLeaderDto.cedula }
      });

      if (existingLeader) {
        throw new ConflictException(`Ya existe un líder con la cédula ${createLeaderDto.cedula}`);
      }

      // 2. Crear el líder
      const leader = this.leaderRepository.create(createLeaderDto);
      const savedLeader = await this.leaderRepository.save(leader);

      console.log(`✅ Líder creado: ${savedLeader.firstName} ${savedLeader.lastName} (${savedLeader.cedula})`);

      // 3. ✅ NUEVA FUNCIONALIDAD - Verificar planillados pendientes
      const planilladosPendientes = await this.planilladosService.getPlanilladosPendientesByLiderCedula(
        createLeaderDto.cedula
      );

      // 4. Si hay planillados pendientes, emitir evento para notificación
      if (planilladosPendientes.length > 0) {
        console.log(`🔔 Se encontraron ${planilladosPendientes.length} planillados pendientes para líder ${savedLeader.firstName} ${savedLeader.lastName}`);
        
        // Emitir evento que será capturado por WebSocket Gateway
        this.eventEmitter.emit('leader.created.with.pending.planillados', {
          leader: {
            id: savedLeader.id,
            cedula: savedLeader.cedula,
            firstName: savedLeader.firstName,
            lastName: savedLeader.lastName,
            email: savedLeader.email,
            phone: savedLeader.phone
          },
          planilladosPendientes: planilladosPendientes.map(p => ({
            id: p.id,
            cedula: p.cedula,
            nombres: p.nombres,
            apellidos: p.apellidos,
            cedulaLiderPendiente: p.cedulaLiderPendiente
          })),
          count: planilladosPendientes.length,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log(`ℹ️ No se encontraron planillados pendientes para líder ${savedLeader.firstName} ${savedLeader.lastName}`);
      }

      return savedLeader;

    } catch (error) {
      console.error('❌ Error al crear líder:', error.message);
      throw error;
    }
  }

  async getEstadisticasPlanillados(liderId: number): Promise<{
  asignados: number;
  pendientes: number;
  verificados: number;
  sinVerificar: number;
}> {
  try {
    const leader = await this.findOne(liderId);
    
    // Obtener estadísticas directamente desde la base de datos
    const asignados = await this.planilladoRepository.count({
      where: { liderId }
    });
    
    const verificados = await this.planilladoRepository.count({
      where: { liderId, estado: 'verificado' }
    });
    
    const pendientes = await this.planilladoRepository.count({
      where: { liderId, estado: 'pendiente' }
    });
    
    return {
      asignados,
      pendientes: pendientes,
      verificados,
      sinVerificar: asignados - verificados
    };
  } catch (error) {
    throw error;
  }
}

  /**
   * Verificar si un líder tiene planillados pendientes de asignar
   */
  async verificarPlanilladosPendientes(cedula: string): Promise<{
    tienePendientes: boolean;
    cantidad: number;
    planillados: any[];
  }> {
    try {
      const planillados = await this.planilladosService.getPlanilladosPendientesByLiderCedula(cedula);
      
      return {
        tienePendientes: planillados.length > 0,
        cantidad: planillados.length,
        planillados: planillados.map(p => ({
          id: p.id,
          cedula: p.cedula,
          nombreCompleto: `${p.nombres} ${p.apellidos}`
        }))
      };
    } catch (error) {
      throw error;
    }
  }

  // ✅ Actualizar líder
  async update(id: number, updateLeaderDto: UpdateLeaderDto): Promise<Leader> {
    try {
      const leader = await this.findOne(id);
      
      // Si se actualiza la cédula, verificar que no exista otra con esa cédula
      if (updateLeaderDto.cedula && updateLeaderDto.cedula !== leader.cedula) {
        const existingLeader = await this.leaderRepository.findOne({
          where: { cedula: updateLeaderDto.cedula }
        });

        if (existingLeader) {
          throw new ConflictException(`Ya existe un líder con la cédula ${updateLeaderDto.cedula}`);
        }
      }

      Object.assign(leader, updateLeaderDto);
      return await this.leaderRepository.save(leader);
    } catch (error) {
      throw error;
    }
  }

  // ✅ Eliminar líder
  async remove(id: number): Promise<void> {
    try {
      const leader = await this.findOne(id);
      await this.leaderRepository.remove(leader);
      console.log(`✅ Líder eliminado: ${leader.firstName} ${leader.lastName}`);
    } catch (error) {
      throw error;
    }
  }

  // ✅ Obtener líderes para select
  async findForSelect(): Promise<{ id: number; name: string; groupName?: string }[]> {
    const leaders = await this.leaderRepository.find({
      where: { isActive: true },
      relations: ['group'],
      order: { firstName: 'ASC' },
    });

    return leaders.map(leader => ({
      id: leader.id,
      name: `${leader.firstName} ${leader.lastName}`,
      groupName: leader.group?.name,
    }));
  }

  async findByCedula(cedula: string): Promise<Leader | null> {
    try {
      return await this.leaderRepository.findOne({
        where: { cedula },
        relations: ['group', 'planillados']
      });
    } catch (error) {
      throw error;
    }
  }

  // ✅ Acciones masivas
  async bulkAction(action: string, ids: number[], groupId?: number): Promise<{ affected: number }> {
    let affected = 0;

    switch (action) {
      case 'activate':
        const activateResult = await this.leaderRepository.update(
          { id: In(ids) },
          { isActive: true }
        );
        affected = activateResult.affected || 0;
        break;

      case 'deactivate':
        const deactivateResult = await this.leaderRepository.update(
          { id: In(ids) },
          { isActive: false }
        );
        affected = deactivateResult.affected || 0;
        break;

      case 'verify':
        const verifyResult = await this.leaderRepository.update(
          { id: In(ids) },
          { isVerified: true }
        );
        affected = verifyResult.affected || 0;
        break;

      case 'unverify':
        const unverifyResult = await this.leaderRepository.update(
          { id: In(ids) },
          { isVerified: false }
        );
        affected = unverifyResult.affected || 0;
        break;

      case 'assignGroup':
        if (!groupId) {
          throw new BadRequestException('groupId es requerido para asignar grupo');
        }
        const group = await this.groupRepository.findOne({ where: { id: groupId } });
        if (!group) {
          throw new BadRequestException('El grupo especificado no existe');
        }
        const assignResult = await this.leaderRepository.update(
          { id: In(ids) },
          { groupId }
        );
        affected = assignResult.affected || 0;
        break;

      case 'delete':
        const deleteResult = await this.leaderRepository.delete({ id: In(ids) });
        affected = deleteResult.affected || 0;
        break;

      default:
        throw new BadRequestException(`Acción no válida: ${action}`);
    }

    return { affected };
  }
  async bulkActivate(ids: number[]): Promise<{ affected: number }> {
    const result = await this.leaderRepository.update(
      { id: In(ids) },
      { isActive: true }
    );
    return { affected: result.affected || 0 };
  }

  async bulkDeactivate(ids: number[]): Promise<{ affected: number }> {
    const result = await this.leaderRepository.update(
      { id: In(ids) },
      { isActive: false }
    );
    return { affected: result.affected || 0 };
  }

  async bulkVerify(ids: number[]): Promise<{ affected: number }> {
    const result = await this.leaderRepository.update(
      { id: In(ids) },
      { isVerified: true }
    );
    return { affected: result.affected || 0 };
  }

  async bulkDelete(ids: number[]): Promise<{ affected: number }> {
    // Verificar que ningún líder tenga planillados asignados
    for (const id of ids) {
      const planilladosCount = await this.planilladoRepository.count({
        where: { liderId: id },
      });

      if (planilladosCount > 0) {
        const leader = await this.leaderRepository.findOne({ where: { id } });
        throw new BadRequestException(
          `No se puede eliminar el líder ${leader?.firstName} ${leader?.lastName} porque tiene ${planilladosCount} planillados asignados.`
        );
      }
    }

    const result = await this.leaderRepository.delete({ id: In(ids) });
    return { affected: result.affected || 0 };
  }

  async bulkAssignGroup(ids: number[], groupId: number): Promise<{ affected: number }> {
    // Verificar que el grupo existe
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Grupo con ID ${groupId} no encontrado`);
    }

    const result = await this.leaderRepository.update(
      { id: In(ids) },
      { groupId }
    );
    return { affected: result.affected || 0 };
  }

  // ✅ Verificar duplicados por cédula
  async checkDuplicates(cedula: string): Promise<{
    exists: boolean;
    leader?: {
      id: number;
      cedula: string;
      firstName: string;
      lastName: string;
      isActive: boolean;
    };
  }> {
    const existingLeader = await this.leaderRepository.findOne({
      where: { cedula },
      select: ['id', 'cedula', 'firstName', 'lastName', 'isActive'],
    });

    if (existingLeader) {
      return {
        exists: true,
        leader: existingLeader,
      };
    }

    return { exists: false };
  }

  async getActiveLeadersCount(): Promise<number> {
    return await this.leaderRepository.count({ where: { isActive: true } });
  }

  async searchLeaders(query: string): Promise<Leader[]> {
    return await this.leaderRepository.createQueryBuilder('leader')
      .where('leader.firstName ILIKE :query OR leader.lastName ILIKE :query OR leader.cedula ILIKE :query', {
        query: `%${query}%`
      })
      .limit(10)
      .getMany();
  }

  // ✅ Exportar líderes a Excel (corregido)
  async exportToExcel(filters: LeaderFiltersDto): Promise<Leader[]> {
    const queryBuilder = this.createQueryBuilder(filters);
    queryBuilder.leftJoinAndSelect('leader.group', 'group');
    // ✅ CAMBIO: mismo mapeo corregido
    queryBuilder.loadRelationCountAndMap('leader.planilladosCount', 'leader.planillados');
    queryBuilder.orderBy('leader.lastName', 'ASC');
    queryBuilder.addOrderBy('leader.firstName', 'ASC');

    return queryBuilder.getMany();
  }

  // ✅ Validar datos de líder (método adicional si lo necesitas)
  async validate(data: Partial<Leader>): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar cédula
    if (data.cedula) {
      if (!/^\d{6,15}$/.test(data.cedula)) {
        errors.push('La cédula debe tener entre 6 y 15 dígitos');
      }

      // Verificar duplicados
      const existing = await this.leaderRepository.findOne({
        where: { cedula: data.cedula },
      });
      if (existing) {
        errors.push('Ya existe un líder con esa cédula');
      }
    }

    // Validar nombres
    if (data.firstName && data.firstName.length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (data.lastName && data.lastName.length < 2) {
      errors.push('El apellido debe tener al menos 2 caracteres');
    }

    // Validar email
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('El formato del email no es válido');
      }
    }

    // Validar teléfono
    if (data.phone) {
      if (!/^\d{7,15}$/.test(data.phone.replace(/\s/g, ''))) {
        warnings.push('El formato del teléfono podría no ser válido');
      }
    }

    // Validar grupo
    if (data.groupId) {
      const group = await this.groupRepository.findOne({
        where: { id: data.groupId },
      });
      if (!group) {
        errors.push('El grupo especificado no existe');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}