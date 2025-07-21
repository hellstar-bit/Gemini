// frontend/src/services/leadersService.ts
import axios from 'axios';
import type { 
  Leader, 
  LeaderFiltersDto, 
  LeaderStatsDto 
} from '../pages/campaign/LeadersPage';

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

// ✅ Interface para respuesta paginada (consistente con el backend)
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
    groupId?: number;
    neighborhood?: string;
  };
}

interface DuplicateCheck {
  exists: boolean;
  leader?: {
    id: number;
    cedula: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
}

interface BulkActionResponse {
  affected: number;
}

export const leadersService = {
  // ✅ Obtener líderes con filtros y paginación
  async getAll(
    filters: LeaderFiltersDto = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Leader>> {
    try {
      // Construir parámetros de query
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      // Agregar filtros si existen
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.get(`/leaders?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leaders:', error);
      throw new Error('Error al cargar líderes');
    }
  },

  // ✅ Obtener estadísticas
  async getStats(filters: LeaderFiltersDto = {}): Promise<LeaderStatsDto> {
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

      const response = await apiClient.get(`/leaders/stats?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw new Error('Error al cargar estadísticas');
    }
  },

  // ✅ Obtener líder por ID
  async getById(id: number): Promise<Leader> {
    try {
      const response = await apiClient.get(`/leaders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leader:', error);
      throw new Error('Error al cargar líder');
    }
  },

  // ✅ Crear nuevo líder
  async create(data: Partial<Leader>): Promise<Leader> {
    try {
      const response = await apiClient.post('/leaders', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al crear líder');
    }
  },

  // ✅ Actualizar líder
  async update(id: number, data: Partial<Leader>): Promise<Leader> {
    try {
      const response = await apiClient.patch(`/leaders/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al actualizar líder');
    }
  },

  // ✅ Eliminar líder
  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/leaders/${id}`);
    } catch (error) {
      console.error('Error deleting leader:', error);
      throw new Error('Error al eliminar líder');
    }
  },

  // ✅ Acciones masivas
  async bulkAction(action: string, ids: number[], groupId?: number): Promise<BulkActionResponse> {
    try {
      const response = await apiClient.post('/leaders/bulk-action', {
        action,
        ids,
        groupId
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(`Error en acción masiva: ${action}`);
    }
  },

  // ✅ Validar datos de líder
  async validate(data: Partial<Leader>): Promise<ValidationResult> {
    try {
      const response = await apiClient.post('/leaders/validate', data);
      return response.data;
    } catch (error) {
      console.error('Error validating leader:', error);
      throw new Error('Error al validar datos del líder');
    }
  },

  // ✅ Verificar duplicados
  async checkDuplicate(cedula: string, excludeId?: number): Promise<DuplicateCheck> {
    try {
      const params = new URLSearchParams({ cedula });
      if (excludeId) {
        params.append('excludeId', excludeId.toString());
      }
      
      const response = await apiClient.get(`/leaders/check-duplicate?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error checking duplicate:', error);
      throw new Error('Error al verificar duplicados');
    }
  },

  // ✅ Exportar a Excel
  async exportToExcel(filters: LeaderFiltersDto = {}): Promise<Blob> {
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

      const response = await apiClient.get(`/leaders/export?${params}`, {
        responseType: 'blob'
      });
      
      return new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    } catch (error) {
      console.error('Error exporting leaders:', error);
      throw new Error('Error al exportar líderes');
    }
  },

  // ✅ Descargar archivo Excel
  downloadExcel(blob: Blob, filename?: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `lideres_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // ✅ Obtener líderes para select (versión simplificada)
  async getForSelect(): Promise<{ id: number; name: string; groupName?: string }[]> {
    try {
      const response = await apiClient.get('/leaders/for-select');
      return response.data;
    } catch (error) {
      console.error('Error fetching leaders for select:', error);
      throw new Error('Error al cargar líderes');
    }
  },

  // ✅ Sincronizar con fuente externa (si aplica)
  async sync(): Promise<{ updated: number; created: number; errors: number }> {
    try {
      const response = await apiClient.post('/leaders/sync');
      return response.data;
    } catch (error) {
      console.error('Error syncing leaders:', error);
      throw new Error('Error al sincronizar líderes');
    }
  }
};

export default leadersService;