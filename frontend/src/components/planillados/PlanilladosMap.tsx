// frontend/src/components/planillados/PlanilladosMap.tsx
import React from 'react';
import {
  MapPinIcon,
  ChartBarIcon,
  EyeIcon,
  Cog6ToothIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import type { PlanilladoFiltersDto } from '../../pages/campaign/PlanilladosPage';

interface PlanilladosMapProps {
  filters: PlanilladoFiltersDto;
}

export const PlanilladosMap: React.FC<PlanilladosMapProps> = ({ }) => {
  // Datos simulados de barrios de Barranquilla
  const barriosData = [
    { nombre: 'El Prado', planillados: 1250, densidad: 'alta', coords: { lat: 10.9916, lng: -74.7966 } },
    { nombre: 'Riomar', planillados: 980, densidad: 'alta', coords: { lat: 11.0196, lng: -74.8510 } },
    { nombre: 'Alto Prado', planillados: 890, densidad: 'media', coords: { lat: 10.9856, lng: -74.7888 } },
    { nombre: 'Las Flores', planillados: 750, densidad: 'media', coords: { lat: 10.9675, lng: -74.7810 } },
    { nombre: 'La Concepción', planillados: 680, densidad: 'media', coords: { lat: 10.9445, lng: -74.7965 } },
    { nombre: 'Boston', planillados: 620, densidad: 'baja', coords: { lat: 10.9234, lng: -74.7823 } },
    { nombre: 'Villa Country', planillados: 580, densidad: 'baja', coords: { lat: 11.0087, lng: -74.8234 } },
    { nombre: 'El Golf', planillados: 450, densidad: 'baja', coords: { lat: 10.9987, lng: -74.8156 } }
  ];

  const getDensityColor = (densidad: string) => {
    switch (densidad) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDensityLabel = (densidad: string) => {
    switch (densidad) {
      case 'alta': return 'Alta concentración';
      case 'media': return 'Concentración media';
      case 'baja': return 'Baja concentración';
      default: return 'Sin datos';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <GlobeAltIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mapa de Calor - Barranquilla</h3>
              <p className="text-sm text-gray-600">Concentración de planillados por barrios</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <EyeIcon className="w-4 h-4 mr-2" />
              Vista
            </button>
            <button className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Cog6ToothIcon className="w-4 h-4 mr-2" />
              Configurar
            </button>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-700">Alta (800+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-700">Media (400-800)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Baja (0-400)</span>
          </div>
        </div>
      </div>

      {/* Área del mapa */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Placeholder del mapa */}
        <div className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPinIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Mapa Interactivo de Barranquilla
            </h3>
            <p className="text-gray-600 mb-4 max-w-md">
              Aquí se mostrará el mapa de calor con la concentración de planillados por barrios. 
              Integración con Google Maps próximamente.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
              <Cog6ToothIcon className="w-4 h-4 mr-2" />
              En desarrollo
            </div>
          </div>

          {/* Puntos de ejemplo en el mapa */}
          <div className="absolute inset-0 pointer-events-none">
            {barriosData.slice(0, 5).map((barrio, index) => (
              <div
                key={barrio.nombre}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${20 + index * 15}%`,
                  top: `${30 + index * 10}%`
                }}
              >
                <div className={`w-4 h-4 ${getDensityColor(barrio.densidad)} rounded-full opacity-70 animate-pulse`} />
              </div>
            ))}
          </div>
        </div>

        {/* Estadísticas por barrio */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Estadísticas por Barrio</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {barriosData.slice(0, 8).map((barrio) => (
              <div
                key={barrio.nombre}
                className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 ${getDensityColor(barrio.densidad)} rounded-full`} />
                    <span className="text-sm font-medium text-gray-900">{barrio.nombre}</span>
                  </div>
                  <ChartBarIcon className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-gray-900">
                    {barrio.planillados.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getDensityLabel(barrio.densidad)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel de información adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 barrios */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Barrios</h4>
          <div className="space-y-3">
            {barriosData.slice(0, 5).map((barrio, index) => (
              <div key={barrio.nombre} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-600 rounded-full text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{barrio.nombre}</div>
                    <div className="text-sm text-gray-500">{getDensityLabel(barrio.densidad)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{barrio.planillados.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">planillados</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen por densidad */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Densidad</h4>
          <div className="space-y-4">
            {['alta', 'media', 'baja'].map((densidad) => {
              const barriosEnDensidad = barriosData.filter(b => b.densidad === densidad);
              const totalPlanillados = barriosEnDensidad.reduce((sum, b) => sum + b.planillados, 0);
              
              return (
                <div key={densidad} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 ${getDensityColor(densidad)} rounded-full`} />
                      <span className="text-sm font-medium text-gray-900 capitalize">{densidad}</span>
                    </div>
                    <span className="text-sm text-gray-600">{barriosEnDensidad.length} barrios</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalPlanillados.toLocaleString()}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getDensityColor(densidad).replace('bg-', 'bg-opacity-70 bg-')}`}
                      style={{ width: `${(totalPlanillados / barriosData.reduce((sum, b) => sum + b.planillados, 0)) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h4>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <GlobeAltIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Ver en Google Maps</div>
                  <div className="text-sm text-blue-700">Abrir mapa completo</div>
                </div>
              </div>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <ChartBarIcon className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">Generar Reporte</div>
                  <div className="text-sm text-green-700">Análisis geográfico</div>
                </div>
              </div>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-purple-900">Configurar Zonas</div>
                  <div className="text-sm text-purple-700">Delimitar territorios</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};