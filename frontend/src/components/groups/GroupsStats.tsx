// frontend/src/components/groups/GroupsStats.tsx
import React from 'react';
import {
  UserGroupIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import type { GroupStatsDto } from '../../services/groupsService';

interface GroupsStatsProps {
  stats: GroupStatsDto;
  isLoading: boolean;
}

export const GroupsStats: React.FC<GroupsStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Grupos',
      value: stats.total,
      subtitle: `${stats.activos} activos, ${stats.inactivos} inactivos`,
      icon: UserGroupIcon,
      color: 'blue',
    },
    {
      title: 'Total Líderes',
      value: stats.totalLideres,
      subtitle: `Promedio: ${stats.promedioLideresPorGrupo} por grupo`,
      icon: UsersIcon,
      color: 'green',
    },
    {
      title: 'Total Planillados',
      value: stats.totalPlanillados,
      subtitle: `Promedio: ${stats.promedioPlanilladosPorGrupo} por grupo`,
      icon: ClipboardDocumentCheckIcon,
      color: 'purple',
    },
    {
      title: 'Cumplimiento Promedio',
      value: stats.cumplimientoMeta.length > 0 
        ? `${Math.round(stats.cumplimientoMeta.reduce((sum, item) => sum + item.porcentaje, 0) / stats.cumplimientoMeta.length)}%`
        : '0%',
      subtitle: 'De la meta establecida',
      icon: ChartBarIcon,
      color: 'yellow',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50',
      yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => {
        const colorClasses = getColorClasses(card.color).split(' ');
        const IconComponent = card.icon;
        
        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className={`p-2 rounded-md ${colorClasses[2]}`}>
                <IconComponent className={`h-6 w-6 ${colorClasses[1]}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.subtitle}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};