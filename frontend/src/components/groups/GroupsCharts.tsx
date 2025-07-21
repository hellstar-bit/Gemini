// frontend/src/components/groups/GroupsCharts.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { GroupStatsDto, GroupFiltersDto } from '../../services/groupsService';

interface GroupsChartsProps {
  stats: GroupStatsDto;
  filters: GroupFiltersDto;
}

export const GroupsCharts: React.FC<GroupsChartsProps> = ({ stats }) => {
  // Datos para gráfico por candidato
  const candidateData = Object.entries(stats.porCandidato).map(([name, count]) => ({
    name,
    grupos: count,
  }));

  // Datos para gráfico por zona
  const zoneData = Object.entries(stats.porZona).map(([name, count]) => ({
    name: name === 'Sin zona' ? 'Sin asignar' : name,
    grupos: count,
  }));

  // Datos para cumplimiento de meta
  const metaData = stats.cumplimientoMeta.slice(0, 10).map(item => ({
    nombre: item.nombre.length > 15 ? item.nombre.substring(0, 15) + '...' : item.nombre,
    porcentaje: item.porcentaje,
    actual: item.actual,
    meta: item.meta,
  }));

  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      {/* Distribución por Candidato */}
      {candidateData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Distribución de Grupos por Candidato
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candidateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="grupos" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Zona */}
        {zoneData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Distribución por Zona
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={zoneData}
                    cx="50%"
                    cy="50%"
                    labelLine={false} // eslint-disable-next-line react/no-unstable-nested-components
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="grupos"
                  >
                    {zoneData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Cumplimiento de Meta */}
        {metaData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cumplimiento de Meta (Top 10)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metaData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="nombre" type="category" width={100} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'porcentaje' ? `${value}%` : value,
                      name === 'porcentaje' ? 'Cumplimiento' : name
                    ]}
                    labelFormatter={(label) => `Grupo: ${label}`}
                  />
                  <Bar dataKey="porcentaje" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
