// frontend/src/pages/campaign/PlanilladosPage.tsx - ESTRUCTURA PRINCIPAL
import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  CheckBadgeIcon, 
  ClockIcon,
  UserIcon,
  MapPinIcon,
  ChartBarIcon,
  FunnelIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

// Componentes del módulo
import { PlanilladosList } from '../../components/planillados/PlanilladosList';
import { PlanilladosFilters } from '../../components/planillados/PlanilladosFilters';
import { PlanilladosStats } from '../../components/planillados/PlanilladosStats';
import { PlanilladosCharts } from '../../components/planillados/PlanilladosCharts';
import { PlanilladosMap } from '../../components/planillados/PlanilladosMap';
import { PlanilladoModal } from '../../components/planillados/PlanilladoModal';
import { BulkActionsBar } from '../../components/planillados/BulkActionsBar';

export const PlanilladosPage: React.FC = () => {
  // ✅ Estados principales
  const [view, setView] = useState<'list' | 'charts' | 'map'>('list');
  const [filters, setFilters] = useState<PlanilladoFiltersDto>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlanillado, setEditingPlanillado] = useState<Planillado | null>(null);
  const [stats, setStats] = useState<PlanilladosStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Datos ficticios para desarrollo
  const mockStats: PlanilladosStatsDto = {
    total: 15420,
    verificados: 12350,
    pendientes: 3070,
    ediles: 245,
    porBarrio: {
      'El Prado': 1250,
      'Riomar': 980,
      'Alto Prado': 890,
      'Las Flores': 750,
      'La Concepción': 680
    },
    porGenero: {
      'M': 7800,
      'F': 7620
    },
    porEdad: {
      '18-24': 2100,
      '25-34': 3200,
      '35-44': 4100,
      '45-54': 3500,
      '55-64': 1800,
      '65+': 720
    },
    porLider: {
      'Carlos Rodríguez': 450,
      'Ana González': 380,
      'Miguel Torres': 320
    },
    porGrupo: {
      'Grupo Norte': 2100,
      'Grupo Centro': 1850,
      'Grupo Sur': 1600
    },
    nuevosHoy: 45,
    nuevosEstaSemana: 312,
    actualizadosHoy: 89
  };

  useEffect(() => {
    setStats(mockStats);
  }, []);

  const handleCreateNew = () => {
    setEditingPlanillado(null);
    setShowModal(true);
  };

  const handleEdit = (planillado: Planillado) => {
    setEditingPlanillado(planillado);
    setShowModal(true);
  };

  const handleBulkAction = (action: string, ids: number[]) => {
    console.log(`Acción masiva: ${action} para ${ids.length} planillados`);
    // Implementar acciones masivas
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <UserGroupIcon className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Planillados</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Vistas */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    view === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setView('charts')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    view === 'charts' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Gráficos
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    view === 'map' 
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
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Nuevo Planillado
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Estadísticas rápidas */}
      {stats && <PlanilladosStats stats={stats} />}

      {/* ✅ Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'list' && (
          <div className="space-y-6">
            {/* Filtros */}
            <PlanilladosFilters 
              filters={filters}
              onFiltersChange={setFilters}
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
            />
          </div>
        )}

        {view === 'charts' && stats && (
          <PlanilladosCharts stats={stats} />
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
          onSave={(data) => {
            console.log('Guardar planillado:', data);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

// ✅ Tipos para los componentes
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