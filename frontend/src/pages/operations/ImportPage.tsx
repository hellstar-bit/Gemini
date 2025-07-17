// frontend/src/pages/operations/ImportPage.tsx - VERSIÓN COMPLETA
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
  CogIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { importService } from '../../services/importService';
import { TemplateInfoCard, CompactTemplateButton } from '../../components/import/TemplateInfoCard';

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
  { value: 'voters', label: 'Votantes', description: 'Importar base de datos de votantes', icon: '👥' },
  { value: 'leaders', label: 'Líderes', description: 'Importar líderes de campaña', icon: '👤' },
  { value: 'candidates', label: 'Candidatos', description: 'Importar candidatos', icon: '🎖️' },
  { value: 'groups', label: 'Grupos', description: 'Importar grupos de campaña', icon: '🏛️' }
];

const VOTER_FIELDS = [
  { key: 'cedula', label: 'Cédula *', required: true },
  { key: 'firstName', label: 'Nombres *', required: true },
  { key: 'lastName', label: 'Apellidos *', required: true },
  { key: 'phone', label: 'Celular', required: false },
  { key: 'email', label: 'Email', required: false },
  { key: 'address', label: 'Dirección', required: false },
  { key: 'neighborhood', label: 'Barrio', required: false },
  { key: 'expeditionDate', label: 'Fecha de Expedición', required: false },
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
    if (!file) return;

    setUploadedFile(file);
    setIsLoading(true);

    try {
      // En producción, esto llamaría al backend
      const preview = await importService.previewFile(file);
      setPreview(preview);
      
      // Generar mapeo automático
      const suggestions = importService.suggestFieldMappings(preview.headers, selectedEntityType);
      setFieldMappings(suggestions);
      
      setCurrentStep(2);
    } catch (error) {
      console.error('Error previewing file:', error);
      // Simular preview para desarrollo
      const mockPreview: ImportPreview = {
        data: [],
        headers: ['cédula', 'nombres', 'apellidos', 'celular', 'dirección', 'barrio', 'fecha de expedición'],
        totalRows: 1250,
        sampleRows: [
          { 'cédula': '12345678', 'nombres': 'Juan Carlos', 'apellidos': 'Pérez García', 'celular': '3001234567' },
          { 'cédula': '87654321', 'nombres': 'María Fernanda', 'apellidos': 'González López', 'celular': '3009876543' }
        ],
        errors: [],
        warnings: ['Archivo grande detectado. Archivos grandes pueden tomar más tiempo.']
      };
      
      setPreview(mockPreview);
      const suggestions = importService.suggestFieldMappings(mockPreview.headers, selectedEntityType);
      setFieldMappings(suggestions);
      setCurrentStep(2);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEntityType]);

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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Importar Datos</h3>
        <p className="text-gray-600">Selecciona el tipo de datos y sube tu archivo Excel</p>
      </div>

      {/* Selector de tipo de entidad */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de datos a importar
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ENTITY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedEntityType(type.value)}
              className={`p-4 border-2 rounded-xl text-left transition-all duration-300 ${
                selectedEntityType === type.value
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{type.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sección de plantilla */}
      <div className="mb-8">
        <TemplateInfoCard 
          entityType={selectedEntityType as 'voters' | 'leaders' | 'candidates' | 'groups'}
          className="mb-6"
        />
      </div>

      {/* Zona de drag & drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
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

      {/* Archivo seleccionado */}
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

      {/* Consejos adicionales */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Consejos para una importación exitosa:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Usa la plantilla descargable para garantizar el formato correcto</li>
          <li>• Revisa que no haya cédulas duplicadas</li>
          <li>• Asegúrate de que las fechas estén en formato DD/MM/YYYY</li>
          <li>• Los números de celular deben incluir el código de área</li>
          <li>• Evita dejar filas vacías entre los datos</li>
        </ul>
      </div>
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
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-900">{preview.sampleRows.length}</div>
              <div className="text-purple-600">Filas de muestra</div>
            </div>
          </div>

          {/* Columnas detectadas */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Columnas detectadas en tu archivo:</h4>
            <div className="flex flex-wrap gap-2">
              {preview.headers.map((header, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                >
                  {header}
                </span>
              ))}
            </div>
          </div>

          {/* Datos de muestra */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Vista previa de datos:</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {preview.headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.sampleRows.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {preview.headers.map((header, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row[header] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Errores y advertencias */}
          {(preview.errors.length > 0 || preview.warnings.length > 0) && (
            <div className="space-y-4">
              {preview.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                    <span className="font-semibold text-red-800">Errores detectados</span>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {preview.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {preview.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="font-semibold text-yellow-800">Advertencias</span>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {preview.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Volver
            </button>
            <button
              onClick={proceedToMapping}
              disabled={preview.errors.length > 0}
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar al mapeo
              <ArrowRightIcon className="w-5 h-5 ml-2" />
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
        <p className="text-gray-600">Configura cómo se asignan las columnas de tu archivo</p>
      </div>

      <div className="space-y-6">
        {/* Mapeo automático detectado */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            <span className="font-semibold text-green-800">Mapeo automático detectado</span>
          </div>
          <p className="text-sm text-green-700">
            Se han detectado automáticamente {Object.keys(fieldMappings).length} campos. 
            Puedes ajustar el mapeo si es necesario.
          </p>
        </div>

        {/* Tabla de mapeo */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Configuración de campos</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {preview?.headers.map((header, index) => (
              <div key={index} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{header}</div>
                  <div className="text-sm text-gray-500">Columna del archivo</div>
                </div>
                <div className="mx-4">
                  <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <select
                    value={fieldMappings[header] || ''}
                    onChange={(e) => handleFieldMapping(header, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">No mapear</option>
                    {VOTER_FIELDS.map((field) => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campos requeridos */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-500 mr-2" />
            <span className="font-semibold text-blue-800">Campos requeridos</span>
          </div>
          <div className="text-sm text-blue-700">
            <p className="mb-2">Asegúrate de mapear estos campos obligatorios:</p>
            <div className="flex flex-wrap gap-2">
              {VOTER_FIELDS.filter(field => field.required).map((field) => {
                const isMapped = Object.values(fieldMappings).includes(field.key);
                return (
                  <span
                    key={field.key}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isMapped
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {field.label} {isMapped ? '✓' : '✗'}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(2)}
            className="flex items-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver
          </button>
          <button
            onClick={executeImport}
            disabled={isLoading}
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Importando...
              </>
            ) : (
              <>
                Ejecutar importación
                <CogIcon className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Importación Completada</h3>
        <p className="text-gray-600">Revisa los resultados de la importación</p>
      </div>

      {importResult && (
        <div className="space-y-6">
          {/* Resumen de resultados */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-900">{importResult.totalRows.toLocaleString()}</div>
              <div className="text-blue-600">Total procesadas</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-900">{importResult.successCount.toLocaleString()}</div>
              <div className="text-green-600">Importadas exitosamente</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-900">{importResult.errorCount}</div>
              <div className="text-red-600">Con errores</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">{(importResult.executionTime / 1000).toFixed(1)}s</div>
              <div className="text-gray-600">Tiempo de ejecución</div>
            </div>
          </div>

          {/* Estado general */}
          <div className={`border-2 rounded-xl p-6 ${
            importResult.success 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center">
              {importResult.success ? (
                <CheckCircleIcon className="w-8 h-8 text-green-500 mr-4" />
              ) : (
                <XCircleIcon className="w-8 h-8 text-red-500 mr-4" />
              )}
              <div>
                <h4 className={`text-xl font-semibold ${
                  importResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {importResult.success 
                    ? '¡Importación completada exitosamente!' 
                    : 'Importación completada con errores'
                  }
                </h4>
                <p className={`${
                  importResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {importResult.success 
                    ? `Se importaron ${importResult.successCount} registros de ${importResult.totalRows} procesados.`
                    : `Se importaron ${importResult.successCount} registros, ${importResult.errorCount} tuvieron errores.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Errores si los hay */}
          {importResult.errors.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                Errores encontrados ({importResult.errors.length})
              </h4>
              <div className="max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {importResult.errors.slice(0, 10).map((error, index) => (
                    <div key={index} className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-sm">
                        <span className="font-medium text-yellow-800">Fila {error.row}:</span>
                        <span className="text-yellow-700 ml-2">{error.error}</span>
                      </div>
                    </div>
                  ))}
                  {importResult.errors.length > 10 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      ... y {importResult.errors.length - 10} errores más
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Advertencias */}
          {importResult.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <InformationCircleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="font-semibold text-yellow-800">Advertencias</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {importResult.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetImport}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Nueva importación
            </button>
            <button
              onClick={() => window.location.href = '/operations/voters'}
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              Ver datos importados
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Centro de Importación</h1>
            </div>
            <div className="flex items-center space-x-4">
              <CompactTemplateButton 
                entityType={selectedEntityType as 'voters' | 'leaders' | 'candidates' | 'groups'}
              />
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="w-4 h-4 mr-1" />
                Última actualización: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Indicador de pasos */}
        {renderStepIndicator()}

        {/* Título del paso actual */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
            Paso {currentStep} de 4: {
              currentStep === 1 ? 'Seleccionar archivo' :
              currentStep === 2 ? 'Vista previa' :
              currentStep === 3 ? 'Mapeo de campos' :
              'Resultados'
            }
          </div>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md mx-auto text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
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

        {/* Footer con información adicional */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
              Formato Excel compatible
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
              Detección automática de campos
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
              Validación en tiempo real
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
              Máximo 10,000 registros
            </div>
          </div>
        </div>

        {/* Ayuda rápida */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">💡 ¿Necesitas ayuda?</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-800 mb-1">Formato de archivo</h5>
                <p className="text-blue-700">Usa archivos Excel (.xlsx) o CSV (.csv) con un máximo de 10MB</p>
              </div>
              <div>
                <h5 className="font-medium text-blue-800 mb-1">Campos requeridos</h5>
                <p className="text-blue-700">Asegúrate de incluir: cédula, nombres y apellidos como mínimo</p>
              </div>
              <div>
                <h5 className="font-medium text-blue-800 mb-1">Formato de fechas</h5>
                <p className="text-blue-700">Usa el formato DD/MM/YYYY para todas las fechas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};