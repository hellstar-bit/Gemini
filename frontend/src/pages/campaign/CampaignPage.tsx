// frontend/src/pages/campaign/CampaignPage.tsx - ACTUALIZADO con vista jerárquica
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
  FireIcon,
  RectangleStackIcon,
  EyeIcon,
  ExclamationCircleIcon,
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

  // ✅ NUEVA SECCIÓN - Vista jerárquica destacada
  const hierarchyModule = {
    name: 'Vista Jerárquica Completa',
    description: 'Gestiona toda la estructura de campaña en una sola vista integrada',
    href: '/campaign/hierarchy',
    icon: RectangleStackIcon,
    gradient: 'from-emerald-500 to-emerald-600',
    features: ['Navegación intuitiva', 'Vista integrada', 'Jerarquía completa', 'Gestión unificada'],
    isNew: true,
    isRecommended: true
  };

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
      features: ['Analytics', 'Gráficos', 'Mapas', 'Filtros avanzados']
    }
  ];

  const quickActions = [
    {
      name: 'Vista Jerárquica',
      description: 'Acceso completo integrado',
      href: '/campaign/hierarchy',
      icon: RectangleStackIcon,
      color: 'emerald',
      isNew: true
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
                  {isLoading ? 'Cargando...' : `${stats.planillados.total.toLocaleString()} votantes registrados`}
                </div>
                <div className="text-xs text-gray-500">
                  {isLoading ? '' : `${stats.leaders.total} líderes activos`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ✅ NUEVA SECCIÓN - Vista Jerárquica Destacada */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Vista Recomendada</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              ✨ Recomendado
            </span>
          </div>
          
          <Link 
            to={hierarchyModule.href}
            className="block group"
          >
            <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${hierarchyModule.gradient} p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02]`}>
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white">
                  Nuevo
                </span>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <hierarchyModule.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                
                <div className="ml-6 flex-1">
                  <h3 className="text-xl font-semibold text-white">{hierarchyModule.name}</h3>
                  <p className="mt-2 text-white text-opacity-90">{hierarchyModule.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {hierarchyModule.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-10 text-white"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex items-center text-white">
                    <EyeIcon className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Explora la estructura completa de tu campaña</span>
                    <ArrowRightIcon className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Resumen de estadísticas */}
        {!isLoading && !error && (
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <IdentificationIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Candidatos</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.candidates.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Grupos</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.groups.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AcademicCapIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Líderes</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.leaders.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardDocumentCheckIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Planillados</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.planillados.total.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <div className="text-sm text-red-600">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones rápidas */}
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
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
                        {action.name}
                      </h3>
                      {action.isNew && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Módulos principales */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Módulos de Gestión</h2>
            <p className="text-sm text-gray-500">Administra cada aspecto de tu campaña</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {modules.map((module) => (
              <Link
                key={module.name}
                to={module.href}
                className="group relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300"
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-r ${module.gradient} rounded-lg flex items-center justify-center`}>
                    <module.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                        {module.name}
                      </h3>
                      <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-600">{module.description}</p>
                    
                    {/* Estadísticas */}
                    {module.stats && (
                      <div className="mt-4 flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="font-medium text-gray-900">{module.stats.total}</span>
                          <span className="ml-1">total</span>
                        </div>
                        {module.stats.active !== undefined && (
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="font-medium text-green-600">{module.stats.active}</span>
                            <span className="ml-1">activos</span>
                          </div>
                        )}
                        {module.stats.verified !== undefined && (
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="font-medium text-green-600">{module.stats.verified}</span>
                            <span className="ml-1">verificados</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Features */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {module.features.slice(0, 3).map((feature, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {feature}
                        </span>
                      ))}
                      {module.features.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{module.features.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
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