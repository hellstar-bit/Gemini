// backend/src/import/dto/import.dto.ts - ACTUALIZADO

import { IsString, IsOptional, IsEmail, IsDateString, IsEnum, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

// ✅ DTO para importación masiva de planillados - ACTUALIZADO
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
  municipioVotacion?: string;

  @IsOptional()
  @IsString()
  zonaPuesto?: string;

  @IsOptional()
  @IsString()
  mesa?: string;

  // ✅ NUEVO CAMPO - Cédula del líder
  @IsOptional()
  @IsString()
  cedulaLider?: string;
}

// ✅ NUEVO DTO - Para relacionar planillados pendientes
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

// DTOs existentes actualizados...

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

// ✅ NUEVO DTO - Respuesta de planillados pendientes
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