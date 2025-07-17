// frontend/src/components/import/TemplateInfoCard.tsx
import React from 'react';
import { 
  DocumentArrowDownIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { SimpleDownloadButton } from './SimpleDownloadButton';
import { useTemplateDownload } from '../../utils/templateDownload';

interface TemplateInfoCardProps {
  entityType: 'voters' | 'leaders' | 'candidates' | 'groups';
  className?: string;
}

export const TemplateInfoCard: React.FC<TemplateInfoCardProps> = ({ 
  entityType, 
  className = '' 
}) => {
  const { getTemplateDetails, getEntityLabel } = useTemplateDownload();
  const details = getTemplateDetails(entityType);

  const getEntityIcon = () => {
    switch (entityType) {
      case 'voters':
        return '👥';
      case 'leaders':
        return '👤';
      case 'candidates':
        return '🎖️';
      case 'groups':
        return '🏛️';
      default:
        return '📄';
    }
  };

  const getEntityColor = () => {
    switch (entityType) {
      case 'voters':
        return 'blue';
      case 'leaders':
        return 'purple';
      case 'candidates':
        return 'orange';
      case 'groups':
        return 'teal';
      default:
        return 'gray';
    }
  };

  const color = getEntityColor();

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-${color}-50 to-${color}-100 border-b border-${color}-200 p-4 rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getEntityIcon()}</span>
            <div>
              <h3 className={`text-lg font-semibold text-${color}-900`}>
                Plantilla {getEntityLabel(entityType)}
              </h3>
              <p className={`text-sm text-${color}-600`}>
                Formato Excel optimizado para importación
              </p>
            </div>
          </div>
          <DocumentTextIcon className={`w-8 h-8 text-${color}-400`} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Información de campos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campos obligatorios */}
          <div>
            <div className="flex items-center mb-2">
              <CheckCircleIcon className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm font-medium text-red-700">Campos Obligatorios</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              {details.requiredFields.map((field, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                  {field}
                </li>
              ))}
            </ul>
          </div>

          {/* Campos opcionales */}
          <div>
            <div className="flex items-center mb-2">
              <InformationCircleIcon className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-700">Campos Opcionales</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              {details.optionalFields.map((field, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-blue-400 rounded-full mr-2"></span>
                  {field}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <span>📊 {details.totalSampleRows} ejemplos incluidos</span>
          <span>📋 Instrucciones detalladas</span>
          <span>✅ Detección automática</span>
        </div>

        {/* Beneficios */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">¿Por qué usar esta plantilla?</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              Formato garantizado
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              Ejemplos incluidos
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              Validación automática
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              Mapeo inteligente
            </div>
          </div>
        </div>
      </div>

      {/* Footer con botón */}
      <div className="border-t border-gray-100 p-4">
        <SimpleDownloadButton 
          entityType={entityType}
          size="md"
          className="w-full"
        >
          <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
          Descargar {details.fileName}
        </SimpleDownloadButton>
      </div>
    </div>
  );
};

// Componente compacto para espacios reducidos
export const CompactTemplateButton: React.FC<{
  entityType: 'voters' | 'leaders' | 'candidates' | 'groups';
  className?: string;
}> = ({ entityType, className = '' }) => {
  const { getEntityLabel } = useTemplateDownload();
  
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <span className="text-xs text-gray-600">¿No tienes archivo?</span>
      <SimpleDownloadButton 
        entityType={entityType}
        size="sm"
        variant="outline"
        showIcon={false}
      >
        Plantilla {getEntityLabel(entityType)}
      </SimpleDownloadButton>
    </div>
  );
};