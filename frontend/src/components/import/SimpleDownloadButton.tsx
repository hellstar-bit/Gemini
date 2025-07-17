// frontend/src/components/import/SimpleDownloadButton.tsx
import React from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useTemplateDownload } from '../../utils/templateDownload';

interface SimpleDownloadButtonProps {
  entityType: 'voters' | 'leaders' | 'candidates' | 'groups';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export const SimpleDownloadButton: React.FC<SimpleDownloadButtonProps> = ({ 
  entityType,
  variant = 'primary',
  size = 'md',
  className = '',
  showIcon = true,
  children
}) => {
  const { downloadTemplate, getEntityLabel } = useTemplateDownload();

  const handleDownload = () => {
    downloadTemplate(entityType);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-500 hover:bg-gray-600 text-white';
      case 'outline':
        return 'border-2 border-green-500 text-green-600 hover:bg-green-50 bg-white';
      default:
        return 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white';
    }
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

  return (
    <button
      onClick={handleDownload}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-xl
        transition-all duration-300
        hover:shadow-lg hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
      title={`Descargar plantilla Excel para ${getEntityLabel(entityType)}`}
    >
      {showIcon && <ArrowDownTrayIcon className={`${getIconSize()} ${children ? 'mr-2' : ''}`} />}
      {children || `Plantilla ${getEntityLabel(entityType)}`}
    </button>
  );
};

// Componente más específico para votantes (el más usado)
export const DownloadVotersTemplateButton: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}> = ({ size = 'md', variant = 'primary', className = '' }) => {
  return (
    <SimpleDownloadButton 
      entityType="voters" 
      size={size}
      variant={variant}
      className={className}
    >
      Descargar Plantilla Excel
    </SimpleDownloadButton>
  );
};