// backend/src/planillados/planillados.service.ts - CORREGIDO
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx'; // Importar XLSX
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
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { DataSource, IsNull, Not } from 'typeorm'; // IsNull y Not para las nuevas consultas
import { EventEmitter2 } from '@nestjs/event-emitter'; // Para los eventos
import { Leader } from '../leaders/entities/leader.entity';

// ✅ NUEVO - Interfaz para las estadísticas de un barrio
interface BarrioStats {
  total: number;
  verificados: number;
  pendientes: number;
  ediles: number;
  lideres: number;
  grupos: number;
  densidad: 'alta' | 'media' | 'baja' | 'sin-datos';
  porcentaje: string;
}

@Injectable()
export class PlanilladosService {
  constructor(
    @InjectRepository(Planillado)
    private planilladoRepository: Repository<Planillado>,
    @InjectRepository(Leader) // ✅ NUEVO
    private leaderRepository: Repository<Leader>,
    private dataSource: DataSource, // ✅ NUEVO - Para transacciones
    private eventEmitter: EventEmitter2, // ✅ NUEVO - Para eventos
  ) {}

  async getPlanilladosPendientesByLiderCedula(cedulaLider: string): Promise<Planillado[]> {
    try {
      const planillados = await this.planilladoRepository.find({
        where: { 
          cedulaLiderPendiente: cedulaLider,
          liderId: IsNull() // Solo los que no tienen líder asignado aún
        },
        select: ['id', 'cedula', 'nombres', 'apellidos', 'cedulaLiderPendiente'],
        order: { nombres: 'ASC', apellidos: 'ASC' }
      });

      return planillados;
    } catch (error) {
      throw new BadRequestException(`Error al obtener planillados pendientes: ${error.message}`);
    }
  }

  async relacionarPlanilladosPendientes(
    cedulaLider: string,
    liderId: number,
    planilladoIds?: number[]
  ): Promise<{ affected: number }> {
    try {
      // Verificar que el líder existe
      const leader = await this.leaderRepository.findOne({
        where: { id: liderId, cedula: cedulaLider }
      });

      if (!leader) {
        throw new NotFoundException('Líder no encontrado o cédula no coincide');
      }

      // Construir condiciones WHERE
      const whereCondition: any = {
        cedulaLiderPendiente: cedulaLider,
        liderId: IsNull()
      };

      // Si se especifican IDs específicos, filtrar por ellos
      if (planilladoIds && planilladoIds.length > 0) {
        whereCondition.id = In(planilladoIds);
      }

      // ✅ CORRECCIÓN: Usar undefined en lugar de null para cedulaLiderPendiente
      const result = await this.planilladoRepository.update(whereCondition, {
        liderId,
        cedulaLiderPendiente: undefined, // ✅ CAMBIO: undefined en lugar de null
        actualizado: true,
        fechaActualizacion: new Date()
      });

      console.log(`✅ Relacionados ${result.affected} planillados con líder ${leader.firstName} ${leader.lastName}`);

      return { affected: result.affected || 0 };
    } catch (error) {
      throw new BadRequestException(`Error al relacionar planillados: ${error.message}`);
    }
  }

  async getEstadisticasPlanilladosPendientes(): Promise<{
    totalPendientes: number;
    porCedulaLider: Record<string, number>;
    sinLider: number;
  }> {
    try {
      // Total con cédula líder pendiente
      const totalPendientes = await this.planilladoRepository.count({
        where: { 
          cedulaLiderPendiente: Not(IsNull()),
          liderId: IsNull()
        }
      });

      // Agrupar por cédula líder
      const porCedulaQuery = await this.planilladoRepository
        .createQueryBuilder('p')
        .select('p.cedulaLiderPendiente as cedula, COUNT(*) as cantidad')
        .where('p.cedulaLiderPendiente IS NOT NULL')
        .andWhere('p.liderId IS NULL')
        .groupBy('p.cedulaLiderPendiente')
        .getRawMany();

      const porCedulaLider = porCedulaQuery.reduce((acc, item) => {
        acc[item.cedula] = parseInt(item.cantidad);
        return acc;
      }, {});

      // Planillados sin líder ni pendiente
      const sinLider = await this.planilladoRepository.count({
        where: { 
          liderId: IsNull(),
          cedulaLiderPendiente: IsNull()
        }
      });

      return {
        totalPendientes,
        porCedulaLider,
        sinLider
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  async limpiarRelacionesPendientesOrfanas(): Promise<{ affected: number }> {
    try {
      // Obtener todas las cédulas pendientes
      const cedulasPendientes = await this.planilladoRepository
        .createQueryBuilder('p')
        .select('DISTINCT p.cedulaLiderPendiente')
        .where('p.cedulaLiderPendiente IS NOT NULL')
        .andWhere('p.liderId IS NULL')
        .getRawMany();

      const cedulasParaLimpiar: string[] = [];

      // Verificar cuáles no tienen líder registrado
      for (const item of cedulasPendientes) {
        const cedula = item.p_cedulaLiderPendiente;
        const leaderExists = await this.leaderRepository.findOne({
          where: { cedula }
        });

        if (!leaderExists) {
          cedulasParaLimpiar.push(cedula);
        }
      }

      // Limpiar relaciones órfanas
      if (cedulasParaLimpiar.length > 0) {
        // ✅ CORRECCIÓN: Usar undefined en lugar de null
        const result = await this.planilladoRepository.update(
          { 
            cedulaLiderPendiente: In(cedulasParaLimpiar),
            liderId: IsNull()
          },
          { 
            cedulaLiderPendiente: undefined // ✅ CAMBIO: undefined en lugar de null
          }
        );

        return { affected: result.affected || 0 };
      }

      return { affected: 0 };
    } catch (error) {
      throw new BadRequestException(`Error al limpiar relaciones: ${error.message}`);
    }
  }

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

  // ✅ Obtener estadísticas - CORREGIDO PARA INCLUIR TODAS LAS PROPIEDADES
  async getStats(filters: PlanilladoFiltersDto): Promise<PlanilladosStatsResponseDto> {
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

    // Estadísticas por edad (calculadas) - SECCIÓN CORREGIDA
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
        // ✅ CORRECCIÓN: Asegurar que fechaNacimiento sea un objeto Date
        const fechaNacimiento = p.fechaNacimiento instanceof Date 
          ? p.fechaNacimiento 
          : new Date(p.fechaNacimiento);
        
        // ✅ Verificar que la fecha sea válida
        if (!isNaN(fechaNacimiento.getTime())) {
          const edad = today.getFullYear() - fechaNacimiento.getFullYear();
          const monthDiff = today.getMonth() - fechaNacimiento.getMonth();
          
          // Ajustar la edad si no ha pasado el cumpleaños este año
          const edadAjustada = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < fechaNacimiento.getDate())) 
            ? edad - 1 
            : edad;
          
          // Clasificar por rango de edad
          if (edadAjustada >= 18 && edadAjustada <= 24) porEdad['18-24']++;
          else if (edadAjustada <= 34) porEdad['25-34']++;
          else if (edadAjustada <= 44) porEdad['35-44']++;
          else if (edadAjustada <= 54) porEdad['45-54']++;
          else if (edadAjustada <= 64) porEdad['55-64']++;
          else if (edadAjustada >= 65) porEdad['65+']++;
        }
      }
    });

    // Estadísticas por líder
    const porLiderQuery = this.planilladoRepository
      .createQueryBuilder('p')
      .leftJoin('p.lider', 'l')
      .select('CONCAT(l.firstName, \' \', l.lastName) as lider, COUNT(*) as cantidad')
      .where('p.liderId IS NOT NULL')
      .groupBy('l.id, l.firstName, l.lastName')
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
      .select('g.name as grupo, COUNT(*) as cantidad')
      .where('p.grupoId IS NOT NULL')
      .groupBy('g.id, g.name')
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

    const conLiderPendiente = await this.planilladoRepository.count({
      where: {
        cedulaLiderPendiente: Not(IsNull()),
        liderId: IsNull()
      }
    });

    const sinLider = await this.planilladoRepository.count({
      where: {
        liderId: IsNull(),
        cedulaLiderPendiente: IsNull()
      }
    });

    // ✅ NUEVAS ESTADÍSTICAS REQUERIDAS
    const totalConLider = await this.planilladoRepository.count({
      where: {
        liderId: Not(IsNull())
      }
    });

    const porcentajeAsignacion = total > 0 ? ((totalConLider / total) * 100).toFixed(1) + '%' : '0.0%';

    return {
      conLiderPendiente,
      sinLider,
      totalConLider, // ✅ AGREGADO
      porcentajeAsignacion, // ✅ AGREGADO
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
  async exportToExcel(filters: PlanilladoFiltersDto): Promise<Buffer> {
    try {
      // Obtener datos con filtros
      const queryBuilder = this.createQueryBuilder(filters);
      queryBuilder.leftJoinAndSelect('planillado.lider', 'lider');
      queryBuilder.leftJoinAndSelect('planillado.grupo', 'grupo');
      
      const planillados = await queryBuilder.getMany();

      // ✅ FORMATEAR DATOS PARA EXCEL
      const excelData = planillados.map((p, index) => ({
        'No.': index + 1,
        'Cédula': p.cedula,
        'Nombres': p.nombres,
        'Apellidos': p.apellidos,
        'Celular': p.celular || '',
        'Dirección': p.direccion || '',
        'Barrio': p.barrioVive || '',
        'Fecha Expedición': p.fechaExpedicion ? 
          p.fechaExpedicion.toLocaleDateString('es-CO') : '',
        'Municipio Votación': p.municipioVotacion || '',
        'Zona y Puesto': p.zonaPuesto || '',
        'Mesa': p.mesa || '',
        'Estado': p.estado === 'verificado' ? 'Verificado' : 'Pendiente',
        'Es Edil': p.esEdil ? 'Sí' : 'No',
        'Líder': p.lider ? `${p.lider.firstName} ${p.lider.lastName}` : '',
        'Cédula Líder Pendiente': p.cedulaLiderPendiente || '',
        'Grupo': p.grupo ? p.grupo.name : '',
        'Género': p.genero || '',
        'Fecha Nacimiento': p.fechaNacimiento ? 
          p.fechaNacimiento.toLocaleDateString('es-CO') : '',
        'Notas': p.notas || '',
        'Fecha Creación': p.fechaCreacion.toLocaleDateString('es-CO'),
        'Última Actualización': p.fechaActualizacion.toLocaleDateString('es-CO')
      }));

      // ✅ CREAR LIBRO DE EXCEL
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // ✅ CONFIGURAR ANCHOS DE COLUMNA
      const columnWidths = [
        { wch: 5 },   // No.
        { wch: 12 },  // Cédula
        { wch: 20 },  // Nombres
        { wch: 20 },  // Apellidos
        { wch: 12 },  // Celular
        { wch: 30 },  // Dirección
        { wch: 15 },  // Barrio
        { wch: 15 },  // Fecha Expedición
        { wch: 18 },  // Municipio Votación
        { wch: 15 },  // Zona y Puesto
        { wch: 8 },   // Mesa
        { wch: 12 },  // Estado
        { wch: 8 },   // Es Edil
        { wch: 25 },  // Líder
        { wch: 12 },  // ✅ NUEVO - Cédula Líder Pendiente
        { wch: 15 },  // Grupo
        { wch: 8 },   // Género
        { wch: 15 },  // Fecha Nacimiento
        { wch: 30 },  // Notas
        { wch: 15 },  // Fecha Creación
        { wch: 15 }   // Última Actualización
      ];
      worksheet['!cols'] = columnWidths;

      // ✅ AGREGAR HOJA AL LIBRO
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Planillados');

      // ✅ GENERAR BUFFER
      const excelBuffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx' 
      });

      return excelBuffer;

    } catch (error) {
      throw new BadRequestException(`Error generando Excel: ${error.message}`);
    }
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

  async getGeographicData(filters: PlanilladoFiltersDto = {}) {
    try {
      // 1. Cargar el GeoJSON base
      const geoJsonPath = path.join(process.cwd(), 'public', 'data', 'barranquilla-barrios.geojson');
      console.log('🔍 Buscando archivo en:', geoJsonPath);
      console.log('📁 Directorio actual:', __dirname);
      console.log('✅ Archivo existe:', fs.existsSync(geoJsonPath));
      if (fs.existsSync(geoJsonPath)) {
        console.log('📏 Tamaño del archivo:', fs.statSync(geoJsonPath).size, 'bytes');
      }
      const geoJsonData = JSON.parse(fs.readFileSync(geoJsonPath, 'utf8'));

      // 2. Obtener estadísticas por barrio con filtros aplicados
      const barrioStats = await this.getBarrioStatistics(filters);

      // 3. Combinar GeoJSON con datos de planillados
      const enrichedFeatures = geoJsonData.features.map(feature => {
        const nombreBarrio = feature.properties.nombre;
        const stats = barrioStats[nombreBarrio] || {
          total: 0,
          verificados: 0,
          pendientes: 0,
          ediles: 0,
          lideres: 0,
          grupos: 0,
          densidad: 'sin-datos',
          porcentaje: '0.0'
        };

        return {
          ...feature,
          properties: {
            ...feature.properties,
            planillados: stats
          }
        };
      });

      // 4. Calcular métricas globales
      const allTotals = Object.values(barrioStats).map(stats => stats.total);
      const totalPlanillados = allTotals.reduce((sum, total) => sum + total, 0);
      const maxPlanillados = allTotals.length > 0 ? Math.max(...allTotals) : 0;
      const minPlanillados = allTotals.length > 0 ? Math.min(...allTotals.filter(t => t > 0)) : 0;

      return {
        type: 'FeatureCollection',
        features: enrichedFeatures,
        metadata: {
          totalBarrios: enrichedFeatures.length,
          totalPlanillados,
          maxPlanillados,
          minPlanillados,
          promedioBarrio: enrichedFeatures.length > 0 ? Math.round(totalPlanillados / enrichedFeatures.length) : 0,
          filtrosAplicados: filters
        }
      };
    } catch (error) {
      console.error('Error loading geographic data:', error);
      throw new Error('Error al cargar datos geográficos');
    }
  }

  private async getBarrioStatistics(filters: PlanilladoFiltersDto): Promise<Record<string, BarrioStats>> {
    // Construir query base
    let query = this.planilladoRepository.createQueryBuilder('p')
      .leftJoin('p.lider', 'l')
      .leftJoin('p.grupo', 'g');

    // Aplicar filtros si existen
    if (filters.estado) {
      query = query.andWhere('p.estado = :estado', { estado: filters.estado });
    }
    if (filters.liderId) {
      query = query.andWhere('p.liderId = :liderId', { liderId: filters.liderId });
    }
    if (filters.grupoId) {
      query = query.andWhere('p.grupoId = :grupoId', { grupoId: filters.grupoId });
    }
    if (filters.esEdil !== undefined) {
      query = query.andWhere('p.esEdil = :esEdil', { esEdil: filters.esEdil });
    }
    if (filters.genero) {
      query = query.andWhere('p.genero = :genero', { genero: filters.genero });
    }
    if (filters.fechaDesde) {
      query = query.andWhere('p.fechaCreacion >= :fechaDesde', { fechaDesde: filters.fechaDesde });
    }
    if (filters.fechaHasta) {
      query = query.andWhere('p.fechaCreacion <= :fechaHasta', { fechaHasta: filters.fechaHasta });
    }

    // Obtener datos agrupados por barrio
    const rawResults = await query
      .select([
        'p.barrioVive as barrio',
        'COUNT(*) as total',
        'SUM(CASE WHEN p.estado = "verificado" THEN 1 ELSE 0 END) as verificados',
        'SUM(CASE WHEN p.estado = "pendiente" THEN 1 ELSE 0 END) as pendientes',
        'SUM(CASE WHEN p.esEdil = true THEN 1 ELSE 0 END) as ediles',
        'COUNT(DISTINCT p.liderId) as lideres',
        'COUNT(DISTINCT p.grupoId) as grupos'
      ])
      .where('p.barrioVive IS NOT NULL')
      .groupBy('p.barrioVive')
      .getRawMany();

    // Procesar resultados y calcular densidades
    const statistics: Record<string, BarrioStats> = {};
    const totales = rawResults.map(r => parseInt(r.total));
    const max = Math.max(...totales);
    const min = Math.min(...totales);
    const range = max - min;

    rawResults.forEach(result => {
      const total = parseInt(result.total);
      let densidad: BarrioStats['densidad'] = 'sin-datos';
      
      if (range > 0) {
        const porcentaje = (total - min) / range;
        if (porcentaje >= 0.7) densidad = 'alta';
        else if (porcentaje >= 0.3) densidad = 'media';
        else densidad = 'baja';
      }

      statistics[result.barrio] = {
        total,
        verificados: parseInt(result.verificados),
        pendientes: parseInt(result.pendientes),
        ediles: parseInt(result.ediles),
        lideres: parseInt(result.lideres),
        grupos: parseInt(result.grupos),
        densidad,
        porcentaje: total > 0 ? ((total / totales.reduce((a, b) => a + b, 0)) * 100).toFixed(1) : '0.0'
      };
    });

    return statistics;
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

    if (filters.cedulaLiderPendiente) {
      queryBuilder.andWhere('planillado.cedulaLiderPendiente = :cedulaLiderPendiente', { 
        cedulaLiderPendiente: filters.cedulaLiderPendiente 
      });
    }

    // Filtro para planillados sin líder
    if (filters.sinLider) {
      queryBuilder.andWhere('planillado.liderId IS NULL');
    }

    // Filtro para planillados con líder pendiente
    if (filters.conLiderPendiente) {
      queryBuilder.andWhere('planillado.cedulaLiderPendiente IS NOT NULL')
                .andWhere('planillado.liderId IS NULL');
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