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
  @Length(1, 100)
  buscar?: string;

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

  @IsOptional()
  @IsString()
  @Length(1, 100)
  neighborhood?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  municipality?: string;

  @IsOptional()
  @IsEnum(['M', 'F', 'Other'])
  gender?: 'M' | 'F' | 'Other';

  @IsOptional()
  @IsDateString()
  fechaDesde?: Date;

  @IsOptional()
  @IsDateString()
  fechaHasta?: Date;
}

// ✅ DTO para respuesta de estadísticas
export interface LeaderStatsDto {
  total: number;
  activos: number;
  verificados: number;
  promedioVotantes: number;
  porGrupo: Record<string, number>;
  porBarrio: Record<string, number>;
  topLideres: Record<string, number>;
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