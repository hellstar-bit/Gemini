// frontend/src/utils/templateDownload.ts - ACTUALIZADO CON PLANILLADOS

import * as XLSX from 'xlsx';

export interface TemplateConfig {
  fileName: string;
  sheetName: string;
  headers: string[];
  sampleData: Record<string, any>[];
  instructions: string[];
}

// ✅ CONFIGURACIONES ACTUALIZADAS CON PLANILLADOS
export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  planillados: {
    fileName: 'Plantilla_Planillados_GEMINI.xlsx',
    sheetName: 'Planillados',
    headers: [
      'cédula',
      'nombres', 
      'apellidos',
      'celular',
      'dirección',
      'barrio donde vive',
      'fecha de expedición',
      'municipio de votación',
      'zona y puesto',
      'mesa',
      'cedula lider'
    ],
    sampleData: [
      {
        'cédula': '12345678',
        'nombres': 'Juan Carlos',
        'apellidos': 'Pérez García',
        'celular': '3001234567',
        'dirección': 'Calle 123 #45-67',
        'barrio donde vive': 'El Prado',
        'fecha de expedición': '15/05/2010',
        'municipio de votación': 'Barranquilla',
        'zona y puesto': 'Zona 1 - Puesto 5',
        'mesa': '001',
        'cedula lider': '87654321'
      },
      {
        'cédula': '87654321',
        'nombres': 'María Fernanda',
        'apellidos': 'González López',
        'celular': '3009876543',
        'dirección': 'Carrera 50 #80-25',
        'barrio donde vive': 'La Concepción',
        'fecha de expedición': '20/03/2008',
        'municipio de votación': 'Soledad',
        'zona y puesto': 'Zona 2 - Puesto 3',
        'mesa': '025',
        'cedula lider': '11223344'
      },
      {
        'cédula': '11223344',
        'nombres': 'Carlos Alberto',
        'apellidos': 'Rodríguez Martínez',
        'celular': '3151122334',
        'dirección': 'Avenida 15 #30-45',
        'barrio donde vive': 'Centro',
        'fecha de expedición': '10/12/2015',
        'municipio de votación': 'Malambo',
        'zona y puesto': 'Zona 3 - Puesto 1',
        'mesa': '050'
      }
    ],
    instructions: [
      '🎯 PLANTILLA PARA IMPORTAR PLANILLADOS EN GEMINI',
      '',
      '📋 CAMPOS OBLIGATORIOS (marcados con *):',
      '   ✓ cédula*: Número de identificación sin puntos ni espacios',
      '   ✓ nombres*: Nombres completos de la persona',
      '   ✓ apellidos*: Apellidos completos de la persona',
      '',
      '📝 CAMPOS OPCIONALES IMPORTANTES:',
      '   • celular: Número de teléfono celular (formato: 3001234567)',
      '   • dirección: Dirección completa de residencia',
      '   • barrio donde vive: Barrio o sector donde reside',
      '   • fecha de expedición: Fecha cuando se expidió la cédula',
      '   • municipio de votación: Municipio donde está registrado para votar',
      '   • zona y puesto: Zona y puesto de votación asignado',
      '   • mesa: Número de mesa de votación',
      '',
      '📐 FORMATOS IMPORTANTES:',
      '   • Cédula: Solo números (ejemplo: 12345678)',
      '   • Fechas: DD/MM/YYYY (ejemplo: 15/05/2010)',
      '   • Celular: Con código de área (ejemplo: 3001234567)',
      '   • Mesa: Número con ceros a la izquierda (ejemplo: 001, 025)',
      '',
      '🗳️ INFORMACIÓN ESPECÍFICA DE PLANILLADOS:',
      '   • Los planillados son personas registradas en las listas electorales',
      '   • Pueden incluir datos de votación como municipio, zona, puesto y mesa',
      '   • El sistema validará automáticamente duplicados por cédula',
      '   • Se pueden asociar con líderes existentes en el sistema',
      '',
      '💡 CONSEJOS PARA EVITAR ERRORES:',
      '   • No dejes filas vacías entre datos',
      '   • No modifiques los nombres de las columnas',
      '   • Revisa que no haya cédulas duplicadas',
      '   • Máximo 10,000 registros por archivo',
      '   • Usa formato Excel (.xlsx) para mejor compatibilidad',
      '   • Verifica que los datos de votación sean correctos',
      '',
      '🚀 PROCESO DE IMPORTACIÓN:',
      '   1. Llena esta plantilla con tus datos de planillados',
      '   2. Guarda el archivo como Excel (.xlsx)',
      '   3. Súbelo en la página de importación de GEMINI',
      '   4. Selecciona "Planillados" como tipo de datos',
      '   5. El sistema detectará automáticamente los campos',
      '   6. Revisa el mapeo y confirma la importación',
      '   7. Los datos se guardarán en la tabla de planillados',
      '',
      '❓ ¿NECESITAS AYUDA?',
      '   • Contacta al administrador del sistema',
      '   • Revisa la documentación en el manual de usuario',
      '   • Asegúrate de tener permisos de importación'
    ]
  },
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
      'municipio'
    ],
    sampleData: [
      {
        'cédula': '12345678',
        'nombres': 'Juan Carlos',
        'apellidos': 'Pérez García',
        'celular': '3001234567',
        'dirección': 'Calle 123 #45-67',
        'barrio': 'El Prado',
        'municipio': 'Barranquilla'
      },
      {
        'cédula': '87654321',
        'nombres': 'María Fernanda',
        'apellidos': 'González López',
        'celular': '3009876543',
        'dirección': 'Carrera 50 #80-25',
        'barrio': 'La Concepción',
        'municipio': 'Soledad'
      }
    ],
    instructions: [
      '🎯 PLANTILLA PARA IMPORTAR VOTANTES EN GEMINI (LEGACY)',
      '',
      '⚠️ NOTA: Esta plantilla es para el sistema legacy de votantes.',
      '   Para datos electorales actuales, usa la plantilla de Planillados.',
      '',
      '📋 CAMPOS OBLIGATORIOS:',
      '   ✓ cédula: Número de identificación',
      '   ✓ nombres: Nombres completos',
      '   ✓ apellidos: Apellidos completos',
      '',
      '📝 CAMPOS OPCIONALES:',
      '   • celular, dirección, barrio, municipio',
      '',
      '📐 FORMATOS: DD/MM/YYYY para fechas, solo números para cédula'
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
      'municipio',
      'meta de votantes',
      'grupo'
    ],
    sampleData: [
      {
        'cédula': '98765432',
        'nombres': 'Ana Patricia',
        'apellidos': 'Martínez Silva',
        'celular': '3007654321',
        'email': 'ana.martinez@email.com',
        'dirección': 'Calle 45 #23-67',
        'barrio': 'Las Flores',
        'municipio': 'Barranquilla',
        'meta de votantes': '500',
        'grupo': 'Grupo Norte'
      }
    ],
    instructions: [
      '🎯 PLANTILLA PARA IMPORTAR LÍDERES EN GEMINI',
      '',
      '👥 Los líderes son coordinadores que gestionan planillados y votantes',
      '',
      '📋 CAMPOS OBLIGATORIOS:',
      '   ✓ cédula, nombres, apellidos',
      '',
      '📝 CAMPOS OPCIONALES:',
      '   • celular, email, dirección, barrio, municipio',
      '   • meta de votantes: número objetivo de personas a gestionar',
      '   • grupo: nombre del grupo al que pertenece'
    ]
  }
};

// ✅ FUNCIÓN PARA OBTENER ANCHO DE COLUMNA
function getColumnWidth(header: string): number {
  const widths: { [key: string]: number } = {
    'cédula': 12,
    'nombres': 20,
    'apellidos': 20,
    'celular': 15,
    'dirección': 25,
    'barrio donde vive': 18,
    'fecha de expedición': 18,
    'municipio de votación': 20,
    'zona y puesto': 18,
    'mesa': 8,
    'cedula lider': 12, // ✅ NUEVO
    'email': 25,
    'meta de votantes': 15,
    'grupo': 15
  };
  
  return widths[header] || Math.max(header.length + 2, 10);
}

// ✅ FUNCIÓN PRINCIPAL PARA DESCARGAR PLANTILLA
export function downloadTemplate(entityType: string): void {
  const config = TEMPLATE_CONFIGS[entityType];
  
  if (!config) {
    console.error(`❌ No existe plantilla para el tipo: ${entityType}`);
    alert(`No se encontró plantilla para ${entityType}`);
    return;
  }

  try {
    console.log(`📥 Generando plantilla para: ${entityType}`);
    
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
      'INSTRUCCIONES DE USO': instruction 
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
    console.error('❌ Error descargando plantilla:', error);
    alert('Error al generar la plantilla. Por favor intenta nuevamente.');
  }
}

// ✅ FUNCIÓN PARA OBTENER LISTA DE PLANTILLAS DISPONIBLES
export function getAvailableTemplates(): Array<{key: string, label: string, description: string}> {
  return [
    {
      key: 'planillados',
      label: 'Planillados',
      description: 'Personas registradas en las planillas electorales'
    },
    {
      key: 'voters',
      label: 'Votantes (Legacy)',
      description: 'Base de datos de votantes tradicional'
    },
    {
      key: 'leaders',
      label: 'Líderes',
      description: 'Líderes comunitarios y coordinadores'
    }
  ];
}

// ✅ FUNCIÓN PARA VALIDAR ESTRUCTURA DE ARCHIVO ANTES DE PROCESAR
export function validateFileStructure(headers: string[], entityType: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const config = TEMPLATE_CONFIGS[entityType];
  const headerLowerCase = headers.map(h => h.toLowerCase().trim());
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config) {
    errors.push(`Tipo de entidad no válido: ${entityType}`);
    return { isValid: false, errors, warnings };
  }

  // Verificar headers requeridos para planillados
  if (entityType === 'planillados') {
    const requiredHeaders = ['cédula', 'nombres', 'apellidos']; // Define requiredHeaders here

    for (const required of requiredHeaders) {
      const found = headerLowerCase.some(h => 
        h.includes(required.toLowerCase()) || 
        (required === 'cédula' && (h.includes('cedula') || h === 'cc'))
      );
      
      if (!found) {
        errors.push(`Falta el campo requerido: ${required}`);
      }
    }

    // Verificar headers opcionales comunes
    const optionalHeaders = ['celular', 'dirección', 'barrio', 'fecha'];
    const foundOptional = optionalHeaders.filter(optional =>
      headerLowerCase.some(h => h.includes(optional.toLowerCase()))
    );

    if (foundOptional.length === 0) {
      warnings.push('No se encontraron campos opcionales comunes. Verifica que el archivo tenga el formato correcto.');
    }
  }

  const hasCedulaLider = headerLowerCase.some(h => 
  (h.includes('cedula') && h.includes('lider')) ||
  (h.includes('lider') && h.includes('cedula')) ||
  h === 'cedula lider' ||
  h === 'cedulalider'
);

if (hasCedulaLider) {
  warnings.push('✨ Se detectó campo "cédula líder" - Nueva funcionalidad disponible para relación automática con líderes');
} else {
  warnings.push('💡 Tip: Puedes agregar una columna "cedula lider" para relacionar automáticamente con líderes existentes');
}

  // Verificar que no haya headers vacíos
  const emptyHeaders = headers.filter(h => !h || h.trim() === '');
  if (emptyHeaders.length > 0) {
    warnings.push(`Se encontraron ${emptyHeaders.length} columnas sin nombre`);
  }

  // Verificar duplicados
  const duplicates = headers.filter((header, index) => 
    headers.indexOf(header) !== index
  );
  if (duplicates.length > 0) {
    errors.push(`Columnas duplicadas encontradas: ${duplicates.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ✅ FUNCIÓN PARA GENERAR MAPEO SUGERIDO
export function generateSuggestedMapping(headers: string[], entityType: string): Record<string, string> {
  const mappings: Record<string, string> = {};
  
  if (entityType === 'planillados') {
    headers.forEach(header => {
      const cleanHeader = header.toLowerCase().trim();
      
      // Mapeos específicos para planillados
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
      } else if (cleanHeader.includes('barrio') && cleanHeader.includes('vive')) {
        mappings[header] = 'barrioVive';
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
      } else if (cleanHeader.includes('cedula') && cleanHeader.includes('lider')) {
      mappings[header] = 'cedulaLider';
    } else if (cleanHeader.includes('lider') && cleanHeader.includes('cedula')) {
      mappings[header] = 'cedulaLider';
    } else if (cleanHeader === 'cedula lider' || cleanHeader === 'cedulalider') {
      mappings[header] = 'cedulaLider';
    }
    });
  } else if (entityType === 'voters') {
    // Mapeos para voters (legacy)
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
      } else if (cleanHeader.includes('dirección') || cleanHeader.includes('direccion')) {
        mappings[header] = 'address';
      } else if (cleanHeader.includes('barrio')) {
        mappings[header] = 'neighborhood';
      } else if (cleanHeader.includes('municipio')) {
        mappings[header] = 'municipality';
      }
    });
  } else if (entityType === 'leaders') {
    // Mapeos para líderes
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
  }
  
  return mappings;
}

export function generateSampleDataWithLeaders(): any[] {
  return [
    {
      'cédula': '12345678',
      'nombres': 'Juan Carlos',
      'apellidos': 'Pérez García',
      'celular': '3001234567',
      'dirección': 'Calle 123 #45-67',
      'barrio donde vive': 'El Prado',
      'fecha de expedición': '15/05/2010',
      'municipio de votación': 'Barranquilla',
      'zona y puesto': 'Zona 1 - Puesto 5',
      'mesa': '001',
      'cedula lider': '87654321'
    },
    {
      'cédula': '87654321',
      'nombres': 'María Fernanda',
      'apellidos': 'González López',
      'celular': '3009876543',
      'dirección': 'Carrera 50 #80-25',
      'barrio donde vive': 'La Concepción',
      'fecha de expedición': '20/03/2008',
      'municipio de votación': 'Soledad',
      'zona y puesto': 'Zona 2 - Puesto 3',
      'mesa': '025',
      'cedula lider': '99888777'
    },
    {
      'cédula': '11223344',
      'nombres': 'Carlos Alberto',
      'apellidos': 'Rodríguez Martínez',
      'celular': '3151122334',
      'dirección': 'Avenida 15 #30-45',
      'barrio donde vive': 'Centro',
      'fecha de expedición': '10/12/2015',
      'municipio de votación': 'Malambo',
      'zona y puesto': 'Zona 3 - Puesto 1',
      'mesa': '050',
      'cedula lider': ''
    }
  ];
}

// ✅ FUNCIÓN PARA LIMPIAR Y VALIDAR DATOS
export function cleanAndValidateData(data: any[], mappings: Record<string, string>): {
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
        } else if (entityField === 'cedulaLider') {
          value = value.replace(/\D/g, ''); // Solo números
          if (value.length === 0) {
            // Campo vacío es válido
            cleanRow[entityField] = null;
          } else if (value.length >= 8 && value.length <= 10) {
            cleanRow[entityField] = value;
          } else {
            warnings.push(`Fila ${index + 1}: Cédula de líder inválida (${value}). Se omitirá este campo.`);
            cleanRow[entityField] = null;
          }
        }
        else if (entityField === 'celular') {
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
          if (['nombres', 'apellidos'].includes(entityField) && value.length > 0) {
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

// ✅ EXPORTAR UTILIDADES
export const templateUtils = {
  download: downloadTemplate,
  validate: validateFileStructure,
  suggest: generateSuggestedMapping,
  clean: cleanAndValidateData,
  getAvailable: getAvailableTemplates
};