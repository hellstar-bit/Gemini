// frontend/src/pages/campaign/PlanilladosPage.tsx - CON MEJOR USO DEL ESPACIO
import React, { useState, useEffect, useCallback } from 'react';
import {
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon,
  ExclamationCircleIcon,
  MapIcon,
} from '@heroicons/react/24/outline';

// Componentes del módulo
import { PlanilladosList } from '../../components/planillados/PlanilladosList';
import { PlanilladosFilters } from '../../components/planillados/PlanilladosFilters';
import { PlanilladosStats } from '../../components/planillados/PlanilladosStats';
import { PlanilladosCharts } from '../../components/planillados/PlanilladosCharts';
import { PlanilladosMap } from '../../components/planillados/PlanilladosMap';
import { PlanilladoModal } from '../../components/planillados/PlanilladoModal';
import { BulkActionsBar } from '../../components/planillados/BulkActionsBar';

// Servicio API
import planilladosService from '../../services/planilladosService';

// ✅ INTERFACES
interface PlanilladoFiltersDto {
  buscar?: string;
  estado?: 'verificado' | 'pendiente';
  esEdil?: boolean;
  barrioVive?: string;
  municipioVotacion?: string;
  liderId?: number;
  grupoId?: number;
  cedulaLider?: string;
  cedulaLiderPendiente?: string;
  sinLider?: boolean;
  conLiderPendiente?: boolean;
  soloAsignados?: boolean;
}

interface PlanilladosStatsDto {
  total: number;
  verificados: number;
  pendientes: number;
  ediles: number;
  porBarrio: Record<string, number>;
  porGenero: Record<string, number>;
  porEdad: Record<string, number>;
  porLider: Record<string, number>;
  porGrupo: Record<string, number>;
  nuevosHoy: number;
  nuevosEstaSemana: number;
  actualizadosHoy: number;
}

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
  cedulaLiderPendiente?: string;
  lider?: {
    id: number;
    cedula: string;
    firstName: string;
    lastName: string;
  };
}

export const PlanilladosPage: React.FC = () => {
  // ✅ Estados principales
  const [view, setView] = useState<'list' | 'charts' | 'map'>('list');
  const [filters, setFilters] = useState<PlanilladoFiltersDto>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlanillado, setEditingPlanillado] = useState<Planillado | null>(null);
  const [stats, setStats] = useState<PlanilladosStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // ✅ Cargar estadísticas desde API
  const loadStats = useCallback(async () => {
    setIsStatsLoading(true);
    setError(null);

    try {
      const statsData = await planilladosService.getStats(filters);
      setStats(statsData);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      setError('Error al cargar estadísticas');

      // Fallback a datos mock para desarrollo
      const mockStats: PlanilladosStatsDto = {
        total: 100,
        verificados: 0,
        pendientes: 100,
        ediles: 0,
        porBarrio: {
          'BOSTON': 13,
          'LAS DELICIAS': 12,
          'RIOMAR': 11,
          'REBOLO': 11,
          'SAN FELIPE': 11,
        },
        porGenero: {},
        porEdad: {},
        porLider: {},
        porGrupo: {},
        nuevosHoy: 0,
        nuevosEstaSemana: 100,
        actualizadosHoy: 0,
      };
      setStats(mockStats);
    } finally {
      setIsStatsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ✅ Manejar filtros
  const handleFiltersChange = (newFilters: PlanilladoFiltersDto) => {
    setFilters(newFilters);
    setSelectedIds([]); // Limpiar selección al cambiar filtros
  };

  // ✅ Manejar edición
  const handleEdit = (planillado: Planillado) => {
    setEditingPlanillado(planillado);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingPlanillado(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPlanillado(null);
  };

  const handleModalSave = async (data: any) => {
    try {
      setIsLoading(true);
      
      if (editingPlanillado) {
        await planilladosService.update(editingPlanillado.id, data);
      } else {
        await planilladosService.create(data);
      }
      
      handleModalClose();
      loadStats(); // Recargar estadísticas
    } catch (error) {
      console.error('Error saving planillado:', error);
      setError('Error al guardar planillado');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Manejar acciones masivas
  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return;

    try {
      setIsLoading(true);
      
      switch (action) {
        case 'verify':
          // Usar update individual para cada planillado seleccionado
          for (const id of selectedIds) {
            await planilladosService.update(id, { estado: 'verificado' });
          }
          break;
        case 'delete':
          // Eliminar individualmente cada planillado seleccionado
          for (const id of selectedIds) {
            await planilladosService.delete(id);
          }
          break;
        case 'export':
          // Obtener datos y exportar
          const data = await planilladosService.getAll({ 
            // Filtrar por IDs si es posible, o usar filtros actuales
            ...filters
          }, 1, 1000);
          
          // Crear y descargar archivo Excel
          const filteredData = data.data.filter(item => selectedIds.includes(item.id));
          const blob = new Blob([JSON.stringify(filteredData, null, 2)], {
            type: 'application/json'
          });
          planilladosService.downloadExcel(blob, 'planillados_seleccionados.json');
          break;
      }
      
      setSelectedIds([]);
      loadStats();
    } catch (error) {
      console.error('Error in bulk action:', error);
      setError('Error en acción masiva');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ HEADER COMPACTO - Sin limitación de ancho */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 lg:px-8"> {/* Sin max-width limitante */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Gestión de Planillados</h1>
                  <p className="text-sm text-gray-600">Base de datos de votantes y análisis electoral</p>
                </div>
              </div>
            </div>

            {/* Navegación de vistas y acciones */}
            <div className="flex items-center space-x-4">
              {/* Cambiar vista */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    view === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setView('charts')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    view === 'charts'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Gráficos
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    view === 'map'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mapa
                </button>
              </div>

              {/* Botón principal */}
              <button
                onClick={handleCreate}
                disabled={isLoading}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Nuevo Planillado
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ESTADÍSTICAS RÁPIDAS - Full width */}
      {isStatsLoading ? (
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 lg:px-8 py-6"> {/* Sin max-width limitante */}
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
            </div>
          </div>
        </div>
      ) : stats && (
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 lg:px-8"> {/* Sin max-width limitante */}
            <PlanilladosStats stats={stats} />
          </div>
        </div>
      )}

      {/* ✅ CONTENIDO PRINCIPAL - Full width */}
      <div className="px-6 lg:px-8 py-6"> {/* Sin max-width limitante */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {view === 'list' && (
          <div className="space-y-6">
            {/* Filtros */}
            <PlanilladosFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />

            {/* Barra de acciones masivas */}
            {selectedIds.length > 0 && (
              <BulkActionsBar
                selectedIds={selectedIds}
                onAction={handleBulkAction}
                onClearSelection={() => setSelectedIds([])}
              />
            )}

            {/* ✅ LISTA CON FULL WIDTH - La tabla aprovechará todo el espacio */}
            <PlanilladosList
              filters={filters}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onEdit={handleEdit}
              onDataChange={loadStats}
            />
          </div>
        )}

        {view === 'charts' && (
          <div>
            {stats ? (
              <PlanilladosCharts 
                stats={stats}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay datos para mostrar gráficos</p>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'map' && (
          <div>
            {stats ? (
              <PlanilladosMap />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay datos para mostrar en el mapa</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ MODAL */}
      {showModal && (
        <PlanilladoModal
          planillado={editingPlanillado}
          onClose={handleModalClose}
          onSave={handleModalSave}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};