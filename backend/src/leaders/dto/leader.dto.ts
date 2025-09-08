// backend/src/leaders/dto/leader.dto.ts
import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, Length, Matches, Min, IsEmail } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// ✅ DTO para crear líder
export class CreateLeaderDto {
  @IsNotEmpty({ message: 'La cédula es requerida' })
  @IsString()
  @Length(8, 10, { message: 'La cédula debe tener entre 8 y 10 dígitos' })
  @Matches(/^\d+$/, { message: 'La cédula solo debe contener números' })
  cedula: string;

  @IsNotEmpty({ message: 'El primer nombre es requerido' })
  @IsString()
  @Length(2, 100, { message: 'El primer nombre debe tener entre 2 y 100 caracteres' })
  firstName: string;

  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  @IsString()
  @Length(2, 100, { message: 'Los apellidos deben tener entre 2 y 100 caracteres' })
  lastName: string;

  @IsOptional()
  @IsString()
  @Matches(/^3\d{9}$/, { message: 'El teléfono debe tener 10 dígitos y empezar por 3' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @Length(1, 255, { message: 'El email no puede exceder 255 caracteres' })
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255, { message: 'La dirección no puede exceder 255 caracteres' })
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'El barrio no puede exceder 100 caracteres' })
  neighborhood?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'El municipio no puede exceder 100 caracteres' })
  municipality?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha de nacimiento inválida' })
  birthDate?: string;

  @IsOptional()
  @IsEnum(['M', 'F', 'Other'], { message: 'Género debe ser M, F u Other' })
  gender?: 'M' | 'F' | 'Other';

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'La meta debe ser un número positivo' })
  @Type(() => Number)
  meta?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'ID del grupo inválido' })
  @Type(() => Number)
  groupId?: number;
}

// ✅ DTO para actualizar líder
export class UpdateLeaderDto {
  @IsOptional()
  @IsString()
  @Length(8, 10, { message: 'La cédula debe tener entre 8 y 10 dígitos' })
  @Matches(/^\d+$/, { message: 'La cédula solo debe contener números' })
  cedula?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'El primer nombre debe tener entre 2 y 100 caracteres' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Los apellidos deben tener entre 2 y 100 caracteres' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^3\d{9}$/, { message: 'El teléfono debe tener 10 dígitos y empezar por 3' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @Length(1, 255)
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  neighborhood?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  municipality?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(['M', 'F', 'Other'])
  gender?: 'M' | 'F' | 'Other';

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  meta?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isVerified?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  groupId?: number;
}

// ✅ DTO para filtros de búsqueda
export class LeaderFiltersDto {
  @IsOptional()
  @IsString()
  buscar?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isVerified?: boolean;

  // ✅ AGREGAR: groupId para filtrar por grupo
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  groupId?: number;

  // ✅ AGREGAR: candidateId para filtrar por candidato
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  candidateId?: number;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  municipality?: string;

  @IsOptional()
  @IsString()
  gender?: 'M' | 'F' | 'Otro';

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  fechaDesde?: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  fechaHasta?: Date;
}
export interface LeaderForSelect {
  id: number;
  firstName: string;
  lastName: string;
  cedula: string;
  isActive: boolean;
  groupName?: string;
}

// ✅ DTO para respuesta de estadísticas
export class LeaderStatsDto {
  total: number;
  activos: number;
  inactivos: number;
  verificados: number;
  noVerificados: number;
  
  // Estadísticas por grupo
  porGrupo: Record<string, number>;
  
  // Estadísticas por barrio/municipio
  porBarrio: Record<string, number>;
  porMunicipio: Record<string, number>;
  
  // Estadísticas por género
  porGenero: Record<string, number>;
  
  // Estadísticas de rendimiento
  promedioVotantesPorLider: number;
  lideresConMeta: number;
  lideresSinMeta: number;
  
  // Top performers
  topLideres: Array<{
    id: number;
    nombre: string;
    grupo: string;
    votantes: number;
    meta: number;
    porcentaje: number;
  }>;
}
export interface HierarchyLeaderResponse {
  id: number;
  cedula: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  municipality?: string;
  meta: number;
  isActive: boolean;
  isVerified: boolean;
  groupId: number;
  group?: {
    id: number;
    name: string;
    candidate?: {
      id: number;
      name: string;
    };
  };
  planilladosCount: number;
  votersCount: number; // Alias para planilladosCount
  createdAt: string;
  updatedAt: string;
}
// ✅ DTO para acciones masivas
export class BulkLeaderActionDto {
  @IsNotEmpty()
  @IsEnum(['activate', 'deactivate', 'verify', 'delete', 'assignGroup'])
  action: 'activate' | 'deactivate' | 'verify' | 'delete' | 'assignGroup';

  @IsNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  groupId?: number; // Para acción assignGroup
}