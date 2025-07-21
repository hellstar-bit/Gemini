// frontend/src/components/planillados/BulkActionsBar.tsx - CORREGIDO
import React, { useState, useEffect } from 'react';
import {
  CheckBadgeIcon,
  ClockIcon,
  UserIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface Leader {
  id: number;
  name: string;
  groupName?: string;
}

interface BulkActionsBarProps {
  selectedIds: number[];
  onAction: (action: string, ids: number[], liderId?: number) => void;
  onClearSelection: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedIds,
  onAction,
  onClearSelection
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [selectedLeaderId, setSelectedLeaderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar líderes disponibles
  useEffect(() => {
    const loadLeaders = async () => {
      try {
        const response = await fetch('/api/leaders/for-select', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const leadersData = await response.json();
          setLeaders(leadersData);
        }
      } catch (error) {
        console.error('Error loading leaders:', error);
        // Fallback a datos de ejemplo
        setLeaders([
          { id: 1, name: 'María González', groupName: 'Grupo Norte' },
          { id: 2, name: 'Carlos Rodríguez', groupName: 'Grupo Sur' },
          { id: 3, name: 'Ana Patricia Mendoza', groupName: 'Grupo Centro' }
        ]);
      }
    };

    if (showLeaderModal) {
      loadLeaders();
    }
  }, [showLeaderModal]);

  const actions = [
    {
      id: 'verify',
      label: 'Marcar como Verificados',
      icon: CheckBadgeIcon,
      color: 'green',
      description: 'Cambiar estado a verificado'
    },
    {
      id: 'unverify',
      label: 'Marcar como Pendientes',
      icon: ClockIcon,
      color: 'yellow',
      description: 'Cambiar estado a pendiente'
    },
    {
      id: 'assignLeader',
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

  const handleAction = async (actionId: string) => {
    if (actionId === 'assignLeader') {
      setShowLeaderModal(true);
      setShowActions(false);
      return;
    }

    if (actionId === 'delete') {
      if (!window.confirm(`¿Estás seguro de que quieres eliminar ${selectedIds.length} planillados? Esta acción no se puede deshacer.`)) {
        return;
      }
    }

    setIsLoading(true);
    try {
      await onAction(actionId, selectedIds);
    } finally {
      setIsLoading(false);
      setShowActions(false);
    }
  };

  const handleAssignLeader = async () => {
    if (!selectedLeaderId) {
      alert('Por favor selecciona un líder');
      return;
    }

    setIsLoading(true);
    try {
      await onAction('assignLeader', selectedIds, selectedLeaderId);
      setShowLeaderModal(false);
      setSelectedLeaderId(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <>
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
              disabled={isLoading}
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
              disabled={isLoading}
              className={`inline-flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <CheckBadgeIcon className="w-4 h-4 mr-2" />
              Verificar
            </button>

            <button
              onClick={() => handleAction('export')}
              disabled={isLoading}
              className={`inline-flex items-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Exportar
            </button>

            {/* Dropdown de más acciones */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                disabled={isLoading}
                className={`inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    Más acciones
                    <ChevronDownIcon className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>

              {showActions && !isLoading && (
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

      {/* Modal para asignar líder */}
      {showLeaderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900 bg-opacity-50"
            onClick={() => !isLoading && setShowLeaderModal(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Asignar Líder
              </h3>
              <button
                onClick={() => !isLoading && setShowLeaderModal(false)}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Se asignará el líder seleccionado a {selectedIds.length} planillados.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Líder
              </label>
              <select
                value={selectedLeaderId || ''}
                onChange={(e) => setSelectedLeaderId(e.target.value ? parseInt(e.target.value) : null)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
              >
                <option value="">Seleccionar líder...</option>
                {leaders.map(leader => (
                  <option key={leader.id} value={leader.id}>
                    {leader.name} {leader.groupName && `- ${leader.groupName}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowLeaderModal(false)}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignLeader}
                disabled={!selectedLeaderId || isLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedLeaderId && !isLoading
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                    Asignando...
                  </>
                ) : (
                  'Asignar Líder'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};