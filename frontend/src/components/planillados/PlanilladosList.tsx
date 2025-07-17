// frontend/src/components/planillados/PlanilladosList.tsx
import React, { useState, useEffect } from 'react';
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
  UserGroupIcon
} from '@heroicons/react/24/outline';
import type { PlanilladoFiltersDto, Planillado } from '../../pages/campaign/PlanilladosPage';

interface PlanilladosListProps {
  filters: PlanilladoFiltersDto;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit: (planillado: Planillado) => void;
}

export const PlanilladosList: React.FC<PlanilladosListProps> = ({
  filters,
  selectedIds,
  onSelectionChange,
  onEdit
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [planillados, setPlanillados] = useState<Planillado[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Mock data - en producción vendría del API
  const mockPlanillados: Planillado[] = [
    {
      id: 1,
      cedula: '12345678',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez García',
      celular: '3001234567',
      direccion: 'Calle 123 #45-67',
      barrioVive: 'El Prado',
      fechaExpedicion: new Date('2010-05-15'),
      departamentoVotacion: 'Atlántico',
      municipioVotacion: 'Barranquilla',
      direccionVotacion: 'Colegio San José',
      zonaPuesto: 'Zona 1',
      mesa: '001',
      estado: 'verificado',
      esEdil: false,
      actualizado: true,
      liderId: 1,
      grupoId: 1,
      fechaNacimiento: new Date('1985-03-20'),
      genero: 'M',
      notas: 'Contacto verificado',
      fechaCreacion: new Date('2024-01-15'),
      fechaActualizacion: new Date('2024-01-20')
    },
    {
      id: 2,
      cedula: '87654321',
      nombres: 'María Fernanda',
      apellidos: 'González López',
      celular: '3009876543',
      direccion: 'Carrera 50 #80-25',
      barrioVive: 'Riomar',
      fechaExpedicion: new Date('2008-03-20'),
      departamentoVotacion: 'Atlántico',
      municipioVotacion: 'Barranquilla',
      direccionVotacion: 'Escuela Central',
      zonaPuesto: 'Zona 2',
      mesa: '045',
      estado: 'pendiente',
      esEdil: true,
      actualizado: true,
      liderId: 2,
      grupoId: 1,
      fechaNacimiento: new Date('1990-07-15'),
      genero: 'F',
      notas: 'Requiere verificación telefónica',
      fechaCreacion: new Date('2024-01-16'),
      fechaActualizacion: new Date('2024-01-21')
    }
    // ... más datos mock
  ];

  useEffect(() => {
    setLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      setPlanillados(mockPlanillados);
      setTotal(mockPlanillados.length);
      setLoading(false);
    }, 500);
  }, [filters, currentPage, itemsPerPage]);

  const handleSelectAll = () => {
    if (selectedIds.length === planillados.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(planillados.map(p => p.id));
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

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

  const getTipoBadge = (esEdil: boolean) => {
    if (esEdil) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <UserIcon className="w-3 h-3 mr-1" />
          Edil
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <UserIcon className="w-3 h-3 mr-1" />
        Planillado
      </span>
    );
  };

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedIds.length === planillados.length && planillados.length > 0}
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
            <tr key={planillado.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(planillado.id)}
                  onChange={() => handleSelectOne(planillado.id)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {planillado.nombres} {planillado.apellidos}
                  </div>
                  <div className="text-sm text-gray-500">CC: {planillado.cedula}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    {getTipoBadge(planillado.esEdil)}
                    {planillado.genero && (
                      <span className="text-xs text-gray-500">
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
                    onClick={() => onEdit(planillado)}
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

  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {planillados.map((planillado) => (
        <div
          key={planillado.id}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
        >
          {/* Header de la tarjeta */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {planillado.nombres} {planillado.apellidos}
              </h3>
              <p className="text-sm text-gray-500">CC: {planillado.cedula}</p>
            </div>
            <input
              type="checkbox"
              checked={selectedIds.includes(planillado.id)}
              onChange={() => handleSelectOne(planillado.id)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>

          {/* Badges */}
          <div className="flex items-center space-x-2 mb-3">
            {getEstadoBadge(planillado.estado)}
            {getTipoBadge(planillado.esEdil)}
          </div>

          {/* Información de contacto */}
          {planillado.celular && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
              {planillado.celular}
            </div>
          )}

          {/* Ubicación */}
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
            {planillado.barrioVive || 'Sin barrio'}
          </div>

          {/* Información de votación */}
          {planillado.zonaPuesto && planillado.mesa && (
            <div className="text-sm text-gray-600 mb-3">
              <strong>Votación:</strong> {planillado.zonaPuesto} - Mesa {planillado.mesa}
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              {formatDate(planillado.fechaActualizacion)}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(planillado)}
                className="p-1 text-primary-600 hover:text-primary-900 transition-colors"
                title="Editar"
              >
                <PencilSquareIcon className="w-4 h-4" />
              </button>
              <button
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Ver detalles"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
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
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Items per page */}
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron planillados
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros o agrega nuevos planillados.
            </p>
          </div>
        ) : (
          viewMode === 'table' ? renderTableView() : renderCardsView()
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a{' '}
              {Math.min(currentPage * itemsPerPage, total)} de{' '}
              {total.toLocaleString()} resultados
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    Math.abs(page - currentPage) <= 2
                  )
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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