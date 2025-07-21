// frontend/src/pages/campaign/LeadersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

// Componentes del módulo
import { LeadersList } from '../../components/leaders/LeadersList';
import { LeadersFilters } from '../../components/leaders/LeadersFilters';
import { LeadersStats } from '../../components/leaders/LeadersStats';
import { LeadersCharts } from '../../components/leaders/LeadersCharts';
import { LeaderModal } from '../../components/leaders/LeaderModal';
import { BulkActionsBar } from '../../components/leaders/BulkActionsBar';

// Servicio API
import leadersService from '../../services/leadersService';

// Tipos
export interface LeaderFiltersDto {
  buscar?: string;
  isActive?: boolean;
  isVerified?: boolean;
  groupId?: number;
  neighborhood?: string;
  municipality?: string;
  gender?: 'M' | 'F' | 'Other';
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface LeaderStatsDto {
  total: number;
  activos: number;
  verificados: number;
  promedioVotantes: number;
  porGrupo: Record<string, number>;
  porBarrio: Record<string, number>;
  topLideres: Record<string, number>;
}

export interface Leader {
  id: number;
  cedula: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  municipality?: string;
  birthDate?: Date;
  gender?: 'M' | 'F' | 'Other';
  meta: number;
  isActive: boolean;
  isVerified: boolean;
  groupId: number;
  group?: {
    id: number;
    name: string;
  };
  votersCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const LeadersPage: React.FC = () => {
  // ✅ Estados principales
  const [view, setView] = useState<'list' | 'charts'>('list');
  const [filters, setFilters] = useState<LeaderFiltersDto>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [stats, setStats] = useState<LeaderStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // ✅ Cargar estadísticas desde API
  const loadStats = useCallback(async () => {
    setIsStatsLoading(true);
    setError(null);

    try {
      const statsData = await leadersService.getStats(filters);
      setStats(statsData);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      setError('Error al cargar estadísticas');

      // Fallback a datos mock para desarrollo
      const mockStats: LeaderStatsDto = {
        total: 0,
        activos: 0,
        verificados: 0,
        promedioVotantes: 0,
        porGrupo: {},
        porBarrio: {},
        topLideres: {}
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
    setEditingLeader(null);
    setShowModal(true);
  };

  const handleEdit = (leader: Leader) => {
    setEditingLeader(leader);
    setShowModal(true);
  };

  const handleSave = async (data: Partial<Leader>) => {
    setError(null);

    try {
      if (editingLeader) {
        // Actualizar líder existente
        await leadersService.update(editingLeader.id, data);
      } else {
        // Crear nuevo líder
        await leadersService.create(data);
      }

      // Recargar estadísticas y datos
      await loadStats();
      setShowModal(false);
      setSelectedIds([]); // Limpiar selección

      // Mostrar mensaje de éxito (opcional)
      console.log(editingLeader ? 'Líder actualizado' : 'Líder creado');
    } catch (error: any) {
      console.error('Error saving leader:', error);
      setError(error.message || 'Error al guardar líder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async (action: string, ids: number[], groupId?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await leadersService.bulkAction(action, ids, groupId);

      console.log(`Acción masiva ${action}: ${result.affected} líderes afectados`);

      // Recargar datos después de la acción
      await loadStats();
      setSelectedIds([]); // Limpiar selección

      // Manejar exportación especial
      if (action === 'export') {
        const blob = await leadersService.exportToExcel(filters);
        leadersService.downloadExcel(blob);
      }
    } catch (error: any) {
      console.error('Error in bulk action:', error);
      setError(error.message || `Error en acción masiva: ${action}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: LeaderFiltersDto) => {
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
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Líderes</h1>
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
                Nuevo Líder
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
        <LeadersStats stats={stats} />
      )}

      {/* ✅ Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'list' && (
          <div className="space-y-6">
            {/* Filtros */}
            <LeadersFilters
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
            <LeadersList
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
              <LeadersCharts stats={stats} />
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
      </div>

      {/* ✅ Modal crear/editar */}
      {showModal && (
        <LeaderModal
          leader={editingLeader}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};