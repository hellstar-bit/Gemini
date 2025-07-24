// backend/src/planillados/dto/planillado.dto.ts - ACTUALIZADO CON CÉDULA LÍDER

import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsBoolean, 
  IsNumber, 
  IsDateString,
  IsArray,
  Min,
  Max,
  Length
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

// =====================================
// ✅ DTO PRINCIPAL ACTUALIZADO
// =====================================

export class CreatePlanilladoDto {
  @IsString()
  @Length(6, 12)
  cedula: string;

  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsOptional()
  @IsString()
  celular?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  barrioVive?: string;

  @IsOptional()
  @IsDateString()
  fechaExpedicion?: string;

  @IsOptional()
  @IsString()
  departamentoVotacion?: string;

  @IsOptional()
  @IsString()
  municipioVotacion?: string;

  @IsOptional()
  @IsString()
  direccionVotacion?: string;

  @IsOptional()
  @IsString()
  zonaPuesto?: string;

  @IsOptional()
  @IsString()
  mesa?: string;

  @IsOptional()
  @IsEnum(['verificado', 'pendiente'])
  estado?: 'verificado' | 'pendiente';

  @IsOptional()
  @IsBoolean()
  esEdil?: boolean;

  @IsOptional()
  @IsNumber()
  liderId?: number;

  @IsOptional()
  @IsNumber()
  grupoId?: number;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsEnum(['M', 'F', 'Otro'])
  genero?: 'M' | 'F' | 'Otro';

  @IsOptional()
  @IsString()
  notas?: string;

  // ✅ NUEVO CAMPO - Cédula del líder pendiente
  @IsOptional()
  @IsString()
  @Length(6, 12)
  cedulaLiderPendiente?: string;
}

export class UpdatePlanilladoDto {
  @IsOptional()
  @IsString()
  @Length(6, 12)
  cedula?: string;

  @IsOptional()
  @IsString()
  nombres?: string;

  @IsOptional()
  @IsString()
  apellidos?: string;

  @IsOptional()
  @IsString()
  celular?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  barrioVive?: string;

  @IsOptional()
  @IsDateString()
  fechaExpedicion?: string;

  @IsOptional()
  @IsString()
  departamentoVotacion?: string;

  @IsOptional()
  @IsString()
  municipioVotacion?: string;

  @IsOptional()
  @IsString()
  direccionVotacion?: string;

  @IsOptional()
  @IsString()
  zonaPuesto?: string;

  @IsOptional()
  @IsString()
  mesa?: string;

  @IsOptional()
  @IsEnum(['verificado', 'pendiente'])
  estado?: 'verificado' | 'pendiente';

  @IsOptional()
  @IsBoolean()
  esEdil?: boolean;

  @IsOptional()
  @IsNumber()
  liderId?: number;

  @IsOptional()
  @IsNumber()
  grupoId?: number;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsEnum(['M', 'F', 'Otro'])
  genero?: 'M' | 'F' | 'Otro';

  @IsOptional()
  @IsString()
  notas?: string;

  // ✅ NUEVO CAMPO
  @IsOptional()
  @IsString()
  @Length(6, 12)
  cedulaLiderPendiente?: string;
}

// =====================================
// ✅ DTO DE FILTROS ACTUALIZADO
// =====================================

export class PlanilladoFiltersDto {
  @IsOptional()
  @IsString()
  buscar?: string;

  @IsOptional()
  @IsEnum(['verificado', 'pendiente'])
  estado?: 'verificado' | 'pendiente';

  @IsOptional()
  @IsString()
  barrioVive?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  liderId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  grupoId?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  esEdil?: boolean;

  @IsOptional()
  @IsEnum(['M', 'F', 'Otro'])
  genero?: 'M' | 'F' | 'Otro';

  @IsOptional()
  @IsString()
  municipioVotacion?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  actualizado?: boolean;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsEnum(['18-24', '25-34', '35-44', '45-54', '55-64', '65+'])
  rangoEdad?: '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';

  // ✅ NUEVOS FILTROS PARA CÉDULA LÍDER
  @IsOptional()
  @IsString()
  @Length(6, 12)
  cedulaLider?: string;

  @IsOptional()
  @IsString()
  @Length(6, 12)
  cedulaLiderPendiente?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  sinLider?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  conLiderPendiente?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  soloAsignados?: boolean;
}

// =====================================
// ✅ OTROS DTOs ACTUALIZADOS
// =====================================

export class PlanilladosStatsResponseDto {
  total: number;
  verificados: number;
  pendientes: number;
  ediles: number;
  porBarrio: Record<string, number>;
  porGenero: Record<string, number>;
  porEdad: Record<string, number>;
  porLider: Record<string, number>;
  porGrupo: Record<string, number>;
  nuevosHoy: number;
  nuevosEstaSemana: number;
  actualizadosHoy: number;

  // ✅ NUEVAS ESTADÍSTICAS
  conLiderPendiente: number;
  sinLider: number;
  totalConLider: number;
  porcentajeAsignacion: string;
}

export class PaginatedResponseDto<T> {
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

export class ValidationResultDto {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: any;
}

export class DuplicateCheckDto {
  exists: boolean;
  planillado?: {
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    estado: string;
  };
}

// =====================================
// ✅ NUEVOS DTOs PARA CÉDULA LÍDER
// =====================================

export class RelacionarPlanilladosPendientesDto {
  @IsString()
  @Length(6, 12)
  cedulaLider: string;

  @IsNumber()
  liderId: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  planilladoIds?: number[];
}

export class PlanilladosPendientesResponseDto {
  planillados: Array<{
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    cedulaLiderPendiente: string;
  }>;
  total: number;
  leader?: {
    id: number;
    cedula: string;
    firstName: string;
    lastName: string;
  };
}

export class EstadisticasPendientesDto {
  totalPendientes: number;
  porCedulaLider: Record<string, number>;
  sinLider: number;
  resumen: string;
}


// =====================================
// ✅ DTOs PARA ACCIONES MASIVAS
// =====================================

export class BulkActionDto {
  @IsEnum(['verify', 'unverify', 'delete', 'assignLeader', 'assignPendingLeader'])
  action: 'verify' | 'unverify' | 'delete' | 'assignLeader' | 'assignPendingLeader';

  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];

  @IsOptional()
  @IsNumber()
  liderId?: number;

  // ✅ NUEVO CAMPO
  @IsOptional()
  @IsString()
  @Length(6, 12)
  cedulaLider?: string;
}

export class ExportFiltersDto extends PlanilladoFiltersDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campos?: string[];

  @IsOptional()
  @IsBoolean()
  incluirEstadisticas?: boolean;

  @IsOptional()
  @IsEnum(['xlsx', 'csv', 'pdf'])
  formato?: 'xlsx' | 'csv' | 'pdf';
}