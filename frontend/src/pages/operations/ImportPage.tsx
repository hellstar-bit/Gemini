// frontend/src/pages/operations/ImportPage.tsx - ACTUALIZADO PARA PLANILLADOS

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { 
  importService, 
  type ImportPreview, 
  type ImportResult, 
  type ImportMapping,
  ENTITY_TYPES,
  ENTITY_FIELDS,
  type MappingQuality
} from '../../services/importService';

const ImportPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEntityType, setSelectedEntityType] = useState<keyof typeof ENTITY_FIELDS>('planillados'); // ✅ DEFAULT planillados
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mappingQuality, setMappingQuality] = useState<MappingQuality | null>(null);

  interface EntityField {
  key: string;
  label: string;
  required: boolean;
  example?: string;
}


  // ✅ PROCESAR ARCHIVO SUBIDO
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploadedFile(file);
    setIsLoading(true);
    
    try {
      console.log('🔄 Procesando archivo:', file.name);
      const previewData = await importService.previewFile(file);
      console.log('📊 Preview obtenido:', previewData);
      
      setPreview(previewData);
      
      // ✅ OBTENER SUGERENCIAS DE MAPEO AUTOMÁTICO
      const suggestions = await importService.suggestFieldMappings(
        previewData.headers, 
        selectedEntityType
      );
      console.log('💡 Sugerencias de mapeo:', suggestions);
      
      setFieldMappings(suggestions);
      setCurrentStep(2);
    } catch (error) {
      console.error('❌ Error procesando archivo:', error);
      if (error instanceof Error) {
        alert(`Error procesando archivo: ${error.message}`);
      } else {
        alert('Ocurrió un error desconocido al procesar el archivo.');
      }
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

  // ✅ MANEJAR CAMBIO DE MAPEO
  const handleFieldMapping = (csvColumn: string, entityField: string) => {
    const newMappings = {
      ...fieldMappings,
      [csvColumn]: entityField
    };
    setFieldMappings(newMappings);
    
    // Actualizar calidad del mapeo
    const quality = importService.getMappingQuality(newMappings, selectedEntityType);
    setMappingQuality(quality);
  };

  // ✅ VALIDAR Y CONTINUAR AL PASO 3
  const proceedToMapping = () => {
    const validation = importService.validateMapping(fieldMappings, selectedEntityType);
    
    if (!validation.isValid) {
      alert(`Errores en el mapeo:\n${validation.errors.join('\n')}`);
      return;
    }
    
    setCurrentStep(3);
  };

  // ✅ EJECUTAR IMPORTACIÓN
  const executeImport = async () => {
    if (!preview || !uploadedFile) return;
    
    setIsLoading(true);
    
    try {
      const mapping: ImportMapping = {
        fileName: uploadedFile.name,
        entityType: selectedEntityType,
        fieldMappings,
        previewData: preview.data
      };
      
      console.log('🚀 Iniciando importación:', mapping);
      
      // ✅ USAR EL MÉTODO GENÉRICO PARA CUALQUIER ENTIDAD
      const result = await importService.importEntity(mapping);
      console.log('✅ Importación completada:', result);
      
      setImportResult(result);
      setCurrentStep(4);
    } catch (error) {
      console.error('❌ Error en importación:', error);
      if (error instanceof Error) {
        alert(`Error en importación: ${error.message}`);
      } else {
        alert('Ocurrió un error desconocido durante la importación.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ RESETEAR IMPORTACIÓN
  const resetImport = () => {
    setCurrentStep(1);
    setUploadedFile(null);
    setPreview(null);
    setFieldMappings({});
    setImportResult(null);
    setMappingQuality(null);
  };

  // ✅ RENDER STEP 1: SELECCIÓN DE ARCHIVO
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Selector de tipo de entidad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          ¿Qué tipo de datos vas a importar?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ENTITY_TYPES.map((entityType) => (
            <div
              key={entityType.value}
              className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedEntityType === entityType.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedEntityType(entityType.value as keyof typeof ENTITY_FIELDS)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{entityType.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{entityType.label}</h3>
                  <p className="text-sm text-gray-600">{entityType.description}</p>
                </div>
              </div>
              {selectedEntityType === entityType.value && (
                <CheckCircleIcon className="absolute top-2 right-2 w-5 h-5 text-primary-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Zona de drop */}
      <div
        {...getRootProps()}
        className={`p-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
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

      {/* Información específica por tipo de entidad */}
      {selectedEntityType && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">
            📋 Campos para {ENTITY_TYPES.find(e => e.value === selectedEntityType)?.label}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {ENTITY_FIELDS[selectedEntityType]?.map((field) => (
              <div key={field.key} className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${field.required ? 'bg-red-500' : 'bg-gray-400'}`} />
                <span className="text-yellow-700">
                  <strong>{field.label}</strong>
                  {field.required && <span className="text-red-600"> (requerido)</span>}
                  {field.example && <span className="text-gray-600"> - ej: {field.example}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ✅ RENDER STEP 2: MAPEO DE CAMPOS
  const renderStep2 = () => {
    if (!preview) return null;

    const availableFields = importService.getAvailableFields(selectedEntityType);
    const usedFields = Object.values(fieldMappings);

    return (
      <div className="space-y-6">
        {/* Información del archivo */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Información del archivo</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Archivo:</span>
              <p className="text-blue-800">{uploadedFile?.name}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Filas:</span>
              <p className="text-blue-800">{preview.totalRows.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Columnas:</span>
              <p className="text-blue-800">{preview.headers.length}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Tipo:</span>
              <p className="text-blue-800">{ENTITY_TYPES.find(e => e.value === selectedEntityType)?.label}</p>
            </div>
          </div>
        </div>

        {/* Calidad del mapeo */}
        {mappingQuality && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-green-900">🎯 Calidad del mapeo</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                mappingQuality.score >= 80 ? 'bg-green-100 text-green-800' :
                mappingQuality.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {mappingQuality.score}%
              </span>
            </div>
            <p className="text-green-700 text-sm mb-2">{mappingQuality.feedback}</p>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${mappingQuality.score}%` }}
              />
            </div>
          </div>
        )}

        {/* Mapeo de campos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🔗 Mapear columnas del archivo a campos del sistema
          </h3>
          
          <div className="grid gap-4">
            {preview.headers.map((header, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📄 {header}
                  </label>
                  <div className="text-xs text-gray-500">
                    Ejemplo: {preview.sampleRows[0]?.[header] || 'Sin datos'}
                  </div>
                </div>
                <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={fieldMappings[header] || ''}
                    onChange={(e) => handleFieldMapping(header, e.target.value)}
                  >
                    <option value="">-- No mapear --</option>
                    {availableFields.map((field: EntityField) => (
                      <option 
                        key={field.key} 
                        value={field.key}
                        disabled={usedFields.includes(field.key) && fieldMappings[header] !== field.key}
                      >
                        {field.label} {field.required ? '(requerido)' : ''}
                        {usedFields.includes(field.key) && fieldMappings[header] !== field.key ? ' (ya usado)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between pt-6">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Anterior</span>
          </button>
          <button
            onClick={proceedToMapping}
            disabled={Object.keys(fieldMappings).length === 0}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>Continuar</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // ✅ RENDER STEP 3: CONFIRMACIÓN
  const renderStep3 = () => {
    if (!preview) return null;

    const mappedFields = Object.entries(fieldMappings).filter(([, value]) => value !== '');
    const validation = importService.validateMapping(fieldMappings, selectedEntityType);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🔍 Confirmar importación
          </h2>
          <p className="text-gray-600">
            Revisa la configuración antes de proceder con la importación
          </p>
        </div>

        {/* Resumen de la importación */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4">📋 Resumen de importación</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-blue-700 font-medium">Tipo:</span>
              <p className="text-blue-800">{ENTITY_TYPES.find(e => e.value === selectedEntityType)?.label}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Registros:</span>
              <p className="text-blue-800">{preview.totalRows.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Campos mapeados:</span>
              <p className="text-blue-800">{mappedFields.length}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Estado:</span>
              <p className={`font-semibold ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {validation.isValid ? '✅ Listo' : '❌ Errores'}
              </p>
            </div>
          </div>
        </div>

        {/* Errores de validación */}
        {!validation.isValid && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-semibold text-red-900 mb-2">❌ Errores de validación</h4>
            <ul className="list-disc list-inside space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-red-700 text-sm">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Mapeo de campos */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-4">🔗 Campos mapeados</h4>
          <div className="space-y-2">
            {mappedFields.map(([csvColumn, entityField]) => {
              const fieldInfo = ENTITY_FIELDS[selectedEntityType]?.find(f => f.key === entityField);
              return (
                <div key={csvColumn} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700">📄 {csvColumn}</span>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {fieldInfo?.label || entityField}
                    {fieldInfo?.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vista previa de datos */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-4">👁️ Vista previa de datos</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  {mappedFields.map(([, entityField]) => {
                    const fieldInfo = ENTITY_FIELDS[selectedEntityType]?.find(f => f.key === entityField);
                    return (
                      <th key={entityField} className="text-left p-2 font-medium text-gray-900">
                        {fieldInfo?.label || entityField}
                        {fieldInfo?.required && <span className="text-red-500 ml-1">*</span>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {preview.sampleRows.slice(0, 3).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-100">
                    {mappedFields.map(([csvColumn, entityField]) => (
                      <td key={entityField} className="p-2 text-gray-700">
                        {row[csvColumn] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Mostrando primeras 3 filas de {preview.totalRows.toLocaleString()} registros
          </p>
        </div>

        {/* Botones */}
        <div className="flex justify-between pt-6">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Anterior</span>
          </button>
          <button
            onClick={executeImport}
            disabled={!validation.isValid || isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Importando...</span>
              </>
            ) : (
              <>
                <span>🚀 Ejecutar importación</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // ✅ RENDER STEP 4: RESULTADOS
  const renderStep4 = () => {
    if (!importResult) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            importResult.success ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {importResult.success ? (
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {importResult.success ? '✅ Importación completada' : '⚠️ Importación con errores'}
          </h2>
          <p className="text-gray-600">
            {importResult.success 
              ? 'Todos los registros se importaron correctamente'
              : 'La importación se completó pero algunos registros tuvieron errores'
            }
          </p>
        </div>

        {/* Estadísticas */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4">📊 Resultados de la importación</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-blue-700 font-medium">Total:</span>
              <p className="text-2xl font-bold text-blue-800">{importResult.totalRows.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Exitosos:</span>
              <p className="text-2xl font-bold text-green-600">{importResult.successCount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-red-700 font-medium">Errores:</span>
              <p className="text-2xl font-bold text-red-600">{importResult.errorCount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-700 font-medium">Tiempo:</span>
              <p className="text-2xl font-bold text-gray-800">{(importResult.executionTime / 1000).toFixed(1)}s</p>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Tasa de éxito</span>
              <span>{((importResult.successCount / importResult.totalRows) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${(importResult.successCount / importResult.totalRows) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Errores */}
        {importResult.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-semibold text-red-900 mb-4">❌ Errores encontrados</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {importResult.errors.slice(0, 10).map((error, index) => (
                <div key={index} className="p-2 bg-white rounded border-l-4 border-red-400">
                  <div className="flex justify-between">
                    <span className="font-medium text-red-900">Fila {error.row}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      error.severity === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {error.severity === 'error' ? 'Error' : 'Advertencia'}
                    </span>
                  </div>
                  <p className="text-red-700 text-sm">
                    <strong>{error.field}:</strong> {error.error}
                  </p>
                  {error.value && (
                    <p className="text-red-600 text-xs">Valor: {error.value}</p>
                  )}
                </div>
              ))}
              {importResult.errors.length > 10 && (
                <p className="text-red-600 text-sm text-center">
                  ... y {importResult.errors.length - 10} errores más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Advertencias */}
        {importResult.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Advertencias</h4>
            <ul className="list-disc list-inside space-y-1">
              {importResult.warnings.map((warning, index) => (
                <li key={index} className="text-yellow-700 text-sm">{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-center space-x-4 pt-6">
          <button
            onClick={resetImport}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Nueva importación
          </button>
          <button
            onClick={() => window.location.href = '/planillados'}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Ver planillados importados
          </button>
        </div>
      </div>
    );
  };

  // ✅ INDICADOR DE PASOS
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📥 Importar datos desde Excel
          </h1>
          <p className="text-gray-600">
            Sube tu archivo Excel o CSV y configura la importación de datos
          </p>
        </div>

        {/* Indicador de pasos */}
        {renderStepIndicator()}

        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center">
              <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-primary-600 mb-4" />
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
      </div>
    </div>
  );
};

export default ImportPage;