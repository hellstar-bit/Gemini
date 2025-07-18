// frontend/src/components/planillados/PlanilladosList.tsx - INTEGRADO CON API REAL
import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckBadgeIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  PencilSquareIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  TableCellsIcon,
  UserGroupIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import type { PlanilladoFiltersDto, Planillado } from '../../pages/campaign/PlanilladosPage';
import planilladosService from '../../services/planilladosService';

interface PlanilladosListProps {
  filters: PlanilladoFiltersDto;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit: (planillado: Planillado) => void;
  onDataChange?: () => void; // Callback para notificar cambios de datos
}

export const PlanilladosList: React.FC<PlanilladosListProps> = ({
  filters,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDataChange
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [planillados, setPlanillados] = useState<Planillado[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ✅ Cargar planillados desde API
  const loadPlanillados = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await planilladosService.getAll(filters, currentPage, itemsPerPage);
      setPlanillados(response.data);
      setTotal(response.meta.total);
      
      // Limpiar selecciones que ya no existen
      const existingIds = response.data.map(p => p.id);
      const validSelectedIds = selectedIds.filter(id => existingIds.includes(id));
      if (validSelectedIds.length !== selectedIds.length) {
        onSelectionChange(validSelectedIds);
      }
    } catch (error: any) {
      console.error('Error loading planillados:', error);
      setError(error.message || 'Error al cargar planillados');
      setPlanillados([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage, selectedIds, onSelectionChange]);

  // ✅ Efectos
  useEffect(() => {
    loadPlanillados();
  }, [loadPlanillados]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // ✅ Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelectedIds = [...selectedIds, ...planillados.map(p => p.id)];
      onSelectionChange([...new Set(newSelectedIds)]);
    } else {
      onSelectionChange(selectedIds.filter(id => !planillados.map(p => p.id).includes(id)));
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleEdit = (planillado: Planillado) => {
    onEdit(planillado);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // ✅ Refresh data after external changes
  const refreshData = useCallback(() => {
    loadPlanillados();
    if (onDataChange) {
      onDataChange();
    }
  }, [loadPlanillados, onDataChange]);

  // ✅ Utilities
  const getEstadoBadge = (estado: 'verificado' | 'pendiente') => {
    if (estado === 'verificado') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckBadgeIcon className="w-3 h-3 mr-1" />
          Verificado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <ClockIcon className="w-3 h-3 mr-1" />
        Pendiente
      </span>
    );
  };

  const currentPagePlanilladosIds = planillados.map(p => p.id);
  const allCurrentPageSelected = currentPagePlanilladosIds.length > 0 && currentPagePlanilladosIds.every(id => selectedIds.includes(id));
  const someCurrentPageSelected = currentPagePlanilladosIds.some(id => selectedIds.includes(id));

  // ✅ Vista de tarjetas
  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {planillados.map((planillado) => (
        <div
          key={planillado.id}
          className={`bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
            selectedIds.includes(planillado.id) 
              ? 'border-primary-300 bg-primary-50' 
              : 'border-gray-200'
          }`}
        >
          <div className="p-4">
            {/* Header de la tarjeta */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(planillado.id)}
                  onChange={(e) => handleSelectOne(planillado.id, e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-primary-600" />
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {planillado.esEdil && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Edil
                  </span>
                )}
                {getEstadoBadge(planillado.estado)}
              </div>
            </div>

            {/* Información principal */}
            <div className="mb-3">
              <h3 className="font-medium text-gray-900 truncate">
                {planillado.nombres} {planillado.apellidos}
              </h3>
              <p className="text-sm text-gray-500">CC: {planillado.cedula}</p>
            </div>

            {/* Detalles */}
            <div className="space-y-2 text-sm">
              {planillado.celular && (
                <div className="flex items-center text-gray-600">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  {planillado.celular}
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="w-4 h-4 mr-2" />
                {planillado.barrioVive || 'Sin barrio'}
              </div>
              {planillado.zonaPuesto && planillado.mesa && (
                <div className="text-gray-600">
                  {planillado.zonaPuesto} - Mesa {planillado.mesa}
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                {planillado.genero && (
                  <span>{planillado.genero === 'M' ? '♂️' : planillado.genero === 'F' ? '♀️' : '⚧️'}</span>
                )}
                {!planillado.actualizado && (
                  <span className="text-red-600">●</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(planillado)}
                  className="text-primary-600 hover:text-primary-900 transition-colors"
                  title="Editar"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Ver detalles"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ✅ Vista de tabla
  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={allCurrentPageSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someCurrentPageSelected && !allCurrentPageSelected;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Planillado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contacto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ubicación
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Votación
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {planillados.map((planillado) => (
            <tr
              key={planillado.id}
              className={`hover:bg-gray-50 transition-colors ${
                selectedIds.includes(planillado.id) ? 'bg-primary-50' : ''
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(planillado.id)}
                  onChange={(e) => handleSelectOne(planillado.id, e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <UserIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {planillado.nombres} {planillado.apellidos}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      CC: {planillado.cedula}
                      {planillado.esEdil && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Edil
                        </span>
                      )}
                    </div>
                    {planillado.genero && (
                      <span className="text-lg">
                        {planillado.genero === 'M' ? '♂️' : planillado.genero === 'F' ? '♀️' : '⚧️'}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  {planillado.celular && (
                    <div className="flex items-center text-sm text-gray-900">
                      <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                      {planillado.celular}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mt-1">
                    {planillado.direccion || 'Sin dirección'}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="flex items-center text-sm text-gray-900">
                    <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {planillado.barrioVive || 'Sin barrio'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {planillado.municipioVotacion || 'Sin municipio'}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm text-gray-900">
                    {planillado.zonaPuesto && planillado.mesa ? 
                      `${planillado.zonaPuesto} - Mesa ${planillado.mesa}` : 
                      'Sin asignar'
                    }
                  </div>
                  <div className="text-sm text-gray-500">
                    {planillado.direccionVotacion || 'Sin dirección'}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-2">
                  {getEstadoBadge(planillado.estado)}
                  {!planillado.actualizado && (
                    <div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Desactualizado
                      </span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(planillado)}
                    className="text-primary-600 hover:text-primary-900 transition-colors"
                    title="Editar"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Planillados ({total.toLocaleString()})
            </h3>
            {selectedIds.length > 0 && (
              <p className="text-sm text-gray-600">
                {selectedIds.length} seleccionados
              </p>
            )}
            {error && (
              <div className="flex items-center text-sm text-red-600 mt-1">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Refresh button */}
            <button
              onClick={refreshData}
              disabled={loading}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              title="Actualizar"
            >
              ↻ Actualizar
            </button>

            {/* Items per page */}
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              disabled={loading}
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>

            {/* View toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1 rounded-md transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Vista de tabla"
              >
                <TableCellsIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1 rounded-md transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Vista de tarjetas"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="ml-3 text-gray-600">Cargando planillados...</span>
          </div>
        ) : planillados.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay planillados</h3>
            <p className="text-gray-600">
              {Object.keys(filters).length > 0 
                ? 'No se encontraron planillados con los filtros aplicados.' 
                : 'Aún no hay planillados registrados en el sistema.'
              }
            </p>
            {error && (
              <button
                onClick={refreshData}
                className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Reintentar
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'table' ? renderTableView() : renderCardsView()}
          </>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && !loading && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, total)} de {total} resultados
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Anterior
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        pageNumber === currentPage
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};