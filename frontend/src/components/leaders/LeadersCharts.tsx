// frontend/src/components/leaders/LeadersCharts.tsx
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import {
  ChartBarIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import type { LeaderStatsDto } from '../../pages/campaign/LeadersPage';

interface LeadersChartsProps {
  stats: LeaderStatsDto;
}

export const LeadersCharts: React.FC<LeadersChartsProps> = ({ stats }) => {
  const [activeChart, setActiveChart] = useState<'overview' | 'groups' | 'locations' | 'performance'>('overview');

  // Colores para los gráficos
  const colors = {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4'
  };

  const pieColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

  // Preparar datos para gráficos

  // Datos de overview
  const overviewData = [
    {
      name: 'Total',
      value: stats.total,
      color: colors.primary
    },
    {
      name: 'Activos',
      value: stats.activos,
      color: colors.success
    },
    {
      name: 'Verificados',
      value: stats.verificados,
      color: colors.warning
    },
    {
      name: 'Inactivos',
      value: stats.total - stats.activos,
      color: colors.danger
    }
  ];

  // Datos de estado (para pie chart)
  const statusData = [
    {
      name: 'Activos',
      value: stats.activos,
      percentage: stats.total > 0 ? ((stats.activos / stats.total) * 100).toFixed(1) : 0
    },
    {
      name: 'Inactivos',
      value: stats.total - stats.activos,
      percentage: stats.total > 0 ? (((stats.total - stats.activos) / stats.total) * 100).toFixed(1) : 0
    }
  ];

  // Datos de verificación
  const verificationData = [
    {
      name: 'Verificados',
      value: stats.verificados,
      percentage: stats.total > 0 ? ((stats.verificados / stats.total) * 100).toFixed(1) : 0
    },
    {
      name: 'No Verificados',
      value: stats.total - stats.verificados,
      percentage: stats.total > 0 ? (((stats.total - stats.verificados) / stats.total) * 100).toFixed(1) : 0
    }
  ];

  // Datos de grupos (top 10)
  const groupsData = Object.entries(stats.porGrupo)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      fullName: name,
      value,
      percentage: stats.total > 0 ? ((value / stats.total) * 100).toFixed(1) : 0
    }));

  // Datos de barrios (top 10)
  const neighborhoodsData = Object.entries(stats.porBarrio)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      fullName: name,
      value,
      percentage: stats.total > 0 ? ((value / stats.total) * 100).toFixed(1) : 0
    }));

  // Datos de rendimiento de líderes (top 10)
  const performanceData = Object.entries(stats.topLideres)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      fullName: name,
      votantes: value,
      eficiencia: value / stats.promedioVotantes * 100
    }));

  // Componente de tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
              {entry.payload.percentage && ` (${entry.payload.percentage}%)`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Componente de etiqueta personalizada para pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // No mostrar etiquetas para segmentos muy pequeños
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const chartTabs = [
    { id: 'overview', label: 'Resumen', icon: ChartBarIcon },
    { id: 'groups', label: 'Grupos', icon: ChartPieIcon },
    { id: 'locations', label: 'Ubicaciones', icon: PresentationChartLineIcon },
    { id: 'performance', label: 'Rendimiento', icon: ArrowTrendingUpIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Navegación de gráficos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {chartTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveChart(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeChart === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Vista de Resumen */}
          {activeChart === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de barras general */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Generales</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overviewData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill={colors.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de pie - Estado */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Líderes</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? colors.success : colors.danger} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico de verificación */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Verificación</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={verificationData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill={colors.warning} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Vista de Grupos */}
          {activeChart === 'groups' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de barras de grupos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Top 10 Grupos por Líderes
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={groupsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill={colors.secondary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de pie de grupos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Distribución por Grupos
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={groupsData.slice(0, 6)} // Solo top 6 para legibilidad
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {groupsData.slice(0, 6).map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Vista de Ubicaciones */}
          {activeChart === 'locations' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de área de barrios */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Top 10 Barrios por Líderes
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={neighborhoodsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={colors.info} 
                        fill={colors.info}
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de barras horizontal de barrios */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ranking de Barrios
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={neighborhoodsData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={120}
                        fontSize={12}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill={colors.info} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Vista de Rendimiento */}
          {activeChart === 'performance' && (
            <div className="space-y-8">
              {performanceData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Gráfico de líneas de votantes */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Top 10 Líderes por Votantes
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="votantes" 
                          stroke={colors.success} 
                          strokeWidth={3}
                          dot={{ fill: colors.success, strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Gráfico de eficiencia */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Eficiencia vs Promedio
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any, name: string) => [
                            `${value.toFixed(1)}%`, 
                            name === 'eficiencia' ? 'Eficiencia' : name
                          ]}
                        />
                        <Bar 
                          dataKey="eficiencia" 
                          fill={colors.warning} 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ArrowTrendingUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay datos de rendimiento
                  </h3>
                  <p className="text-gray-600">
                    Los datos de votantes por líder no están disponibles
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ChartBarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Información sobre las visualizaciones
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Los gráficos se actualizan automáticamente con los filtros aplicados</li>
                <li>Haz clic en las pestañas para ver diferentes tipos de análisis</li>
                <li>Los datos mostrados reflejan el estado actual de los líderes</li>
                <li>Usa los filtros en la vista de lista para afinar estos resultados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};