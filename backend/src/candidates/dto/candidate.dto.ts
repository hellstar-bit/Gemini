// backend/src/candidates/dto/candidate.dto.ts
export interface CreateCandidateDto {
  name: string;
  email: string;
  phone?: string;
  meta: number;
  description?: string;
  position?: string;
  party?: string;
  isActive?: boolean;
}

export interface UpdateCandidateDto {
  name?: string;
  email?: string;
  phone?: string;
  meta?: number;
  description?: string;
  position?: string;
  party?: string;
  isActive?: boolean;
}

export interface CandidateFiltersDto {
  buscar?: string;
  position?: string;
  party?: string;
  isActive?: boolean;
  conGrupos?: boolean;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface CandidateStatsDto {
  total: number;
  activos: number;
  inactivos: number;
  totalGrupos: number;
  totalLideres: number;
  totalVotantes: number;
  promedioGruposPorCandidato: number;
  porPartido: Record<string, number>;
  porPosicion: Record<string, number>;
  cumplimientoMeta: {
    candidatoId: number;
    nombre: string;
    meta: number;
    actual: number;
    porcentaje: number;
  }[];
  topCandidatos: {
    candidatoId: number;
    nombre: string;
    grupos: number;
    lideres: number;
    votantes: number;
  }[];
}