// frontend/src/components/planillados/BulkActionsBar.tsx
import React, { useState } from 'react';
import {
  CheckBadgeIcon,
  ClockIcon,
  UserIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface BulkActionsBarProps {
  selectedIds: number[];
  onAction: (action: string, ids: number[]) => void;
  onClearSelection: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedIds,
  onAction,
  onClearSelection
}) => {
  const [showActions, setShowActions] = useState(false);

  const actions = [
    {
      id: 'verify',
      label: 'Marcar como Verificados',
      icon: CheckBadgeIcon,
      color: 'green',
      description: 'Cambiar estado a verificado'
    },
    {
      id: 'pending',
      label: 'Marcar como Pendientes',
      icon: ClockIcon,
      color: 'yellow',
      description: 'Cambiar estado a pendiente'
    },
    {
      id: 'assign-leader',
      label: 'Asignar Líder',
      icon: UserIcon,
      color: 'blue',
      description: 'Asignar a un líder específico'
    },
    {
      id: 'export',
      label: 'Exportar Seleccionados',
      icon: DocumentArrowDownIcon,
      color: 'indigo',
      description: 'Descargar en Excel'
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: TrashIcon,
      color: 'red',
      description: 'Eliminar permanentemente'
    }
  ];

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'hover') => {
    const colorMap = {
      green: {
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-700',
        hover: 'hover:bg-green-100'
      },
      yellow: {
        bg: 'bg-yellow-50 border-yellow-200',
        text: 'text-yellow-700',
        hover: 'hover:bg-yellow-100'
      },
      blue: {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-700',
        hover: 'hover:bg-blue-100'
      },
      indigo: {
        bg: 'bg-indigo-50 border-indigo-200',
        text: 'text-indigo-700',
        hover: 'hover:bg-indigo-100'
      },
      red: {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        hover: 'hover:bg-red-100'
      }
    };
    
    return colorMap[color as keyof typeof colorMap]?.[type] || colorMap.blue[type];
  };

  const handleAction = (actionId: string) => {
    if (actionId === 'delete') {
      if (window.confirm(`¿Estás seguro de que quieres eliminar ${selectedIds.length} planillados?`)) {
        onAction(actionId, selectedIds);
      }
    } else {
      onAction(actionId, selectedIds);
    }
    setShowActions(false);
  };

  return (
    <div className="sticky top-0 z-10 bg-primary-50 border border-primary-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Información de selección */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {selectedIds.length}
            </div>
            <span className="ml-3 text-primary-900 font-medium">
              {selectedIds.length === 1 
                ? '1 planillado seleccionado'
                : `${selectedIds.length} planillados seleccionados`
              }
            </span>
          </div>
          
          <button
            onClick={onClearSelection}
            className="flex items-center text-sm text-primary-700 hover:text-primary-900 transition-colors"
            title="Limpiar selección"
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Limpiar
          </button>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center space-x-3">
          {/* Acciones rápidas */}
          <button
            onClick={() => handleAction('verify')}
            className="inline-flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
          >
            <CheckBadgeIcon className="w-4 h-4 mr-2" />
            Verificar
          </button>

          <button
            onClick={() => handleAction('export')}
            className="inline-flex items-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Exportar
          </button>

          {/* Dropdown de más acciones */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Más acciones
              <ChevronDownIcon className="w-4 h-4 ml-2" />
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                <div className="p-2">
                  {actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      className={`w-full flex items-start p-3 rounded-lg transition-colors ${getColorClasses(action.color, 'hover')} border ${getColorClasses(action.color, 'bg')}`}
                    >
                      <action.icon className={`w-5 h-5 mr-3 mt-0.5 ${getColorClasses(action.color, 'text')}`} />
                      <div className="text-left">
                        <div className={`font-medium ${getColorClasses(action.color, 'text')}`}>
                          {action.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {action.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de progreso de acción (opcional) */}
      <div className="mt-3 text-xs text-primary-600">
        <strong>Tip:</strong> Usa Ctrl+Click para seleccionar múltiples elementos, o usa los filtros para seleccionar grupos específicos.
      </div>
    </div>
  );
};