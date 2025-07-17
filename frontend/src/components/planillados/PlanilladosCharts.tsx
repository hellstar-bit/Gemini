import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
  
} from 'recharts';
import {
  ChartBarIcon,
  UsersIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  ArrowsPointingOutIcon,
  PhotoIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// Tipos para las props y datos de gráficos
interface PlanilladosChartsProps {
  stats: {
    total: number;
    verificados: number;
    pendientes: number;
    ediles: number;
    porBarrio: Record<string, number>;
    porGenero: Record<string, number>;
    porEdad: Record<string, number>;
    porLider: Record<string, number>;
    porGrupo: Record<string, number>;
    nuevosHoy: number;
    nuevosEstaSemana: number;
    actualizadosHoy: number;
  };
}

// Tipos para los datos de gráficos
interface EdadData {
  rango: string;
  cantidad: number;
  porcentaje: string;
}

interface GeneroData {
  genero: string;
  cantidad: number;
  porcentaje: string;
  color: string;
}

interface BarrioData {
  barrio: string;
  cantidad: number;
  porcentaje: string;
}


interface EstadoData {
  estado: string;
  cantidad: number;
  color: string;
}

// Colores para los gráficos
const COLORS = {
  primary: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
  gender: ['#10B981', '#F59E0B', '#8B5CF6'],
  age: ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4'],
  leaders: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'],
  status: ['#10B981', '#F59E0B', '#EF4444']
};

export const PlanilladosCharts: React.FC<PlanilladosChartsProps> = ({ stats }) => {
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [chartFilters, setChartFilters] = useState({
    timeRange: '30d',
    showVerifiedOnly: false,
    selectedBarrio: 'all'
  });

  // Procesar datos para gráficos
  const chartData = useMemo(() => {
    // Datos de edad
    const edadData = Object.entries(stats.porEdad).map(([rango, cantidad]) => ({
      rango,
      cantidad,
      porcentaje: ((cantidad / stats.total) * 100).toFixed(1)
    }));

    // Datos de género
    const generoData = Object.entries(stats.porGenero).map(([genero, cantidad], index) => ({
      genero: genero === 'M' ? 'Masculino' : genero === 'F' ? 'Femenino' : 'Otro',
      cantidad,
      porcentaje: ((cantidad / stats.total) * 100).toFixed(1),
      color: COLORS.gender[index]
    }));

    // Datos de barrios (top 10)
    const barrioData = Object.entries(stats.porBarrio)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([barrio, cantidad]) => ({
        barrio: barrio.length > 15 ? barrio.substring(0, 15) + '...' : barrio,
        cantidad,
        porcentaje: ((cantidad / stats.total) * 100).toFixed(1)
      }));

    // Datos de líderes
    const liderData = Object.entries(stats.porLider).map(([lider, cantidad]) => ({
      lider: lider.length > 20 ? lider.substring(0, 20) + '...' : lider,
      cantidad,
      verificados: Math.floor(cantidad * 0.8), // Simulado
      pendientes: Math.floor(cantidad * 0.2)
    }));

    // Datos de tendencia (simulados para demo)
    const tendenciaData = Array.from({ length: 30 }, (_, i) => ({
      dia: `${30 - i}d`,
      nuevos: Math.floor(Math.random() * 50) + 10,
      verificados: Math.floor(Math.random() * 80) + 20,
      actualizados: Math.floor(Math.random() * 30) + 5
    })).reverse();

    // Datos de estado
    const estadoData = [
      { estado: 'Verificados', cantidad: stats.verificados, color: COLORS.status[0] },
      { estado: 'Pendientes', cantidad: stats.pendientes, color: COLORS.status[1] },
      { estado: 'Ediles', cantidad: stats.ediles, color: COLORS.status[2] }
    ];

    return {
      edadData,
      generoData,
      barrioData,
      liderData,
      tendenciaData,
      estadoData
    };
  }, [stats]);

  // Componente de filtros para charts
  const ChartFilters = () => (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FunnelIcon className="w-5 h-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Análisis</h3>
        </div>
        <button 
          onClick={() => setChartFilters({ timeRange: '30d', showVerifiedOnly: false, selectedBarrio: 'all' })}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Limpiar filtros
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
          <select 
            value={chartFilters.timeRange}
            onChange={(e) => setChartFilters({...chartFilters, timeRange: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 3 meses</option>
            <option value="1y">Último año</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={chartFilters.showVerifiedOnly}
              onChange={(e) => setChartFilters({...chartFilters, showVerifiedOnly: e.target.checked})}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Solo verificados</span>
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Barrio</label>
          <select 
            value={chartFilters.selectedBarrio}
            onChange={(e) => setChartFilters({...chartFilters, selectedBarrio: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos los barrios</option>
            {Object.keys(stats.porBarrio).map(barrio => (
              <option key={barrio} value={barrio}>{barrio}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // Componente de gráfico con wrapper
  const ChartWrapper = ({ title, icon: Icon, children, chartId }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
    chartId: string;
  }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-primary-50 rounded-lg mr-3">
              <Icon className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedChart(selectedChart === chartId ? null : chartId)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Pantalla completa"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Exportar imagen"
            >
              <PhotoIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <ChartFilters />
      
      {/* Grid de gráficos */}
      <div className={`grid gap-6 ${selectedChart ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        
        {/* Gráfico de Edad */}
        {(!selectedChart || selectedChart === 'edad') && (
          <ChartWrapper title="Distribución por Edad" icon={UsersIcon} chartId="edad">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.edadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="rango" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip 
                  content={(props: any) => {
                    const { active, payload, label } = props;
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload as EdadData;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900">{label}</p>
                          <p className="text-primary-600">
                            Cantidad: <span className="font-medium">{payload[0].value?.toLocaleString()}</span>
                          </p>
                          <p className="text-gray-600 text-sm">
                            {data.porcentaje}% del total
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="cantidad" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}

        {/* Gráfico de Género */}
        {(!selectedChart || selectedChart === 'genero') && (
          <ChartWrapper title="Distribución por Género" icon={UsersIcon} chartId="genero">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.generoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="cantidad"
                >
                  {chartData.generoData.map((entry: GeneroData, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={(props: any) => {
                    const { active, payload } = props;
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload as GeneroData;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900">{data.genero}</p>
                          <p className="text-primary-600">
                            Cantidad: <span className="font-medium">{data.cantidad.toLocaleString()}</span>
                          </p>
                          <p className="text-gray-600 text-sm">{data.porcentaje}% del total</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value: string) => (
                    <span>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}

        {/* Gráfico de Barrios */}
        {(!selectedChart || selectedChart === 'barrios') && (
          <ChartWrapper title="Top 10 Barrios" icon={MapPinIcon} chartId="barrios">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={chartData.barrioData} 
                layout="horizontal"
                margin={{ left: 80, right: 20, top: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  dataKey="barrio" 
                  type="category"
                  tick={{ fontSize: 11 }}
                  stroke="#6b7280"
                  width={80}
                />
                <Tooltip 
                  content={(props: any) => {
                    const { active, payload, label } = props;
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload as BarrioData;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900">{label}</p>
                          <p className="text-primary-600">
                            Planillados: <span className="font-medium">{payload[0].value?.toLocaleString()}</span>
                          </p>
                          <p className="text-gray-600 text-sm">
                            {data.porcentaje}% del total
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="cantidad" 
                  fill="#10B981"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}

        {/* Gráfico de Líderes */}
        {(!selectedChart || selectedChart === 'lideres') && (
          <ChartWrapper title="Performance por Líder" icon={ArrowTrendingUpIcon} chartId="lideres">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.liderData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="lider" 
                  angle={-45}
                  tick={{ fontSize: 10, textAnchor: 'end' }}
                  height={80}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip 
                  content={(props: any) => {
                    const { active, payload, label } = props;
                    if (active && payload && payload.length > 0) {
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900 mb-2">{label}</p>
                          {payload.map((entry: any, index: number) => (
                            <p key={index} style={{ color: entry.color }}>
                              {entry.dataKey === 'verificados' ? 'Verificados' : 'Pendientes'}: {' '}
                              <span className="font-medium">{entry.value?.toLocaleString()}</span>
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="verificados" stackId="a" fill="#10B981" name="Verificados" />
                <Bar dataKey="pendientes" stackId="a" fill="#F59E0B" name="Pendientes" />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}

        {/* Gráfico de Tendencias */}
        {(!selectedChart || selectedChart === 'tendencias') && (
          <ChartWrapper title="Tendencias Temporales" icon={CalendarDaysIcon} chartId="tendencias">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.tendenciaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="dia" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip 
                  content={(props: any) => {
                    const { active, payload, label } = props;
                    if (active && payload && payload.length > 0) {
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900 mb-2">Hace {label}</p>
                          {payload.map((entry: any, index: number) => (
                            <p key={index} style={{ color: entry.color }}>
                              {entry.name}: <span className="font-medium">{entry.value}</span>
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="nuevos" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Nuevos Registros"
                  dot={{ fill: '#3B82F6', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="verificados" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Verificaciones"
                  dot={{ fill: '#10B981', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="actualizados" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Actualizaciones"
                  dot={{ fill: '#F59E0B', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}

        {/* Gráfico de Estado */}
        {(!selectedChart || selectedChart === 'estado') && (
          <ChartWrapper title="Estado de Planillados" icon={ChartBarIcon} chartId="estado">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.estadoData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="cantidad"
                  label={({ estado}) => `${estado}`}
                >
                  {chartData.estadoData.map((entry: EstadoData, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={(props: any) => {
                    const { active, payload } = props;
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload as EstadoData;
                      const porcentaje = ((data.cantidad / stats.total) * 100).toFixed(1);
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900">{data.estado}</p>
                          <p className="text-primary-600">
                            Cantidad: <span className="font-medium">{data.cantidad.toLocaleString()}</span>
                          </p>
                          <p className="text-gray-600 text-sm">{porcentaje}% del total</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}
      </div>

      {/* Resumen estadístico */}
      {!selectedChart && (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Resumen del Análisis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-600">
                {((stats.verificados / stats.total) * 100).toFixed(1)}%
              </div>
              <div className="text-gray-600">Tasa de verificación</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(stats.porBarrio).length}
              </div>
              <div className="text-gray-600">Barrios cubiertos</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(stats.porLider).length}
              </div>
              <div className="text-gray-600">Líderes activos</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}