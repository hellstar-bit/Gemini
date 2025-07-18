// backend/src/planillados/planillados.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between, Like, In } from 'typeorm';
import { Planillado } from './entities/planillado.entity';
import {
  CreatePlanilladoDto,
  UpdatePlanilladoDto,
  PlanilladoFiltersDto,
  PlanilladosStatsResponseDto,
  PaginatedResponseDto,
  ValidationResultDto,
  DuplicateCheckDto
} from './dto/planillado.dto';

@Injectable()
export class PlanilladosService {
  constructor(
    @InjectRepository(Planillado)
    private planilladoRepository: Repository<Planillado>,
  ) {}

  // ✅ Obtener todos con filtros y paginación
  async findAll(
    filters: PlanilladoFiltersDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponseDto<Planillado>> {
    const queryBuilder = this.createQueryBuilder(filters);
    
    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    // Ordenar por fecha de actualización descendente
    queryBuilder.orderBy('planillado.fechaActualizacion', 'DESC');
    
    // Incluir relaciones
    queryBuilder.leftJoinAndSelect('planillado.lider', 'lider');
    queryBuilder.leftJoinAndSelect('planillado.grupo', 'grupo');

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

  // ✅ Obtener estadísticas
  async getStats(filters?: PlanilladoFiltersDto): Promise<PlanilladosStatsResponseDto> {
    const queryBuilder = this.createQueryBuilder(filters || {});

    // Total y estados
    const total = await queryBuilder.getCount();
    const verificados = await this.createQueryBuilder({ ...filters, estado: 'verificado' }).getCount();
    const pendientes = await this.createQueryBuilder({ ...filters, estado: 'pendiente' }).getCount();
    const ediles = await this.createQueryBuilder({ ...filters, esEdil: true }).getCount();

    // Estadísticas por barrio
    const porBarrioQuery = this.planilladoRepository
      .createQueryBuilder('p')
      .select('p.barrioVive as barrio, COUNT(*) as cantidad')
      .where('p.barrioVive IS NOT NULL')
      .groupBy('p.barrioVive')
      .orderBy('cantidad', 'DESC')
      .limit(10);

    const barriosResult = await porBarrioQuery.getRawMany();
    const porBarrio = barriosResult.reduce((acc, item) => {
      acc[item.barrio] = parseInt(item.cantidad);
      return acc;
    }, {});

    // Estadísticas por género
    const porGeneroQuery = this.planilladoRepository
      .createQueryBuilder('p')
      .select('p.genero as genero, COUNT(*) as cantidad')
      .where('p.genero IS NOT NULL')
      .groupBy('p.genero');

    const generoResult = await porGeneroQuery.getRawMany();
    const porGenero = generoResult.reduce((acc, item) => {
      acc[item.genero] = parseInt(item.cantidad);
      return acc;
    }, {});

    // Estadísticas por edad (calculadas)
    const today = new Date();
    const porEdad = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55-64': 0,
      '65+': 0,
    };

    const planilladosConEdad = await this.planilladoRepository
      .createQueryBuilder('p')
      .where('p.fechaNacimiento IS NOT NULL')
      .getMany();

    planilladosConEdad.forEach(p => {
      if (p.fechaNacimiento) {
        const edad = today.getFullYear() - p.fechaNacimiento.getFullYear();
        if (edad >= 18 && edad <= 24) porEdad['18-24']++;
        else if (edad <= 34) porEdad['25-34']++;
        else if (edad <= 44) porEdad['35-44']++;
        else if (edad <= 54) porEdad['45-54']++;
        else if (edad <= 64) porEdad['55-64']++;
        else if (edad >= 65) porEdad['65+']++;
      }
    });

    // Estadísticas por líder
    const porLiderQuery = this.planilladoRepository
      .createQueryBuilder('p')
      .leftJoin('p.lider', 'l')
      .select('CONCAT(l.nombres, \' \', l.apellidos) as lider, COUNT(*) as cantidad')
      .where('p.liderId IS NOT NULL')
      .groupBy('l.id, l.nombres, l.apellidos')
      .orderBy('cantidad', 'DESC')
      .limit(10);

    const liderResult = await porLiderQuery.getRawMany();
    const porLider = liderResult.reduce((acc, item) => {
      acc[item.lider] = parseInt(item.cantidad);
      return acc;
    }, {});

    // Estadísticas por grupo
    const porGrupoQuery = this.planilladoRepository
      .createQueryBuilder('p')
      .leftJoin('p.grupo', 'g')
      .select('g.nombre as grupo, COUNT(*) as cantidad')
      .where('p.grupoId IS NOT NULL')
      .groupBy('g.id, g.nombre')
      .orderBy('cantidad', 'DESC');

    const grupoResult = await porGrupoQuery.getRawMany();
    const porGrupo = grupoResult.reduce((acc, item) => {
      acc[item.grupo] = parseInt(item.cantidad);
      return acc;
    }, {});

    // Nuevos registros
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const nuevosHoy = await this.planilladoRepository.count({
      where: {
        fechaCreacion: Between(startOfDay, endOfDay),
      },
    });

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const nuevosEstaSemana = await this.planilladoRepository.count({
      where: {
        fechaCreacion: Between(startOfWeek, endOfDay),
      },
    });

    const actualizadosHoy = await this.planilladoRepository.count({
      where: {
        fechaActualizacion: Between(startOfDay, endOfDay),
      },
    });

    return {
      total,
      verificados,
      pendientes,
      ediles,
      porBarrio,
      porGenero,
      porEdad,
      porLider,
      porGrupo,
      nuevosHoy,
      nuevosEstaSemana,
      actualizadosHoy,
    };
  }

  // ✅ Obtener por ID
  async findOne(id: number): Promise<Planillado> {
    const planillado = await this.planilladoRepository.findOne({
      where: { id },
      relations: ['lider', 'grupo'],
    });

    if (!planillado) {
      throw new NotFoundException(`Planillado con ID ${id} no encontrado`);
    }

    return planillado;
  }

  // ✅ Crear nuevo planillado
  async create(createPlanilladoDto: CreatePlanilladoDto): Promise<Planillado> {
    // Verificar duplicados
    const existing = await this.planilladoRepository.findOne({
      where: { cedula: createPlanilladoDto.cedula },
    });

    if (existing) {
      throw new ConflictException(`Ya existe un planillado con la cédula ${createPlanilladoDto.cedula}`);
    }

    // Crear el planillado
    const planillado = this.planilladoRepository.create({
      ...createPlanilladoDto,
      fechaExpedicion: createPlanilladoDto.fechaExpedicion ? new Date(createPlanilladoDto.fechaExpedicion) : undefined,
      fechaNacimiento: createPlanilladoDto.fechaNacimiento ? new Date(createPlanilladoDto.fechaNacimiento) : undefined,
      estado: 'pendiente',
      actualizado: true,
    });

    return this.planilladoRepository.save(planillado);
  }

  // ✅ Actualizar planillado
  async update(id: number, updatePlanilladoDto: UpdatePlanilladoDto): Promise<Planillado> {
    const planillado = await this.findOne(id);

    // Si se está cambiando la cédula, verificar duplicados
    if (updatePlanilladoDto.cedula && updatePlanilladoDto.cedula !== planillado.cedula) {
      const existing = await this.planilladoRepository.findOne({
        where: { cedula: updatePlanilladoDto.cedula },
      });

      if (existing) {
        throw new ConflictException(`Ya existe un planillado con la cédula ${updatePlanilladoDto.cedula}`);
      }
    }

    // Actualizar datos
    Object.assign(planillado, {
      ...updatePlanilladoDto,
      fechaExpedicion: updatePlanilladoDto.fechaExpedicion ? new Date(updatePlanilladoDto.fechaExpedicion) : planillado.fechaExpedicion,
      fechaNacimiento: updatePlanilladoDto.fechaNacimiento ? new Date(updatePlanilladoDto.fechaNacimiento) : planillado.fechaNacimiento,
    });

    return this.planilladoRepository.save(planillado);
  }

  // ✅ Eliminar planillado
  async remove(id: number): Promise<void> {
    const planillado = await this.findOne(id);
    await this.planilladoRepository.remove(planillado);
  }

  // ✅ Acciones masivas
  async bulkVerify(ids: number[]): Promise<{ affected: number }> {
    const result = await this.planilladoRepository.update(
      { id: In(ids) },
      { estado: 'verificado', actualizado: true }
    );
    return { affected: result.affected || 0 };
  }

  async bulkUnverify(ids: number[]): Promise<{ affected: number }> {
    const result = await this.planilladoRepository.update(
      { id: In(ids) },
      { estado: 'pendiente', actualizado: true }
    );
    return { affected: result.affected || 0 };
  }

  async bulkDelete(ids: number[]): Promise<{ affected: number }> {
    const result = await this.planilladoRepository.delete({ id: In(ids) });
    return { affected: result.affected || 0 };
  }

  async bulkAssignLeader(ids: number[], liderId: number): Promise<{ affected: number }> {
    if (!liderId) {
      throw new BadRequestException('ID del líder es requerido para asignación masiva');
    }

    const result = await this.planilladoRepository.update(
      { id: In(ids) },
      { liderId, actualizado: true }
    );
    return { affected: result.affected || 0 };
  }

  async bulkExport(ids: number[]): Promise<Planillado[]> {
    return this.planilladoRepository.find({
      where: { id: In(ids) },
      relations: ['lider', 'grupo'],
      order: { apellidos: 'ASC', nombres: 'ASC' }
    });
  }

  // ✅ Exportar a Excel
  async exportToExcel(filters: PlanilladoFiltersDto): Promise<Planillado[]> {
    const queryBuilder = this.createQueryBuilder(filters);
    queryBuilder.leftJoinAndSelect('planillado.lider', 'lider');
    queryBuilder.leftJoinAndSelect('planillado.grupo', 'grupo');
    queryBuilder.orderBy('planillado.apellidos', 'ASC');
    queryBuilder.addOrderBy('planillado.nombres', 'ASC');

    return queryBuilder.getMany();
  }

  // ✅ Obtener barrios únicos
  async getUniqueBarrios(): Promise<string[]> {
    const result = await this.planilladoRepository
      .createQueryBuilder('p')
      .select('DISTINCT p.barrioVive')
      .where('p.barrioVive IS NOT NULL')
      .orderBy('p.barrioVive', 'ASC')
      .getRawMany();

    return result.map(item => item.p_barrioVive).filter(Boolean);
  }

  // ✅ Obtener municipios únicos
  async getUniqueMunicipios(): Promise<string[]> {
    const result = await this.planilladoRepository
      .createQueryBuilder('p')
      .select('DISTINCT p.municipioVotacion')
      .where('p.municipioVotacion IS NOT NULL')
      .orderBy('p.municipioVotacion', 'ASC')
      .getRawMany();

    return result.map(item => item.p_municipioVotacion).filter(Boolean);
  }

  // ✅ Validar planillado
  async validatePlanillado(data: CreatePlanilladoDto): Promise<ValidationResultDto> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: any = {};

    // Verificar duplicados
    const existing = await this.planilladoRepository.findOne({
      where: { cedula: data.cedula },
    });

    if (existing) {
      errors.push(`Ya existe un planillado con la cédula ${data.cedula}`);
    }

    // Validar edad si se proporciona fecha de nacimiento
    if (data.fechaNacimiento) {
      const birthDate = new Date(data.fechaNacimiento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        errors.push('El planillado debe ser mayor de edad (18 años)');
      } else if (age > 100) {
        warnings.push('La edad parece inusualmente alta, verifique la fecha de nacimiento');
      }
    }

    // Sugerir municipio basado en barrio
    if (data.barrioVive && !data.municipioVotacion) {
      // Buscar el municipio más común para este barrio
      const municipioSugerido = await this.planilladoRepository
        .createQueryBuilder('p')
        .select('p.municipioVotacion')
        .where('p.barrioVive = :barrio', { barrio: data.barrioVive })
        .groupBy('p.municipioVotacion')
        .orderBy('COUNT(*)', 'DESC')
        .limit(1)
        .getRawOne();

      if (municipioSugerido) {
        suggestions.municipioVotacion = municipioSugerido.p_municipioVotacion;
      }
    }

    // Validar formato de celular
    if (data.celular && !/^3\d{9}$/.test(data.celular)) {
      errors.push('El formato del celular no es válido (debe ser 3XXXXXXXXX)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  // ✅ Verificar duplicados
  async checkDuplicates(cedula: string): Promise<DuplicateCheckDto> {
    const existing = await this.planilladoRepository.findOne({
      where: { cedula },
      select: ['id', 'cedula', 'nombres', 'apellidos', 'estado'],
    });

    if (existing) {
      return {
        exists: true,
        planillado: {
          id: existing.id,
          cedula: existing.cedula,
          nombres: existing.nombres,
          apellidos: existing.apellidos,
          estado: existing.estado,
        },
      };
    }

    return { exists: false };
  }

  // ✅ Método privado para crear query builder con filtros
  private createQueryBuilder(filters: PlanilladoFiltersDto): SelectQueryBuilder<Planillado> {
    const queryBuilder = this.planilladoRepository.createQueryBuilder('planillado');

    // Filtro de búsqueda general
    if (filters.buscar) {
      queryBuilder.andWhere(
        '(planillado.cedula LIKE :buscar OR planillado.nombres LIKE :buscar OR planillado.apellidos LIKE :buscar OR planillado.celular LIKE :buscar)',
        { buscar: `%${filters.buscar}%` }
      );
    }

    // Filtro por estado
    if (filters.estado) {
      queryBuilder.andWhere('planillado.estado = :estado', { estado: filters.estado });
    }

    // Filtro por barrio
    if (filters.barrioVive) {
      queryBuilder.andWhere('planillado.barrioVive = :barrioVive', { barrioVive: filters.barrioVive });
    }

    // Filtro por líder
    if (filters.liderId) {
      queryBuilder.andWhere('planillado.liderId = :liderId', { liderId: filters.liderId });
    }

    // Filtro por grupo
    if (filters.grupoId) {
      queryBuilder.andWhere('planillado.grupoId = :grupoId', { grupoId: filters.grupoId });
    }

    // Filtro por edil
    if (filters.esEdil !== undefined) {
      queryBuilder.andWhere('planillado.esEdil = :esEdil', { esEdil: filters.esEdil });
    }

    // Filtro por género
    if (filters.genero) {
      queryBuilder.andWhere('planillado.genero = :genero', { genero: filters.genero });
    }

    // Filtro por municipio de votación
    if (filters.municipioVotacion) {
      queryBuilder.andWhere('planillado.municipioVotacion = :municipioVotacion', { 
        municipioVotacion: filters.municipioVotacion 
      });
    }

    // Filtro por actualizado
    if (filters.actualizado !== undefined) {
      queryBuilder.andWhere('planillado.actualizado = :actualizado', { actualizado: filters.actualizado });
    }

    // Filtro por rango de fechas
    if (filters.fechaDesde && filters.fechaHasta) {
      queryBuilder.andWhere('planillado.fechaCreacion BETWEEN :fechaDesde AND :fechaHasta', {
        fechaDesde: filters.fechaDesde,
        fechaHasta: filters.fechaHasta,
      });
    } else if (filters.fechaDesde) {
      queryBuilder.andWhere('planillado.fechaCreacion >= :fechaDesde', { fechaDesde: filters.fechaDesde });
    } else if (filters.fechaHasta) {
      queryBuilder.andWhere('planillado.fechaCreacion <= :fechaHasta', { fechaHasta: filters.fechaHasta });
    }

    // Filtro por rango de edad (requiere cálculo)
    if (filters.rangoEdad) {
      const today = new Date();
      let minAge: number, maxAge: number;

      switch (filters.rangoEdad) {
        case '18-24':
          minAge = 18; maxAge = 24;
          break;
        case '25-34':
          minAge = 25; maxAge = 34;
          break;
        case '35-44':
          minAge = 35; maxAge = 44;
          break;
        case '45-54':
          minAge = 45; maxAge = 54;
          break;
        case '55-64':
          minAge = 55; maxAge = 64;
          break;
        case '65+':
          minAge = 65; maxAge = 120;
          break;
        default:
          minAge = 0; maxAge = 120;
      }

      const maxBirthYear = today.getFullYear() - minAge;
      const minBirthYear = today.getFullYear() - maxAge;

      queryBuilder.andWhere(
        'EXTRACT(YEAR FROM planillado.fechaNacimiento) BETWEEN :minBirthYear AND :maxBirthYear',
        { minBirthYear, maxBirthYear }
      );
    }

    return queryBuilder;
  }
}