// frontend/src/services/importService.ts - Versión con tipos corregidos
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// =====================================
// INTERFACES Y TIPOS
// =====================================

export interface ImportPreview {
  data: Record<string, any>[];
  headers: string[];
  totalRows: number;
  sampleRows: Record<string, any>[];
  errors: string[];
  warnings: string[];
}

export interface ImportMapping {
  fileName: string;
  entityType: 'voters' | 'leaders' | 'candidates' | 'groups';
  fieldMappings: Record<string, string>;
  previewData: Record<string, any>[];
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  warnings: string[];
  executionTime: number;
}

export interface ImportError {
  row: number;
  field: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
}

export interface EntityField {
  key: string;
  label: string;
  required: boolean;
  type: 'string' | 'number' | 'email' | 'date' | 'enum' | 'text';
  description?: string;
  example?: string;
}

export interface EntityType {
  value: string;
  label: string;
  description: string;
  icon: string;
}

export interface ImportProgress {
  step: number;
  data: any;
  timestamp: number;
}

export interface ImportStats {
  lastImport?: Date;
  totalImports: number;
  totalRecordsImported: number;
  averageSuccessRate: number;
}

export interface ImportHistoryItem {
  id: string;
  fileName: string;
  entityType: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  createdAt: Date;
  status: 'completed' | 'failed' | 'processing';
}

export interface ImportStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentRow: number;
  totalRows: number;
  errors: ImportError[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ImportError[];
  warnings: string[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicates: number;
  };
}

export interface MappingQuality {
  score: number;
  requiredMapped: number;
  totalRequired: number;
  totalMapped: number;
  feedback: string;
}

export interface DataQualityReport {
  completeness: Record<string, number>;
  duplicates: string[];
  invalidFormats: Record<string, number>;
  recommendations: string[];
}

export interface TemplateData {
  headers: string[];
  sampleData: Record<string, any>[];
}

export interface StructureValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// =====================================
// SERVICIO PRINCIPAL
// =====================================

class ImportService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // ===========================================
  // MÉTODOS PRINCIPALES DE IMPORTACIÓN
  // ===========================================

  async previewFile(file: File): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/import/preview`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || 'Error al procesar archivo');
    }

    return response.json();
  }

  async importVoters(mapping: ImportMapping): Promise<ImportResult> {
    const response = await fetch(`${API_URL}/import/voters`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mapping),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || 'Error en importación');
    }

    return response.json();
  }

  async importLeaders(mapping: ImportMapping): Promise<ImportResult> {
    const response = await fetch(`${API_URL}/import/leaders`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mapping),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || 'Error en importación');
    }

    return response.json();
  }

  async importCandidates(mapping: ImportMapping): Promise<ImportResult> {
    const response = await fetch(`${API_URL}/import/candidates`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mapping),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || 'Error en importación');
    }

    return response.json();
  }

  async importGroups(mapping: ImportMapping): Promise<ImportResult> {
    const response = await fetch(`${API_URL}/import/groups`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mapping),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || 'Error en importación');
    }

    return response.json();
  }

  // ===========================================
  // UTILIDADES DE VALIDACIÓN
  // ===========================================

  validateFileType(file: File): boolean {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ];
    
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    return hasValidType || hasValidExtension;
  }

  validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  getFileSizeFormatted(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  validateDataStructure(headers: string[], entityType: string): StructureValidation {
    const fields = this.getFieldsForEntityType(entityType);
    const requiredFields = fields.filter(f => f.required);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!headers || headers.length === 0) {
      errors.push('El archivo no contiene columnas válidas');
      return { isValid: false, errors, warnings };
    }

    const suggestions = this.suggestFieldMappings(headers, entityType);
    const mappedRequiredFields = requiredFields.filter(field => 
      Object.values(suggestions).includes(field.key)
    );

    if (mappedRequiredFields.length < requiredFields.length) {
      const missingFields = requiredFields.filter(field => 
        !Object.values(suggestions).includes(field.key)
      );
      warnings.push(
        `No se detectaron automáticamente los campos requeridos: ${missingFields.map(f => f.label).join(', ')}`
      );
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // ===========================================
  // CONFIGURACIONES DE ENTIDADES
  // ===========================================

  getEntityTypes(): EntityType[] {
    return [
      { 
        value: 'voters', 
        label: 'Votantes', 
        description: 'Importar base de datos de votantes y simpatizantes',
        icon: '👥'
      },
      { 
        value: 'leaders', 
        label: 'Líderes', 
        description: 'Importar líderes de campaña y coordinadores',
        icon: '👤'
      },
      { 
        value: 'candidates', 
        label: 'Candidatos', 
        description: 'Importar candidatos y aspirantes',
        icon: '🎖️'
      },
      { 
        value: 'groups', 
        label: 'Grupos', 
        description: 'Importar grupos de campaña y organizaciones',
        icon: '🏛️'
      }
    ];
  }

  getFieldsForEntityType(entityType: string): EntityField[] {
  const fieldConfigurations: Record<string, EntityField[]> = {
    voters: [
      // ✅ Campos obligatorios (mantengo firstName y lastName para compatibilidad)
      { key: 'cedula', label: 'Cédula *', required: true, type: 'string', description: 'Número de identificación único', example: '12345678' },
      { key: 'firstName', label: 'Nombres *', required: true, type: 'string', description: 'Nombres completos del votante', example: 'Juan Carlos' },
      { key: 'lastName', label: 'Apellidos *', required: true, type: 'string', description: 'Apellidos completos del votante', example: 'Pérez García' },
      
      // ✅ Campos de contacto
      { key: 'phone', label: 'Celular', required: false, type: 'string', description: 'Número de celular', example: '3001234567' },
      { key: 'email', label: 'Email', required: false, type: 'email', description: 'Correo electrónico', example: 'juan.perez@email.com' },
      
      // ✅ Campos de ubicación
      { key: 'address', label: 'Dirección', required: false, type: 'string', description: 'Dirección de residencia', example: 'Calle 123 #45-67' },
      { key: 'neighborhood', label: 'Barrio', required: false, type: 'string', description: 'Barrio o sector', example: 'El Prado' },
      { key: 'municipality', label: 'Municipio', required: false, type: 'string', description: 'Municipio de residencia', example: 'Barranquilla' },
      
      // ✅ NUEVO - Fecha de expedición
      { key: 'expeditionDate', label: 'Fecha de Expedición', required: false, type: 'date', description: 'Fecha de expedición de la cédula (DD/MM/YYYY)', example: '15/05/2010' },
      
      // ✅ Campos adicionales opcionales
      { key: 'votingPlace', label: 'Mesa de Votación', required: false, type: 'string', description: 'Mesa o puesto de votación', example: 'Mesa 001' },
      { key: 'birthDate', label: 'Fecha de Nacimiento', required: false, type: 'date', description: 'Fecha de nacimiento (DD/MM/YYYY)', example: '15/05/1990' },
      { key: 'gender', label: 'Género', required: false, type: 'enum', description: 'Género (M, F, Otro)', example: 'M' },
      { key: 'leaderCedula', label: 'Cédula del Líder', required: false, type: 'string', description: 'Cédula del líder asignado', example: '87654321' },
      { key: 'commitment', label: 'Compromiso', required: false, type: 'enum', description: 'Nivel de compromiso', example: 'committed' },
      { key: 'notes', label: 'Notas', required: false, type: 'text', description: 'Observaciones adicionales', example: 'Votante activo' }
    ],
    leaders: [
      { key: 'cedula', label: 'Cédula *', required: true, type: 'string', description: 'Número de identificación único', example: '87654321' },
      { key: 'firstName', label: 'Primer Nombre *', required: true, type: 'string', description: 'Primer nombre del líder', example: 'María' },
      { key: 'lastName', label: 'Apellido *', required: true, type: 'string', description: 'Apellidos del líder', example: 'González López' },
      { key: 'phone', label: 'Teléfono', required: false, type: 'string', description: 'Número de teléfono', example: '3009876543' },
      { key: 'email', label: 'Email', required: false, type: 'email', description: 'Correo electrónico', example: 'maria.gonzalez@email.com' },
      { key: 'address', label: 'Dirección', required: false, type: 'string', description: 'Dirección de residencia', example: 'Carrera 50 #80-25' },
      { key: 'neighborhood', label: 'Barrio', required: false, type: 'string', description: 'Barrio de trabajo', example: 'La Concepción' },
      { key: 'municipality', label: 'Municipio', required: false, type: 'string', description: 'Municipio de operación', example: 'Barranquilla' },
      { key: 'birthDate', label: 'Fecha de Nacimiento', required: false, type: 'date', description: 'Fecha de nacimiento', example: '1985-03-20' },
      { key: 'gender', label: 'Género', required: false, type: 'enum', description: 'Género (M, F, Other)', example: 'F' },
      { key: 'meta', label: 'Meta de Votantes', required: false, type: 'number', description: 'Objetivo de votantes', example: '50' },
      { key: 'groupName', label: 'Nombre del Grupo', required: false, type: 'string', description: 'Grupo al que pertenece', example: 'Grupo Norte' }
    ],
    candidates: [
      { key: 'name', label: 'Nombre Completo *', required: true, type: 'string', description: 'Nombre completo del candidato', example: 'Carlos Alberto Rodríguez' },
      { key: 'email', label: 'Email *', required: true, type: 'email', description: 'Correo electrónico oficial', example: 'carlos.rodriguez@campaña.com' },
      { key: 'phone', label: 'Teléfono', required: false, type: 'string', description: 'Número de contacto', example: '3151234567' },
      { key: 'meta', label: 'Meta de Votos', required: false, type: 'number', description: 'Objetivo de votos', example: '50000' },
      { key: 'description', label: 'Descripción', required: false, type: 'text', description: 'Descripción del candidato', example: 'Candidato con experiencia' },
      { key: 'position', label: 'Cargo', required: false, type: 'string', description: 'Cargo al que aspira', example: 'Alcalde' },
      { key: 'party', label: 'Partido Político', required: false, type: 'string', description: 'Partido político', example: 'Partido Democrático' }
    ],
    groups: [
      { key: 'name', label: 'Nombre del Grupo *', required: true, type: 'string', description: 'Nombre del grupo', example: 'Grupo Norte Barranquilla' },
      { key: 'description', label: 'Descripción', required: false, type: 'text', description: 'Descripción del grupo', example: 'Grupo de trabajo zona norte' },
      { key: 'zone', label: 'Zona Geográfica', required: false, type: 'string', description: 'Zona de cobertura', example: 'Norte' },
      { key: 'meta', label: 'Meta de Votantes', required: false, type: 'number', description: 'Objetivo de votantes', example: '500' },
      { key: 'candidateName', label: 'Nombre del Candidato', required: false, type: 'string', description: 'Candidato que apoya', example: 'Carlos Alberto Rodríguez' }
    ]
  };

  return fieldConfigurations[entityType] || [];
}

  // ===========================================
  // SUGERENCIAS AUTOMÁTICAS
  // ===========================================

  suggestFieldMappings(headers: string[], entityType: string): Record<string, string> {
  const fields = this.getFieldsForEntityType(entityType);
  const suggestions: Record<string, string> = {};

  // ✅ REGLAS DE MAPEO MEJORADAS para tu formato específico
  const mappingRules: Record<string, string[]> = {
    cedula: [
      'cedula', 'documento', 'identificacion', 'id', 'cc', 'dni',
      'numero_documento', 'num_doc', 'documento_identidad'
    ],
    firstName: [
      'nombres', 'nombre', 'first_name', 'primer_nombre', 'name',
      'nombres_completos', 'nombre_completo'
    ],
    lastName: [
      'apellidos', 'apellido', 'last_name', 'surname', 'segundo_nombre',
      'apellidos_completos', 'apellido_completo'
    ],
    phone: [
      'celular', 'telefono', 'phone', 'movil', 'tel', 'numero',
      'numero_celular', 'telefono_celular', 'movil_numero'
    ],
    email: [
      'email', 'correo', 'mail', 'correo_electronico',
      'e_mail', 'correo_email'
    ],
    address: [
      'direccion', 'address', 'domicilio', 'residencia',
      'direccion_residencia', 'dir'
    ],
    neighborhood: [
      'barrio', 'neighborhood', 'sector', 'zona',
      'barrio_residencia', 'localidad'
    ],
    municipality: [
      'municipio', 'municipality', 'ciudad', 'localidad',
      'mpio', 'municipio_residencia'
    ],
    // ✅ NUEVO - Reglas para fecha de expedición
    expeditionDate: [
      'fecha_expedicion', 'fechaexpedicion', 'fecha_de_expedicion',
      'expedicion', 'fecha_exp', 'exp', 'fecha_expedicion_cedula',
      'fecha de expedicion', 'fecha expedicion'
    ],
    votingPlace: ['mesa', 'puesto_votacion', 'voting_place', 'mesa_votacion'],
    birthDate: ['fecha_nacimiento', 'birth_date', 'nacimiento', 'fecha_nac'],
    gender: ['genero', 'sexo', 'gender'],
    name: ['nombre_completo', 'full_name', 'nombre'],
    meta: ['meta', 'objetivo', 'target'],
    description: ['descripcion', 'description', 'desc'],
    position: ['cargo', 'position', 'puesto'],
    party: ['partido', 'party', 'partido_politico'],
    zone: ['zona', 'zone', 'area'],
    groupName: ['grupo', 'group', 'nombre_grupo'],
    candidateName: ['candidato', 'candidate', 'nombre_candidato'],
    leaderCedula: ['lider', 'leader', 'cedula_lider'],
    commitment: ['compromiso', 'commitment', 'nivel'],
    notes: ['notas', 'notes', 'observaciones']
  };

    fields.forEach(field => {
      const rules = mappingRules[field.key];
      if (rules) {
        const matchedHeader = headers.find(header => {
          const headerLower = header.toLowerCase().trim();
          return rules.some(rule => {
            const ruleLower = rule.toLowerCase();
            return headerLower === ruleLower || 
                   headerLower.includes(ruleLower) || 
                   ruleLower.includes(headerLower);
          });
        });
        
        if (matchedHeader) {
          suggestions[matchedHeader] = field.key;
        }
      }
    });

    return suggestions;
  }

  getMappingQuality(suggestions: Record<string, string>, entityType: string): MappingQuality {
    const fields = this.getFieldsForEntityType(entityType);
    const requiredFields = fields.filter(f => f.required);
    const mappedFields = Object.values(suggestions);
    
    const requiredMapped = requiredFields.filter(field => 
      mappedFields.includes(field.key)
    ).length;
    
    const totalMapped = mappedFields.length;
    const totalRequired = requiredFields.length;
    
    const score = Math.round(
      ((requiredMapped / totalRequired) * 0.7 + (totalMapped / fields.length) * 0.3) * 100
    );

    let feedback = '';
    if (score >= 80) {
      feedback = 'Excelente mapeo automático detectado';
    } else if (score >= 60) {
      feedback = 'Buen mapeo, revisa campos faltantes';
    } else if (score >= 40) {
      feedback = 'Mapeo parcial, configura campos manualmente';
    } else {
      feedback = 'Mapeo manual requerido';
    }

    return { score, requiredMapped, totalRequired, totalMapped, feedback };
  }

  // ===========================================
  // VALIDACIÓN DE DATOS
  // ===========================================

  validateImportData(
  data: Record<string, any>[], 
  fieldMappings: Record<string, string>, 
  entityType: string
): ValidationResult {
  const fields = this.getFieldsForEntityType(entityType);
  const requiredFields = fields.filter(f => f.required);
  const errors: ImportError[] = [];
  const warnings: string[] = [];
  const seenValues = new Set<string>();
  let duplicates = 0;

  data.forEach((row, index) => {
    const rowNumber = index + 1;

    // Validar campos requeridos
    requiredFields.forEach(field => {
      const csvColumn = Object.keys(fieldMappings).find(
        key => fieldMappings[key] === field.key
      );
      
      if (csvColumn) {
        const value = row[csvColumn];
        if (!value || String(value).trim() === '') {
          errors.push({
            row: rowNumber,
            field: field.key,
            value: value,
            error: `${field.label} es requerido`,
            severity: 'error'
          });
        }
      }
    });

    // Validar duplicados por cédula
    const cedulaColumn = Object.keys(fieldMappings).find(
      key => fieldMappings[key] === 'cedula'
    );
    
    if (cedulaColumn && row[cedulaColumn]) {
      const cedula = String(row[cedulaColumn]).trim();
      
      // Validar formato de cédula (solo números)
      if (!/^\d+$/.test(cedula)) {
        errors.push({
          row: rowNumber,
          field: 'cedula',
          value: cedula,
          error: 'Cédula debe contener solo números',
          severity: 'error'
        });
      }
      
      // Validar duplicados
      if (seenValues.has(cedula)) {
        duplicates++;
        errors.push({
          row: rowNumber,
          field: 'cedula',
          value: cedula,
          error: 'Cédula duplicada en el archivo',
          severity: 'warning'
        });
      } else {
        seenValues.add(cedula);
      }
    }

    // Validar formato de email
    const emailColumn = Object.keys(fieldMappings).find(
      key => fieldMappings[key] === 'email'
    );
    
    if (emailColumn && row[emailColumn]) {
      const email = String(row[emailColumn]).trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({
          row: rowNumber,
          field: 'email',
          value: email,
          error: 'Formato de email inválido',
          severity: 'warning'
        });
      }
    }

    // ✅ NUEVO - Validar formato de celular
    const phoneColumn = Object.keys(fieldMappings).find(
      key => fieldMappings[key] === 'phone'
    );
    
    if (phoneColumn && row[phoneColumn]) {
      const phone = String(row[phoneColumn]).trim();
      if (phone && !/^[0-9+\-\s()]{7,15}$/.test(phone)) {
        errors.push({
          row: rowNumber,
          field: 'phone',
          value: phone,
          error: 'Formato de celular inválido',
          severity: 'warning'
        });
      }
    }

    // ✅ NUEVO - Validar formato de fecha de expedición
    const expeditionDateColumn = Object.keys(fieldMappings).find(
      key => fieldMappings[key] === 'expeditionDate'
    );
    
    if (expeditionDateColumn && row[expeditionDateColumn]) {
      const fecha = String(row[expeditionDateColumn]).trim();
      if (fecha && !this.isValidDate(fecha)) {
        errors.push({
          row: rowNumber,
          field: 'expeditionDate',
          value: fecha,
          error: 'Formato de fecha inválido (use DD/MM/YYYY)',
          severity: 'warning'
        });
      }
    }

    // ✅ NUEVO - Validar formato de fecha de nacimiento
    const birthDateColumn = Object.keys(fieldMappings).find(
      key => fieldMappings[key] === 'birthDate'
    );
    
    if (birthDateColumn && row[birthDateColumn]) {
      const fecha = String(row[birthDateColumn]).trim();
      if (fecha && !this.isValidDate(fecha)) {
        errors.push({
          row: rowNumber,
          field: 'birthDate',
          value: fecha,
          error: 'Formato de fecha inválido (use DD/MM/YYYY)',
          severity: 'warning'
        });
      }
    }
  });

  const criticalErrors = errors.filter(e => e.severity === 'error');
  const validRows = data.length - criticalErrors.length;

  return {
    isValid: criticalErrors.length === 0,
    errors,
    warnings,
    stats: {
      totalRows: data.length,
      validRows,
      invalidRows: criticalErrors.length,
      duplicates
    }
  };
}

  // ===========================================
  // ESTADÍSTICAS Y HISTORIAL
  // ===========================================

  async getImportStats(): Promise<ImportStats> {
    try {
      const response = await fetch(`${API_URL}/import/stats`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('No se pudieron obtener estadísticas de importación');
    }

    return {
      totalImports: 0,
      totalRecordsImported: 0,
      averageSuccessRate: 0
    };
  }

  async getImportHistory(limit: number = 10): Promise<ImportHistoryItem[]> {
    try {
      const response = await fetch(`${API_URL}/import/history?limit=${limit}`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('No se pudo obtener historial de importaciones');
    }

    return [];
  }

  async cancelImport(importId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/import/${importId}/cancel`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Error cancelando importación:', error);
      return false;
    }
  }

  async checkImportStatus(importId: string): Promise<ImportStatusResponse> {
    const response = await fetch(`${API_URL}/import/${importId}/status`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error verificando estado de importación');
    }

    return response.json();
  }

  async checkServerConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // ===========================================
  // UTILIDADES DE GESTIÓN
  // ===========================================

  saveImportProgress(step: number, data: any): void {
    localStorage.setItem('gemini_import_progress', JSON.stringify({
      step,
      data,
      timestamp: Date.now()
    }));
  }

  getImportProgress(): ImportProgress | null {
    const progress = localStorage.getItem('gemini_import_progress');
    if (progress) {
      try {
        const parsed = JSON.parse(progress) as ImportProgress;
        // Solo recuperar si es de las últimas 24 horas
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed;
        } else {
          localStorage.removeItem('gemini_import_progress');
          return null;
        }
      } catch (error) {
        localStorage.removeItem('gemini_import_progress');
        return null;
      }
    }
    return null;
  }

  clearImportCache(): void {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('gemini_import_')
    );
    keys.forEach(key => localStorage.removeItem(key));
  }

  // ===========================================
  // LIMPIEZA Y NORMALIZACIÓN
  // ===========================================

  cleanImportData(data: Record<string, any>[], fieldMappings: Record<string, string>): Record<string, any>[] {
    return data.map(row => {
      const cleanedRow: Record<string, any> = {};
      
      Object.entries(fieldMappings).forEach(([csvColumn, entityField]) => {
        let value = row[csvColumn];
        
        if (value !== null && value !== undefined) {
          value = String(value).trim();
          
          switch (entityField) {
            case 'cedula':
              value = value.replace(/\D/g, '');
              break;
            case 'phone':
              value = value.replace(/[\s\-\(\)]/g, '');
              break;
            case 'firstName':
            case 'lastName':
              value = this.capitalizeWords(value);
              break;
            case 'gender':
              value = this.normalizeGender(value);
              break;
            case 'commitment':
              value = this.normalizeCommitment(value);
              break;
          }
          
          cleanedRow[csvColumn] = value || null;
        }
      });
      
      return cleanedRow;
    });
  }

  private capitalizeWords(text: string): string {
    return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  private normalizeGender(value: string): string {
    const normalized = value.toLowerCase().trim();
    
    if (['m', 'masculino', 'male', 'hombre'].includes(normalized)) {
      return 'M';
    } else if (['f', 'femenino', 'female', 'mujer'].includes(normalized)) {
      return 'F';
    } else {
      return 'Other';
    }
  }

  private normalizeCommitment(value: string): string {
    const normalized = value.toLowerCase().trim();
    
    if (['comprometido', 'committed', 'seguro', 'fijo'].includes(normalized)) {
      return 'committed';
    } else if (['potencial', 'potential', 'posible'].includes(normalized)) {
      return 'potential';
    } else if (['indeciso', 'undecided', 'dudoso'].includes(normalized)) {
      return 'undecided';
    } else if (['opuesto', 'opposed', 'contrario'].includes(normalized)) {
      return 'opposed';
    } else {
      return 'potential';
    }
  }

  // ===========================================
  // REPORTES Y PLANTILLAS
  // ===========================================

  generateDataQualityReport(
    data: Record<string, any>[], 
    fieldMappings: Record<string, string>
  ): DataQualityReport {
    const completeness: Record<string, number> = {};
    const duplicates: string[] = [];
    const invalidFormats: Record<string, number> = {};
    const recommendations: string[] = [];
    
    const seenCedulas = new Set<string>();
    
    Object.entries(fieldMappings).forEach(([csvColumn, entityField]) => {
      let validCount = 0;
      let invalidCount = 0;
      
      data.forEach((row, index) => {
        const value = row[csvColumn];
        
        if (value && String(value).trim() !== '') {
          validCount++;
          
          if (entityField === 'email' && value) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
              invalidCount++;
            }
          }
          
          if (entityField === 'cedula' && value) {
            const cedula = String(value).trim();
            if (seenCedulas.has(cedula)) {
              duplicates.push(`Fila ${index + 1}: ${cedula}`);
            } else {
              seenCedulas.add(cedula);
            }
          }
        }
      });
      
      completeness[entityField] = Math.round((validCount / data.length) * 100);
      if (invalidCount > 0) {
        invalidFormats[entityField] = invalidCount;
      }
    });
    
    Object.entries(completeness).forEach(([field, percentage]) => {
      if (percentage < 50) {
        recommendations.push(`Campo ${field}: Solo ${percentage}% completo. Considera obtener más datos.`);
      }
    });
    
    if (duplicates.length > 0) {
      recommendations.push(`Se encontraron ${duplicates.length} cédulas duplicadas. Revisa y limpia los datos.`);
    }
    
    if (Object.keys(invalidFormats).length > 0) {
      recommendations.push('Algunos campos tienen formatos inválidos. Revisa la validación de datos.');
    }
    
    return { completeness, duplicates, invalidFormats, recommendations };
  }

  generateTemplate(entityType: string): TemplateData {
  const fields = this.getFieldsForEntityType(entityType);
  const headers = fields.map(field => field.label.replace(' *', ''));
  
  const sampleData: Record<string, any>[] = [];
  
  if (entityType === 'voters') {
    sampleData.push(
      {
        'Cédula': '12345678',
        'Nombres': 'Juan Carlos',
        'Apellidos': 'Pérez García',
        'Celular': '3001234567',
        'Email': 'juan.perez@email.com',
        'Dirección': 'Calle 123 #45-67',
        'Barrio': 'El Prado',
        'Municipio': 'Barranquilla',
        'Fecha de Expedición': '15/05/2010'
      },
      {
        'Cédula': '87654321',
        'Nombres': 'María Fernanda',
        'Apellidos': 'González López',
        'Celular': '3009876543',
        'Email': 'maria.gonzalez@email.com',
        'Dirección': 'Carrera 50 #80-25',
        'Barrio': 'La Concepción',
        'Municipio': 'Barranquilla',
        'Fecha de Expedición': '20/03/2008'
      },
      {
        'Cédula': '11223344',
        'Nombres': 'Carlos Alberto',
        'Apellidos': 'Rodríguez Martínez',
        'Celular': '3151122334',
        'Email': 'carlos.rodriguez@email.com',
        'Dirección': 'Avenida 15 #30-45',
        'Barrio': 'Centro',
        'Municipio': 'Barranquilla',
        'Fecha de Expedición': '10/12/2015'
      }
    );
  } else if (entityType === 'leaders') {
    sampleData.push(
      {
        'Cédula': '11223344',
        'Primer Nombre': 'Carlos',
        'Apellido': 'Rodríguez',
        'Teléfono': '3001122334',
        'Email': 'carlos.rodriguez@email.com',
        'Meta de Votantes': '50',
        'Nombre del Grupo': 'Grupo Norte'
      }
    );
  } else if (entityType === 'candidates') {
    sampleData.push(
      {
        'Nombre Completo': 'Ana Patricia Mendoza',
        'Email': 'ana.mendoza@campaña.com',
        'Teléfono': '3151234567',
        'Cargo': 'Alcaldesa',
        'Partido Político': 'Partido Progresista'
      }
    );
  } else if (entityType === 'groups') {
    sampleData.push(
      {
        'Nombre del Grupo': 'Coordinación Norte',
        'Descripción': 'Grupo de trabajo zona norte',
        'Zona Geográfica': 'Norte',
        'Meta de Votantes': '500'
      }
    );
  }

  return { headers, sampleData };
}

// ✅ NUEVA función auxiliar para validar fechas
private isValidDate(dateString: string): boolean {
  // Acepta formatos: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
  const patterns = [
    /^\d{2}\/\d{2}\/\d{4}$/,  // DD/MM/YYYY
    /^\d{2}-\d{2}-\d{4}$/,   // DD-MM-YYYY
    /^\d{4}-\d{2}-\d{2}$/    // YYYY-MM-DD
  ];
  
  return patterns.some(pattern => pattern.test(dateString));
}

  exportImportResults(result: ImportResult, format: 'csv' | 'xlsx' = 'csv'): void {
    const data = result.errors.map(error => ({
      Fila: error.row,
      Campo: error.field,
      Valor: error.value,
      Error: error.error,
      Severidad: error.severity
    }));

    if (format === 'csv') {
      this.downloadCSV(data, 'errores_importacion.csv');
    }
  }

  private downloadCSV(data: Record<string, any>[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        `"${String(row[header] || '').replace(/"/g, '""')}"`
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
}

// Instancia singleton del servicio
export const importService = new ImportService();