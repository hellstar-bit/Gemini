// frontend/src/services/geographicService.ts
// Cambiar la importación para usar axios directamente
import axios from 'axios';

// Configurar la base URL (ajusta según tu configuración)
const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface PlanilladoFiltersDto {
  estado?: 'verificado' | 'pendiente';
  liderId?: number;
  grupoId?: number;
  esEdil?: boolean;
  genero?: 'M' | 'F' | 'Otro';
  fechaDesde?: Date;
  fechaHasta?: Date;
  barrioVive?: string;
}

export interface BarrioStats {
  total: number;
  verificados: number;
  pendientes: number;
  ediles: number;
  lideres: number;
  grupos: number;
  densidad: 'alta' | 'media' | 'baja' | 'sin-datos';
  porcentaje: string;
}

export interface GeographicFeature {
  type: 'Feature';
  properties: {
    id: number;
    nombre: string;
    localidad: string;
    pieza_urba: string;
    planillados: BarrioStats;
  };
  geometry: {
    type: 'MultiPolygon' | 'Polygon';
    coordinates: number[][][];
  };
}

export interface GeographicData {
  type: 'FeatureCollection';
  features: GeographicFeature[];
  metadata: {
    totalBarrios: number;
    totalPlanillados: number;
    maxPlanillados: number;
    minPlanillados: number;
    promedioBarrio: number;
    filtrosAplicados: PlanilladoFiltersDto;
  };
}

export const geographicService = {
  // ✅ Obtener datos geográficos con filtros
  async getGeographicData(filters: PlanilladoFiltersDto = {}): Promise<GeographicData> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.get(`/planillados/geographic-data?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching geographic data:', error);
      throw new Error('Error al cargar datos geográficos');
    }
  },

  // ✅ Obtener lista de barrios únicos
  async getBarriosList(): Promise<string[]> {
    try {
      const response = await apiClient.get('/planillados/barrios/list');
      return response.data;
    } catch (error) {
      console.error('Error fetching barrios list:', error);
      throw new Error('Error al cargar lista de barrios');
    }
  },

  // ✅ Obtener estadísticas resumidas por barrio
  async getBarriosStats(filters: PlanilladoFiltersDto = {}): Promise<Record<string, BarrioStats>> {
    try {
      const geoData = await this.getGeographicData(filters);
      const stats: Record<string, BarrioStats> = {};
      
      geoData.features.forEach(feature => {
        stats[feature.properties.nombre] = feature.properties.planillados;
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching barrios stats:', error);
      throw new Error('Error al cargar estadísticas de barrios');
    }
  },

  // ✅ Exportar datos geográficos como GeoJSON
  async exportGeographicData(filters: PlanilladoFiltersDto = {}): Promise<Blob> {
    try {
      const data = await this.getGeographicData(filters);
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      return blob;
    } catch (error) {
      console.error('Error exporting geographic data:', error);
      throw new Error('Error al exportar datos geográficos');
    }
  },

  // ✅ Descargar datos como archivo
  async downloadGeographicData(filters: PlanilladoFiltersDto = {}, filename: string = 'barranquilla-planillados.geojson') {
    try {
      const blob = await this.exportGeographicData(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading geographic data:', error);
      throw new Error('Error al descargar datos geográficos');
    }
  }
};