// backend/src/candidates/candidates.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Candidate } from './entities/candidate.entity';
import { CreateCandidateDto, UpdateCandidateDto, CandidateFiltersDto, CandidateStatsDto } from './dto/candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
  ) {}

  async findAll(filters: CandidateFiltersDto = {}, page = 1, limit = 20) {
    const queryBuilder = this.createQueryBuilder(filters);
    
    // Agregar conteos de relaciones
    queryBuilder
      .loadRelationCountAndMap('candidate.groupsCount', 'candidate.groups')
      .loadRelationCountAndMap('candidate.leadersCount', 'candidate.groups.leaders')
      .loadRelationCountAndMap('candidate.votersCount', 'candidate.groups.planillados');

    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Ordenamiento
    queryBuilder.addOrderBy('candidate.name', 'ASC');

    const [candidates, total] = await queryBuilder.getManyAndCount();

    // Calcular estadísticas adicionales para cada candidato
    for (const candidate of candidates) {
      const stats = await this.getCandidateDetailedStats(candidate.id);
      candidate.leadersCount = stats.leadersCount;
      candidate.votersCount = stats.votersCount;
    }

    return {
      data: candidates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const candidate = await this.candidateRepository.findOne({
      where: { id },
      relations: ['groups', 'groups.leaders', 'groups.planillados'],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidato con ID ${id} no encontrado`);
    }

    // Calcular estadísticas detalladas
    const stats = await this.getCandidateDetailedStats(id);
    candidate.groupsCount = stats.groupsCount;
    candidate.leadersCount = stats.leadersCount;
    candidate.votersCount = stats.votersCount;

    return candidate;
  }

  async create(createCandidateDto: CreateCandidateDto) {
    // Validar email único
    const existingEmail = await this.candidateRepository.findOne({
      where: { email: createCandidateDto.email },
    });

    if (existingEmail) {
      throw new BadRequestException(`Ya existe un candidato con el email ${createCandidateDto.email}`);
    }

    // Validar nombre único
    const existingName = await this.candidateRepository.findOne({
      where: { name: createCandidateDto.name },
    });

    if (existingName) {
      throw new BadRequestException(`Ya existe un candidato con el nombre ${createCandidateDto.name}`);
    }

    const candidate = this.candidateRepository.create(createCandidateDto);
    const savedCandidate = await this.candidateRepository.save(candidate);

    return this.findOne(savedCandidate.id);
  }

  async update(id: number, updateCandidateDto: UpdateCandidateDto) {
    const candidate = await this.findOne(id);

    // Validar email único si se está actualizando
    if (updateCandidateDto.email && updateCandidateDto.email !== candidate.email) {
      const existing = await this.candidateRepository.findOne({
        where: { email: updateCandidateDto.email },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(`Ya existe un candidato con el email ${updateCandidateDto.email}`);
      }
    }

    // Validar nombre único si se está actualizando
    if (updateCandidateDto.name && updateCandidateDto.name !== candidate.name) {
      const existing = await this.candidateRepository.findOne({
        where: { name: updateCandidateDto.name },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(`Ya existe un candidato con el nombre ${updateCandidateDto.name}`);
      }
    }

    Object.assign(candidate, updateCandidateDto);
    await this.candidateRepository.save(candidate);

    return this.findOne(id);
  }

  async remove(id: number) {
    const candidate = await this.findOne(id);
    
    // Verificar que no tenga grupos asociados
    const groupsCount = await this.candidateRepository
      .createQueryBuilder('c')
      .leftJoin('c.groups', 'g')
      .where('c.id = :id', { id })
      .andWhere('g.isActive = true')
      .getCount();

    if (groupsCount > 0) {
      throw new BadRequestException('No se puede eliminar el candidato porque tiene grupos activos asociados');
    }

    await this.candidateRepository.remove(candidate);
    return { message: 'Candidato eliminado exitosamente' };
  }

  async getStats(filters: CandidateFiltersDto = {}): Promise<CandidateStatsDto> {
    const queryBuilder = this.createQueryBuilder(filters);

    const total = await queryBuilder.getCount();
    const activos = await this.createQueryBuilder({ ...filters, isActive: true }).getCount();
    const inactivos = total - activos;

    // Obtener candidatos con estadísticas
    const candidates = await queryBuilder
      .loadRelationCountAndMap('candidate.groupsCount', 'candidate.groups')
      .getMany();

    const totalGrupos = candidates.reduce((sum, candidate) => sum + (candidate.groupsCount || 0), 0);

    // Estadísticas detalladas
    let totalLideres = 0;
    let totalVotantes = 0;

    for (const candidate of candidates) {
      const stats = await this.getCandidateDetailedStats(candidate.id);
      totalLideres += stats.leadersCount;
      totalVotantes += stats.votersCount;
    }

    // Estadísticas por partido
    const porPartido = candidates.reduce((acc, candidate) => {
      const partido = candidate.party || 'Sin partido';
      acc[partido] = (acc[partido] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Estadísticas por posición
    const porPosicion = candidates.reduce((acc, candidate) => {
      const posicion = candidate.position || 'Sin definir';
      acc[posicion] = (acc[posicion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Cumplimiento de meta
    const cumplimientoMeta = await Promise.all(
      candidates.map(async (candidate) => {
        const stats = await this.getCandidateDetailedStats(candidate.id);
        return {
          candidatoId: candidate.id,
          nombre: candidate.name,
          meta: candidate.meta,
          actual: stats.votersCount,
          porcentaje: candidate.meta > 0 ? Math.round((stats.votersCount / candidate.meta) * 100) : 0,
        };
      })
    );

    cumplimientoMeta.sort((a, b) => b.porcentaje - a.porcentaje);

    // Top candidatos
    const topCandidatos = await Promise.all(
      candidates.slice(0, 10).map(async (candidate) => {
        const stats = await this.getCandidateDetailedStats(candidate.id);
        return {
          candidatoId: candidate.id,
          nombre: candidate.name,
          grupos: stats.groupsCount,
          lideres: stats.leadersCount,
          votantes: stats.votersCount,
        };
      })
    );

    topCandidatos.sort((a, b) => b.votantes - a.votantes);

    return {
      total,
      activos,
      inactivos,
      totalGrupos,
      totalLideres,
      totalVotantes,
      promedioGruposPorCandidato: total > 0 ? Math.round(totalGrupos / total) : 0,
      porPartido,
      porPosicion,
      cumplimientoMeta,
      topCandidatos,
    };
  }

  async exportToExcel(filters: CandidateFiltersDto = {}) {
    const queryBuilder = this.createQueryBuilder(filters);
    
    const candidates = await queryBuilder
      .loadRelationCountAndMap('candidate.groupsCount', 'candidate.groups')
      .getMany();

    const excelData = await Promise.all(
      candidates.map(async (candidate) => {
        const stats = await this.getCandidateDetailedStats(candidate.id);
        return {
          ID: candidate.id,
          Nombre: candidate.name,
          Email: candidate.email,
          Teléfono: candidate.phone || '',
          Posición: candidate.position || '',
          Partido: candidate.party || '',
          Meta: candidate.meta,
          'Votantes Actuales': stats.votersCount,
          'Cumplimiento (%)': candidate.meta > 0 ? Math.round((stats.votersCount / candidate.meta) * 100) : 0,
          'Grupos Asociados': stats.groupsCount,
          'Líderes Total': stats.leadersCount,
          Estado: candidate.isActive ? 'Activo' : 'Inactivo',
          'Fecha de Creación': candidate.createdAt.toLocaleDateString(),
        };
      })
    );

    return {
      data: excelData,
      filename: `candidatos_${new Date().toISOString().split('T')[0]}.xlsx`,
    };
  }

  private async getCandidateDetailedStats(candidateId: number) {
    const result = await this.candidateRepository
      .createQueryBuilder('c')
      .leftJoin('c.groups', 'g')
      .leftJoin('g.leaders', 'l')
      .leftJoin('g.planillados', 'p')
      .select([
        'COUNT(DISTINCT g.id) as groupsCount',
        'COUNT(DISTINCT l.id) as leadersCount',
        'COUNT(DISTINCT p.id) as votersCount',
      ])
      .where('c.id = :candidateId', { candidateId })
      .getRawOne();

    return {
      groupsCount: parseInt(result.groupsCount) || 0,
      leadersCount: parseInt(result.leadersCount) || 0,
      votersCount: parseInt(result.votersCount) || 0,
    };
  }

  private createQueryBuilder(filters: CandidateFiltersDto): SelectQueryBuilder<Candidate> {
    const queryBuilder = this.candidateRepository.createQueryBuilder('candidate');

    if (filters.buscar) {
      queryBuilder.andWhere(
        '(candidate.name ILIKE :buscar OR candidate.email ILIKE :buscar OR candidate.position ILIKE :buscar OR candidate.party ILIKE :buscar)',
        { buscar: `%${filters.buscar}%` }
      );
    }

    if (filters.position) {
      queryBuilder.andWhere('candidate.position ILIKE :position', { position: `%${filters.position}%` });
    }

    if (filters.party) {
      queryBuilder.andWhere('candidate.party ILIKE :party', { party: `%${filters.party}%` });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('candidate.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.fechaDesde && filters.fechaHasta) {
      queryBuilder.andWhere('candidate.createdAt BETWEEN :fechaDesde AND :fechaHasta', {
        fechaDesde: filters.fechaDesde,
        fechaHasta: filters.fechaHasta,
      });
    }

    return queryBuilder;
  }
}