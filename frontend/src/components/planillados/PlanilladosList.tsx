// frontend/src/components/planillados/PlanilladosList.tsx - MEJORADO
import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
  CheckCircleIcon,
  ClockIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

// ✅ IMPORTAR EL SERVICIO
import planilladosService from '../../services/planilladosService';

interface Planillado {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  celular?: string;
  direccion?: string;
  barrioVive?: string;
  municipioVotacion?: string;
  zonaPuesto?: string;
  mesa?: string;
  estado: 'verificado' | 'pendiente';
  esEdil: boolean;
  fechaCreacion?: string;
  cedulaLiderPendiente?: string; // ✅ NUEVO CAMPO
  lider?: {
    id: number;
    cedula: string;
    firstName: string;
    lastName: string;
  };
}

interface PlanilladosListProps {
  filters: any;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit: (planillado: Planillado) => void;
  onDataChange: () => void;
}

interface PaginatedResponse {
  data: Planillado[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const PlanilladosList: React.FC<PlanilladosListProps> = ({
  filters,
  selectedIds,
  onSelectionChange,
  onEdit,
}) => {
  const [data, setData] = useState<PaginatedResponse>({
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy] = useState<string>('id');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');

  // ✅ Cargar datos con filtros
  const loadData = async () => {
    setIsLoading(true);
    try {
      // ✅ USAR EL SERVICIO EXISTENTE en lugar de fetch directo
      const response = await planilladosService.getAll(
        filters,
        page,
        pageSize
      );
      
      setData(response);
    } catch (error) {
      console.error('Error loading planillados:', error);
      // Mock data para desarrollo cuando falla la API
      setData({
        data: [
          {
            id: 1,
            cedula: '1098762509',
            nombres: 'Julio Jaime',
            apellidos: 'Mercader Duarte',
            celular: '3001234567',
            direccion: 'Calle 30 #45-21',
            barrioVive: 'SAN FELIPE',
            municipioVotacion: 'BARRANQUILLA',
            zonaPuesto: 'Zona 1 - Puesto 5',
            mesa: '001',
            estado: 'pendiente',
            esEdil: false,
            fechaCreacion: '23/7/2025',
            cedulaLiderPendiente: '87654321', // ✅ DATO NUEVO
            lider: {
              id: 1,
              cedula: '87654321',
              firstName: 'María',
              lastName: 'González'
            }
          },
          {
            id: 2,
            cedula: '331254311',
            nombres: 'Rosalina Fernando',
            apellidos: 'Rivero Angulo',
            celular: '3009876543',
            direccion: 'Carrera 54 #27-9',
            barrioVive: 'CIUDAD JARDÍN',
            municipioVotacion: 'SOLEDAD',
            zonaPuesto: 'Zona 2 - Puesto 3',
            mesa: '025',
            estado: 'pendiente',
            esEdil: false,
            fechaCreacion: '23/7/2025',
            cedulaLiderPendiente: '11223344',
          },
          // Más datos de ejemplo...
        ],
        meta: {
          total: 100,
          page: 1,
          limit: 20,
          totalPages: 5,
          hasNextPage: true,
          hasPrevPage: false,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters, page, pageSize, sortBy, sortOrder]);

  // ✅ Manejar selección
  const handleSelectAll = () => {
    if (selectedIds.length === data.data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.data.map(item => item.id));
    }
  };

  const handleSelectItem = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  // ✅ Manejar paginación
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  // ✅ Generar páginas para paginador
  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = data.meta.totalPages;
    const currentPage = data.meta.page;
    
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
      {/* ✅ Header mejorado */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {selectedIds.length > 0
                  ? `${selectedIds.length} seleccionados`
                  : `${data.meta.total} planillados`
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

      {/* ✅ TABLA CON MEJOR USO DEL ESPACIO - Sin max-width limitante */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={data.data.length > 0 && selectedIds.length === data.data.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Información Personal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto & Ubicación
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ✅ Cédula Líder
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datos Electorales
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="w-32 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.data.map((planillado) => (
              <tr
                key={planillado.id}
                className={`hover:bg-gray-50 transition-colors duration-150 ${
                  selectedIds.includes(planillado.id) ? 'bg-primary-50' : ''
                }`}
              >
                {/* Checkbox */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(planillado.id)}
                    onChange={() => handleSelectItem(planillado.id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </td>
                
                {/* Información Personal */}
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-gray-900">
                        {planillado.nombres} {planillado.apellidos}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <IdentificationIcon className="h-4 w-4 mr-1" />
                        CC: {planillado.cedula}
                        {planillado.esEdil && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Edil
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contacto & Ubicación */}
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {planillado.celular || 'Sin teléfono'}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate max-w-48" title={planillado.direccion}>
                        {planillado.barrioVive || 'Sin ubicación'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* ✅ NUEVA COLUMNA - Cédula Líder */}
                <td className="px-4 py-4">
                  {planillado.lider ? (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <AcademicCapIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">
                          {planillado.lider.cedula}
                        </div>
                        <div className="text-xs text-gray-500">
                          {planillado.lider.firstName} {planillado.lider.lastName}
                        </div>
                      </div>
                    </div>
                  ) : planillado.cedulaLiderPendiente ? (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <ClockIcon className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-yellow-700">
                          {planillado.cedulaLiderPendiente}
                        </div>
                        <div className="text-xs text-yellow-600">
                          Pendiente asignación
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">
                      Sin líder asignado
                    </div>
                  )}
                </td>

                {/* Datos Electorales */}
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-900">
                      {planillado.municipioVotacion || 'Sin municipio'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {planillado.zonaPuesto && `${planillado.zonaPuesto} • `}
                      Mesa: {planillado.mesa || 'N/A'}
                    </div>
                  </div>
                </td>

                {/* Estado */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    planillado.estado === 'verificado'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {planillado.estado === 'verificado' ? (
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <ClockIcon className="w-4 h-4 mr-1" />
                    )}
                    {planillado.estado === 'verificado' ? 'Verificado' : 'Pendiente'}
                  </span>
                </td>

                {/* Fecha */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {planillado.fechaCreacion}
                </td>

                {/* Acciones */}
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => {/* Ver detalles */}}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(planillado)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {/* Eliminar */}}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Footer con paginación mejorada */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((data.meta.page - 1) * data.meta.limit) + 1} a{' '}
            {Math.min(data.meta.page * data.meta.limit, data.meta.total)} de{' '}
            {data.meta.total} resultados
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(data.meta.page - 1)}
              disabled={!data.meta.hasPrevPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Anterior
            </button>
            
            {generatePageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 text-sm border rounded ${
                  pageNum === data.meta.page
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(data.meta.page + 1)}
              disabled={!data.meta.hasNextPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};