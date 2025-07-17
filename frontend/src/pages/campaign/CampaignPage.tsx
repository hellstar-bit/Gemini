// frontend/src/pages/campaign/CampaignPage.tsx - Página principal del módulo
import React from 'react';
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
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

export const CampaignPage: React.FC = () => {
  const modules = [
    {
      name: 'Candidatos',
      description: 'Gestión completa de candidatos y perfiles electorales',
      href: '/campaign/candidates',
      icon: IdentificationIcon,
      gradient: 'from-blue-500 to-blue-600',
      stats: { total: 12, active: 8 },
      features: ['Perfiles completos', 'Documentos', 'Historial electoral']
    },
    {
      name: 'Grupos',
      description: 'Organización de grupos y estructuras de campaña',
      href: '/campaign/groups',
      icon: UserGroupIcon,
      gradient: 'from-green-500 to-green-600',
      stats: { total: 5, active: 4 },
      features: ['Jerarquías', 'Asignaciones', 'Coordinación']
    },
    {
      name: 'Líderes',
      description: 'Administración de líderes y coordinadores territoriales',
      href: '/campaign/leaders',
      icon: AcademicCapIcon,
      gradient: 'from-purple-500 to-purple-600',
      stats: { total: 45, active: 38 },
      features: ['Territorios', 'Performance', 'Reportes']
    },
    {
      name: 'Planillados',
      description: 'Base de datos de votantes y análisis electoral',
      href: '/campaign/planillados',
      icon: ClipboardDocumentCheckIcon,
      gradient: 'from-primary-500 to-primary-600',
      stats: { total: 15420, verified: 12350 },
      features: ['Analytics', 'Gráficos', 'Mapas', 'Filtros avanzados'],
      isNew: true
    }
  ];

  const quickActions = [
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
                <div className="text-sm font-medium text-gray-900">15,420</div>
                <div className="text-xs text-gray-500">Planillados totales</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">80.1%</div>
                <div className="text-xs text-gray-500">Verificados</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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
                        {module.stats.total?.toLocaleString() || module.stats.verified?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {module.name === 'Planillados' ? 'Verificados' : 'Total'}
                      </div>
                    </div>
                    {module.stats.verified && (
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {((module.stats.verified / module.stats.total) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Verificación</div>
                      </div>
                    )}
                    {module.stats.active && (
                      <div>
                        <div className="text-lg font-semibold text-blue-600">
                          {module.stats.active}
                        </div>
                        <div className="text-xs text-gray-500">Activos</div>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {module.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 group-hover:bg-primary-100 group-hover:text-primary-800 transition-colors"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress bar para planillados */}
                {module.name === 'Planillados' && module.stats.verified && (
                  <div className="px-6 pb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(module.stats.verified / module.stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-primary-900 mb-1">
                🚀 ¿Listo para ver tus datos en acción?
              </h3>
              <p className="text-sm text-primary-700">
                Explora los gráficos interactivos y análisis avanzados de planillados
              </p>
            </div>
            <Link
              to="/campaign/planillados"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
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