// frontend/src/components/planillados/PlanilladosStats.tsx
import React from 'react';
import {
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import type { PlanilladosStatsDto } from '../../pages/campaign/PlanilladosPage';

interface PlanilladosStatsProps {
  stats: PlanilladosStatsDto;
}

export const PlanilladosStats: React.FC<PlanilladosStatsProps> = ({ stats }) => {
  // Calcular porcentajes
  const verificadosPercentage = stats.total > 0 ? (stats.verificados / stats.total) * 100 : 0;
  const edilesPercentage = stats.total > 0 ? (stats.ediles / stats.total) * 100 : 0;

  // Datos para las tarjetas principales
  const mainStats = [
    {
      title: 'Total Planillados',
      value: stats.total.toLocaleString(),
      icon: UserGroupIcon,
      color: 'blue',
      description: 'Registros en el sistema'
    },
    {
      title: 'Verificados',
      value: stats.verificados.toLocaleString(),
      icon: CheckCircleIcon,
      color: 'green',
      description: `${verificadosPercentage.toFixed(1)}% del total`,
      percentage: verificadosPercentage
    },
    {
      title: 'Pendientes',
      value: stats.pendientes.toLocaleString(),
      icon: ClockIcon,
      color: 'yellow',
      description: `${(100 - verificadosPercentage).toFixed(1)}% del total`,
      percentage: 100 - verificadosPercentage
    },
    {
      title: 'Candidatos Ediles',
      value: stats.ediles.toLocaleString(),
      icon: StarIcon,
      color: 'purple',
      description: `${edilesPercentage.toFixed(1)}% del total`,
      percentage: edilesPercentage
    }
  ];

  // Datos de actividad reciente
  const activityStats = [
    {
      title: 'Nuevos hoy',
      value: stats.nuevosHoy,
      icon: CalendarDaysIcon,
      trend: stats.nuevosHoy > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Esta semana',
      value: stats.nuevosEstaSemana,
      icon: ArrowTrendingUpIcon,
      trend: stats.nuevosEstaSemana > stats.nuevosHoy ? 'up' : 'neutral'
    },
    {
      title: 'Actualizados hoy',
      value: stats.actualizadosHoy,
      icon: CheckCircleIcon,
      trend: stats.actualizadosHoy > 0 ? 'up' : 'neutral'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        text: 'text-blue-800',
        progress: 'bg-blue-500'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        text: 'text-green-800',
        progress: 'bg-green-500'
      },
      yellow: {
        bg: 'bg-yellow-50',
        icon: 'text-yellow-600',
        text: 'text-yellow-800',
        progress: 'bg-yellow-500'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        text: 'text-purple-800',
        progress: 'bg-purple-500'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {mainStats.map((stat) => {
            const colors = getColorClasses(stat.color);
            const IconComponent = stat.icon;
            
            return (
              <div
                key={stat.title}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-2xl font-bold ${colors.text}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                </div>
                
                {/* Barra de progreso para porcentajes */}
                {stat.percentage !== undefined && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors.progress} transition-all duration-300`}
                        style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actividad reciente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {activityStats.map((activity) => {
            const IconComponent = activity.icon;
            
            return (
              <div
                key={activity.title}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <IconComponent className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">{activity.title}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-900">{activity.value}</span>
                    {activity.trend === 'up' && (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 ml-1" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top estadísticas por categoría */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top barrios */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Top Barrios
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.porBarrio)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([barrio, cantidad]) => (
                  <div key={barrio} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1">{barrio}</span>
                    <span className="font-medium text-gray-900 ml-2">{cantidad}</span>
                  </div>
                ))
              }
              {Object.keys(stats.porBarrio).length === 0 && (
                <p className="text-sm text-gray-500 italic">No hay datos disponibles</p>
              )}
            </div>
          </div>

          {/* Top líderes */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <StarIcon className="w-4 h-4 mr-2" />
              Top Líderes
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.porLider)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([lider, cantidad]) => (
                  <div key={lider} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1">{lider}</span>
                    <span className="font-medium text-gray-900 ml-2">{cantidad}</span>
                  </div>
                ))
              }
              {Object.keys(stats.porLider).length === 0 && (
                <p className="text-sm text-gray-500 italic">No hay datos disponibles</p>
              )}
            </div>
          </div>

          {/* Distribución por género */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Por Género
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.porGenero).map(([genero, cantidad]) => {
                const percentage = stats.total > 0 ? (cantidad / stats.total) * 100 : 0;
                const genderLabels: Record<string, string> = {
                  'M': 'Masculino',
                  'F': 'Femenino',
                  'Otro': 'Otro'
                };
                
                return (
                  <div key={genero} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{genderLabels[genero] || genero}</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">{cantidad}</span>
                      <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
              {Object.keys(stats.porGenero).length === 0 && (
                <p className="text-sm text-gray-500 italic">No hay datos disponibles</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};