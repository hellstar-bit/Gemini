// frontend/src/pages/operations/ImportPage.tsx - ERRORES CORREGIDOS

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx'; // ✅ IMPORT DIRECTO DE XLSX
import {
  ArrowUpTrayIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

import { ImportMapping } from '../../components/import/ImportMapping';
import { ImportResults } from '../../components/import/ImportResults';
import { importService } from '../../services/importService'; // ✅ IMPORT CORREGIDO

interface ImportPageState {
  file: File | null;
  preview: any | null;
  mappings: Record<string, string>;
  result: any | null;
  errors: string[];
  isLoading: boolean;
}

export const ImportPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<ImportPageState>({
    file: null,
    preview: null,
    mappings: {},
    result: null,
    errors: [],
    isLoading: false,
  });

  // ✅ FUNCIÓN PARA DESCARGAR PLANTILLA DE PLANILLADOS
  const downloadTemplate = () => {
    try {
      // Datos de ejemplo para la plantilla
      const templateData = [
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
          'cédula líder': '87654321',
          'fecha de nacimiento': '25/08/1990',
          'género': 'M',
          'notas': 'Votante comprometido'
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
          'fecha de nacimiento': '12/11/1985',
          'género': 'F'
        }
      ];

      // Instrucciones para la plantilla
      const instructions = [
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
        '   • fecha de expedición: Fecha de expedición de la cédula (DD/MM/YYYY)',
        '   • municipio de votación: Municipio donde está registrado para votar',
        '   • zona y puesto: Información electoral específica',
        '   • mesa: Número de mesa electoral',
        '   • cédula líder: Cédula del líder asignado (opcional)',
        '   • fecha de nacimiento: Fecha de nacimiento (DD/MM/YYYY)',
        '   • género: M (Masculino), F (Femenino), Otro',
        '   • notas: Observaciones adicionales',
        '',
        '⚠️ IMPORTANTE:',
        '   • NO modifiques el nombre de las columnas',
        '   • Usa el formato DD/MM/YYYY para todas las fechas',
        '   • La cédula debe ser solo números, sin puntos ni espacios',
        '   • El celular debe tener 10 dígitos y empezar por 3',
        '',
        '💡 CONSEJOS:',
        '   • Puedes eliminar las filas de ejemplo antes de importar',
        '   • Si no tienes algún dato, deja la celda vacía',
        '   • Revisa que no hayan cédulas duplicadas',
        '   • Máximo 10,000 registros por archivo'
      ].map(instruction => ({ 'INSTRUCCIONES': instruction }));

      // Crear workbook
      const workbook = XLSX.utils.book_new();
      
      // Crear worksheet principal
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      
      // Crear worksheet de instrucciones
      const instructionsWorksheet = XLSX.utils.json_to_sheet(instructions);
      
      // Configurar anchos de columna
      const columnWidths = [
        { wch: 12 }, // cédula
        { wch: 20 }, // nombres
        { wch: 20 }, // apellidos
        { wch: 15 }, // celular
        { wch: 25 }, // dirección
        { wch: 18 }, // barrio donde vive
        { wch: 18 }, // fecha de expedición
        { wch: 20 }, // municipio de votación
        { wch: 18 }, // zona y puesto
        { wch: 8 },  // mesa
        { wch: 15 }, // cédula líder
        { wch: 18 }, // fecha de nacimiento
        { wch: 10 }, // género
        { wch: 30 }  // notas
      ];
      
      worksheet['!cols'] = columnWidths;
      instructionsWorksheet['!cols'] = [{ wch: 60 }];
      
      // Agregar hojas al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Planillados');
      XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, 'Instrucciones');
      
      // Descargar archivo
      const fileName = `Plantilla_Planillados_GEMINI_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      console.log('✅ Plantilla descargada:', fileName);
    } catch (error) {
      console.error('❌ Error descargando plantilla:', error);
      alert('Error al descargar la plantilla. Intenta de nuevo.');
    }
  };

  // Configuración de dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setState(prev => ({ ...prev, isLoading: true, errors: [] }));

    try {
      const preview = await importService.previewFile(file);
      setState(prev => ({
        ...prev,
        file,
        preview,
        isLoading: false,
        errors: preview.errors || [],
      }));
      setCurrentStep(2);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        errors: [error.message || 'Error procesando archivo'],
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });
  const handleMappingChange = (mappings: Record<string, string>) => {
  console.log('🔄 Actualizando mappings en ImportPage:', mappings);
  console.log('🔄 Número de mappings recibidos:', Object.keys(mappings).length);
  setState(prev => ({ ...prev, mappings }));
};

  // ✅ FUNCIÓN PARA MANEJAR CAMBIOS DE MAPEO
  const executeImport = async (mappingsFromComponent?: Record<string, string>) => {
  if (!state.file || !state.preview) return;

  // ✅ USAR LOS MAPPINGS PASADOS COMO PARÁMETRO O LOS DEL ESTADO
  const mappingsToUse = mappingsFromComponent || state.mappings;

  if (!mappingsToUse || Object.keys(mappingsToUse).length === 0) {
    console.error('❌ No hay mappings definidos');
    setState(prev => ({
      ...prev,
      errors: ['No se han configurado los mapeos de campos. Por favor configura los mapeos antes de continuar.']
    }));
    return;
  }

  setState(prev => ({ ...prev, isLoading: true }));
  setCurrentStep(3);

  try {
    const mappingData = {
      fileName: state.file.name,
      entityType: 'planillados' as const,
      fieldMappings: mappingsToUse, // ✅ USAR LOS MAPPINGS CORRECTOS
      previewData: state.preview.data,
    };

    console.log('📤 Enviando al backend:', mappingData);
    console.log('📤 FieldMappings a enviar:', mappingsToUse);
    
    const result = await importService.importPlanillados(mappingData);
    setState(prev => ({
      ...prev,
      result,
      isLoading: false,
    }));
    setCurrentStep(4);
  } catch (error: any) {
    setState(prev => ({
      ...prev,
      isLoading: false,
      errors: [error.message || 'Error durante la importación'],
    }));
    setCurrentStep(2);
  }
};

  // Reiniciar proceso
  const resetImport = () => {
    setState({
      file: null,
      preview: null,
      mappings: {},
      result: null,
      errors: [],
      isLoading: false,
    });
    setCurrentStep(1);
  };

  // =====================================
  // RENDER DE CADA PASO
  // =====================================

  const renderStep1 = () => (
    <div className="text-center">
      {/* Botón de descarga de plantilla */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Paso 1: Descarga la plantilla oficial
        </h3>
        <p className="text-gray-600 mb-6">
          Utiliza nuestra plantilla Excel para asegurar que tus datos tengan el formato correcto
        </p>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          Descargar Plantilla Excel
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Incluye ejemplos y todas las columnas necesarias
        </p>
      </div>

      {/* Separador */}
      <div className="flex items-center my-8">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-gray-500 text-sm">o</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Zona de subida */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📤 Paso 2: Sube tu archivo de planillados
        </h3>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <ArrowUpTrayIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-xl font-medium text-gray-900 mb-2">
              {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra tu archivo Excel aquí'}
            </p>
            <p className="text-gray-600 mb-4">
              o haz clic para seleccionar desde tu computadora
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <DocumentIcon className="w-4 h-4 mr-1" />
                .xlsx, .xls, .csv
              </span>
              <span>Máximo 10MB</span>
              <span>Hasta 10,000 registros</span>
            </div>
          </div>
        </div>
      </div>

      {/* Errores */}
      {state.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
            <h4 className="font-medium text-red-800">Errores encontrados:</h4>
          </div>
          <ul className="mt-2 text-sm text-red-700 space-y-1">
            {state.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
  <ImportMapping
    preview={state.preview}
    entityType="planillados"
    onSubmit={executeImport}
    onMappingChange={handleMappingChange} // ✅ AGREGAR ESTA LÍNEA
    onBack={() => setCurrentStep(1)}
  />
);

  const renderStep3 = () => (
    <div className="text-center py-12">
      <ArrowPathIcon className="w-16 h-16 animate-spin mx-auto text-blue-600 mb-4" />
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
        Importando planillados...
      </h3>
      <p className="text-gray-600">
        Procesando {state.preview?.totalRows || 0} registros. Por favor espera.
      </p>
    </div>
  );

  const renderStep4 = () => (
    <ImportResults
      result={state.result}
      onReset={resetImport}
      entityType="planillados" // ✅ FIJO A PLANILLADOS
    />
  );

  // =====================================
  // INDICADOR DE PASOS
  // =====================================
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step, _index) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === step 
              ? 'bg-blue-600 text-white' 
              : currentStep > step 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {currentStep > step ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              step
            )}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              currentStep > step ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📥 Importar Planillados
          </h1>
          <p className="text-gray-600">
            Importa datos de planillados desde Excel de forma rápida y segura
          </p>
        </div>

        {/* Indicador de pasos */}
        {renderStepIndicator()}

        {/* Loading overlay */}
        {state.isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center">
              <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentStep === 1 ? 'Procesando archivo...' :
                 currentStep === 3 ? 'Ejecutando importación...' :
                 'Cargando...'}
              </h3>
              <p className="text-gray-600">
                {currentStep === 1 ? 'Analizando el contenido de tu archivo' :
                 currentStep === 3 ? 'Importando datos a la base de datos' :
                 'Por favor espera un momento'}
              </p>
            </div>
          </div>
        )}

        {/* Contenido de cada paso */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Footer con información */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
              Solo planillados
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
              Plantilla incluida
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
              Validación automática
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
              Máximo 10,000 registros
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPage;



