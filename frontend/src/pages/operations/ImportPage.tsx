// frontend/src/pages/operations/ImportPage.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// Tipos para la importación
interface ImportPreview {
  data: any[];
  headers: string[];
  totalRows: number;
  sampleRows: any[];
  errors: string[];
  warnings: string[];
}


interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: any[];
  warnings: string[];
  executionTime: number;
}

const ENTITY_TYPES = [
  { value: 'voters', label: 'Votantes', description: 'Importar base de datos de votantes' },
  { value: 'leaders', label: 'Líderes', description: 'Importar líderes de campaña' },
  { value: 'candidates', label: 'Candidatos', description: 'Importar candidatos' },
  { value: 'groups', label: 'Grupos', description: 'Importar grupos de campaña' }
];

const VOTER_FIELDS = [
  { key: 'cedula', label: 'Cédula *', required: true },
  { key: 'firstName', label: 'Primer Nombre *', required: true },
  { key: 'lastName', label: 'Apellido *', required: true },
  { key: 'phone', label: 'Teléfono', required: false },
  { key: 'email', label: 'Email', required: false },
  { key: 'address', label: 'Dirección', required: false },
  { key: 'neighborhood', label: 'Barrio', required: false },
  { key: 'municipality', label: 'Municipio', required: false },
  { key: 'votingPlace', label: 'Mesa de Votación', required: false },
  { key: 'birthDate', label: 'Fecha de Nacimiento', required: false },
  { key: 'gender', label: 'Género', required: false },
  { key: 'leaderCedula', label: 'Cédula del Líder', required: false },
  { key: 'commitment', label: 'Compromiso', required: false },
  { key: 'notes', label: 'Notas', required: false }
];

export const ImportPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('voters');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setIsLoading(true);
      
      try {
        // Simular llamada a API para preview
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data para demo
        const mockPreview: ImportPreview = {
          data: [
            { cedula: '12345678', nombre: 'Juan', apellido: 'Pérez', telefono: '3001234567' },
            { cedula: '87654321', nombre: 'María', apellido: 'García', telefono: '3009876543' },
            { cedula: '11223344', nombre: 'Carlos', apellido: 'López', telefono: '3001122334' }
          ],
          headers: ['cedula', 'nombre', 'apellido', 'telefono'],
          totalRows: 1250,
          sampleRows: [
            { cedula: '12345678', nombre: 'Juan', apellido: 'Pérez', telefono: '3001234567' },
            { cedula: '87654321', nombre: 'María', apellido: 'García', telefono: '3009876543' }
          ],
          errors: [],
          warnings: ['El archivo contiene 1250 filas. Archivos grandes pueden tomar más tiempo.']
        };
        
        setPreview(mockPreview);
        setCurrentStep(2);
      } catch (error) {
        console.error('Error previewing file:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleFieldMapping = (csvColumn: string, entityField: string) => {
    setFieldMappings(prev => ({
      ...prev,
      [csvColumn]: entityField
    }));
  };

  const proceedToMapping = () => {
    setCurrentStep(3);
  };

  const executeImport = async () => {
    setIsLoading(true);
    
    try {
      // Simular importación
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult: ImportResult = {
        success: true,
        totalRows: 1250,
        successCount: 1235,
        errorCount: 15,
        errors: [
          { row: 15, field: 'cedula', error: 'Cédula duplicada', severity: 'error' },
          { row: 89, field: 'email', error: 'Formato de email inválido', severity: 'warning' }
        ],
        warnings: ['15 registros tenían errores menores pero se importaron'],
        executionTime: 2850
      };
      
      setImportResult(mockResult);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error importing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetImport = () => {
    setCurrentStep(1);
    setUploadedFile(null);
    setPreview(null);
    setFieldMappings({});
    setImportResult(null);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            currentStep >= step 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              currentStep > step ? 'bg-primary-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto">
      {/* Selector de tipo de entidad */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de datos a importar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ENTITY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedEntityType(type.value)}
              className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                selectedEntityType === type.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">{type.label}</div>
              <div className="text-sm text-gray-600 mt-1">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Zona de drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí'}
        </h3>
        <p className="text-gray-600 mb-4">
          o <span className="text-primary-600 font-medium">haz clic para seleccionar</span>
        </p>
        <p className="text-sm text-gray-500">
          Archivos soportados: Excel (.xlsx, .xls) y CSV (.csv) • Máximo 10MB
        </p>
      </div>

      {uploadedFile && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center">
            <DocumentTextIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="font-medium text-blue-900">{uploadedFile.name}</div>
              <div className="text-sm text-blue-600">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Vista Previa de Datos</h3>
        <p className="text-gray-600">Revisa la información antes de continuar</p>
      </div>

      {preview && (
        <div className="space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-900">{preview.totalRows.toLocaleString()}</div>
              <div className="text-blue-600">Total de filas</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-900">{preview.headers.length}</div>
              <div className="text-green-600">Columnas detectadas</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">{selectedEntityType}</div>
              <div className="text-gray-600">Tipo de importación</div>
            </div>
          </div>

          {/* Warnings y errores */}
          {(preview.warnings.length > 0 || preview.errors.length > 0) && (
            <div className="space-y-3">
              {preview.errors.map((error, index) => (
                <div key={index} className="flex items-start p-4 bg-red-50 border border-red-200 rounded-xl">
                  <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-red-800">{error}</span>
                </div>
              ))}
              {preview.warnings.map((warning, index) => (
                <div key={index} className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-yellow-800">{warning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tabla de muestra */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900">Muestra de datos (primeras 5 filas)</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {preview.headers.map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {preview.sampleRows.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {preview.headers.map((header) => (
                        <td key={header} className="px-4 py-3 text-sm text-gray-900">
                          {row[header] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Volver
            </button>
            <button
              onClick={proceedToMapping}
              disabled={preview.errors.length > 0}
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Configurar Campos
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Mapeo de Campos</h3>
        <p className="text-gray-600">Asocia las columnas de tu archivo con los campos del sistema</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Columnas en tu archivo</h4>
            <div className="space-y-2">
              {preview?.headers.map((header) => (
                <div key={header} className="p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{header}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Campos del sistema</h4>
            <div className="space-y-3">
              {VOTER_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="font-medium text-gray-900">{field.label}</span>
                  <select
                    value={Object.entries(fieldMappings).find(([, value]) => value === field.key)?.[0] || ''}
                    onChange={(e) => handleFieldMapping(e.target.value, field.key)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Sin mapear</option>
                    {preview?.headers.map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Campos requeridos:</p>
              <p>Los campos marcados con * son obligatorios y deben ser mapeados para continuar.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(2)}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Volver
          </button>
          <button
            onClick={executeImport}
            disabled={!fieldMappings.cedula || !fieldMappings.firstName || !fieldMappings.lastName}
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <CogIcon className="w-4 h-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                Iniciar Importación
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-8">
        {importResult?.success ? (
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-4" />
        )}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {importResult?.success ? 'Importación Completada' : 'Importación con Errores'}
        </h3>
        <p className="text-gray-600">
          {importResult?.success 
            ? 'Los datos se han importado exitosamente'
            : 'La importación se completó pero hubo algunos errores'
          }
        </p>
      </div>

      {importResult && (
        <div className="space-y-6">
          {/* Estadísticas de resultado */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-900">{importResult.totalRows.toLocaleString()}</div>
              <div className="text-blue-600">Total procesadas</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-900">{importResult.successCount.toLocaleString()}</div>
              <div className="text-green-600">Exitosas</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-900">{importResult.errorCount.toLocaleString()}</div>
              <div className="text-red-600">Con errores</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">{(importResult.executionTime / 1000).toFixed(1)}s</div>
              <div className="text-gray-600">Tiempo transcurrido</div>
            </div>
          </div>

          {/* Errores y warnings */}
          {importResult.errors.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Errores encontrados</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {importResult.errors.slice(0, 10).map((error, index) => (
                  <div key={index} className="text-sm text-red-600 p-2 bg-red-50 rounded">
                    Fila {error.row}: {error.error} ({error.field})
                  </div>
                ))}
                {importResult.errors.length > 10 && (
                  <div className="text-sm text-gray-500 p-2">
                    Y {importResult.errors.length - 10} errores más...
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <button
              onClick={resetImport}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Nueva Importación
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              Ir al Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CloudArrowUpIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Importar Datos</h1>
          <p className="text-gray-600">Carga masiva de información electoral</p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <CogIcon className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Procesando archivo...</h3>
              <p className="text-gray-600">Por favor espera mientras analizamos tu archivo</p>
            </div>
          </div>
        )}

        {/* Steps Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>
      </div>
    </div>
  );
};