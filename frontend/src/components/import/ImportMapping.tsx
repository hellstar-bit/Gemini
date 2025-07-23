// frontend/src/components/import/ImportMapping.tsx - ACTUALIZADO CON CÉDULA LÍDER

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  CheckIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { addNotification } from '../../store/slices/appSlice';

// =====================================
// ✅ TIPOS E INTERFACES
// =====================================

interface ImportMappingProps {
  preview: {
    data: Record<string, any>[];
    headers: string[];
    totalRows: number;
    sampleRows: Record<string, any>[];
  };
  entityType: 'planillados' | 'voters' | 'leaders' | 'candidates' | 'groups';
  onSubmit: (mappings: Record<string, string>) => void;
  onBack: () => void;
}

interface FieldMapping {
  key: string;
  label: string;
  required: boolean;
  description?: string;
  example?: string;
  icon?: React.ComponentType<any>;
  isNew?: boolean; // Para destacar campos nuevos
}

// =====================================
// ✅ CONFIGURACIÓN DE CAMPOS
// =====================================

const FIELD_MAPPINGS: Record<string, FieldMapping[]> = {
  planillados: [
    { 
      key: 'cedula', 
      label: 'Cédula *', 
      required: true,
      description: 'Número de identificación único',
      example: '12345678',
      icon: DocumentTextIcon
    },
    { 
      key: 'nombres', 
      label: 'Nombres *', 
      required: true,
      description: 'Nombres completos de la persona',
      example: 'Juan Carlos',
      icon: UserIcon
    },
    { 
      key: 'apellidos', 
      label: 'Apellidos *', 
      required: true,
      description: 'Apellidos completos de la persona',
      example: 'Pérez García',
      icon: UserIcon
    },
    { 
      key: 'celular', 
      label: 'Celular', 
      required: false,
      description: 'Número de teléfono celular',
      example: '3001234567'
    },
    { 
      key: 'direccion', 
      label: 'Dirección', 
      required: false,
      description: 'Dirección completa de residencia',
      example: 'Calle 123 #45-67'
    },
    { 
      key: 'barrioVive', 
      label: 'Barrio donde vive', 
      required: false,
      description: 'Barrio o sector donde reside',
      example: 'El Prado'
    },
    { 
      key: 'fechaExpedicion', 
      label: 'Fecha de expedición', 
      required: false,
      description: 'Fecha cuando se expidió la cédula',
      example: '15/05/2010'
    },
    { 
      key: 'municipioVotacion', 
      label: 'Municipio de votación', 
      required: false,
      description: 'Municipio donde está registrado para votar',
      example: 'Barranquilla'
    },
    { 
      key: 'zonaPuesto', 
      label: 'Zona y puesto', 
      required: false,
      description: 'Zona y puesto de votación asignado',
      example: 'Zona 1 - Puesto 5'
    },
    { 
      key: 'mesa', 
      label: 'Mesa', 
      required: false,
      description: 'Número de mesa de votación',
      example: '001'
    },
    { 
      key: 'cedulaLider', 
      label: 'Cédula del líder', 
      required: false,
      description: 'Cédula del líder responsable (nueva funcionalidad)',
      example: '87654321',
      icon: UserIcon,
      isNew: true // ✅ NUEVO CAMPO DESTACADO
    }
  ],
  
  // Otros tipos de entidades...
  voters: [
    { key: 'cedula', label: 'Cédula *', required: true },
    { key: 'nombres', label: 'Nombres *', required: true },
    { key: 'apellidos', label: 'Apellidos *', required: true },
    { key: 'celular', label: 'Celular', required: false },
    { key: 'direccion', label: 'Dirección', required: false },
    { key: 'barrio', label: 'Barrio', required: false },
    { key: 'municipio', label: 'Municipio', required: false }
  ]
};

// =====================================
// ✅ COMPONENTE PRINCIPAL
// =====================================

export const ImportMapping: React.FC<ImportMappingProps> = ({ 
  preview, 
  entityType, 
  onSubmit, 
  onBack 
}) => {
  const dispatch = useDispatch();
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [autoMappedFields, setAutoMappedFields] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const availableFields = FIELD_MAPPINGS[entityType] || [];

  // =====================================
  // ✅ AUTO-MAPEO INTELIGENTE
  // =====================================

  useEffect(() => {
    const autoMap = () => {
      const newMappings: Record<string, string> = {};
      const autoMapped: string[] = [];

      availableFields.forEach(field => {
        // Buscar coincidencias exactas o similares
        const matchingHeader = preview.headers.find(header => {
          const normalizedHeader = header.toLowerCase().trim();
          const normalizedField = field.key.toLowerCase();
          
          // Coincidencias exactas
          if (normalizedHeader === normalizedField) return true;
          if (normalizedHeader === field.label.toLowerCase().replace(' *', '')) return true;
          
          // Coincidencias parciales para campos específicos
          if (field.key === 'cedulaLider') {
            return normalizedHeader.includes('cedula') && normalizedHeader.includes('lider');
          }
          if (field.key === 'barrioVive') {
            return normalizedHeader.includes('barrio');
          }
          if (field.key === 'fechaExpedicion') {
            return normalizedHeader.includes('fecha') && normalizedHeader.includes('expedicion');
          }
          if (field.key === 'municipioVotacion') {
            return normalizedHeader.includes('municipio') && normalizedHeader.includes('votacion');
          }
          if (field.key === 'zonaPuesto') {
            return normalizedHeader.includes('zona') && normalizedHeader.includes('puesto');
          }
          
          // Coincidencias generales
          return normalizedHeader.includes(normalizedField) || normalizedField.includes(normalizedHeader);
        });

        if (matchingHeader) {
          newMappings[field.key] = matchingHeader;
          autoMapped.push(field.key);
        }
      });

      setMappings(newMappings);
      setAutoMappedFields(autoMapped);

      // Mostrar notificación sobre auto-mapeo
      if (autoMapped.length > 0) {
        dispatch(addNotification({
          type: 'success',
          title: 'Mapeo automático completado',
          message: `Se mapearon automáticamente ${autoMapped.length} campo(s). Revisa y ajusta según sea necesario.`,
          duration: 5000
        }));
      }
    };

    autoMap();
  }, [preview.headers, availableFields, dispatch]);

  // =====================================
  // ✅ VALIDACIÓN
  // =====================================

  const validateMappings = () => {
    const errors: string[] = [];
    
    // Verificar campos requeridos
    availableFields.forEach(field => {
      if (field.required && !mappings[field.key]) {
        errors.push(`El campo "${field.label}" es obligatorio`);
      }
    });

    // Verificar duplicados
    const usedHeaders = Object.values(mappings).filter(Boolean);
    const duplicatedHeaders = usedHeaders.filter((header, index) => 
      usedHeaders.indexOf(header) !== index
    );

    if (duplicatedHeaders.length > 0) {
      errors.push(`Estas columnas están duplicadas: ${duplicatedHeaders.join(', ')}`);
    }

    // Validación específica para cédula líder
    if (mappings.cedulaLider && entityType === 'planillados') {
      // Verificar que hay datos en esa columna
      const hasData = preview.sampleRows.some(row => {
        const value = row[mappings.cedulaLider];
        return value && value.toString().trim() !== '';
      });

      if (!hasData) {
        errors.push('La columna de "Cédula del líder" está vacía en todas las filas de muestra');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // =====================================
  // ✅ MANEJADORES DE EVENTOS
  // =====================================

  const handleMappingChange = (fieldKey: string, headerValue: string) => {
    setMappings(prev => ({
      ...prev,
      [fieldKey]: headerValue
    }));
    
    // Limpiar errores cuando se hace un cambio
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleSubmit = () => {
    if (validateMappings()) {
      console.log('✅ Mapeos validados, enviando:', mappings);
      onSubmit(mappings);
    } else {
      dispatch(addNotification({
        type: 'error',
        title: 'Errores en mapeo',
        message: 'Corrige los errores antes de continuar',
        duration: 5000
      }));
    }
  };

  const handleReset = () => {
    setMappings({});
    setAutoMappedFields([]);
    setValidationErrors([]);
    
    dispatch(addNotification({
      type: 'info',
      title: 'Mapeo reiniciado',
      message: 'Todos los mapeos han sido limpiados',
      duration: 3000
    }));
  };

  // =====================================
  // ✅ COMPONENTES DE RENDER
  // =====================================

  const renderFieldMapping = (field: FieldMapping) => {
    const isAutoMapped = autoMappedFields.includes(field.key);
    const selectedHeader = mappings[field.key];
    const Icon = field.icon;

    return (
      <div 
        key={field.key}
        className={`p-4 border rounded-lg transition-all ${
          field.isNew 
            ? 'border-blue-300 bg-blue-50' 
            : 'border-gray-200 bg-white'
        } hover:shadow-sm`}
      >
        {/* Header del campo */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {Icon && <Icon className="w-5 h-5 text-gray-400 mr-2" />}
            <div>
              <h4 className={`font-medium flex items-center ${
                field.required ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {field.label}
                {field.isNew && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    ✨ Nuevo
                  </span>
                )}
                {isAutoMapped && (
                  <CheckIcon className="w-4 h-4 text-green-500 ml-2" title="Mapeado automáticamente" />
                )}
              </h4>
              {field.description && (
                <p className="text-sm text-gray-500 mt-1">{field.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Selector de columna */}
        <div className="space-y-2">
          <select
            value={selectedHeader || ''}
            onChange={(e) => handleMappingChange(field.key, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              field.required && !selectedHeader 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
          >
            <option value="">-- Seleccionar columna --</option>
            {preview.headers.map(header => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
          
          {/* Ejemplo de datos */}
          {selectedHeader && (
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Vista previa:</strong>{' '}
              {preview.sampleRows.slice(0, 3).map(row => 
                row[selectedHeader] || '<vacío>'
              ).join(', ')}
              {preview.sampleRows.length > 3 && '...'}
            </div>
          )}

          {/* Ejemplo esperado */}
          {field.example && (
            <div className="text-xs text-blue-600">
              <strong>Ejemplo esperado:</strong> {field.example}
            </div>
          )}
        </div>
      </div>
    );
  };

  const mappedFieldsCount = Object.values(mappings).filter(Boolean).length;
  const requiredFieldsCount = availableFields.filter(f => f.required).length;
  const mappedRequiredFields = availableFields.filter(f => f.required && mappings[f.key]).length;

  // =====================================
  // ✅ RENDER PRINCIPAL
  // =====================================

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Mapear Campos de Importación
        </h2>
        <p className="text-gray-600">
          Relaciona las columnas de tu archivo Excel con los campos del sistema. 
          Los campos marcados con * son obligatorios.
        </p>
      </div>

      {/* Información del archivo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-2">Información del archivo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Total de filas:</span>
                <span className="ml-2 text-blue-900">{preview.totalRows}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Columnas detectadas:</span>
                <span className="ml-2 text-blue-900">{preview.headers.length}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Tipo:</span>
                <span className="ml-2 text-blue-900 capitalize">{entityType}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del mapeo */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center mr-6">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                mappedRequiredFields === requiredFieldsCount ? 'bg-green-500' : 'bg-amber-500'
              }`}></div>
              <span className="font-medium">
                Campos obligatorios: {mappedRequiredFields}/{requiredFieldsCount}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">
                Total mapeados: {mappedFieldsCount}/{availableFields.length}
              </span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Limpiar todo
          </button>
        </div>
        
        {/* Barra de progreso */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(mappedFieldsCount / availableFields.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Errores de validación */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 mb-2">Errores de mapeo</h3>
              <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Grid de mapeos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {availableFields.map(renderFieldMapping)}
      </div>

      {/* Información adicional para cédula líder */}
      {entityType === 'planillados' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <UserIcon className="w-6 h-6 text-blue-600 mr-3 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-3">
                🆕 Nueva funcionalidad: Relación con líderes
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  <strong>¿Qué hace el campo "Cédula del líder"?</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Si existe un líder con esa cédula → se relaciona automáticamente</li>
                  <li>Si no existe → se guarda como "pendiente" para relacionar después</li>
                  <li>Cuando registres el líder, recibirás una notificación para relacionar</li>
                  <li>Si lo dejas vacío → se puede asignar manualmente después</li>
                </ul>
                <p className="mt-3 text-xs">
                  💡 <strong>Tip:</strong> Esta función hace que la asignación de líderes sea mucho más eficiente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Volver
        </button>

        <div className="flex items-center gap-3">
          {/* Información de validación */}
          <div className="text-sm text-gray-600">
            {mappedRequiredFields === requiredFieldsCount ? (
              <span className="text-green-600 flex items-center">
                <CheckIcon className="w-4 h-4 mr-1" />
                Listo para importar
              </span>
            ) : (
              <span className="text-amber-600 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                Completa campos obligatorios
              </span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={mappedRequiredFields !== requiredFieldsCount}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Continuar importación →
          </button>
        </div>
      </div>
    </div>
  );
};