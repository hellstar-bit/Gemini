// frontend/src/services/geographicService.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configurar axios con interceptores para auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Más tiempo para datos geográficos
});

// Interceptor para agregar token
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

// Interceptor para manejar errores globales
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Interfaces para tipos de datos geográficos
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

interface GeographicFeature {
  type: 'Feature';
  properties: {
    nombre: string;
    localidad?: string;
    planillados: BarrioStats;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

interface GeographicData {
  type: 'FeatureCollection';
  features: GeographicFeature[];
  metadata: {
    totalBarrios: number;
    totalPlanillados: number;
    maxPlanillados: number;
    minPlanillados: number;
    promedioBarrio: number;
    filtrosAplicados: any;
  };
}

interface PlanilladoFiltersDto {
  estado?: 'verificado' | 'pendiente';
  liderId?: number;
  grupoId?: number;
  esEdil?: boolean;
  genero?: 'M' | 'F' | 'Otro';
  fechaDesde?: Date;
  fechaHasta?: Date;
  barrioVive?: string;
  municipioVotacion?: string;
  buscar?: string;
}

export const geographicService = {
  // ✅ Obtener datos geográficos con estadísticas de planillados
  async getGeographicData(filters: PlanilladoFiltersDto = {}): Promise<GeographicData> {
    try {
      // Preparar parámetros de consulta
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            params.append(key, value.toISOString().split('T')[0]);
          } else {
            params.append(key, String(value));
          }
        }
      });

      const response = await apiClient.get(`/planillados/geographic-data?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching geographic data:', error);
      
      // Si no hay conexión con la API, devolver datos de fallback
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        return this.getFallbackGeographicData();
      }
      
      throw new Error(error.response?.data?.message || 'Error al cargar datos geográficos');
    }
  },

  // ✅ Datos de fallback para cuando no hay conexión con la API
  getFallbackGeographicData(): GeographicData {
    const barrios = [
      'EL PRADO', 'CENTRO', 'ALTO PRADO', 'GRANADILLO', 'LAS FLORES', 
      'BOSTON', 'CIUDAD JARDIN', 'LA CONCEPCION', 'VILLA CAROLINA', 
      'SAN NICOLAS', 'RIOMAR', 'BUENAVISTA', 'LOS ANGELES', 'SIMON BOLIVAR',
      'MODELO', 'SAN VICENTE', 'VILLA DEL ESTE', 'LA PAZ', 'BETANIA',
      'OLAYA HERRERA', 'CHIQUINQUIRA', 'SANTODOMINGO', 'LAS MALVINAS'
    ];

    const features: GeographicFeature[] = barrios.map((nombre, index) => {
      const baseTotal = Math.floor(Math.random() * 800) + 50;
      const verificados = Math.floor(baseTotal * (0.4 + Math.random() * 0.4));
      const pendientes = baseTotal - verificados;
      const ediles = Math.floor(Math.random() * 15);
      
      let densidad: BarrioStats['densidad'] = 'baja';
      if (baseTotal > 500) densidad = 'alta';
      else if (baseTotal > 200) densidad = 'media';

      return {
        type: 'Feature',
        properties: {
          nombre,
          localidad: `Localidad ${Math.floor(index / 5) + 1}`,
          planillados: {
            total: baseTotal,
            verificados,
            pendientes,
            ediles,
            lideres: Math.floor(Math.random() * 8) + 1,
            grupos: Math.floor(Math.random() * 3) + 1,
            densidad,
            porcentaje: ((baseTotal / 8000) * 100).toFixed(1)
          }
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-74.8 + (index * 0.01), 10.9 + (index * 0.01)],
            [-74.8 + (index * 0.01) + 0.02, 10.9 + (index * 0.01)],
            [-74.8 + (index * 0.01) + 0.02, 10.9 + (index * 0.01) + 0.02],
            [-74.8 + (index * 0.01), 10.9 + (index * 0.01) + 0.02],
            [-74.8 + (index * 0.01), 10.9 + (index * 0.01)]
          ]]
        }
      };
    });

    const totalPlanillados = features.reduce((sum, f) => sum + f.properties.planillados.total, 0);
    const totales = features.map(f => f.properties.planillados.total);

    return {
      type: 'FeatureCollection',
      features,
      metadata: {
        totalBarrios: features.length,
        totalPlanillados,
        maxPlanillados: Math.max(...totales),
        minPlanillados: Math.min(...totales),
        promedioBarrio: Math.round(totalPlanillados / features.length),
        filtrosAplicados: {}
      }
    };
  },

  // ✅ Obtener estadísticas por barrio específico
  async getBarrioStats(barrioName: string): Promise<BarrioStats | null> {
    try {
      const response = await apiClient.get(`/planillados/barrio/${encodeURIComponent(barrioName)}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching barrio stats:', error);
      return null;
    }
  },

  // ✅ Obtener lista de barrios disponibles
  async getAvailableBarrios(): Promise<string[]> {
    try {
      const response = await apiClient.get('/planillados/barrios/list');
      return response.data;
    } catch (error) {
      console.error('Error fetching barrios list:', error);
      // Fallback a lista estática
      return [
        'EL PRADO', 'CENTRO', 'ALTO PRADO', 'GRANADILLO', 'LAS FLORES',
        'BOSTON', 'CIUDAD JARDIN', 'LA CONCEPCION', 'VILLA CAROLINA',
        'SAN NICOLAS', 'RIOMAR', 'BUENAVISTA', 'LOS ANGELES', 'SIMON BOLIVAR'
      ];
    }
  },

  // ✅ Exportar datos geográficos
  async exportGeographicData(filters: PlanilladoFiltersDto = {}, format: 'excel' | 'geojson' = 'excel'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            params.append(key, value.toISOString().split('T')[0]);
          } else {
            params.append(key, String(value));
          }
        }
      });

      const response = await apiClient.get(`/planillados/geographic-data/export?${params}`, {
        responseType: 'blob',
      });

      const mimeType = format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/json';

      return new Blob([response.data], { type: mimeType });
    } catch (error) {
      console.error('Error exporting geographic data:', error);
      throw new Error('Error al exportar datos geográficos');
    }
  },

  // ✅ Utilidad para descargar archivos
  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // ✅ Obtener coordenadas de un barrio específico
  async getBarrioCoordinates(barrioName: string): Promise<[number, number] | null> {
    try {
      const response = await apiClient.get(`/locations/barrio/${encodeURIComponent(barrioName)}/coordinates`);
      return [response.data.latitude, response.data.longitude];
    } catch (error) {
      console.error('Error fetching barrio coordinates:', error);
      // Coordenadas por defecto de Barranquilla
      return [10.9639, -74.7964];
    }
  },

  // ✅ Validar si un barrio existe en el sistema
  async validateBarrio(barrioName: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/locations/barrio/${encodeURIComponent(barrioName)}/validate`);
      return response.data.exists;
    } catch (error) {
      console.error('Error validating barrio:', error);
      return false;
    }
  }
};

export default geographicService;