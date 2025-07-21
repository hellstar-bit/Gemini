// backend/src/candidates/candidates.controller.ts
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
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto, UpdateCandidateDto, CandidateFiltersDto } from './dto/candidate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('candidates')
@UseGuards(JwtAuthGuard)
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  async findAll(@Query() query: any) {
    const {
      page = 1,
      limit = 20,
      buscar,
      position,
      party,
      isActive,
      conGrupos,
      fechaDesde,
      fechaHasta,
    } = query;

    const filterDto: CandidateFiltersDto = {
      buscar,
      position,
      party,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      conGrupos: conGrupos === 'true',
      fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
    };

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
      throw new BadRequestException('Parámetros de paginación inválidos');
    }

    return this.candidatesService.findAll(filterDto, pageNumber, limitNumber);
  }

  @Get('stats')
  async getStats(@Query() filters: CandidateFiltersDto) {
    return this.candidatesService.getStats(filters);
  }

  @Get('export')
  async exportToExcel(@Query() filters: CandidateFiltersDto) {
    return this.candidatesService.exportToExcel(filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.candidatesService.findOne(id);
  }

  @Post()
  async create(@Body() createCandidateDto: CreateCandidateDto) {
    return this.candidatesService.create(createCandidateDto);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateCandidateDto: UpdateCandidateDto) {
    return this.candidatesService.update(id, updateCandidateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.candidatesService.remove(id);
  }
}