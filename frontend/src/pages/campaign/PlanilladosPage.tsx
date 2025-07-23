// frontend/src/pages/campaign/PlanilladosPage.tsx - INTEGRADO CON API REAL
import React, { useState, useEffect, useCallback } from 'react';
import {
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon,
  ExclamationCircleIcon
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
        total: 0,
        verificados: 0,
        pendientes: 0,
        ediles: 0,
        porBarrio: {},
        porGenero: {},
        porEdad: {},
        porLider: {},
        porGrupo: {},
        nuevosHoy: 0,
        nuevosEstaSemana: 0,
        actualizadosHoy: 0
      };
      setStats(mockStats);
    } finally {
      setIsStatsLoading(false);
    }
  }, [filters]);

  // ✅ Efectos
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ✅ Handlers
  const handleCreateNew = () => {
    setEditingPlanillado(null);
    setShowModal(true);
  };

  const handleEdit = (planillado: Planillado) => {
    setEditingPlanillado(planillado);
    setShowModal(true);
  };

  const handleSave = async (data: Partial<Planillado>) => {
    setIsLoading(true);
    setError(null);

    try {
      if (editingPlanillado) {
        // Actualizar planillado existente
        await planilladosService.update(editingPlanillado.id, data);
      } else {
        // Crear nuevo planillado
        await planilladosService.create(data);
      }

      // Recargar estadísticas y datos
      await loadStats();
      setShowModal(false);
      setSelectedIds([]); // Limpiar selección

      // Mostrar mensaje de éxito (opcional)
      console.log(editingPlanillado ? 'Planillado actualizado' : 'Planillado creado');
    } catch (error: any) {
      console.error('Error saving planillado:', error);
      setError(error.message || 'Error al guardar planillado');
    } finally {
      setIsLoading(false);
    }
  };

  

  const handleBulkAction = async (action: string, ids: number[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await planilladosService.bulkAction(action, ids);

      console.log(`Acción masiva ${action}: ${result.affected} planillados afectados`);

      // Recargar datos después de la acción
      await loadStats();
      setSelectedIds([]); // Limpiar selección

      // Manejar exportación especial
      if (action === 'export') {
        await planilladosService.exportToExcel(filters);
      }
    } catch (error: any) {
      console.error('Error in bulk action:', error);
      setError(error.message || `Error en acción masiva: ${action}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: PlanilladoFiltersDto) => {
    setFilters(newFilters);
    setSelectedIds([]); // Limpiar selección al cambiar filtros
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <UserGroupIcon className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Planillados</h1>
                {error && (
                  <div className="flex items-center text-sm text-red-600 mt-1">
                    <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                    {error}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Vistas */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setView('charts')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === 'charts'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Gráficos
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === 'map'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Mapa
                </button>
              </div>

              {/* Acciones */}
              <button
                onClick={handleCreateNew}
                disabled={isLoading}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${isLoading
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

      {/* ✅ Estadísticas rápidas */}
      {isStatsLoading ? (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
            </div>
          </div>
        </div>
      ) : stats && (
        <PlanilladosStats stats={stats} />
      )}

      {/* ✅ Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

            {/* Lista */}
            <PlanilladosList
              filters={filters}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onEdit={handleEdit}
              onDataChange={loadStats} // Recargar stats cuando cambien los datos
            />
          </div>
        )}

        {view === 'charts' && (
          <div>
            {stats ? (
              <PlanilladosCharts stats={stats} />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Cargando gráficos...
                </h3>
                <p className="text-gray-600">
                  Obteniendo datos para generar las visualizaciones
                </p>
              </div>
            )}
          </div>
        )}

        {view === 'map' && (
          <PlanilladosMap filters={filters} />
        )}
      </div>

      {/* ✅ Modal crear/editar */}
      {showModal && (
        <PlanilladoModal
          planillado={editingPlanillado}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          isLoading={isLoading}
        />
      )}

      {/* ✅ Loading overlay global */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <span className="text-gray-900">Procesando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Tipos para los componentes (mantener compatibilidad)
export interface PlanilladoFiltersDto {
  buscar?: string;
  estado?: 'verificado' | 'pendiente';
  barrioVive?: string;
  liderId?: number;
  grupoId?: number;
  esEdil?: boolean;
  genero?: 'M' | 'F' | 'Otro';
  rangoEdad?: string;
  municipioVotacion?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  actualizado?: boolean;
  cedulaLider?: string;  
}

export interface PlanilladosStatsDto {
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

export interface Planillado {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  celular?: string;
  direccion?: string;
  barrioVive?: string;
  fechaExpedicion?: Date;
  departamentoVotacion?: string;
  municipioVotacion?: string;
  direccionVotacion?: string;
  zonaPuesto?: string;
  mesa?: string;
  estado: 'verificado' | 'pendiente';
  esEdil: boolean;
  actualizado: boolean;
  liderId?: number;
  grupoId?: number;
  fechaNacimiento?: Date;
  genero?: 'M' | 'F' | 'Otro';
  notas?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}