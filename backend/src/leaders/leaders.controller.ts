// backend/src/leaders/leaders.controller.ts - CORREGIDO
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
} from '@nestjs/common';
import { LeadersService } from './leaders.service';
import { CreateLeaderDto, UpdateLeaderDto, LeaderFiltersDto, LeaderStatsDto } from './dto/leader.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Leader } from './entities/leader.entity';

// ✅ Definir interfaces localmente para evitar problemas de importación
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

interface LeaderForSelect {
  id: number;
  name: string;
  groupName?: string;
}

interface DuplicateCheckResponse {
  exists: boolean;
  leader?: {
    id: number;
    cedula: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
}

interface BulkActionResponse {
  affected: number;
}

@Controller('leaders')
@UseGuards(JwtAuthGuard)
export class LeadersController {
  constructor(private readonly leadersService: LeadersService) {}

  // ✅ GET /leaders - Listar con filtros y paginación
  @Get()
  async findAll(@Query() query: any): Promise<PaginatedResponse<Leader>> {
    const {
      page = 1,
      limit = 20,
      buscar,
      isActive,
      isVerified,
      groupId,
      neighborhood,
      municipality,
      gender,
      fechaDesde,
      fechaHasta,
      ...filters
    } = query;

    // Construir filtros
    const filterDto: LeaderFiltersDto = {
      buscar,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
      groupId: groupId ? parseInt(groupId) : undefined,
      neighborhood,
      municipality,
      gender,
      fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
    };

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
      throw new BadRequestException('Parámetros de paginación inválidos');
    }

    return this.leadersService.findAll(filterDto, pageNumber, limitNumber);
  }

  // ✅ GET /leaders/stats - Estadísticas
  @Get('stats')
  async getStats(@Query() filters: LeaderFiltersDto): Promise<LeaderStatsDto> {
    return this.leadersService.getStats(filters);
  }

  // ✅ GET /leaders/for-select - Lista para dropdowns
  @Get('for-select')
  async findForSelect(): Promise<LeaderForSelect[]> {
    return this.leadersService.findForSelect();
  }

  // ✅ GET /leaders/export - Exportar a Excel
  @Get('export')
  async exportToExcel(@Query() filters: LeaderFiltersDto): Promise<Leader[]> {
    return this.leadersService.exportToExcel(filters);
  }

  // ✅ GET /leaders/:id - Obtener por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Leader> {
    return this.leadersService.findOne(id);
  }

  // ✅ GET /leaders/:id/planillados - Obtener planillados del líder
  @Get(':id/planillados')
  async getPlanillados(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
    // Cambié de getVoters a getPlanillados ya que trabajamos con planillados
    return this.leadersService.getPlanillados(id);
  }

  // ✅ POST /leaders - Crear nuevo líder
  @Post()
  async create(@Body() createLeaderDto: CreateLeaderDto): Promise<Leader> {
    return this.leadersService.create(createLeaderDto);
  }

  // ✅ PATCH /leaders/:id - Actualizar líder
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeaderDto: UpdateLeaderDto,
  ): Promise<Leader> {
    return this.leadersService.update(id, updateLeaderDto);
  }

  // ✅ DELETE /leaders/:id - Eliminar líder
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.leadersService.remove(id);
  }

  // ✅ POST /leaders/bulk-actions - Acciones masivas
  @Post('bulk-actions')
  async bulkActions(@Body() bulkActionDto: { 
    action: string; 
    ids: number[]; 
    groupId?: number;
  }): Promise<BulkActionResponse> {
    const { action, ids, groupId } = bulkActionDto;

    if (!ids || ids.length === 0) {
      throw new BadRequestException('No se proporcionaron IDs para la acción masiva');
    }

    switch (action) {
      case 'activate':
        return this.leadersService.bulkActivate(ids);
      case 'deactivate':
        return this.leadersService.bulkDeactivate(ids);
      case 'verify':
        return this.leadersService.bulkVerify(ids);
      case 'delete':
        return this.leadersService.bulkDelete(ids);
      case 'assignGroup':
        if (!groupId) {
          throw new BadRequestException('ID del grupo es requerido para asignación masiva');
        }
        return this.leadersService.bulkAssignGroup(ids, groupId);
      default:
        throw new BadRequestException(`Acción masiva no válida: ${action}`);
    }
  }

  // ✅ GET /leaders/duplicates/check - Verificar duplicados
  @Get('duplicates/check')
  async checkDuplicates(@Query('cedula') cedula: string): Promise<DuplicateCheckResponse> {
    if (!cedula) {
      throw new BadRequestException('Cédula es requerida para verificar duplicados');
    }
    return this.leadersService.checkDuplicates(cedula);
  }
}