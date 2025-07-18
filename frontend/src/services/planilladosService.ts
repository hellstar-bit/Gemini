// frontend/src/services/planilladosService.ts
import axios from 'axios';
import type { 
  Planillado, 
  PlanilladoFiltersDto, 
  PlanilladosStatsDto 
} from '../pages/campaign/PlanilladosPage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configurar axios con interceptores para auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Interfaces para respuestas
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: {
    municipioVotacion?: string;
    barrioVive?: string;
    zonaPuesto?: string;
  };
}

interface DuplicateCheck {
  exists: boolean;
  planillado?: {
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    estado: string;
  };
}

export const planilladosService = {
  // ✅ Obtener planillados con filtros y paginación
  async getAll(
    filters: PlanilladoFiltersDto = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Planillado>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        ),
      });

      const response = await apiClient.get(`/planillados?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching planillados:', error);
      throw new Error('Error al cargar planillados');
    }
  },

  // ✅ Obtener estadísticas
  async getStats(filters: PlanilladoFiltersDto = {}): Promise<PlanilladosStatsDto> {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      );

      const response = await apiClient.get(`/planillados/stats?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw new Error('Error al cargar estadísticas');
    }
  },

  // ✅ Obtener planillado por ID
  async getById(id: number): Promise<Planillado> {
    try {
      const response = await apiClient.get(`/planillados/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching planillado:', error);
      throw new Error('Error al cargar planillado');
    }
  },

  // ✅ Crear nuevo planillado
  async create(data: Partial<Planillado>): Promise<Planillado> {
    try {
      const response = await apiClient.post('/planillados', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al crear planillado');
    }
  },

  // ✅ Actualizar planillado
  async update(id: number, data: Partial<Planillado>): Promise<Planillado> {
    try {
      const response = await apiClient.patch(`/planillados/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al actualizar planillado');
    }
  },

  // ✅ Eliminar planillado
  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/planillados/${id}`);
    } catch (error) {
      console.error('Error deleting planillado:', error);
      throw new Error('Error al eliminar planillado');
    }
  },

  // ✅ Acciones masivas
  async bulkAction(action: string, ids: number[], liderId?: number): Promise<{ affected: number }> {
    try {
      const payload: any = { action, ids };
      if (liderId) payload.liderId = liderId;

      const response = await apiClient.post('/planillados/bulk-actions', payload);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error en acción masiva');
    }
  },

  // ✅ Exportar a Excel
  async exportToExcel(filters: PlanilladoFiltersDto = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      );

      const response = await apiClient.get(`/planillados/export?${params}`, {
        responseType: 'blob',
      });

      return new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    } catch (error) {
      console.error('Error exporting planillados:', error);
      throw new Error('Error al exportar planillados');
    }
  },

  // ✅ Obtener listas para filtros
  async getBarrios(): Promise<string[]> {
    try {
      const response = await apiClient.get('/planillados/barrios/list');
      return response.data;
    } catch (error) {
      console.error('Error fetching barrios:', error);
      return [];
    }
  },

  async getMunicipios(): Promise<string[]> {
    try {
      const response = await apiClient.get('/planillados/municipios/list');
      return response.data;
    } catch (error) {
      console.error('Error fetching municipios:', error);
      return [];
    }
  },

  // ✅ Validar planillado
  async validate(data: Partial<Planillado>): Promise<ValidationResult> {
    try {
      const response = await apiClient.post('/planillados/validate', data);
      return response.data;
    } catch (error) {
      console.error('Error validating planillado:', error);
      return {
        isValid: false,
        errors: ['Error en validación'],
        warnings: [],
        suggestions: {},
      };
    }
  },

  // ✅ Verificar duplicados
  async checkDuplicates(cedula: string): Promise<DuplicateCheck> {
    try {
      const response = await apiClient.get(`/planillados/duplicates/check?cedula=${cedula}`);
      return response.data;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return { exists: false };
    }
  },

  // ✅ Utilidades
  downloadExcel(blob: Blob, filename: string = 'planillados.xlsx') {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default planilladosService;