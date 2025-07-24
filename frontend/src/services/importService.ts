// frontend/src/services/importService.ts - VERSIÓN COMPLETA CON TIPADO CORREGIDO

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// =====================================
// TIPOS Y INTERFACES
// =====================================

export type EntityType = 'planillados' | 'leaders' | 'candidates' | 'groups';

export interface EntityField {
  key: string;
  label: string;
  required: boolean;
  example: string;
}

export type EntityFieldsConfig = Record<EntityType, EntityField[]>;

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
  entityType: EntityType;
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

export interface MappingQuality {
  score: number;
  requiredMapped: number;
  totalRequired: number;
  totalMapped: number;
  feedback: string;
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

// =====================================
// CONFIGURACIONES
// =====================================

export const ENTITY_TYPES: Array<{ value: EntityType; label: string; description: string; icon: string }> = [
  {
    value: 'planillados',
    label: 'Planillados',
    description: 'Personas registradas en las planillas electorales',
    icon: '📋'
  },
  {
    value: 'leaders',
    label: 'Líderes',
    description: 'Líderes comunitarios y coordinadores',
    icon: '👥'
  },
  {
    value: 'candidates',
    label: 'Candidatos',
    description: 'Candidatos a cargos de elección popular',
    icon: '🏛️'
  },
  {
    value: 'groups',
    label: 'Grupos',
    description: 'Grupos de trabajo y equipos de campaña',
    icon: '🎯'
  }
];

export const ENTITY_FIELDS: EntityFieldsConfig = {
  planillados: [
    { key: 'cedula', label: 'Cédula', required: true, example: '12345678' },
    { key: 'nombres', label: 'Nombres', required: true, example: 'Juan Carlos' },
    { key: 'apellidos', label: 'Apellidos', required: true, example: 'Pérez García' },
    { key: 'celular', label: 'Celular', required: false, example: '3001234567' },
    { key: 'direccion', label: 'Dirección', required: false, example: 'Calle 123 #45-67' },
    { key: 'barrioVive', label: 'Barrio donde vive', required: false, example: 'El Prado' },
    { key: 'fechaExpedicion', label: 'Fecha de expedición', required: false, example: '15/05/2010' },
    { key: 'departamentoVotacion', label: 'Departamento de votación', required: false, example: 'Atlántico' },
    { key: 'municipioVotacion', label: 'Municipio de votación', required: false, example: 'Barranquilla' },
    { key: 'direccionVotacion', label: 'Dirección de votación', required: false, example: 'Calle 50 #30-20' },
    { key: 'zonaPuesto', label: 'Zona y puesto', required: false, example: 'Zona 1 - Puesto 5' },
    { key: 'mesa', label: 'Mesa', required: false, example: '001' },
    { key: 'cedulaLider', label: 'Cédula del líder', required: false, example: '87654321' },
    { key: 'grupoNombre', label: 'Nombre del grupo', required: false, example: 'Grupo Norte' },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', required: false, example: '20/03/1985' },
    { key: 'genero', label: 'Género', required: false, example: 'M' },
    { key: 'notas', label: 'Notas', required: false, example: 'Observaciones adicionales' }
  ],
  leaders: [
    { key: 'cedula', label: 'Cédula', required: true, example: '12345678' },
    { key: 'firstName', label: 'Nombres', required: true, example: 'María' },
    { key: 'lastName', label: 'Apellidos', required: true, example: 'González' },
    { key: 'phone', label: 'Teléfono', required: false, example: '3001234567' },
    { key: 'email', label: 'Email', required: false, example: 'maria@email.com' },
    { key: 'address', label: 'Dirección', required: false, example: 'Calle 45 #23-67' },
    { key: 'neighborhood', label: 'Barrio', required: false, example: 'Las Flores' },
    { key: 'municipality', label: 'Municipio', required: false, example: 'Barranquilla' },
    { key: 'birthDate', label: 'Fecha de nacimiento', required: false, example: '15/08/1980' },
    { key: 'gender', label: 'Género', required: false, example: 'F' },
    { key: 'meta', label: 'Meta de votantes', required: false, example: '500' },
    { key: 'groupName', label: 'Nombre del grupo', required: false, example: 'Grupo Centro' }
  ],
  candidates: [
    { key: 'name', label: 'Nombre', required: true, example: 'Carlos Rodríguez' },
    { key: 'email', label: 'Email', required: true, example: 'carlos@email.com' },
    { key: 'phone', label: 'Teléfono', required: false, example: '3001234567' },
    { key: 'position', label: 'Cargo', required: false, example: 'Alcalde' },
    { key: 'party', label: 'Partido', required: false, example: 'Partido X' },
    { key: 'meta', label: 'Meta de votos', required: false, example: '10000' },
    { key: 'description', label: 'Descripción', required: false, example: 'Candidato a la alcaldía' }
  ],
  groups: [
    { key: 'name', label: 'Nombre', required: true, example: 'Grupo Norte' },
    { key: 'description', label: 'Descripción', required: false, example: 'Grupo de trabajo zona norte' },
    { key: 'zone', label: 'Zona', required: false, example: 'Norte' },
    { key: 'meta', label: 'Meta', required: false, example: '1000' },
    { key: 'candidateName', label: 'Nombre del candidato', required: false, example: 'Carlos Rodríguez' }
  ]
};

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

  async importPlanillados(mapping: ImportMapping): Promise<ImportResult> {
    const response = await fetch(`${API_URL}/import/planillados`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mapping),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || 'Error en importación de planillados');
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
      throw new Error(error.message || 'Error en importación de líderes');
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
      throw new Error(error.message || 'Error en importación de candidatos');
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
      throw new Error(error.message || 'Error en importación de grupos');
    }

    return response.json();
  }

  // ✅ NUEVO - SUGERIR MAPEOS
  async suggestFieldMappings(headers: string[], entityType: EntityType): Promise<Record<string, string>> {
    const response = await fetch(`${API_URL}/import/suggest-mappings`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ headers, entityType }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || 'Error al sugerir mapeos');
    }

    const result = await response.json();
    return result.suggestions || {};
  }

  // ✅ MÉTODO GENÉRICO PARA IMPORTAR CUALQUIER ENTIDAD
  async importEntity(mapping: ImportMapping): Promise<ImportResult> {
    const endpoints: Record<EntityType, string> = {
      planillados: '/import/planillados',
      leaders: '/import/leaders',
      candidates: '/import/candidates',
      groups: '/import/groups'
    };

    const endpoint = endpoints[mapping.entityType];
    if (!endpoint) {
      throw new Error(`Tipo de entidad no soportado: ${mapping.entityType}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mapping),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || `Error en importación de ${mapping.entityType}`);
    }

    return response.json();
  }

  // ===========================================
  // UTILIDADES Y VALIDACIONES
  // ===========================================

  getAvailableFields(entityType: EntityType): EntityField[] {
    return ENTITY_FIELDS[entityType] || [];
  }

  validateMapping(mapping: Record<string, string>, entityType: EntityType): { isValid: boolean, errors: string[] } {
    const errors: string[] = [];
    const availableFields = this.getAvailableFields(entityType);
    const requiredFields = availableFields.filter(field => field.required);

    // Verificar campos requeridos
    const mappedFields = Object.values(mapping);
    for (const requiredField of requiredFields) {
      if (!mappedFields.includes(requiredField.key)) {
        errors.push(`Campo requerido no mapeado: ${requiredField.label}`);
      }
    }

    // Verificar duplicados
    const fieldCounts: Record<string, number> = {};
    for (const field of mappedFields) {
      if (field) {
        fieldCounts[field] = (fieldCounts[field] || 0) + 1;
        if (fieldCounts[field] > 1) {
          errors.push(`Campo duplicado en el mapeo: ${field}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getMappingQuality(mapping: Record<string, string>, entityType: EntityType): MappingQuality {
    const availableFields = this.getAvailableFields(entityType);
    const requiredFields = availableFields.filter(field => field.required);
    const mappedFields = Object.values(mapping).filter(field => field !== '');
    
    const requiredMapped = requiredFields.filter(field => 
      mappedFields.includes(field.key)
    ).length;
    
    const totalMapped = mappedFields.length;
    
    let score = 0;
    let feedback = '';

    // Calcular score basado en campos requeridos mapeados
    if (requiredMapped === requiredFields.length) {
      score = 70; // Base score for all required fields
      feedback = 'Todos los campos requeridos están mapeados. ';
      
      // Bonus por campos opcionales
      const optionalMapped = totalMapped - requiredMapped;
      const optionalAvailable = availableFields.length - requiredFields.length;
      const optionalPercentage = optionalAvailable > 0 ? optionalMapped / optionalAvailable : 0;
      score += Math.round(optionalPercentage * 30);
      
      if (optionalPercentage > 0.5) {
        feedback += 'Excelente cobertura de campos opcionales.';
      } else if (optionalPercentage > 0.2) {
        feedback += 'Buena cobertura de campos adicionales.';
      } else {
        feedback += 'Considera mapear más campos opcionales para mejor información.';
      }
    } else {
      const percentage = requiredMapped / requiredFields.length;
      score = Math.round(percentage * 50);
      feedback = `Faltan ${requiredFields.length - requiredMapped} campos requeridos por mapear.`;
    }

    return {
      score: Math.min(score, 100),
      requiredMapped,
      totalRequired: requiredFields.length,
      totalMapped,
      feedback
    };
  }

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

  // ===========================================
  // MAPEO LOCAL (FALLBACK)
  // ===========================================

  suggestFieldMappingsLocal(headers: string[], entityType: EntityType): Record<string, string> {
    const mappings: Record<string, string> = {};
    
    if (entityType === 'planillados') {
      headers.forEach(header => {
        const cleanHeader = header.toLowerCase().trim();
        
        if (cleanHeader.includes('cédula') || cleanHeader.includes('cedula') || cleanHeader === 'cc') {
          mappings[header] = 'cedula';
        } else if (cleanHeader.includes('nombres') || cleanHeader.includes('nombre')) {
          mappings[header] = 'nombres';
        } else if (cleanHeader.includes('apellidos') || cleanHeader.includes('apellido')) {
          mappings[header] = 'apellidos';
        } else if (cleanHeader.includes('celular') || cleanHeader.includes('teléfono') || cleanHeader.includes('telefono') || cleanHeader.includes('móvil')) {
          mappings[header] = 'celular';
        } else if (cleanHeader.includes('dirección') || cleanHeader.includes('direccion')) {
          mappings[header] = 'direccion';
        } else if (cleanHeader.includes('barrio')) {
          mappings[header] = 'barrioVive';
        } else if (cleanHeader.includes('fecha') && cleanHeader.includes('expedición')) {
          mappings[header] = 'fechaExpedicion';
        } else if (cleanHeader.includes('municipio') && cleanHeader.includes('votación')) {
          mappings[header] = 'municipioVotacion';
        } else if (cleanHeader.includes('zona') && cleanHeader.includes('puesto')) {
          mappings[header] = 'zonaPuesto';
        } else if (cleanHeader.includes('mesa')) {
          mappings[header] = 'mesa';
        }
      });
    } else if (entityType === 'leaders') {
      headers.forEach(header => {
        const cleanHeader = header.toLowerCase().trim();
        
        if (cleanHeader.includes('cédula') || cleanHeader.includes('cedula')) {
          mappings[header] = 'cedula';
        } else if (cleanHeader.includes('nombres') || cleanHeader.includes('nombre')) {
          mappings[header] = 'firstName';
        } else if (cleanHeader.includes('apellidos') || cleanHeader.includes('apellido')) {
          mappings[header] = 'lastName';
        } else if (cleanHeader.includes('celular') || cleanHeader.includes('teléfono')) {
          mappings[header] = 'phone';
        } else if (cleanHeader.includes('email') || cleanHeader.includes('correo')) {
          mappings[header] = 'email';
        } else if (cleanHeader.includes('meta')) {
          mappings[header] = 'meta';
        } else if (cleanHeader.includes('grupo')) {
          mappings[header] = 'groupName';
        }
      });
    } else if (entityType === 'candidates') {
      headers.forEach(header => {
        const cleanHeader = header.toLowerCase().trim();
        
        if (cleanHeader.includes('nombre') || cleanHeader.includes('name')) {
          mappings[header] = 'name';
        } else if (cleanHeader.includes('email') || cleanHeader.includes('correo')) {
          mappings[header] = 'email';
        } else if (cleanHeader.includes('celular') || cleanHeader.includes('teléfono')) {
          mappings[header] = 'phone';
        } else if (cleanHeader.includes('cargo') || cleanHeader.includes('position')) {
          mappings[header] = 'position';
        } else if (cleanHeader.includes('partido') || cleanHeader.includes('party')) {
          mappings[header] = 'party';
        } else if (cleanHeader.includes('meta')) {
          mappings[header] = 'meta';
        }
      });
    } else if (entityType === 'groups') {
      headers.forEach(header => {
        const cleanHeader = header.toLowerCase().trim();
        
        if (cleanHeader.includes('nombre') || cleanHeader.includes('name')) {
          mappings[header] = 'name';
        } else if (cleanHeader.includes('descripción') || cleanHeader.includes('description')) {
          mappings[header] = 'description';
        } else if (cleanHeader.includes('zona') || cleanHeader.includes('zone')) {
          mappings[header] = 'zone';
        } else if (cleanHeader.includes('candidato') || cleanHeader.includes('candidate')) {
          mappings[header] = 'candidateName';
        } else if (cleanHeader.includes('meta')) {
          mappings[header] = 'meta';
        }
      });
    }
    
    return mappings;
  }

  // ===========================================
  // UTILIDADES DE DATOS
  // ===========================================

  cleanAndValidateData(data: any[], mappings: Record<string, string>): {
    cleanData: any[];
    errors: string[];
    warnings: string[];
  } {
    const cleanData: any[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    data.forEach((row, index) => {
      const cleanRow: any = {};
      let hasRequiredFields = false;

      // Aplicar mapeos y limpiar datos
      for (const [csvColumn, entityField] of Object.entries(mappings)) {
        if (row[csvColumn] !== undefined && row[csvColumn] !== null) {
          let value = String(row[csvColumn]).trim();
          
          // Limpiezas específicas por campo
          if (entityField === 'cedula') {
            value = value.replace(/\D/g, ''); // Solo números
            if (value.length >= 8 && value.length <= 10) {
              cleanRow[entityField] = value;
              hasRequiredFields = true;
            } else {
              errors.push(`Fila ${index + 1}: Cédula inválida (${value})`);
            }
          } else if (entityField === 'celular') {
            value = value.replace(/\D/g, ''); // Solo números
            if (value.length === 10 && value.startsWith('3')) {
              cleanRow[entityField] = value;
            } else if (value.length > 0) {
              warnings.push(`Fila ${index + 1}: Celular con formato inválido (${value})`);
              cleanRow[entityField] = value; // Guardar de todas formas
            }
          } else if (entityField.includes('fecha')) {
            // Validar formato de fecha
            if (value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
              cleanRow[entityField] = value;
            } else if (value.length > 0) {
              warnings.push(`Fila ${index + 1}: Fecha con formato inválido (${value}). Use DD/MM/YYYY`);
            }
          } else {
            cleanRow[entityField] = value;
            if (['nombres', 'apellidos', 'firstName', 'lastName', 'name'].includes(entityField) && value.length > 0) {
              hasRequiredFields = true;
            }
          }
        }
      }

      // Solo agregar filas que tengan al menos campos requeridos
      if (hasRequiredFields) {
        cleanData.push(cleanRow);
      } else {
        warnings.push(`Fila ${index + 1}: Sin campos requeridos, se omitirá`);
      }
    });

    return { cleanData, errors, warnings };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'csv':
        return '📄';
      default:
        return '📁';
    }
  }
}

// Exportar instancia singleton
export const importService = new ImportService();