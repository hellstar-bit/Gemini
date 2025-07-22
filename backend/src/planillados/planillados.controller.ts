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
} from '@nestjs/common';
import { PlanilladosService } from './planillados.service';
import { CreatePlanilladoDto, UpdatePlanilladoDto, PlanilladoFiltersDto } from './dto/planillado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('planillados')
@UseGuards(JwtAuthGuard)

export class PlanilladosController {
  constructor(private readonly planilladosService: PlanilladosService) {}

  // ✅ GET /planillados - Listar con filtros y paginación
  @Get()
  async findAll(@Query() query: any) {
    const {
      page = 1,
      limit = 20,
      buscar,
      estado,
      barrioVive,
      liderId,
      grupoId,
      esEdil,
      genero,
      rangoEdad,
      municipioVotacion,
      fechaDesde,
      fechaHasta,
      actualizado,
      ...filters
    } = query;

    // Construir filtros
    const filterDto: PlanilladoFiltersDto = {
      buscar,
      estado,
      barrioVive,
      liderId: liderId ? parseInt(liderId) : undefined,
      grupoId: grupoId ? parseInt(grupoId) : undefined,
      esEdil: esEdil === 'true' ? true : esEdil === 'false' ? false : undefined,
      genero,
      rangoEdad,
      municipioVotacion,
      fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
      actualizado: actualizado === 'true' ? true : actualizado === 'false' ? false : undefined,
    };

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
      throw new BadRequestException('Parámetros de paginación inválidos');
    }

    return this.planilladosService.findAll(filterDto, pageNumber, limitNumber);
  }

  @Get('geographic-data')
  async getGeographicData(@Query() filters: PlanilladoFiltersDto) {
  return this.planilladosService.getGeographicData(filters);
}

  // ✅ GET /planillados/stats - Estadísticas
  @Get('stats')
  async getStats(@Query() filters: PlanilladoFiltersDto) {
    return this.planilladosService.getStats(filters);
  }

  // ✅ GET /planillados/export - Exportar a Excel
  @Get('export')
async exportToExcel(
  @Query() filters: PlanilladoFiltersDto,
  @Res() res: any // Use 'any' for Response object to avoid type issues with express
) {
  try {
    const excelBuffer = await this.planilladosService.exportToExcel(filters);
    
    // ✅ CONFIGURAR HEADERS CORRECTOS
    const fileName = `planillados_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': excelBuffer.length.toString(),
    });

    res.send(excelBuffer);
    
  } catch (error) {
    console.error('Error exportando:', error);
    res.status(500).json({ 
      message: 'Error generando archivo de exportación',
      error: error.message 
    });
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