// frontend/src/components/import/DownloadTemplateButton.tsx
import React from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

interface DownloadTemplateButtonProps {
  entityType: 'voters' | 'leaders' | 'candidates' | 'groups';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DownloadTemplateButton: React.FC<DownloadTemplateButtonProps> = ({ 
  entityType, 
  className = '',
  size = 'md'
}) => {
  
  const getTemplateData = (type: string) => {
    const templates = {
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
          'INSTRUCCIONES PARA USAR ESTA PLANTILLA:',
          '',
          '1. CAMPOS OBLIGATORIOS (marcados con *):',
          '   - cédula: Número de identificación sin puntos ni espacios',
          '   - nombres: Nombres completos de la persona',
          '   - apellidos: Apellidos completos de la persona',
          '',
          '2. CAMPOS OPCIONALES:',
          '   - celular: Número de teléfono celular',
          '   - dirección: Dirección completa de residencia',
          '   - barrio: Barrio o sector donde vive',
          '   - fecha de expedición: Fecha cuando se expidió la cédula (DD/MM/YYYY)',
          '',
          '3. FORMATOS IMPORTANTES:',
          '   - Cédula: Solo números (ejemplo: 12345678)',
          '   - Fechas: DD/MM/YYYY (ejemplo: 15/05/2010)',
          '   - Celular: Con código de área (ejemplo: 3001234567)',
          '',
          '4. CONSEJOS:',
          '   - No dejes filas vacías entre datos',
          '   - No modifiques los nombres de las columnas',
          '   - Revisa que no haya cédulas duplicadas',
          '   - Máximo 10,000 registros por archivo',
          '',
          '5. DESPUÉS DE LLENAR:',
          '   - Guarda el archivo como Excel (.xlsx)',
          '   - Súbelo en la página de importación de GEMINI',
          '   - El sistema detectará automáticamente los campos'
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
          'INSTRUCCIONES PARA PLANTILLA DE LÍDERES:',
          '',
          '1. CAMPOS OBLIGATORIOS:',
          '   - cédula, nombres, apellidos',
          '',
          '2. CAMPOS RECOMENDADOS:',
          '   - celular, email, meta de votantes',
          '',
          '3. FORMATOS:',
          '   - Meta de votantes: Solo números',
          '   - Email: formato válido (ejemplo@dominio.com)'
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
          }
        ],
        instructions: [
          'INSTRUCCIONES PARA CANDIDATOS:',
          '',
          '1. CAMPOS OBLIGATORIOS:',
          '   - nombre completo, email',
          '',
          '2. Meta de votos: Solo números'
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
          }
        ],
        instructions: [
          'INSTRUCCIONES PARA GRUPOS:',
          '',
          '1. CAMPO OBLIGATORIO:',
          '   - nombre del grupo',
          '',
          '2. Meta de votantes: Solo números'
        ]
      }
    };

    return templates[type as keyof typeof templates];
  };

  const downloadTemplate = () => {
    const template = getTemplateData(entityType);
    
    // Crear un nuevo workbook
    const workbook = XLSX.utils.book_new();
    
    // Crear worksheet con los datos de ejemplo
    const worksheet = XLSX.utils.json_to_sheet(template.sampleData);
    
    // Crear worksheet para instrucciones
    const instructionsData = template.instructions.map(instruction => ({ 'INSTRUCCIONES': instruction }));
    const instructionsWorksheet = XLSX.utils.json_to_sheet(instructionsData);
    
    // Configurar anchos de columna para mejor visualización
    const columnWidths = template.headers.map(header => {
      switch (header) {
        case 'cédula':
          return { wch: 12 };
        case 'nombres':
        case 'apellidos':
        case 'nombre completo':
          return { wch: 20 };
        case 'celular':
          return { wch: 12 };
        case 'dirección':
          return { wch: 25 };
        case 'email':
          return { wch: 25 };
        case 'fecha de expedición':
          return { wch: 15 };
        case 'barrio':
        case 'cargo':
          return { wch: 15 };
        default:
          return { wch: 15 };
      }
    });
    
    worksheet['!cols'] = columnWidths;
    instructionsWorksheet['!cols'] = [{ wch: 60 }];
    
    // Agregar hojas al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, template.sheetName);
    XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, 'Instrucciones');
    
    // Descargar el archivo
    XLSX.writeFile(workbook, template.fileName);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-6 py-4 text-lg';
      default:
        return 'px-4 py-3 text-base';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const getEntityLabel = () => {
    const labels = {
      voters: 'Votantes',
      leaders: 'Líderes',
      candidates: 'Candidatos',
      groups: 'Grupos'
    };
    return labels[entityType];
  };

  return (
    <button
      onClick={downloadTemplate}
      className={`
        inline-flex items-center justify-center
        bg-gradient-to-r from-green-500 to-green-600 
        hover:from-green-600 hover:to-green-700
        text-white font-medium rounded-xl
        transition-all duration-300
        hover:shadow-lg hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        ${getSizeClasses()}
        ${className}
      `}
      title={`Descargar plantilla Excel para ${getEntityLabel()}`}
    >
      <ArrowDownTrayIcon className={`${getIconSize()} mr-2`} />
      Descargar Plantilla Excel
    </button>
  );
};