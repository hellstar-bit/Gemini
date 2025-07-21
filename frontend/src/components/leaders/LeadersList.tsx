// frontend/src/components/leaders/LeadersList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import type { Leader, LeaderFiltersDto } from '../../pages/campaign/LeadersPage';
import leadersService from '../../services/leadersService';

interface LeadersListProps {
  filters: LeaderFiltersDto;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit: (leader: Leader) => void;
  onDataChange: () => void;
}

interface SortConfig {
  key: keyof Leader | null;
  direction: 'asc' | 'desc';
}

// ✅ Interface para respuesta paginada (basada en el backend)
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const LeadersList: React.FC<LeadersListProps> = ({
  filters,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDataChange
}) => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const itemsPerPage = 20;

  // ✅ Cargar líderes - CORREGIDO
  const loadLeaders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // ✅ Llamar al servicio con parámetros separados
      const response: PaginatedResponse<Leader> = await leadersService.getAll(
        filters,
        currentPage,
        itemsPerPage
      );

      // ✅ Acceder a los datos correctamente usando la estructura meta
      setLeaders(response.data || []);
      setTotalPages(response.meta.totalPages || 1);
      setTotalItems(response.meta.total || 0);
    } catch (error: any) {
      console.error('Error loading leaders:', error);
      setError('Error al cargar líderes');
      
      // Fallback a datos vacíos
      setLeaders([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  // Efectos
  useEffect(() => {
    loadLeaders();
  }, [loadLeaders]);

  useEffect(() => {
    setCurrentPage(1); // Resetear página al cambiar filtros
  }, [filters]);

  // Manejar ordenamiento
  const handleSort = (key: keyof Leader) => {
    setSortConfig(prevSort => ({
      key,
      direction: prevSort.key === key && prevSort.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Manejar selección individual
  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // Manejar selección de todos
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = leaders.map(leader => leader.id);
      const newSelection = [...new Set([...selectedIds, ...currentPageIds])];
      onSelectionChange(newSelection);
    } else {
      const currentPageIds = leaders.map(leader => leader.id);
      onSelectionChange(selectedIds.filter(id => !currentPageIds.includes(id)));
    }
  };

  // Eliminar líder individual
  const handleDelete = async (id: number) => {
    try {
      await leadersService.delete(id);
      await loadLeaders();
      onDataChange(); // Actualizar estadísticas
      setShowDeleteConfirm(null);
    } catch (error: any) {
      console.error('Error deleting leader:', error);
      setError('Error al eliminar líder');
    }
  };

  // Componente de header de tabla ordenable
  const SortableHeader: React.FC<{
    label: string;
    sortKey: keyof Leader;
    className?: string;
  }> = ({ label, sortKey, className = '' }) => {
    const isSorted = sortConfig.key === sortKey;
    const direction = sortConfig.direction;

    return (
      <th
        onClick={() => handleSort(sortKey)}
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className}`}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          <div className="flex flex-col">
            <ChevronUpIcon 
              className={`w-3 h-3 ${isSorted && direction === 'asc' ? 'text-primary-600' : 'text-gray-300'}`} 
            />
            <ChevronDownIcon 
              className={`w-3 h-3 -mt-1 ${isSorted && direction === 'desc' ? 'text-primary-600' : 'text-gray-300'}`} 
            />
          </div>
        </div>
      </th>
    );
  };

  // Componente de estado del líder
  const LeaderStatus: React.FC<{ leader: Leader }> = ({ leader }) => (
    <div className="flex flex-wrap gap-1">
      {leader.isActive ? (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Activo
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Inactivo
        </span>
      )}
      {leader.isVerified && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ShieldCheckIcon className="w-3 h-3 mr-1" />
          Verificado
        </span>
      )}
    </div>
  );

  // Verificar si todos los elementos de la página actual están seleccionados
  const currentPageIds = leaders.map(leader => leader.id);
  const allCurrentPageSelected = currentPageIds.length > 0 && 
    currentPageIds.every(id => selectedIds.includes(id));
  const someCurrentPageSelected = currentPageIds.some(id => selectedIds.includes(id));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Lista de Líderes
            </h3>
            <p className="text-sm text-gray-600">
              {totalItems} líder{totalItems !== 1 ? 'es' : ''} encontrado{totalItems !== 1 ? 's' : ''}
            </p>
          </div>
          
          {selectedIds.length > 0 && (
            <div className="text-sm text-primary-600 font-medium">
              {selectedIds.length} seleccionado{selectedIds.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allCurrentPageSelected}
                  ref={input => {
                    if (input) input.indeterminate = someCurrentPageSelected && !allCurrentPageSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <SortableHeader label="Nombre" sortKey="firstName" />
              <SortableHeader label="Cédula" sortKey="cedula" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <SortableHeader label="Grupo" sortKey="groupId" />
              <SortableHeader label="Meta" sortKey="meta" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <SortableHeader label="Fecha" sortKey="createdAt" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <span className="ml-3 text-gray-600">Cargando líderes...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center">
                  <div className="text-red-600">
                    <p className="font-medium">Error al cargar los datos</p>
                    <p className="text-sm mt-1">{error}</p>
                    <button
                      onClick={loadLeaders}
                      className="mt-3 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                </td>
              </tr>
            ) : leaders.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center">
                  <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No se encontraron líderes</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Intenta ajustar los filtros o crear un nuevo líder
                  </p>
                </td>
              </tr>
            ) : (
              leaders.map((leader) => (
                <tr 
                  key={leader.id}
                  className={`hover:bg-gray-50 ${
                    selectedIds.includes(leader.id) ? 'bg-primary-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(leader.id)}
                      onChange={(e) => handleSelectOne(leader.id, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {leader.firstName?.charAt(0)}{leader.lastName?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {leader.firstName} {leader.lastName}
                        </div>
                        {leader.gender && (
                          <div className="text-sm text-gray-500">
                            {leader.gender === 'M' ? 'Masculino' : leader.gender === 'F' ? 'Femenino' : 'Otro'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{leader.cedula}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {leader.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="w-4 h-4 mr-1" />
                          {leader.phone}
                        </div>
                      )}
                      {leader.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <EnvelopeIcon className="w-4 h-4 mr-1" />
                          {leader.email.length > 20 ? leader.email.substring(0, 20) + '...' : leader.email}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {leader.neighborhood && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {leader.neighborhood}
                        </div>
                      )}
                      {leader.municipality && (
                        <div className="text-sm text-gray-500">
                          {leader.municipality}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      <UserGroupIcon className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-gray-900">ID: {leader.groupId}</span>
                      {leader.group && (
                        <div className="text-gray-500 ml-1">
                          ({leader.group.name})
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{leader.meta}</div>
                    {leader.votersCount !== undefined && (
                      <div className="text-sm text-gray-500">
                        {leader.votersCount} actual
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <LeaderStatus leader={leader} />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(leader.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(leader.updatedAt).toLocaleDateString()}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(leader)}
                        className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                        title="Editar líder"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => setShowDeleteConfirm(leader.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Eliminar líder"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">
                  {((currentPage - 1) * itemsPerPage) + 1}
                </span>{' '}
                a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{' '}
                de{' '}
                <span className="font-medium">{totalItems}</span> resultados
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmar Eliminación
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar este líder? Esta acción no se puede deshacer.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};