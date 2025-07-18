// backend/src/planillados/dto/planillado.dto.ts
import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, Length, Matches, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// ✅ DTO para crear planillado
export class CreatePlanilladoDto {
  @IsNotEmpty({ message: 'La cédula es requerida' })
  @IsString()
  @Length(8, 10, { message: 'La cédula debe tener entre 8 y 10 dígitos' })
  @Matches(/^\d+$/, { message: 'La cédula solo debe contener números' })
  cedula: string;

  @IsNotEmpty({ message: 'Los nombres son requeridos' })
  @IsString()
  @Length(2, 150, { message: 'Los nombres deben tener entre 2 y 150 caracteres' })
  nombres: string;

  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  @IsString()
  @Length(2, 150, { message: 'Los apellidos deben tener entre 2 y 150 caracteres' })
  apellidos: string;

  @IsOptional()
  @IsString()
  @Matches(/^3\d{9}$/, { message: 'El celular debe tener 10 dígitos y empezar por 3' })
  celular?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255, { message: 'La dirección no puede exceder 255 caracteres' })
  direccion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'El barrio no puede exceder 100 caracteres' })
  barrioVive?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha de expedición inválida' })
  fechaExpedicion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  departamentoVotacion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  municipioVotacion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  direccionVotacion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  zonaPuesto?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  mesa?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  esEdil?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'ID del líder inválido' })
  @Type(() => Number)
  liderId?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'ID del grupo inválido' })
  @Type(() => Number)
  grupoId?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha de nacimiento inválida' })
  fechaNacimiento?: string;

  @IsOptional()
  @IsEnum(['M', 'F', 'Otro'], { message: 'Género debe ser M, F u Otro' })
  genero?: 'M' | 'F' | 'Otro';

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Las notas no pueden exceder 500 caracteres' })
  notas?: string;
}

// ✅ DTO para actualizar planillado
export class UpdatePlanilladoDto {
  @IsOptional()
  @IsString()
  @Length(8, 10, { message: 'La cédula debe tener entre 8 y 10 dígitos' })
  @Matches(/^\d+$/, { message: 'La cédula solo debe contener números' })
  cedula?: string;

  @IsOptional()
  @IsString()
  @Length(2, 150, { message: 'Los nombres deben tener entre 2 y 150 caracteres' })
  nombres?: string;

  @IsOptional()
  @IsString()
  @Length(2, 150, { message: 'Los apellidos deben tener entre 2 y 150 caracteres' })
  apellidos?: string;

  @IsOptional()
  @IsString()
  @Matches(/^3\d{9}$/, { message: 'El celular debe tener 10 dígitos y empezar por 3' })
  celular?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  direccion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  barrioVive?: string;

  @IsOptional()
  @IsDateString()
  fechaExpedicion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  departamentoVotacion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  municipioVotacion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  direccionVotacion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  zonaPuesto?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  mesa?: string;

  @IsOptional()
  @IsEnum(['verificado', 'pendiente'], { message: 'Estado debe ser verificado o pendiente' })
  estado?: 'verificado' | 'pendiente';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  esEdil?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  actualizado?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  liderId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  grupoId?: number;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsEnum(['M', 'F', 'Otro'])
  genero?: 'M' | 'F' | 'Otro';

  @IsOptional()
  @IsString()
  @Length(0, 500)
  notas?: string;
}

// ✅ DTO para filtros de búsqueda
export class PlanilladoFiltersDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  buscar?: string;

  @IsOptional()
  @IsEnum(['verificado', 'pendiente'])
  estado?: 'verificado' | 'pendiente';

  @IsOptional()
  @IsString()
  @Length(1, 100)
  barrioVive?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  liderId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
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
  @IsEnum(['18-24', '25-34', '35-44', '45-54', '55-64', '65+'])
  rangoEdad?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  municipioVotacion?: string;

  @IsOptional()
  @IsDateString()
  fechaDesde?: Date;

  @IsOptional()
  @IsDateString()
  fechaHasta?: Date;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  actualizado?: boolean;
}

// ✅ DTO para respuesta de estadísticas
export interface PlanilladosStatsResponseDto {
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
}

// ✅ DTO para respuesta paginada
export interface PaginatedResponseDto<T> {
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

// ✅ DTO para validación de planillado
export interface ValidationResultDto {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: {
    municipioVotacion?: string;
    barrioVive?: string;
    zonaPuesto?: string;
  };
}

// ✅ DTO para verificar duplicados
export interface DuplicateCheckDto {
  exists: boolean;
  planillado?: {
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    estado: string;
  };
}

// ✅ DTO para acciones masivas
export class BulkActionDto {
  @IsNotEmpty()
  @IsEnum(['verify', 'unverify', 'delete', 'assignLeader', 'export'])
  action: 'verify' | 'unverify' | 'delete' | 'assignLeader' | 'export';

  @IsNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  liderId?: number; // Para acción assignLeader
}