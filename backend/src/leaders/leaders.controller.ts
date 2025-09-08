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
export class LeadersController {
  constructor(private readonly leadersService: LeadersService) {}

  // ✅ CORREGIR GET /leaders - Asegurar que soporte groupId
  @Get()
  async findAll(@Query() query: any): Promise<PaginatedResponse<Leader>> {
    const {
      page = '1',
      limit = '20',
      buscar,
      isActive,
      isVerified,
      groupId,        // ✅ AGREGAR: groupId
      candidateId,    // ✅ AGREGAR: candidateId 
      neighborhood,
      municipality,
      gender,
      fechaDesde,
      fechaHasta,
    } = query;

    // ✅ CORREGIR: Construcción de filtros
    const filterDto: LeaderFiltersDto = {
      buscar,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
      groupId: groupId ? parseInt(groupId) : undefined,           // ✅ AGREGAR
      candidateId: candidateId ? parseInt(candidateId) : undefined, // ✅ AGREGAR
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

    // ✅ AGREGAR: Logging para debug
    console.log('Leaders Controller - findAll called with:', {
      filterDto,
      page: pageNumber,
      limit: limitNumber
    });

    try {
      const result = await this.leadersService.findAll(filterDto, pageNumber, limitNumber);
      
      // ✅ AGREGAR: Log del resultado
      console.log('Leaders Controller - Result:', {
        total: result.meta.total,
        returned: result.data.length,
        groupId: filterDto.groupId
      });
      
      return result;
    } catch (error) {
      console.error('Leaders Controller - Error:', error);
      throw error;
    }
  }

  // ✅ AGREGAR: Endpoint específico para jerarquía
  @Get('by-group/:groupId')
  async findByGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() query: any
  ): Promise<PaginatedResponse<Leader>> {
    const {
      page = '1',
      limit = '20',
      buscar,
      isActive,
      isVerified,
      neighborhood,
      municipality,
      gender,
    } = query;

    const filterDto: LeaderFiltersDto = {
      buscar,
      groupId, // ✅ Filtrar específicamente por este grupo
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
      neighborhood,
      municipality,
      gender,
    };

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    console.log(`Leaders Controller - findByGroup ${groupId}:`, filterDto);

    return this.leadersService.findAll(filterDto, pageNumber, limitNumber);
  }

  // ✅ RESTO DE MÉTODOS SIN CAMBIOS...
  @Get('stats')
  async getStats(@Query() filters: LeaderFiltersDto): Promise<LeaderStatsDto> {
    return this.leadersService.getStats(filters);
  }

  @Get('for-select')
  async findForSelect(): Promise<LeaderForSelect[]> {
    return this.leadersService.findForSelect();
  }

  @Get('export')
  async exportToExcel(@Query() filters: LeaderFiltersDto): Promise<Leader[]> {
    return this.leadersService.exportToExcel(filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Leader> {
    return this.leadersService.findOne(id);
  }

  @Get(':id/planillados')
  async getPlanillados(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
    return this.leadersService.getPlanillados(id);
  }

  @Post()
  async create(@Body() createLeaderDto: CreateLeaderDto): Promise<Leader> {
    return this.leadersService.create(createLeaderDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeaderDto: UpdateLeaderDto,
  ): Promise<Leader> {
    return this.leadersService.update(id, updateLeaderDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.leadersService.remove(id);
  }

  @Post('bulk-actions')
  async bulkActions(@Body() bulkActionDto: { 
    action: string; 
    ids: number[]; 
    groupId?: number;
  }): Promise<any> {
    return this.leadersService.bulkAction(
      bulkActionDto.action,
      bulkActionDto.ids,
      bulkActionDto.groupId
    );
  }
}