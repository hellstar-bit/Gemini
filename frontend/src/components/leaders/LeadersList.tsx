// frontend/src/components/leaders/LeadersList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  UserIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import type { Leader, LeaderFiltersDto } from '../../pages/campaign/LeadersPage';
import leadersService from '../../services/leadersService';

interface LeadersListProps {
  filters: LeaderFiltersDto;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit: (leader: Leader) => void;
  onDataChange: () => void; // Para recargar datos después de cambios
}

interface PaginatedData {
  data: Leader[];
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
  const [data, setData] = useState<PaginatedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ✅ Cargar datos desde la API
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await leadersService.getAll(filters, currentPage, pageSize);
      setData(response);
    } catch (error: any) {
      console.error('Error loading leaders:', error);
      setError(error.message || 'Error al cargar líderes');
      
      // Fallback a datos vacíos
      setData({
        data: [],
        meta: {
          total: 0,
          page: currentPage,
          limit: pageSize,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  // ✅ Efectos
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // ✅ Handlers
  const handleSelectAll = () => {
    if (!data) return;
    
    if (selectedIds.length === data.data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.data.map(l => l.id));
    }
  };

  const handleSelectItem = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleDelete = async (leader: Leader) => {
    if (!confirm(`¿Estás seguro de eliminar a ${leader.firstName} ${leader.lastName}?`)) {
      return;
    }

    try {
      await leadersService.delete(leader.id);
      await loadData();
      onDataChange(); // Recargar stats
      onSelectionChange(selectedIds.filter(id => id !== leader.id));
    } catch (error: any) {
      alert(error.message || 'Error al eliminar líder');
    }
  };

  const handleToggleStatus = async (leader: Leader) => {
    try {
      await leadersService.update(leader.id, { isActive: !leader.isActive });
      await loadData();
      onDataChange(); // Recargar stats
    } catch (error: any) {
      alert(error.message || 'Error al actualizar estado');
    }
  };

  const handleToggleVerified = async (leader: Leader) => {
    try {
      await leadersService.update(leader.id, { isVerified: !leader.isVerified });
      await loadData();
      onDataChange(); // Recargar stats
    } catch (error: any) {
      alert(error.message || 'Error al actualizar verificación');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // ✅ Formateo de datos
  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO');
  };

  const getStatusBadge = (isActive: boolean, isVerified: boolean) => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIconSolid className="w-3 h-3 mr-1" />
          Verificado
        </span>
      );
    } else if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <UserIcon className="w-3 h-3 mr-1" />
          Activo
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Inactivo
        </span>
      );
    }
  };

  // ✅ Estados de carga
  if (isLoading && !data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-3 text-gray-600">Cargando líderes...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8">
        <div className="flex items-center justify-center text-red-600">
          <ExclamationTriangleIcon className="w-8 h-8 mr-3" />
          <div>
            <p className="font-medium">Error al cargar datos</p>
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay líderes
        </h3>
        <p className="text-gray-600">
          {Object.keys(filters).length > 0 
            ? 'No se encontraron líderes con los filtros aplicados'
            : 'Aún no hay líderes registrados en el sistema'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header con controles */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={data.data.length > 0 && selectedIds.length === data.data.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                {selectedIds.length > 0 
                  ? `${selectedIds.length} seleccionados`
                  : `${data.meta.total} líderes`
                }
              </span>
            </div>
            
            {isLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                Actualizando...
              </div>
            )}
          </div>

          {/* Control de página */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filas por página:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={data.data.length > 0 && selectedIds.length === data.data.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Información Personal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grupo y Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estadísticas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.data.map((leader) => (
              <tr
                key={leader.id}
                className={`hover:bg-gray-50 ${selectedIds.includes(leader.id) ? 'bg-primary-50' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(leader.id)}
                    onChange={() => handleSelectItem(leader.id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <UserGroupIcon className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {leader.firstName} {leader.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        CC: {leader.cedula}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {leader.phone || '-'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {leader.email || '-'}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {leader.group?.name || 'Sin grupo'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {leader.neighborhood || '-'}
                    {leader.municipality && `, ${leader.municipality}`}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Meta: {leader.meta} votantes
                  </div>
                  <div className="text-sm text-gray-500">
                    Actual: {leader.votersCount || 0} planillados
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(leader.isActive, leader.isVerified)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleToggleVerified(leader)}
                      className={`p-2 rounded-lg transition-colors ${
                        leader.isVerified
                          ? 'text-yellow-600 hover:bg-yellow-100'
                          : 'text-green-600 hover:bg-green-100'
                      }`}
                      title={leader.isVerified ? 'Quitar verificación' : 'Verificar'}
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleStatus(leader)}
                      className={`p-2 rounded-lg transition-colors ${
                        leader.isActive
                          ? 'text-red-600 hover:bg-red-100'
                          : 'text-green-600 hover:bg-green-100'
                      }`}
                      title={leader.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {leader.isActive ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => onEdit(leader)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(leader)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {data.meta.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {((data.meta.page - 1) * data.meta.limit) + 1} a{' '}
              {Math.min(data.meta.page * data.meta.limit, data.meta.total)} de{' '}
              {data.meta.total} resultados
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(data.meta.page - 1)}
                disabled={!data.meta.hasPrevPage}
                className={`p-2 rounded-lg ${
                  data.meta.hasPrevPage
                    ? 'text-gray-600 hover:bg-gray-200'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              
              <span className="text-sm text-gray-600">
                Página {data.meta.page} de {data.meta.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(data.meta.page + 1)}
                disabled={!data.meta.hasNextPage}
                className={`p-2 rounded-lg ${
                  data.meta.hasNextPage
                    ? 'text-gray-600 hover:bg-gray-200'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};