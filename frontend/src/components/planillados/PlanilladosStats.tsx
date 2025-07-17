// frontend/src/components/planillados/PlanilladosStats.tsx
import React from 'react';
import {
  UserGroupIcon,
  CheckBadgeIcon,
  ClockIcon,
  UserIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import type { PlanilladosStatsDto } from '../../pages/campaign/PlanilladosPage';

interface PlanilladosStatsProps {
  stats: PlanilladosStatsDto;
}

export const PlanilladosStats: React.FC<PlanilladosStatsProps> = ({ stats }) => {
  const porcentajeVerificados = Math.round((stats.verificados / stats.total) * 100);
  const porcentajeEdiles = Math.round((stats.ediles / stats.total) * 100);

  const statCards = [
    {
      label: 'Total Planillados',
      value: stats.total.toLocaleString(),
      icon: UserGroupIcon,
      color: 'blue',
      subtitle: 'Registros totales'
    },
    {
      label: 'Verificados',
      value: stats.verificados.toLocaleString(),
      icon: CheckBadgeIcon,
      color: 'green',
      subtitle: `${porcentajeVerificados}% del total`,
      trend: porcentajeVerificados >= 80 ? 'up' : 'down'
    },
    {
      label: 'Pendientes',
      value: stats.pendientes.toLocaleString(),
      icon: ClockIcon,
      color: 'yellow',
      subtitle: `${100 - porcentajeVerificados}% restante`
    },
    {
      label: 'Ediles',
      value: stats.ediles.toLocaleString(),
      icon: UserIcon,
      color: 'purple',
      subtitle: `${porcentajeEdiles}% son ediles`
    },
    {
      label: 'Nuevos Hoy',
      value: stats.nuevosHoy.toLocaleString(),
      icon: TrendingUpIcon,
      color: 'indigo',
      subtitle: `${stats.nuevosEstaSemana} esta semana`
    },
    {
      label: 'Actualizados',
      value: stats.actualizadosHoy.toLocaleString(),
      icon: CalendarDaysIcon,
      color: 'teal',
      subtitle: 'Hoy'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      teal: 'bg-teal-50 border-teal-200 text-teal-900'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      purple: 'text-purple-600 bg-purple-100',
      indigo: 'text-indigo-600 bg-indigo-100',
      teal: 'text-teal-600 bg-teal-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`border rounded-xl p-4 transition-all duration-300 hover:shadow-md ${getColorClasses(stat.color)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${getIconColorClasses(stat.color)}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                {stat.trend && (
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    stat.trend === 'up' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {stat.trend === 'up' ? '↗️' : '↘️'}
                  </div>
                )}
              </div>
              
              <div>
                <div className="text-2xl font-bold mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium opacity-80 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs opacity-60">
                  {stat.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Barra de progreso de verificación */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progreso de Verificación
            </span>
            <span className="text-sm text-gray-500">
              {stats.verificados.toLocaleString()} de {stats.total.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${porcentajeVerificados}%` }}
            >
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span className="font-medium">{porcentajeVerificados}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};