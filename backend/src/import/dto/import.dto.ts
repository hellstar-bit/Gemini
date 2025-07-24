// backend/src/import/dto/import.dto.ts - CORREGIDO

import { IsString, IsOptional, IsEmail, IsDateString, IsEnum, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

// ✅ DTO CORREGIDO para importación masiva de planillados
export class BulkImportPlanilladoDto {
  @IsString()
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
  @IsString()
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

  // ✅ CAMPO CRÍTICO - Cédula del líder
  @IsOptional()
  @IsString()
  liderCedula?: string;

  @IsOptional()
  @IsString()
  grupoNombre?: string;

  @IsOptional()
  @IsString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsEnum(['M', 'F', 'Otro'])
  genero?: 'M' | 'F' | 'Otro';

  @IsOptional()
  @IsString()
  notas?: string;
}

// ✅ DTO CORREGIDO para importación masiva de líderes
export class BulkImportLeaderDto {
  @IsString()
  cedula: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  municipality?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(['M', 'F', 'Other'])
  gender?: 'M' | 'F' | 'Other';

  @IsOptional()
  @IsNumber()
  meta?: number;

  @IsOptional()
  @IsString()
  groupName?: string; // Para mapear por nombre de grupo
}

// ✅ DTO CORREGIDO para importación masiva de candidatos
export class BulkImportCandidateDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNumber()
  meta?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  party?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ✅ DTO CORREGIDO para importación masiva de grupos
export class BulkImportGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsNumber()
  meta?: number;

  @IsOptional()
  @IsString()
  candidateName?: string; // Para mapear por nombre de candidato

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ✅ DTO LEGACY para compatibilidad (renombrado de planillados)
export class BulkImportVoterDto extends BulkImportPlanilladoDto {
  // Hereda todos los campos de BulkImportPlanilladoDto
  // Mantenido para compatibilidad con código existente
}

// ✅ DTO para relacionar planillados pendientes
export class RelacionarPlanilladosPendientesDto {
  @IsString()
  cedulaLider: string;

  @IsNumber()
  liderId: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  planilladoIds?: number[];
}

// ✅ DTOs para el flujo de importación
export class ImportPreviewDto {
  data: Record<string, any>[];
  headers: string[];
  totalRows: number;
  sampleRows: Record<string, any>[];
  errors: string[];
  warnings: string[];
}

export class ImportMappingDto {
  fileName: string;
  
  @IsEnum(['voters', 'leaders', 'candidates', 'groups', 'planillados'])
  entityType: 'voters' | 'leaders' | 'candidates' | 'groups' | 'planillados';
  
  fieldMappings: Record<string, string>;
  previewData: Record<string, any>[];
}

export class ImportResultDto {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportErrorDto[];
  warnings: string[];
  executionTime: number;
}

export class ImportErrorDto {
  row: number;
  field: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
}

// ✅ DTO de respuesta para planillados pendientes
export class PlanilladosPendientesResponseDto {
  planillados: {
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    cedulaLiderPendiente: string;
  }[];
  total: number;
  leader?: {
    id: number;
    cedula: string;
    firstName: string;
    lastName: string;
  };
}