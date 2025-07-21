// frontend/src/components/leaders/BulkActionsBar.tsx
import React, { useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  UserGroupIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface BulkActionsBarProps {
  selectedIds: number[];
  onAction: (action: string, ids: number[], groupId?: number) => Promise<void>;
  onClearSelection: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedIds,
  onAction,
  onClearSelection
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupId, setNewGroupId] = useState<number>(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedCount = selectedIds.length;

  // Ejecutar acción masiva
  const executeAction = async (action: string, groupId?: number) => {
    setIsLoading(true);
    try {
      await onAction(action, selectedIds, groupId);
      onClearSelection(); // Limpiar selección después de ejecutar la acción
    } catch (error) {
      console.error('Error executing bulk action:', error);
    } finally {
      setIsLoading(false);
      setShowGroupModal(false);
      setShowDeleteConfirm(false);
    }
  };

  // Acciones disponibles
  const actions = [
    {
      id: 'activate',
      label: 'Activar',
      icon: CheckCircleIcon,
      color: 'text-green-600 hover:bg-green-50',
      description: 'Activar líderes seleccionados'
    },
    {
      id: 'deactivate',
      label: 'Desactivar',
      icon: XCircleIcon,
      color: 'text-red-600 hover:bg-red-50',
      description: 'Desactivar líderes seleccionados'
    },
    {
      id: 'verify',
      label: 'Verificar',
      icon: ShieldCheckIcon,
      color: 'text-yellow-600 hover:bg-yellow-50',
      description: 'Marcar como verificados'
    },
    {
      id: 'unverify',
      label: 'Desverificar',
      icon: ShieldExclamationIcon,
      color: 'text-orange-600 hover:bg-orange-50',
      description: 'Quitar verificación'
    },
    {
      id: 'changeGroup',
      label: 'Cambiar Grupo',
      icon: UserGroupIcon,
      color: 'text-blue-600 hover:bg-blue-50',
      description: 'Asignar a otro grupo',
      requiresGroupId: true
    },
    {
      id: 'export',
      label: 'Exportar',
      icon: DocumentArrowDownIcon,
      color: 'text-indigo-600 hover:bg-indigo-50',
      description: 'Exportar a Excel'
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: TrashIcon,
      color: 'text-red-600 hover:bg-red-50',
      description: 'Eliminar permanentemente',
      dangerous: true
    }
  ];

  // Modal para cambiar grupo
  const GroupModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Cambiar Grupo
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Se cambiará el grupo de {selectedCount} líder{selectedCount > 1 ? 'es' : ''} seleccionado{selectedCount > 1 ? 's' : ''}.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nuevo ID de Grupo
            </label>
            <input
              type="number"
              value={newGroupId}
              onChange={(e) => setNewGroupId(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowGroupModal(false)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => executeAction('changeGroup', newGroupId)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              {isLoading ? 'Cambiando...' : 'Cambiar Grupo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal de confirmación para eliminar
  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Confirmar Eliminación
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            ¿Estás seguro de que deseas eliminar {selectedCount} líder{selectedCount > 1 ? 'es' : ''} seleccionado{selectedCount > 1 ? 's' : ''}?
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-800">
              <strong>⚠️ Esta acción no se puede deshacer.</strong> Se eliminarán permanentemente todos los datos asociados a estos líderes.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => executeAction('delete')}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Información de selección */}
            <div className="flex items-center">
              <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mr-4">
                {selectedCount} seleccionado{selectedCount > 1 ? 's' : ''}
              </div>
              <span className="text-sm text-gray-600">
                Acciones masivas disponibles para los líderes seleccionados
              </span>
            </div>

            {/* Botón de limpiar selección */}
            <button
              onClick={onClearSelection}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Limpiar selección"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Acciones */}
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    if (action.requiresGroupId) {
                      setShowGroupModal(true);
                    } else if (action.dangerous) {
                      setShowDeleteConfirm(true);
                    } else {
                      executeAction(action.id);
                    }
                  }}
                  disabled={isLoading}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    action.dangerous
                      ? 'border-red-200 text-red-700 hover:bg-red-50'
                      : 'border-gray-200 ' + action.color
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={action.description}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {action.label}
                </button>
              );
            })}
          </div>

          {/* Indicador de carga */}
          {isLoading && (
            <div className="mt-3 flex items-center text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
              Ejecutando acción...
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <p><strong>Consejos:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Las acciones se aplicarán a todos los líderes seleccionados</li>
              <li>Puedes seleccionar líderes desde la lista usando las casillas de verificación</li>
              <li>Usa "Exportar" para descargar los datos de los líderes seleccionados</li>
              <li>Las acciones de eliminación no se pueden deshacer</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showGroupModal && <GroupModal />}
      {showDeleteConfirm && <DeleteConfirmModal />}
    </>
  );
};