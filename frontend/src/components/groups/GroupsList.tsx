// frontend/src/components/groups/GroupsList.tsx
import React, { useState, useEffect } from 'react';
import {
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import groupsService, { type Group, type GroupFiltersDto } from '../../services/groupsService';

interface GroupsListProps {
  filters: GroupFiltersDto;
  onEditGroup: (group: Group) => void;
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export const GroupsList: React.FC<GroupsListProps> = ({
  filters,
  onEditGroup,
  selectedIds,
  onSelectedIdsChange,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const loadGroups = async (page = 1, sortKey?: string, sortDirection?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await groupsService.getAll(filters, page, pagination.limit);
      
      let sortedData = [...response.data];
      
      // Aplicar ordenamiento local si se especifica
      if (sortKey && sortDirection) {
        sortedData.sort((a, b) => {
          let aValue = a[sortKey as keyof Group];
          let bValue = b[sortKey as keyof Group];
          
          // Manejar valores undefined/null
          if (aValue === undefined || aValue === null) aValue = '';
          if (bValue === undefined || bValue === null) bValue = '';
          
          // Convertir a string para comparación
          const aStr = String(aValue).toLowerCase();
          const bStr = String(bValue).toLowerCase();
          
          if (sortDirection === 'asc') {
            return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
          } else {
            return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
          }
        });
      }
      
      setGroups(sortedData);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Error loading groups:', error);
      setError(error.message || 'Error al cargar grupos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups(1);
  }, [filters]);

  const handleSort = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    loadGroups(pagination.page, key, direction);
  };

  const handlePageChange = (page: number) => {
    loadGroups(page, sortConfig.key, sortConfig.direction);
  };

  const handleDelete = async (group: Group) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el grupo "${group.name}"?`)) {
      try {
        await groupsService.delete(group.id);
        loadGroups(pagination.page);
        onSelectedIdsChange(selectedIds.filter(id => id !== group.id));
      } catch (error: any) {
        console.error('Error deleting group:', error);
        alert('Error al eliminar el grupo: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = groups.map(g => g.id);
      const newSelectedIds = [...new Set([...selectedIds, ...currentPageIds])];
      onSelectedIdsChange(newSelectedIds);
    } else {
      const currentPageIds = groups.map(g => g.id);
      onSelectedIdsChange(selectedIds.filter(id => !currentPageIds.includes(id)));
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      onSelectedIdsChange([...selectedIds, id]);
    } else {
      onSelectedIdsChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // Componente para headers ordenables
  const SortableHeader: React.FC<{ label: string; sortKey: string }> = ({ label, sortKey }) => {
    const isSorted = sortConfig.key === sortKey;
    const direction = sortConfig.direction;

    return (
      <th 
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => handleSort(sortKey)}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          <div className="flex flex-col">
            <ChevronUpIcon 
              className={`w-3 h-3 -mb-1 ${isSorted && direction === 'asc' ? 'text-primary-600' : 'text-gray-300'}`} 
            />
            <ChevronDownIcon 
              className={`w-3 h-3 -mt-1 ${isSorted && direction === 'desc' ? 'text-primary-600' : 'text-gray-300'}`} 
            />
          </div>
        </div>
      </th>
    );
  };

  // Componente de estado del grupo
  const GroupStatus: React.FC<{ group: Group }> = ({ group }) => (
    <div className="flex flex-wrap gap-1">
      {group.isActive ? (
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
    </div>
  );

  // Verificar si todos los elementos de la página actual están seleccionados
  const currentPageIds = groups.map(group => group.id);
  const allCurrentPageSelected = currentPageIds.length > 0 && 
    currentPageIds.every(id => selectedIds.includes(id));
  const someCurrentPageSelected = currentPageIds.some(id => selectedIds.includes(id));

  const totalItems = pagination.total;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Lista de Grupos
            </h3>
            <p className="text-sm text-gray-600">
              {totalItems} grupo{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
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
              <SortableHeader label="Nombre" sortKey="name" />
              <SortableHeader label="Candidato" sortKey="candidateId" />
              <SortableHeader label="Zona" sortKey="zone" />
              <SortableHeader label="Meta" sortKey="meta" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estructura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cumplimiento
              </th>
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
            {loading ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <span className="ml-3 text-gray-600">Cargando grupos...</span>
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
                      onClick={() => loadGroups()}
                      className="mt-3 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                </td>
              </tr>
            ) : groups.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center">
                  <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No se encontraron grupos</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Intenta ajustar los filtros o crear un nuevo grupo
                  </p>
                </td>
              </tr>
            ) : (
              groups.map((group) => {
                const cumplimiento = group.meta > 0 ? Math.round(((group.planilladosCount || 0) / group.meta) * 100) : 0;
                
                return (
                  <tr 
                    key={group.id}
                    className={`hover:bg-gray-50 ${
                      selectedIds.includes(group.id) ? 'bg-primary-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(group.id)}
                        onChange={(e) => handleSelectOne(group.id, e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{group.name}</div>
                          {group.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{group.description}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {group.candidate?.name || 'Sin asignar'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{group.zone || '-'}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {group.meta.toLocaleString()}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <UsersIcon className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{group.leadersCount || 0} líderes</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{group.planilladosCount || 0} planillados</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-900">
                          {group.planilladosCount || 0} / {group.meta}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          cumplimiento >= 100 ? 'bg-green-100 text-green-800' :
                          cumplimiento >= 75 ? 'bg-yellow-100 text-yellow-800' :
                          cumplimiento >= 50 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cumplimiento}%
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <GroupStatus group={group} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEditGroup(group)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded-md hover:bg-primary-50"
                          title="Editar grupo"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(group)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                          title="Eliminar grupo"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                {' '}a{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>
                {' '}de{' '}
                <span className="font-medium">{pagination.total}</span>
                {' '}resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                {/* Números de página */}
                {[...Array(Math.min(pagination.pages, 7))].map((_, i) => {
                  let pageNum;
                  if (pagination.pages <= 7) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 4) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 3) {
                    pageNum = pagination.pages - 6 + i;
                  } else {
                    pageNum = pagination.page - 3 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.page === pageNum
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};