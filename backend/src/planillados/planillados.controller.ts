// backend/src/planillados/planillados.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
  Res,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { PlanilladosService } from './planillados.service';
import { CreatePlanilladoDto, UpdatePlanilladoDto, PlanilladoFiltersDto } from './dto/planillado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { 
  RelacionarPlanilladosPendientesDto,
  PlanilladosPendientesResponseDto 
} from '../import/dto/import.dto';
import { Response } from 'express'; 
import { Planillado } from './entities/planillado.entity';
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


@Controller('planillados')
@UseGuards(JwtAuthGuard)

export class PlanilladosController {
  constructor(private readonly planilladosService: PlanilladosService) {}

  // ✅ GET /planillados - Listar con filtros y paginación
  
  @Get('geographic-data')
  async getGeographicData(@Query() filters: PlanilladoFiltersDto) {
  return this.planilladosService.getGeographicData(filters);
}
  @Get()
async findAll(
  @Query() query: any
): Promise<PaginatedResponse<Planillado>> {
  const {
    page = 1,
    limit = 20,
    buscar,
    isVerified,
    barrio,
    municipio,
    genero,
    edadMin,
    edadMax,
    fechaDesde,
    fechaHasta,
    liderId,
    ...filters
  } = query;

  // Construir filtros
  const filterDto: PlanilladoFiltersDto = {
    buscar,
    isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
    barrio,
    municipio, 
    genero,
    edadMin: edadMin ? parseInt(edadMin) : undefined,
    edadMax: edadMax ? parseInt(edadMax) : undefined,
    fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
    fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
    liderId: liderId ? parseInt(liderId) : undefined,
    ...filters
  };

  return this.planilladosService.findAll(filterDto, parseInt(page), parseInt(limit));
}

  // ✅ GET /planillados/stats - Estadísticas
  @Get('stats')
  async getStats(@Query() filters: PlanilladoFiltersDto) {
    return this.planilladosService.getStats(filters);
  }

  // ✅ GET /planillados/export - Exportar a Excel
  @Get('export')
  @HttpCode(HttpStatus.OK)
  async exportToExcel(
    @Query() filters: PlanilladoFiltersDto,
    @Res() res: Response
  ): Promise<void> {
    try {
      const excelBuffer = await this.planilladosService.exportToExcel(filters);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const hasFilters = Object.keys(filters || {}).length > 0;
      const fileName = hasFilters 
        ? `planillados_filtrados_${timestamp}.xlsx`
        : `planillados_completo_${timestamp}.xlsx`;
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': excelBuffer.length.toString(),
      });

      res.status(HttpStatus.OK).send(excelBuffer);
      
    } catch (error) {
      console.error('❌ Error en exportación:', error);
      
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Error al generar archivo de exportación',
          error: error.message
        });
      }
    }
  }

  // ✅ GET /planillados/:id - Obtener por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.planilladosService.findOne(id);
  }

  // ✅ POST /planillados - Crear nuevo planillado
  @Post()
  async create(@Body() createPlanilladoDto: CreatePlanilladoDto) {
    return this.planilladosService.create(createPlanilladoDto);
  }

  // ✅ PATCH /planillados/:id - Actualizar planillado
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlanilladoDto: UpdatePlanilladoDto,
  ) {
    return this.planilladosService.update(id, updatePlanilladoDto);
  }

  // ✅ DELETE /planillados/:id - Eliminar planillado
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.planilladosService.remove(id);
  }

  @Get('pendientes-lider/:cedula')
@HttpCode(HttpStatus.OK)
async getPlanilladosPendientesByLiderCedula(
  @Param('cedula') cedula: string
) {
  try {
    const planillados = await this.planilladosService.getPlanilladosPendientesByLiderCedula(cedula);
    
    return {
      planillados: planillados.map(p => ({
        id: p.id,
        cedula: p.cedula,
        nombres: p.nombres,
        apellidos: p.apellidos,
        cedulaLiderPendiente: p.cedulaLiderPendiente || '' // ✅ CORREGIDO - Manejar undefined
      })),
      total: planillados.length
    };
  } catch (error) {
    throw error;
  }
}

  /**
   * Relacionar planillados pendientes con líder
   * POST /planillados/relacionar-pendientes
   */
  @Post('relacionar-pendientes')
@HttpCode(HttpStatus.OK)
async relacionarPlanilladosPendientes(
  @Body(ValidationPipe) dto: RelacionarPlanilladosPendientesDto
): Promise<{ affected: number; message: string }> {
  try {
    // ✅ CORREGIDO - Desestructurar el DTO y pasar argumentos individuales
    const result = await this.planilladosService.relacionarPlanilladosPendientes(
      dto.cedulaLider,
      dto.liderId,
      dto.planilladoIds
    );
    
    return {
      affected: result.affected,
      message: `Se relacionaron ${result.affected} planillado(s) exitosamente`
    };
  } catch (error) {
    throw error;
  }
}

  /**
   * Obtener estadísticas de planillados pendientes
   * GET /planillados/estadisticas-pendientes
   */
  @Get('estadisticas-pendientes')
  @HttpCode(HttpStatus.OK)
  async getEstadisticasPlanilladosPendientes(): Promise<{
    totalPendientes: number;
    porCedulaLider: Record<string, number>;
    sinLider: number;
    resumen: string;
  }> {
    try {
      const stats = await this.planilladosService.getEstadisticasPlanilladosPendientes();
      
      return {
        ...stats,
        resumen: `${stats.totalPendientes} planillados pendientes de ${Object.keys(stats.porCedulaLider).length} líderes diferentes`
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Limpiar relaciones pendientes (útil para mantenimiento)
   * POST /planillados/limpiar-pendientes
   */
  @Post('limpiar-pendientes')
  @HttpCode(HttpStatus.OK)
  async limpiarRelacionesPendientes(
    @Body() body: { confirmar: boolean }
  ): Promise<{ message: string; eliminados: number }> {
    if (!body.confirmar) {
      return {
        message: 'Operación cancelada. Debe confirmar la acción.',
        eliminados: 0
      };
    }

    try {
      // Limpiar solo planillados que tienen cédula pendiente pero el líder no existe
      const result = await this.planilladosService.limpiarRelacionesPendientesOrfanas();
      
      return {
        message: `Se limpiaron ${result.affected} relaciones pendientes órfanas`,
        eliminados: result.affected
      };
    } catch (error) {
      throw error;
    }
  }

  // ✅ POST /planillados/bulk-actions - Acciones masivas
  @Post('bulk-actions')
  async bulkActions(@Body() bulkActionDto: { action: string; ids: number[] }) {
    const { action, ids } = bulkActionDto;

    if (!ids || ids.length === 0) {
      throw new BadRequestException('No se proporcionaron IDs para la acción masiva');
    }

    switch (action) {
      case 'verify':
        return this.planilladosService.bulkVerify(ids);
      case 'unverify':
        return this.planilladosService.bulkUnverify(ids);
      case 'delete':
        return this.planilladosService.bulkDelete(ids);
      case 'assignLeader':
        return this.planilladosService.bulkAssignLeader(ids, bulkActionDto['liderId']);
      case 'export':
        return this.planilladosService.bulkExport(ids);
      default:
        throw new BadRequestException(`Acción masiva no válida: ${action}`);
    }
  }

  // ✅ GET /planillados/barrios/list - Lista de barrios únicos
  @Get('barrios/list')
  async getBarrios() {
    return this.planilladosService.getUniqueBarrios();
  }

  // ✅ GET /planillados/municipios/list - Lista de municipios únicos
  @Get('municipios/list')
  async getMunicipios() {
    return this.planilladosService.getUniqueMunicipios();
  }

  // ✅ POST /planillados/validate - Validar datos antes de crear
  @Post('validate')
  async validate(@Body() data: CreatePlanilladoDto) {
    return this.planilladosService.validatePlanillado(data);
  }

  // ✅ GET /planillados/duplicates/check - Verificar duplicados
  @Get('duplicates/check')
  async checkDuplicates(@Query('cedula') cedula: string) {
    if (!cedula) {
      throw new BadRequestException('Cédula es requerida para verificar duplicados');
    }
    return this.planilladosService.checkDuplicates(cedula);
  }
}