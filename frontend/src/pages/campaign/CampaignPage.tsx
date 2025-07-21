// frontend/src/pages/campaign/CampaignPage.tsx - CON DATOS REALES
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  IdentificationIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightIcon,
  ChartBarIcon,
  UserPlusIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

// Importar servicios para obtener estadísticas reales
import candidatesService from '../../services/candidatesService';
import groupsService from '../../services/groupsService';
import leadersService from '../../services/leadersService';
import planilladosService from '../../services/planilladosService';

interface ModuleStats {
  candidates: { total: number; active: number };
  groups: { total: number; active: number };
  leaders: { total: number; active: number };
  planillados: { total: number; verified: number };
}

export const CampaignPage: React.FC = () => {
  const [stats, setStats] = useState<ModuleStats>({
    candidates: { total: 0, active: 0 },
    groups: { total: 0, active: 0 },
    leaders: { total: 0, active: 0 },
    planillados: { total: 0, verified: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Cargar estadísticas de todos los módulos
        const [candidatesStats, groupsStats, leadersStats, planilladosStats] = await Promise.allSettled([
          candidatesService.getStats(),
          groupsService.getStats(),
          leadersService.getStats(),
          planilladosService.getStats()
        ]);

        // Procesar resultados de candidatos
        const candidatesData = candidatesStats.status === 'fulfilled' 
          ? { total: candidatesStats.value.total || 0, active: candidatesStats.value.activos || 0 }
          : { total: 0, active: 0 };

        // Procesar resultados de grupos
        const groupsData = groupsStats.status === 'fulfilled'
          ? { total: groupsStats.value.total || 0, active: groupsStats.value.activos || 0 }
          : { total: 0, active: 0 };

        // Procesar resultados de líderes
        const leadersData = leadersStats.status === 'fulfilled'
          ? { total: leadersStats.value.total || 0, active: leadersStats.value.activos || 0 }
          : { total: 0, active: 0 };

        // Procesar resultados de planillados
        const planilladosData = planilladosStats.status === 'fulfilled'
          ? { total: planilladosStats.value.total || 0, verified: planilladosStats.value.verificados || 0 }
          : { total: 0, verified: 0 };

        setStats({
          candidates: candidatesData,
          groups: groupsData,
          leaders: leadersData,
          planillados: planilladosData
        });

      } catch (error) {
        console.error('Error loading stats:', error);
        setError('Error al cargar estadísticas');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const modules = [
    {
      name: 'Candidatos',
      description: 'Gestión completa de candidatos y perfiles electorales',
      href: '/campaign/candidates',
      icon: IdentificationIcon,
      gradient: 'from-blue-500 to-blue-600',
      stats: { 
        total: stats.candidates.total, 
        active: stats.candidates.active 
      },
      features: ['Perfiles completos', 'Metas de votos', 'Historial electoral']
    },
    {
      name: 'Grupos',
      description: 'Organización de grupos y estructuras de campaña',
      href: '/campaign/groups',
      icon: UserGroupIcon,
      gradient: 'from-green-500 to-green-600',
      stats: { 
        total: stats.groups.total, 
        active: stats.groups.active 
      },
      features: ['Jerarquías', 'Asignaciones', 'Coordinación territorial']
    },
    {
      name: 'Líderes',
      description: 'Administración de líderes y coordinadores territoriales',
      href: '/campaign/leaders',
      icon: AcademicCapIcon,
      gradient: 'from-purple-500 to-purple-600',
      stats: { 
        total: stats.leaders.total, 
        active: stats.leaders.active 
      },
      features: ['Territorios', 'Performance', 'Reportes']
    },
    {
      name: 'Planillados',
      description: 'Base de datos de votantes y análisis electoral',
      href: '/campaign/planillados',
      icon: ClipboardDocumentCheckIcon,
      gradient: 'from-primary-500 to-primary-600',
      stats: { 
        total: stats.planillados.total, 
        verified: stats.planillados.verified 
      },
      features: ['Analytics', 'Gráficos', 'Mapas', 'Filtros avanzados'],
      isNew: true
    }
  ];

  const quickActions = [
    {
      name: 'Nuevo Candidato',
      description: 'Registrar nuevo candidato',
      href: '/campaign/candidates',
      icon: PlusIcon,
      color: 'blue'
    },
    {
      name: 'Crear Grupo',
      description: 'Formar nuevo grupo de trabajo',
      href: '/campaign/groups',
      icon: UserGroupIcon,
      color: 'green'
    },
    {
      name: 'Nuevo Líder',
      description: 'Registrar líder de territorio',
      href: '/campaign/leaders',
      icon: UserPlusIcon,
      color: 'purple'
    },
    {
      name: 'Nuevo Planillado',
      description: 'Registrar votante rápidamente',
      href: '/campaign/planillados',
      icon: UserPlusIcon,
      color: 'primary'
    },
    {
      name: 'Ver Analytics',
      description: 'Estadísticas y gráficos',
      href: '/campaign/planillados',
      icon: ChartBarIcon,
      color: 'green'
    },
    {
      name: 'Importar Datos',
      description: 'Cargar archivo masivo',
      href: '/operations/import',
      icon: DocumentDuplicateIcon,
      color: 'blue'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <UsersIcon className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Campaña</h1>
                <p className="text-sm text-gray-600">Administración completa de la estructura electoral</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {isLoading ? '...' : stats.planillados.total.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Planillados totales</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">
                  {isLoading ? '...' : stats.planillados.total > 0 
                    ? `${Math.round((stats.planillados.verified / stats.planillados.total) * 100)}%`
                    : '0%'
                  }
                </div>
                <div className="text-xs text-gray-500">Verificados</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${action.color}-100`}>
                    <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">📋 Módulos de Gestión</h2>
            <span className="text-sm text-gray-500">{modules.length} módulos disponibles</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {modules.map((module) => (
              <Link
                key={module.name}
                to={module.href}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group relative"
              >
                {module.isNew && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                      Nuevo
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300`}>
                        <module.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {module.name}
                        </h3>
                        <p className="text-sm text-gray-600 max-w-xs">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-6 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {isLoading ? '...' : (module.stats.total || module.stats.verified || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {module.name === 'Planillados' ? 'Planillados' : 
                         module.name === 'Candidatos' ? 'Candidatos' :
                         module.name === 'Grupos' ? 'Grupos' : 
                         module.name === 'Líderes' ? 'Total' : 'Total'}
                      </div>
                    </div>
                    {(module.stats.active || module.stats.verified) && (
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {isLoading ? '...' : (module.stats.active || module.stats.verified || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {module.name === 'Planillados' ? 'Verificados' : 'Activos'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-1">
                    {module.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom gradient - Corregido para que coincida con el color del módulo */}
                <div className={`h-1 bg-gradient-to-r ${module.gradient}`}></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Section - Planillados Analytics */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <FireIcon className="w-6 h-6 mr-2" />
                <span className="text-sm font-medium opacity-90">DESTACADO</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Analytics Avanzados de Planillados
              </h3>
              <p className="text-sm text-primary-100">
                Explora los gráficos interactivos y análisis avanzados de planillados
              </p>
            </div>
            <Link
              to="/campaign/planillados"
              className="inline-flex items-center px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
            >
              Ver Analytics
              <ChartBarIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};