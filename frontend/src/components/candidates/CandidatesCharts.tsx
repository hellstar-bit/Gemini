// frontend/src/components/candidates/CandidatesCharts.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { CandidateStatsDto, CandidateFiltersDto } from '../../services/candidatesService';

interface CandidatesChartsProps {
  stats: CandidateStatsDto;
  filters: CandidateFiltersDto;
}

export const CandidatesCharts: React.FC<CandidatesChartsProps> = ({ stats }) => {
  // Datos para gráfico por partido
  const partyData = Object.entries(stats.porPartido).map(([name, count]) => ({
    name: name === 'Sin partido' ? 'Independiente' : name,
    candidatos: count,
  }));

  // Datos para gráfico por posición
  const positionData = Object.entries(stats.porPosicion).map(([name, count]) => ({
    name: name === 'Sin definir' ? 'Sin asignar' : name,
    candidatos: count,
  }));

  // Datos para cumplimiento de meta
  const metaData = stats.cumplimientoMeta.slice(0, 10).map(item => ({
    nombre: item.nombre.length > 15 ? item.nombre.substring(0, 15) + '...' : item.nombre,
    porcentaje: item.porcentaje,
    actual: item.actual,
    meta: item.meta,
  }));

  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  return (
    <div className="space-y-6">
      {/* Top Candidatos por Votantes */}
      {stats.topCandidatos.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Candidatos por Número de Votantes
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topCandidatos.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nombre" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString() : value,
                    name === 'votantes' ? 'Votantes' : 
                    name === 'grupos' ? 'Grupos' : 
                    name === 'lideres' ? 'Líderes' : name
                  ]}
                />
                <Bar dataKey="votantes" fill="#3B82F6" name="votantes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Partido */}
        {partyData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Distribución por Partido
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={partyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false} // eslint-disable-next-line react/no-unstable-nested-components
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="candidatos"
                  >
                    {partyData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Distribución por Posición */}
        {positionData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Distribución por Posición
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={positionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="candidatos" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Cumplimiento de Meta */}
      {metaData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Cumplimiento de Meta por Candidato
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nombre" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'porcentaje' ? `${value}%` : value?.toLocaleString(),
                    name === 'porcentaje' ? 'Cumplimiento' : 
                    name === 'actual' ? 'Votantes Actuales' : 
                    name === 'meta' ? 'Meta' : name
                  ]}
                />
                <Bar dataKey="porcentaje" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};