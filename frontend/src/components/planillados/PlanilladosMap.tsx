import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PlanilladosMap.css'; // Importar los estilos CSS
import {
  GlobeAltIcon,
  ArrowsPointingOutIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { geographicService } from '../../services/geographicService';
// Interfaces
interface PlanilladoFiltersDto {
  estado?: 'verificado' | 'pendiente';
  liderId?: number;
  grupoId?: number;
  esEdil?: boolean;
  genero?: 'M' | 'F' | 'Otro';
  fechaDesde?: Date;
  fechaHasta?: Date;
  barrioVive?: string;
}

interface BarrioStats {
  total: number;
  verificados: number;
  pendientes: number;
  ediles: number;
  lideres: number;
  grupos: number;
  densidad: 'alta' | 'media' | 'baja' | 'sin-datos';
  porcentaje: string;
}

interface GeographicData {
  type: 'FeatureCollection';
  features: any[];
  metadata: {
    totalBarrios: number;
    totalPlanillados: number;
    maxPlanillados: number;
    minPlanillados: number;
    promedioBarrio: number;
    filtrosAplicados: PlanilladoFiltersDto;
  };
}

interface PlanilladosHeatMapProps {
  filters?: PlanilladoFiltersDto;
  onFiltersChange?: (filters: PlanilladoFiltersDto) => void;
}

// Componente para controlar el mapa
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

export const PlanilladosMap: React.FC<PlanilladosHeatMapProps> = ({ 
  filters = {}, 
  onFiltersChange 
}) => {
  // Estados
  const [geoData, setGeoData] = useState<GeographicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBarrio, setSelectedBarrio] = useState<any>(null);
  const [mapFilters, setMapFilters] = useState<PlanilladoFiltersDto>(filters);
  const [showFilters, setShowFilters] = useState(false);
  const [mapView, setMapView] = useState<'calor' | 'categorias'>('calor');
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.9639, -74.7964]);
  const [mapZoom, setMapZoom] = useState(11);
  
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  // Cargar datos geográficos
  useEffect(() => {
    loadGeographicData();
  }, [mapFilters]);

  const loadGeographicData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const data = await geographicService.getGeographicData(mapFilters);
    setGeoData(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error desconocido');
  } finally {
    setLoading(false);
  }
};

  // Función para obtener color según densidad
  const getColorByDensity = (densidad: string, opacity = 0.7) => {
    switch (densidad) {
      case 'alta': return `rgba(239, 68, 68, ${opacity})`; // Rojo
      case 'media': return `rgba(245, 158, 11, ${opacity})`; // Amarillo
      case 'baja': return `rgba(34, 197, 94, ${opacity})`; // Verde
      default: return `rgba(156, 163, 175, ${opacity})`; // Gris
    }
  };

  // Función para obtener color por categoría
  const getColorByCategory = (stats: BarrioStats) => {
    if (mapView === 'categorias') {
      const porcentajeVerificados = stats.total > 0 ? (stats.verificados / stats.total) * 100 : 0;
      if (porcentajeVerificados >= 80) return 'rgba(34, 197, 94, 0.7)'; // Verde - Alto %
      if (porcentajeVerificados >= 50) return 'rgba(245, 158, 11, 0.7)'; // Amarillo - Medio %
      return 'rgba(239, 68, 68, 0.7)'; // Rojo - Bajo %
    }
    return getColorByDensity(stats.densidad);
  };

  // Estilo de los polígonos
  const geoJsonStyle = (feature: any) => {
    const stats = feature.properties.planillados as BarrioStats;
    return {
      fillColor: getColorByCategory(stats),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  // Eventos del GeoJSON
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const stats = feature.properties.planillados as BarrioStats;
    const nombre = feature.properties.nombre;

    // Tooltip
    layer.bindTooltip(`
      <div class="p-2">
        <h3 class="font-bold text-sm">${nombre}</h3>
        <div class="text-xs space-y-1 mt-1">
          <div>Total: <span class="font-semibold">${stats.total.toLocaleString()}</span></div>
          <div>Verificados: <span class="text-green-600">${stats.verificados}</span></div>
          <div>Pendientes: <span class="text-yellow-600">${stats.pendientes}</span></div>
          <div>Densidad: <span class="font-medium">${stats.densidad}</span></div>
        </div>
      </div>
    `, {
      permanent: false,
      sticky: true,
      className: 'custom-tooltip'
    });

    // Eventos de mouse
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 5,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.9
        });
        layer.bringToFront();
      },
      mouseout: (e) => {
        if (geoJsonRef.current) {
          geoJsonRef.current.resetStyle(e.target);
        }
      },
      click: (e) => {
        setSelectedBarrio({
          nombre,
          stats,
          properties: feature.properties
        });
        setMapCenter([e.latlng.lat, e.latlng.lng]);
        setMapZoom(14);
      }
    });
  };

  // Aplicar filtros
  const applyFilters = (newFilters: PlanilladoFiltersDto) => {
    setMapFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Resetear filtros
  const resetFilters = () => {
    const emptyFilters = {};
    setMapFilters(emptyFilters);
    onFiltersChange?.(emptyFilters);
  };

  // Datos para estadísticas
  const topBarrios = useMemo(() => {
    if (!geoData) return [];
    return geoData.features
      .map(f => ({
        nombre: f.properties.nombre,
        ...f.properties.planillados
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [geoData]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-center space-x-3">
          <ArrowPathIcon className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-lg text-gray-600">Cargando mapa de calor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8">
        <div className="flex items-center justify-center space-x-3 text-red-600">
          <InformationCircleIcon className="w-6 h-6" />
          <span className="text-lg">Error: {error}</span>
        </div>
        <button 
          onClick={loadGeographicData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

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
              <p className="text-sm text-gray-600">
                {geoData?.metadata.totalPlanillados.toLocaleString()} planillados en {geoData?.metadata.totalBarrios} barrios
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filtros
            </button>
            
            <select
              value={mapView}
              onChange={(e) => setMapView(e.target.value as 'calor' | 'categorias')}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg border-0 focus:ring-2 focus:ring-blue-500"
            >
              <option value="calor">Concentración</option>
              <option value="categorias">% Verificados</option>
            </select>

            <button className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={mapFilters.estado || ''}
                  onChange={(e) => applyFilters({ ...mapFilters, estado: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="verificado">Verificados</option>
                  <option value="pendiente">Pendientes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Género</label>
                <select
                  value={mapFilters.genero || ''}
                  onChange={(e) => applyFilters({ ...mapFilters, genero: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Solo Ediles</label>
                <select
                  value={mapFilters.esEdil?.toString() || ''}
                  onChange={(e) => applyFilters({ 
                    ...mapFilters, 
                    esEdil: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined 
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="true">Solo Ediles</option>
                  <option value="false">No Ediles</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 inline mr-2" />
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leyenda */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6 text-sm">
            {mapView === 'calor' ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Alta concentración</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Concentración media</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Baja concentración</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">80%+ verificados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">50-80% verificados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">&lt;50% verificados</span>
                </div>
              </>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            Promedio por barrio: {geoData?.metadata.promedioBarrio.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mapa */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div style={{ height: '600px' }}>
              {geoData && (
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-xl"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapController center={mapCenter} zoom={mapZoom} />
                  <GeoJSON
                    data={geoData}
                    style={geoJsonStyle}
                    onEachFeature={onEachFeature}
                    ref={(ref) => { geoJsonRef.current = ref; }}
                  />
                </MapContainer>
              )}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Barrio seleccionado */}
          {selectedBarrio && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">Barrio Seleccionado</h4>
                <button
                  onClick={() => setSelectedBarrio(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <h5 className="font-bold text-blue-600">{selectedBarrio.nombre}</h5>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-600">Total</div>
                    <div className="font-bold text-lg">{selectedBarrio.stats.total.toLocaleString()}</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-green-600">Verificados</div>
                    <div className="font-bold text-lg text-green-700">{selectedBarrio.stats.verificados}</div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <div className="text-yellow-600">Pendientes</div>
                    <div className="font-bold text-lg text-yellow-700">{selectedBarrio.stats.pendientes}</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-blue-600">Ediles</div>
                    <div className="font-bold text-lg text-blue-700">{selectedBarrio.stats.ediles}</div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Líderes activos: {selectedBarrio.stats.lideres}</div>
                    <div>Grupos: {selectedBarrio.stats.grupos}</div>
                    <div>% del total: {selectedBarrio.stats.porcentaje}%</div>
                    <div>Localidad: {selectedBarrio.properties.localidad}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top 5 barrios */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Barrios</h4>
            <div className="space-y-3">
              {topBarrios.map((barrio, index) => (
                <div key={barrio.nombre} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {barrio.nombre.length > 15 ? barrio.nombre.substring(0, 15) + '...' : barrio.nombre}
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                          barrio.densidad === 'alta' ? 'bg-red-500' : 
                          barrio.densidad === 'media' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></span>
                        {barrio.densidad}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{barrio.total.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{barrio.porcentaje}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Métricas generales */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Métricas Generales</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Barrios:</span>
                <span className="font-semibold">{geoData?.metadata.totalBarrios}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max por Barrio:</span>
                <span className="font-semibold">{geoData?.metadata.maxPlanillados.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Min por Barrio:</span>
                <span className="font-semibold">{geoData?.metadata.minPlanillados.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Promedio:</span>
                <span className="font-semibold">{geoData?.metadata.promedioBarrio.toLocaleString()}</span>
              </div>
              
              {Object.keys(mapFilters).length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-2">Filtros activos:</div>
                  <div className="space-y-1">
                    {mapFilters.estado && (
                      <div className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        Estado: {mapFilters.estado}
                      </div>
                    )}
                    {mapFilters.genero && (
                      <div className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs ml-1">
                        Género: {mapFilters.genero}
                      </div>
                    )}
                    {mapFilters.esEdil !== undefined && (
                      <div className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs ml-1">
                        {mapFilters.esEdil ? 'Solo Ediles' : 'No Ediles'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h4>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  setMapCenter([10.9639, -74.7964]);
                  setMapZoom(11);
                  setSelectedBarrio(null);
                }}
                className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowsPointingOutIcon className="w-4 h-4 inline mr-2" />
                Vista General
              </button>
              
              <button 
                onClick={() => window.print()}
                className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <DocumentArrowDownIcon className="w-4 h-4 inline mr-2" />
                Imprimir Mapa
              </button>
              
              <button 
                onClick={loadGeographicData}
                className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4 inline mr-2" />
                Actualizar Datos
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
export default PlanilladosMap;