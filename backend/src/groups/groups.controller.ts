// backend/src/groups/groups.controller.ts
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
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto, GroupFiltersDto } from './dto/group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async findAll(@Query() query: any) {
    const {
      page = 1,
      limit = 20,
      buscar,
      candidateId,
      zone,
      isActive,
      conLideres,
      conPlanillados,
      fechaDesde,
      fechaHasta,
    } = query;

    const filterDto: GroupFiltersDto = {
      buscar,
      candidateId: candidateId ? parseInt(candidateId) : undefined,
      zone,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      conLideres: conLideres === 'true',
      conPlanillados: conPlanillados === 'true',
      fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
    };

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
      throw new BadRequestException('Parámetros de paginación inválidos');
    }

    return this.groupsService.findAll(filterDto, pageNumber, limitNumber);
  }

  @Get('stats')
  async getStats(@Query() filters: GroupFiltersDto) {
    return this.groupsService.getStats(filters);
  }

  @Get('export')
  async exportToExcel(@Query() filters: GroupFiltersDto) {
    return this.groupsService.exportToExcel(filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }

  @Post()
  async create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.remove(id);
  }
}