// backend/src/import/dto/import.dto.ts

export class ImportPreviewDto {
  data: any[];
  headers: string[];
  totalRows: number;
  sampleRows: any[];
  errors: string[];
  warnings: string[];
}

export class ImportMappingDto {
  fileName: string;
  entityType: 'voters' | 'leaders' | 'candidates' | 'groups';
  fieldMappings: Record<string, string>; // { csvColumn: entityField }
  previewData: any[];
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

export class BulkImportVoterDto {
  cedula: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  municipality?: string;
  votingPlace?: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'Other';
  leaderCedula?: string; // Para asociar con líder
  commitment?: 'committed' | 'potential' | 'undecided' | 'opposed';
  notes?: string;
}

export class BulkImportLeaderDto {
  cedula: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  municipality?: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'Other';
  meta?: number;
  groupName?: string; // Para asociar con grupo
}

export class BulkImportCandidateDto {
  name: string;
  email: string;
  phone?: string;
  meta?: number;
  description?: string;
  position?: string;
  party?: string;
}

export class BulkImportGroupDto {
  name: string;
  description?: string;
  zone?: string;
  meta?: number;
  candidateName?: string; // Para asociar con candidato
}