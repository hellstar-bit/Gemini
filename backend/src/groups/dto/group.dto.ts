// backend/src/groups/dto/group.dto.ts
export interface CreateGroupDto {
  name: string;
  description?: string;
  zone?: string;
  meta: number;
  candidateId: number;
  isActive?: boolean;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  zone?: string;
  meta?: number;
  candidateId?: number;
  isActive?: boolean;
}

export interface GroupFiltersDto {
  buscar?: string;
  candidateId?: number;
  zone?: string;
  isActive?: boolean;
  conLideres?: boolean;
  conPlanillados?: boolean;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface GroupStatsDto {
  total: number;
  activos: number;
  inactivos: number;
  totalLideres: number;
  totalPlanillados: number;
  promedioLideresPorGrupo: number;
  promedioPlanilladosPorGrupo: number;
  porCandidato: Record<string, number>;
  porZona: Record<string, number>;
  cumplimientoMeta: {
    grupoId: number;
    nombre: string;
    meta: number;
    actual: number;
    porcentaje: number;
  }[];
}