// backend/src/leaders/leaders.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Like, In } from 'typeorm';
import { Leader } from './entities/leader.entity';
import { Group } from '../groups/entities/group.entity';
import { CreateLeaderDto, UpdateLeaderDto, LeaderFiltersDto, LeaderStatsDto } from './dto/leader.dto';
import { Planillado } from '../planillados/entities/planillado.entity';  // ✅ Agregar

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
    @InjectRepository(Planillado)  // ✅ Cambiar Voter por Planillado
    private planilladoRepository: Repository<Planillado>,
    @InjectRepository(Leader)
    private leaderRepository: Repository<Leader>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
   
  ) {}

  // ✅ Obtener todos los líderes con filtros y paginación
  async findAll(
    filters: LeaderFiltersDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<Leader>> {
    const queryBuilder = this.createQueryBuilder(filters);
    
    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    // Ordenar por nombre
    queryBuilder.orderBy('leader.lastName', 'ASC');
    queryBuilder.addOrderBy('leader.firstName', 'ASC');
    
    // Incluir relaciones y contar votantes
    queryBuilder.leftJoinAndSelect('leader.group', 'group');
    queryBuilder.loadRelationCountAndMap('leader.votersCount', 'leader.voters');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  // ✅ Obtener estadísticas de líderes
  async getStats(filters?: LeaderFiltersDto): Promise<LeaderStatsDto> {
    const queryBuilder = this.createQueryBuilder(filters || {});

    // Total de líderes
    const total = await queryBuilder.getCount();
    
    // Líderes activos
    const activos = await this.createQueryBuilder({ ...filters, isActive: true }).getCount();
    
    // Líderes verificados
    const verificados = await this.createQueryBuilder({ ...filters, isVerified: true }).getCount();

    // Promedio de votantes por líder
    const leadersWithVoters = await this.leaderRepository
      .createQueryBuilder('leader')
      .leftJoin('leader.voters', 'voter')
      .select('leader.id, COUNT(voter.id) as votersCount')
      .groupBy('leader.id')
      .getRawMany();

    const totalVoters = leadersWithVoters.reduce((sum, leader) => sum + parseInt(leader.votersCount), 0);
    const promedioVotantes = total > 0 ? Math.round(totalVoters / total) : 0;

    // Estadísticas por grupo
    const porGrupo = await this.leaderRepository
      .createQueryBuilder('leader')
      .leftJoin('leader.group', 'group')
      .select('group.name as grupo, COUNT(leader.id) as cantidad')
      .where('leader.groupId IS NOT NULL')
      .groupBy('group.id, group.name')
      .orderBy('cantidad', 'DESC')
      .getRawMany();

    const porGrupoData = porGrupo.reduce((acc, item) => {
      acc[item.grupo] = parseInt(item.cantidad);
      return acc;
    }, {});

    // Estadísticas por barrio
    const porBarrio = await this.leaderRepository
      .createQueryBuilder('leader')
      .select('leader.neighborhood as barrio, COUNT(leader.id) as cantidad')
      .where('leader.neighborhood IS NOT NULL')
      .groupBy('leader.neighborhood')
      .orderBy('cantidad', 'DESC')
      .limit(10)
      .getRawMany();

    const porBarrioData = porBarrio.reduce((acc, item) => {
      acc[item.barrio] = parseInt(item.cantidad);
      return acc;
    }, {});

    // Top líderes por número de votantes
    const topLideres = await this.leaderRepository
      .createQueryBuilder('leader')
      .leftJoin('leader.voters', 'voter')
      .select([
        'leader.id',
        'leader.firstName',
        'leader.lastName',
        'COUNT(voter.id) as votersCount'
      ])
      .groupBy('leader.id, leader.firstName, leader.lastName')
      .orderBy('votersCount', 'DESC')
      .limit(10)
      .getRawMany();

    const topLideresData = topLideres.reduce((acc, leader) => {
      const name = `${leader.leader_firstName} ${leader.leader_lastName}`;
      acc[name] = parseInt(leader.votersCount);
      return acc;
    }, {});

    return {
      total,
      activos,
      verificados,
      promedioVotantes,
      porGrupo: porGrupoData,
      porBarrio: porBarrioData,
      topLideres: topLideresData,
    };
  }

  // ✅ Obtener líder por ID
  async findOne(id: number): Promise<Leader> {
    const leader = await this.leaderRepository.findOne({
      where: { id },
      relations: ['group', 'voters'],
    });

    if (!leader) {
      throw new NotFoundException(`Líder con ID ${id} no encontrado`);
    }

    return leader;
  }

  // ✅ Crear nuevo líder
  async create(createLeaderDto: CreateLeaderDto): Promise<Leader> {
    // Verificar duplicados por cédula
    const existing = await this.leaderRepository.findOne({
      where: { cedula: createLeaderDto.cedula },
    });

    if (existing) {
      throw new ConflictException(`Ya existe un líder con la cédula ${createLeaderDto.cedula}`);
    }

    // Verificar que el grupo existe si se proporciona
    if (createLeaderDto.groupId) {
      const group = await this.groupRepository.findOne({
        where: { id: createLeaderDto.groupId },
      });

      if (!group) {
        throw new NotFoundException(`Grupo con ID ${createLeaderDto.groupId} no encontrado`);
      }
    }

    // Crear el líder
    const leader = this.leaderRepository.create({
      ...createLeaderDto,
      birthDate: createLeaderDto.birthDate ? new Date(createLeaderDto.birthDate) : undefined,
    });

    return this.leaderRepository.save(leader);
  }

  // ✅ Actualizar líder
  async update(id: number, updateLeaderDto: UpdateLeaderDto): Promise<Leader> {
    const leader = await this.findOne(id);

    // Verificar duplicados por cédula si se está cambiando
    if (updateLeaderDto.cedula && updateLeaderDto.cedula !== leader.cedula) {
      const existing = await this.leaderRepository.findOne({
        where: { cedula: updateLeaderDto.cedula },
      });

      if (existing) {
        throw new ConflictException(`Ya existe un líder con la cédula ${updateLeaderDto.cedula}`);
      }
    }

    // Verificar que el grupo existe si se proporciona
    if (updateLeaderDto.groupId) {
      const group = await this.groupRepository.findOne({
        where: { id: updateLeaderDto.groupId },
      });

      if (!group) {
        throw new NotFoundException(`Grupo con ID ${updateLeaderDto.groupId} no encontrado`);
      }
    }

    // Actualizar datos
    Object.assign(leader, {
      ...updateLeaderDto,
      birthDate: updateLeaderDto.birthDate ? new Date(updateLeaderDto.birthDate) : leader.birthDate,
    });

    return this.leaderRepository.save(leader);
  }

  // ✅ Eliminar líder
  async remove(id: number): Promise<void> {
    const leader = await this.findOne(id);

    // Verificar si tiene votantes asignados
    const planilladosCount = await this.planilladoRepository.count({
    where: { liderId: id },  // ✅ Cambiar leaderId por liderId
    });

    if (planilladosCount > 0) {
  throw new BadRequestException(
    `No se puede eliminar el líder porque tiene ${planilladosCount} planillados asignados. Reasigne los planillados primero.`
  );
}

    await this.leaderRepository.remove(leader);
  }

  // ✅ Acciones masivas
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
    // Verificar que ningún líder tenga votantes asignados
    const leadersWithVoters = await this.leaderRepository
      .createQueryBuilder('leader')
      .leftJoin('leader.voters', 'voter')
      .where('leader.id IN (:...ids)', { ids })
      .andWhere('voter.id IS NOT NULL')
      .getCount();

    if (leadersWithVoters > 0) {
      throw new BadRequestException(
        'No se pueden eliminar líderes que tienen votantes asignados'
      );
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

  // ✅ Obtener líderes para selects/dropdowns
  async findForSelect(): Promise<Array<{ id: number; name: string; groupName?: string }>> {
    const leaders = await this.leaderRepository
      .createQueryBuilder('leader')
      .leftJoinAndSelect('leader.group', 'group')
      .where('leader.isActive = :isActive', { isActive: true })
      .orderBy('leader.lastName', 'ASC')
      .addOrderBy('leader.firstName', 'ASC')
      .getMany();

    return leaders.map(leader => ({
      id: leader.id,
      name: `${leader.firstName} ${leader.lastName}`,
      groupName: leader.group?.name,
    }));
  }

  // ✅ Obtener planillados de un líder (corregido)
  async getPlanillados(leaderId: number): Promise<any[]> {
    const leader = await this.findOne(leaderId);

    // Aquí deberías importar y usar el repository de Planillado
    // Por ahora retorno un array vacío como placeholder
    return [];
    
    // TODO: Implementar cuando tengas acceso al PlanilladoRepository
    // return this.planilladoRepository.find({
    //   where: { liderId },
    //   order: { apellidos: 'ASC', nombres: 'ASC' },
    // });
  }

  // ✅ Exportar líderes a Excel
  async exportToExcel(filters: LeaderFiltersDto): Promise<Leader[]> {
    const queryBuilder = this.createQueryBuilder(filters);
    queryBuilder.leftJoinAndSelect('leader.group', 'group');
    queryBuilder.loadRelationCountAndMap('leader.votersCount', 'leader.voters');
    queryBuilder.orderBy('leader.lastName', 'ASC');
    queryBuilder.addOrderBy('leader.firstName', 'ASC');

    return queryBuilder.getMany();
  }

  // ✅ Verificar duplicados por cédula
  async checkDuplicates(cedula: string): Promise<{ exists: boolean; leader?: any }> {
    const existing = await this.leaderRepository.findOne({
      where: { cedula },
      select: ['id', 'cedula', 'firstName', 'lastName', 'isActive'],
    });

    if (existing) {
      return {
        exists: true,
        leader: {
          id: existing.id,
          cedula: existing.cedula,
          firstName: existing.firstName,
          lastName: existing.lastName,
          isActive: existing.isActive,
        },
      };
    }

    return { exists: false };
  }

  // ✅ Método privado para crear query builder con filtros
  private createQueryBuilder(filters: LeaderFiltersDto): SelectQueryBuilder<Leader> {
    const queryBuilder = this.leaderRepository.createQueryBuilder('leader');

    // Filtro de búsqueda general
    if (filters.buscar) {
      queryBuilder.andWhere(
        '(leader.cedula LIKE :buscar OR leader.firstName LIKE :buscar OR leader.lastName LIKE :buscar OR leader.phone LIKE :buscar OR leader.email LIKE :buscar)',
        { buscar: `%${filters.buscar}%` }
      );
    }

    // Filtro por estado activo
    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('leader.isActive = :isActive', { isActive: filters.isActive });
    }

    // Filtro por verificado
    if (filters.isVerified !== undefined) {
      queryBuilder.andWhere('leader.isVerified = :isVerified', { isVerified: filters.isVerified });
    }

    // Filtro por grupo
    if (filters.groupId) {
      queryBuilder.andWhere('leader.groupId = :groupId', { groupId: filters.groupId });
    }

    // Filtro por barrio
    if (filters.neighborhood) {
      queryBuilder.andWhere('leader.neighborhood = :neighborhood', { neighborhood: filters.neighborhood });
    }

    // Filtro por municipio
    if (filters.municipality) {
      queryBuilder.andWhere('leader.municipality = :municipality', { municipality: filters.municipality });
    }

    // Filtro por género
    if (filters.gender) {
      queryBuilder.andWhere('leader.gender = :gender', { gender: filters.gender });
    }

    // Filtro por rango de fechas de creación
    if (filters.fechaDesde && filters.fechaHasta) {
      queryBuilder.andWhere('leader.createdAt BETWEEN :fechaDesde AND :fechaHasta', {
        fechaDesde: filters.fechaDesde,
        fechaHasta: filters.fechaHasta,
      });
    } else if (filters.fechaDesde) {
      queryBuilder.andWhere('leader.createdAt >= :fechaDesde', { fechaDesde: filters.fechaDesde });
    } else if (filters.fechaHasta) {
      queryBuilder.andWhere('leader.createdAt <= :fechaHasta', { fechaHasta: filters.fechaHasta });
    }

    return queryBuilder;
  }
}