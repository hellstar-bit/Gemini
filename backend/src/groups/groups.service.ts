// backend/src/groups/groups.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto, UpdateGroupDto, GroupFiltersDto, GroupStatsDto } from './dto/group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
  ) {}

  async findAll(filters: GroupFiltersDto = {}, page = 1, limit = 20) {
    const queryBuilder = this.createQueryBuilder(filters);
    
    // Agregar información de relaciones
    queryBuilder
      .leftJoinAndSelect('group.candidate', 'candidate')
      .loadRelationCountAndMap('group.leadersCount', 'group.leaders')
      .loadRelationCountAndMap('group.planilladosCount', 'group.planillados');

    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Ordenamiento
    queryBuilder.addOrderBy('group.name', 'ASC');

    const [groups, total] = await queryBuilder.getManyAndCount();

    return {
      data: groups,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['candidate', 'leaders', 'planillados'],
    });

    if (!group) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }

    return group;
  }

  async create(createGroupDto: CreateGroupDto) {
    // Validar que no exista un grupo con el mismo nombre para el mismo candidato
    const existing = await this.groupRepository.findOne({
      where: { 
        name: createGroupDto.name,
        candidateId: createGroupDto.candidateId 
      },
    });

    if (existing) {
      throw new BadRequestException(`Ya existe un grupo con el nombre "${createGroupDto.name}" para este candidato`);
    }

    const group = this.groupRepository.create(createGroupDto);
    const savedGroup = await this.groupRepository.save(group);

    return this.findOne(savedGroup.id);
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.findOne(id);

    // Validar nombre único si se está actualizando
    if (updateGroupDto.name && updateGroupDto.name !== group.name) {
      const existing = await this.groupRepository.findOne({
        where: { 
          name: updateGroupDto.name,
          candidateId: updateGroupDto.candidateId || group.candidateId
        },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(`Ya existe un grupo con el nombre "${updateGroupDto.name}" para este candidato`);
      }
    }

    Object.assign(group, updateGroupDto);
    await this.groupRepository.save(group);

    return this.findOne(id);
  }

  async remove(id: number) {
    const group = await this.findOne(id);
    
    // Verificar que no tenga líderes o planillados asociados
    const leadersCount = await this.groupRepository
      .createQueryBuilder('g')
      .leftJoin('g.leaders', 'l')
      .where('g.id = :id', { id })
      .andWhere('l.isActive = true')
      .getCount();

    if (leadersCount > 0) {
      throw new BadRequestException('No se puede eliminar el grupo porque tiene líderes activos asociados');
    }

    const planilladosCount = await this.groupRepository
      .createQueryBuilder('g')
      .leftJoin('g.planillados', 'p')
      .where('g.id = :id', { id })
      .getCount();

    if (planilladosCount > 0) {
      throw new BadRequestException('No se puede eliminar el grupo porque tiene planillados asociados');
    }

    await this.groupRepository.remove(group);
    return { message: 'Grupo eliminado exitosamente' };
  }

  async getStats(filters: GroupFiltersDto = {}): Promise<GroupStatsDto> {
    const queryBuilder = this.createQueryBuilder(filters);

    const total = await queryBuilder.getCount();
    const activos = await this.createQueryBuilder({ ...filters, isActive: true }).getCount();
    const inactivos = total - activos;

    // Estadísticas de líderes y planillados
    const grupos = await queryBuilder
      .leftJoinAndSelect('group.candidate', 'candidate')
      .loadRelationCountAndMap('group.leadersCount', 'group.leaders')
      .loadRelationCountAndMap('group.planilladosCount', 'group.planillados')
      .getMany();

    const totalLideres = grupos.reduce((sum, group) => sum + (group.leadersCount || 0), 0);
    const totalPlanillados = grupos.reduce((sum, group) => sum + (group.planilladosCount || 0), 0);

    // Estadísticas por candidato
    const porCandidato = grupos.reduce((acc, group) => {
      const candidatoNombre = group.candidate?.name || 'Sin candidato';
      acc[candidatoNombre] = (acc[candidatoNombre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Estadísticas por zona
    const porZona = grupos.reduce((acc, group) => {
      const zona = group.zone || 'Sin zona';
      acc[zona] = (acc[zona] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Cumplimiento de meta
    const cumplimientoMeta = grupos.map(group => ({
      grupoId: group.id,
      nombre: group.name,
      meta: group.meta,
      actual: group.planilladosCount || 0,
      porcentaje: group.meta > 0 ? Math.round(((group.planilladosCount || 0) / group.meta) * 100) : 0,
    })).sort((a, b) => b.porcentaje - a.porcentaje);

    return {
      total,
      activos,
      inactivos,
      totalLideres,
      totalPlanillados,
      promedioLideresPorGrupo: total > 0 ? Math.round(totalLideres / total) : 0,
      promedioPlanilladosPorGrupo: total > 0 ? Math.round(totalPlanillados / total) : 0,
      porCandidato,
      porZona,
      cumplimientoMeta,
    };
  }

  async exportToExcel(filters: GroupFiltersDto = {}) {
    const queryBuilder = this.createQueryBuilder(filters);
    
    const groups = await queryBuilder
      .leftJoinAndSelect('group.candidate', 'candidate')
      .loadRelationCountAndMap('group.leadersCount', 'group.leaders')
      .loadRelationCountAndMap('group.planilladosCount', 'group.planillados')
      .getMany();

    const excelData = groups.map(group => ({
      ID: group.id,
      Nombre: group.name,
      Descripción: group.description || '',
      Zona: group.zone || '',
      Meta: group.meta,
      'Planillados Actuales': group.planilladosCount || 0,
      'Cumplimiento (%)': group.meta > 0 ? Math.round(((group.planilladosCount || 0) / group.meta) * 100) : 0,
      Candidato: group.candidate?.name || '',
      'Líderes Asignados': group.leadersCount || 0,
      Estado: group.isActive ? 'Activo' : 'Inactivo',
      'Fecha de Creación': group.createdAt.toLocaleDateString(),
    }));

    // Aquí irías la lógica de exportación a Excel usando una librería como 'exceljs'
    return {
      data: excelData,
      filename: `grupos_${new Date().toISOString().split('T')[0]}.xlsx`,
    };
  }

  private createQueryBuilder(filters: GroupFiltersDto): SelectQueryBuilder<Group> {
    const queryBuilder = this.groupRepository.createQueryBuilder('group');

    if (filters.buscar) {
      queryBuilder.andWhere(
        '(group.name ILIKE :buscar OR group.description ILIKE :buscar OR group.zone ILIKE :buscar)',
        { buscar: `%${filters.buscar}%` }
      );
    }

    if (filters.candidateId) {
      queryBuilder.andWhere('group.candidateId = :candidateId', { candidateId: filters.candidateId });
    }

    if (filters.zone) {
      queryBuilder.andWhere('group.zone ILIKE :zone', { zone: `%${filters.zone}%` });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('group.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.fechaDesde && filters.fechaHasta) {
      queryBuilder.andWhere('group.createdAt BETWEEN :fechaDesde AND :fechaHasta', {
        fechaDesde: filters.fechaDesde,
        fechaHasta: filters.fechaHasta,
      });
    }

    return queryBuilder;
  }
}