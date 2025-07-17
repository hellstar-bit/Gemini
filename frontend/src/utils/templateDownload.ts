// frontend/src/utils/templateDownload.ts - UTILIDADES PARA PLANTILLAS
import * as XLSX from 'xlsx';

export interface TemplateConfig {
  fileName: string;
  sheetName: string;
  headers: string[];
  sampleData: Record<string, any>[];
  instructions: string[];
}

// Configuraciones de plantillas para cada tipo de entidad
export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  voters: {
    fileName: 'Plantilla_Votantes_GEMINI.xlsx',
    sheetName: 'Votantes',
    headers: [
      'cédula',
      'nombres', 
      'apellidos',
      'celular',
      'dirección',
      'barrio',
      'fecha de expedición'
    ],
    sampleData: [
      {
        'cédula': '12345678',
        'nombres': 'Juan Carlos',
        'apellidos': 'Pérez García',
        'celular': '3001234567',
        'dirección': 'Calle 123 #45-67',
        'barrio': 'El Prado',
        'fecha de expedición': '15/05/2010'
      },
      {
        'cédula': '87654321',
        'nombres': 'María Fernanda',
        'apellidos': 'González López',
        'celular': '3009876543',
        'dirección': 'Carrera 50 #80-25',
        'barrio': 'La Concepción',
        'fecha de expedición': '20/03/2008'
      },
      {
        'cédula': '11223344',
        'nombres': 'Carlos Alberto',
        'apellidos': 'Rodríguez Martínez',
        'celular': '3151122334',
        'dirección': 'Avenida 15 #30-45',
        'barrio': 'Centro',
        'fecha de expedición': '10/12/2015'
      }
    ],
    instructions: [
      '🎯 PLANTILLA PARA IMPORTAR VOTANTES EN GEMINI',
      '',
      '📋 CAMPOS OBLIGATORIOS (marcados con *):',
      '   ✓ cédula: Número de identificación sin puntos ni espacios',
      '   ✓ nombres: Nombres completos de la persona',
      '   ✓ apellidos: Apellidos completos de la persona',
      '',
      '📝 CAMPOS OPCIONALES:',
      '   • celular: Número de teléfono celular',
      '   • dirección: Dirección completa de residencia',
      '   • barrio: Barrio o sector donde vive',
      '   • fecha de expedición: Fecha cuando se expidió la cédula',
      '',
      '📐 FORMATOS IMPORTANTES:',
      '   • Cédula: Solo números (ejemplo: 12345678)',
      '   • Fechas: DD/MM/YYYY (ejemplo: 15/05/2010)',
      '   • Celular: Con código de área (ejemplo: 3001234567)',
      '',
      '💡 CONSEJOS PARA EVITAR ERRORES:',
      '   • No dejes filas vacías entre datos',
      '   • No modifiques los nombres de las columnas',
      '   • Revisa que no haya cédulas duplicadas',
      '   • Máximo 10,000 registros por archivo',
      '   • Usa formato Excel (.xlsx) para mejor compatibilidad',
      '',
      '🚀 PROCESO DE IMPORTACIÓN:',
      '   1. Llena esta plantilla con tus datos',
      '   2. Guarda el archivo como Excel (.xlsx)',
      '   3. Súbelo en la página de importación de GEMINI',
      '   4. El sistema detectará automáticamente los campos',
      '   5. Revisa el mapeo y confirma la importación',
      '',
      '❓ ¿NECESITAS AYUDA?',
      '   • Contacta al soporte técnico de GEMINI',
      '   • Revisa la documentación en línea',
      '   • Usa los ejemplos incluidos como guía'
    ]
  },
  leaders: {
    fileName: 'Plantilla_Lideres_GEMINI.xlsx',
    sheetName: 'Líderes',
    headers: [
      'cédula',
      'nombres',
      'apellidos', 
      'celular',
      'email',
      'dirección',
      'barrio',
      'meta de votantes'
    ],
    sampleData: [
      {
        'cédula': '11223344',
        'nombres': 'Carlos Alberto',
        'apellidos': 'Rodríguez Martínez',
        'celular': '3001122334',
        'email': 'carlos.rodriguez@email.com',
        'dirección': 'Carrera 50 #80-25',
        'barrio': 'La Concepción',
        'meta de votantes': '50'
      },
      {
        'cédula': '55667788',
        'nombres': 'Ana Patricia',
        'apellidos': 'González López',
        'celular': '3009988776',
        'email': 'ana.gonzalez@email.com',
        'dirección': 'Calle 70 #45-30',
        'barrio': 'El Prado',
        'meta de votantes': '75'
      }
    ],
    instructions: [
      '👤 PLANTILLA PARA IMPORTAR LÍDERES EN GEMINI',
      '',
      '📋 CAMPOS OBLIGATORIOS:',
      '   ✓ cédula, nombres, apellidos',
      '',
      '📝 CAMPOS RECOMENDADOS:',
      '   • celular, email, meta de votantes',
      '',
      '📐 FORMATOS ESPECIALES:',
      '   • Meta de votantes: Solo números (ejemplo: 50)',
      '   • Email: formato válido (ejemplo@dominio.com)',
      '',
      '💡 NOTA: Los líderes pueden gestionar votantes y tienen metas específicas.'
    ]
  },
  candidates: {
    fileName: 'Plantilla_Candidatos_GEMINI.xlsx',
    sheetName: 'Candidatos',
    headers: [
      'nombre completo',
      'email',
      'celular',
      'cargo',
      'partido político',
      'meta de votos'
    ],
    sampleData: [
      {
        'nombre completo': 'Ana Patricia Mendoza Ruiz',
        'email': 'ana.mendoza@campaña.com',
        'celular': '3151234567',
        'cargo': 'Alcaldesa',
        'partido político': 'Partido Progresista',
        'meta de votos': '50000'
      },
      {
        'nombre completo': 'Carlos Alberto Rodríguez',
        'email': 'carlos.rodriguez@campaña.com',
        'celular': '3129876543',
        'cargo': 'Concejal',
        'partido político': 'Partido Democrático',
        'meta de votos': '15000'
      }
    ],
    instructions: [
      '🎖️ PLANTILLA PARA IMPORTAR CANDIDATOS EN GEMINI',
      '',
      '📋 CAMPOS OBLIGATORIOS:',
      '   ✓ nombre completo, email',
      '',
      '📐 FORMATOS:',
      '   • Meta de votos: Solo números (ejemplo: 50000)',
      '   • Email: Debe ser válido y único'
    ]
  },
  groups: {
    fileName: 'Plantilla_Grupos_GEMINI.xlsx',
    sheetName: 'Grupos',
    headers: [
      'nombre del grupo',
      'descripción',
      'zona geográfica',
      'meta de votantes'
    ],
    sampleData: [
      {
        'nombre del grupo': 'Coordinación Norte',
        'descripción': 'Grupo de trabajo zona norte de la ciudad',
        'zona geográfica': 'Norte',
        'meta de votantes': '500'
      },
      {
        'nombre del grupo': 'Equipo Centro',
        'descripción': 'Coordinación del centro histórico',
        'zona geográfica': 'Centro',
        'meta de votantes': '300'
      }
    ],
    instructions: [
      '🏛️ PLANTILLA PARA IMPORTAR GRUPOS EN GEMINI',
      '',
      '📋 CAMPO OBLIGATORIO:',
      '   ✓ nombre del grupo',
      '',
      '📐 FORMATOS:',
      '   • Meta de votantes: Solo números (ejemplo: 500)',
      '   • Zona geográfica: Texto descriptivo'
    ]
  }
};

// Función principal para descargar plantilla
export function downloadExcelTemplate(entityType: string): void {
  const config = TEMPLATE_CONFIGS[entityType];
  
  if (!config) {
    console.error(`No existe configuración de plantilla para: ${entityType}`);
    return;
  }

  try {
    // Crear workbook
    const workbook = XLSX.utils.book_new();
    
    // Crear worksheet principal con datos de ejemplo
    const worksheet = XLSX.utils.json_to_sheet(config.sampleData);
    
    // Configurar anchos de columna
    const columnWidths = config.headers.map(header => ({
      wch: getColumnWidth(header)
    }));
    worksheet['!cols'] = columnWidths;
    
    // Crear worksheet de instrucciones
    const instructionsData = config.instructions.map(instruction => ({ 
      'INSTRUCCIONES': instruction 
    }));
    const instructionsWorksheet = XLSX.utils.json_to_sheet(instructionsData);
    instructionsWorksheet['!cols'] = [{ wch: 80 }];
    
    // Agregar hojas al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, config.sheetName);
    XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, 'Instrucciones');
    
    // Descargar archivo
    XLSX.writeFile(workbook, config.fileName);
    
    console.log(`✅ Plantilla descargada: ${config.fileName}`);
    
  } catch (error) {
    console.error('Error descargando plantilla:', error);
    alert('Error al generar la plantilla. Por favor intenta nuevamente.');
  }
}

// Función auxiliar para determinar ancho de columna
function getColumnWidth(header: string): number {
  const widthMap: Record<string, number> = {
    'cédula': 12,
    'nombres': 20,
    'apellidos': 20,
    'nombre completo': 25,
    'celular': 12,
    'dirección': 30,
    'email': 25,
    'fecha de expedición': 15,
    'barrio': 15,
    'cargo': 15,
    'partido político': 20,
    'meta de votantes': 12,
    'meta de votos': 12,
    'zona geográfica': 15,
    'descripción': 40,
    'nombre del grupo': 20
  };
  
  return widthMap[header.toLowerCase()] || 15;
}

// Función para obtener etiqueta amigable del tipo de entidad
export function getEntityLabel(entityType: string): string {
  const labels: Record<string, string> = {
    voters: 'Votantes',
    leaders: 'Líderes', 
    candidates: 'Candidatos',
    groups: 'Grupos'
  };
  
  return labels[entityType] || entityType;
}

// Función para obtener información sobre la plantilla
export function getTemplateInfo(entityType: string): { 
  requiredFields: string[], 
  optionalFields: string[], 
  totalSampleRows: number,
  fileName: string 
} {
  const config = TEMPLATE_CONFIGS[entityType];
  
  if (!config) {
    return {
      requiredFields: [],
      optionalFields: [],
      totalSampleRows: 0,
      fileName: ''
    };
  }

  // Determinar campos obligatorios y opcionales según el tipo
  let requiredFields: string[] = [];
  let optionalFields: string[] = [];

  switch (entityType) {
    case 'voters':
      requiredFields = ['cédula', 'nombres', 'apellidos'];
      optionalFields = ['celular', 'dirección', 'barrio', 'fecha de expedición'];
      break;
    case 'leaders':
      requiredFields = ['cédula', 'nombres', 'apellidos'];
      optionalFields = ['celular', 'email', 'dirección', 'barrio', 'meta de votantes'];
      break;
    case 'candidates':
      requiredFields = ['nombre completo', 'email'];
      optionalFields = ['celular', 'cargo', 'partido político', 'meta de votos'];
      break;
    case 'groups':
      requiredFields = ['nombre del grupo'];
      optionalFields = ['descripción', 'zona geográfica', 'meta de votantes'];
      break;
  }

  return {
    requiredFields,
    optionalFields,
    totalSampleRows: config.sampleData.length,
    fileName: config.fileName
  };
}

// Hook personalizado para usar en componentes React
export function useTemplateDownload() {
  const downloadTemplate = (entityType: string) => {
    downloadExcelTemplate(entityType);
  };

  const getTemplateDetails = (entityType: string) => {
    return getTemplateInfo(entityType);
  };

  return {
    downloadTemplate,
    getTemplateDetails,
    getEntityLabel
  };
}