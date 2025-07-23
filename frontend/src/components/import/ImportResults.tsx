// frontend/src/components/import/ImportResults.tsx - NUEVO COMPONENTE

import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface ImportResultsProps {
  result: {
    success: boolean;
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: Array<{
      row: number;
      field: string;
      value: any;
      error: string;
      severity: 'error' | 'warning';
    }>;
    warnings: string[];
    executionTime: number;
  };
  onReset: () => void;
  entityType: string;
}

export const ImportResults: React.FC<ImportResultsProps> = ({
  result,
  onReset,
  entityType
}) => {
  if (!result) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No hay resultados disponibles
        </h3>
        <button
          onClick={onReset}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver a intentar
        </button>
      </div>
    );
  }

  const { success, totalRows, successCount, errorCount, errors, warnings, executionTime } = result;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header de resultados */}
      <div className="text-center mb-8">
        {success ? (
          <div className="flex flex-col items-center">
            <CheckCircleIcon className="w-20 h-20 text-green-500 mb-4" />
            <h2 className="text-3xl font-bold text-green-800 mb-2">
              ¡Importación Exitosa!
            </h2>
            <p className="text-gray-600">
              Se procesaron {successCount} de {totalRows} registros correctamente
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <XCircleIcon className="w-20 h-20 text-red-500 mb-4" />
            <h2 className="text-3xl font-bold text-red-800 mb-2">
              Importación con Errores
            </h2>
            <p className="text-gray-600">
              Se procesaron {successCount} de {totalRows} registros. {errorCount} con errores.
            </p>
          </div>
        )}
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <DocumentTextIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-800">{totalRows}</div>
          <div className="text-sm text-blue-600">Total de filas</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-800">{successCount}</div>
          <div className="text-sm text-green-600">Exitosos</div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <XCircleIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-800">{errorCount}</div>
          <div className="text-sm text-red-600">Con errores</div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <ArrowPathIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{executionTime}ms</div>
          <div className="text-sm text-gray-600">Tiempo</div>
        </div>
      </div>

      {/* Advertencias */}
      {warnings && warnings.length > 0 && (
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="font-semibold text-yellow-800">
                Advertencias ({warnings.length})
              </h3>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              {warnings.slice(0, 10).map((warning, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{warning}</span>
                </li>
              ))}
              {warnings.length > 10 && (
                <li className="text-yellow-600 italic">
                  ... y {warnings.length - 10} advertencias más
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Errores detallados */}
      {errors && errors.length > 0 && (
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <XCircleIcon className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="font-semibold text-red-800">
                Errores Detallados ({errors.length})
              </h3>
            </div>
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-red-200">
                    <th className="text-left py-2 text-red-800">Fila</th>
                    <th className="text-left py-2 text-red-800">Campo</th>
                    <th className="text-left py-2 text-red-800">Valor</th>
                    <th className="text-left py-2 text-red-800">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.slice(0, 20).map((error, index) => (
                    <tr key={index} className="border-b border-red-100">
                      <td className="py-2 text-red-700">{error.row}</td>
                      <td className="py-2 text-red-700">{error.field}</td>
                      <td className="py-2 text-red-700 max-w-32 truncate">
                        {error.value || '<vacío>'}
                      </td>
                      <td className="py-2 text-red-700">{error.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {errors.length > 20 && (
                <p className="text-red-600 text-center mt-3 italic">
                  ... y {errors.length - 20} errores más
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resumen final */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen de Importación
        </h3>
        <div className="text-gray-600 mb-6 space-y-2">
          <p>
            <strong>Tipo:</strong> {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
          </p>
          <p>
            <strong>Registros procesados:</strong> {successCount} de {totalRows}
          </p>
          <p>
            <strong>Tasa de éxito:</strong> {totalRows > 0 ? Math.round((successCount / totalRows) * 100) : 0}%
          </p>
          <p>
            <strong>Tiempo de procesamiento:</strong> {executionTime}ms
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Nueva Importación
          </button>
          
          {successCount > 0 && (
            <button
              onClick={() => window.location.href = '/planillados'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Ver Planillados Importados
            </button>
          )}

          {errorCount > 0 && (
            <button
              onClick={() => {
                // Aquí podrías implementar descarga de errores
                alert('Funcionalidad de descarga de errores pendiente de implementar');
              }}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Descargar Errores
            </button>
          )}
        </div>
      </div>

      {/* Consejos para mejorar importaciones futuras */}
      {errorCount > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            💡 Consejos para mejorar tu próxima importación:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Verifica que las cédulas tengan entre 8 y 10 dígitos</li>
            <li>• Usa el formato DD/MM/YYYY para todas las fechas</li>
            <li>• Asegúrate de que los números de celular empiecen por 3</li>
            <li>• Elimina filas completamente vacías</li>
            <li>• Revisa que no hayan cédulas duplicadas</li>
          </ul>
        </div>
      )}
    </div>
  );
};