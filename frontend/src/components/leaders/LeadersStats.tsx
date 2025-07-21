// frontend/src/components/leaders/LeadersStats.tsx
import React from 'react';
import {
  UserGroupIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  MapPinIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import type { LeaderStatsDto } from '../../pages/campaign/LeadersPage';

interface LeadersStatsProps {
  stats: LeaderStatsDto;
}

export const LeadersStats: React.FC<LeadersStatsProps> = ({ stats }) => {
  // Calcular porcentajes
  const activePercentage = stats.total > 0 ? (stats.activos / stats.total) * 100 : 0;
  const verifiedPercentage = stats.total > 0 ? (stats.verificados / stats.total) * 100 : 0;

  // Obtener top 3 grupos
  const topGroups = Object.entries(stats.porGrupo)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Obtener top 3 barrios
  const topNeighborhoods = Object.entries(stats.porBarrio)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Obtener top 3 líderes
  const topLeaders = Object.entries(stats.topLideres)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Componente para tarjeta de estadística
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'yellow' | 'purple' | 'indigo';
    trend?: {
      value: number;
      label: string;
    };
  }> = ({ title, value, subtitle, icon, color, trend }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      green: 'bg-green-50 text-green-600 border-green-100',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-100',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${colorClasses[color]} mr-4`}>
                {icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
          
          {trend && (
            <div className="text-right">
              <div className={`inline-flex items-center text-sm font-medium ${
                trend.value >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <ArrowTrendingUpIcon className={`w-4 h-4 mr-1 ${
                  trend.value < 0 ? 'transform rotate-180' : ''
                }`} />
                {Math.abs(trend.value)}%
              </div>
              <p className="text-xs text-gray-500">{trend.label}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Componente para ranking
  const RankingCard: React.FC<{
    title: string;
    items: [string, number][];
    icon: React.ReactNode;
    emptyMessage: string;
  }> = ({ title, items, icon, emptyMessage }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-gray-100 text-gray-600 mr-3">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map(([name, count], index) => (
            <div key={name} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mr-3 ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-900 truncate">
                  {name}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-600">
                {count}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          {emptyMessage}
        </p>
      )}
    </div>
  );

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Líderes"
            value={stats.total.toLocaleString()}
            icon={<UserGroupIcon className="w-6 h-6" />}
            color="blue"
            subtitle="Registrados en el sistema"
          />
          
          <StatCard
            title="Líderes Activos"
            value={stats.activos.toLocaleString()}
            subtitle={`${activePercentage.toFixed(1)}% del total`}
            icon={<CheckCircleIcon className="w-6 h-6" />}
            color="green"
          />
          
          <StatCard
            title="Líderes Verificados"
            value={stats.verificados.toLocaleString()}
            subtitle={`${verifiedPercentage.toFixed(1)}% del total`}
            icon={<ShieldCheckIcon className="w-6 h-6" />}
            color="yellow"
          />
          
          <StatCard
            title="Promedio Votantes"
            value={stats.promedioVotantes.toFixed(1)}
            subtitle="Votantes por líder"
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Gráfico de barras de progreso */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estado de Líderes
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-gray-600">Activos</span>
                  <span className="text-gray-900">{stats.activos} ({activePercentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${activePercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-gray-600">Verificados</span>
                  <span className="text-gray-900">{stats.verificados} ({verifiedPercentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${verifiedPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-gray-600">Inactivos</span>
                  <span className="text-gray-900">
                    {stats.total - stats.activos} ({(100 - activePercentage).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${100 - activePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen Rápido
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Grupos</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Object.keys(stats.porGrupo).length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Barrios</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Object.keys(stats.porBarrio).length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Líderes con Votantes</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Object.keys(stats.topLideres).length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Eficiencia</span>
                <span className="text-sm font-semibold text-green-600">
                  {stats.total > 0 ? ((stats.verificados / stats.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RankingCard
            title="Top Grupos"
            items={topGroups}
            icon={<UserGroupIcon className="w-5 h-5" />}
            emptyMessage="No hay datos de grupos disponibles"
          />
          
          <RankingCard
            title="Top Barrios"
            items={topNeighborhoods}
            icon={<MapPinIcon className="w-5 h-5" />}
            emptyMessage="No hay datos de barrios disponibles"
          />
          
          <RankingCard
            title="Top Líderes"
            items={topLeaders}
            icon={<UsersIcon className="w-5 h-5" />}
            emptyMessage="No hay datos de líderes disponibles"
          />
        </div>
      </div>
    </div>
  );
};