// frontend/src/components/candidates/CandidatesStats.tsx
import React from 'react';
import {
  IdentificationIcon,
  UserGroupIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import type { CandidateStatsDto } from '../../services/candidatesService';

interface CandidatesStatsProps {
  stats: CandidateStatsDto;
  isLoading: boolean;
}

export const CandidatesStats: React.FC<CandidatesStatsProps> = ({ stats, isLoading }) => {
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
      title: 'Total Candidatos',
      value: stats.total,
      subtitle: `${stats.activos} activos, ${stats.inactivos} inactivos`,
      icon: IdentificationIcon,
      color: 'blue',
    },
    {
      title: 'Total Grupos',
      value: stats.totalGrupos,
      subtitle: `Promedio: ${stats.promedioGruposPorCandidato} por candidato`,
      icon: UserGroupIcon,
      color: 'green',
    },
    {
      title: 'Total Líderes',
      value: stats.totalLideres,
      subtitle: 'En toda la estructura',
      icon: UsersIcon,
      color: 'purple',
    },
    {
      title: 'Total Votantes',
      value: stats.totalVotantes,
      subtitle: 'Base electoral registrada',
      icon: ClipboardDocumentCheckIcon,
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
    <div className="space-y-6">
      {/* Tarjetas principales */}
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

      {/* Top candidatos */}
      {stats.topCandidatos.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Candidatos por Votantes
          </h3>
          <div className="space-y-3">
            {stats.topCandidatos.slice(0, 5).map((candidato, index) => (
              <div key={candidato.candidatoId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-800">
                      {index + 1}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {candidato.nombre}
                    </p>
                    <p className="text-sm text-gray-500">
                      {candidato.grupos} grupos, {candidato.lideres} líderes
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {candidato.votantes.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">votantes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};