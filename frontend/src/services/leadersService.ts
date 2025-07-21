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

export const leadersService = {
  // ✅ Obtener líderes con filtros y paginación
  async getAll(
    filters: LeaderFiltersDto = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Leader>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        ),
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
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      );

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
  async bulkAction(action: string, ids: number[], groupId?: number): Promise<{ affected: number }> {
    try {
      const payload: any = { action, ids };
      if (groupId) payload.groupId = groupId;

      const response = await apiClient.post('/leaders/bulk-actions', payload);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error en acción masiva');
    }
  },

  // ✅ Exportar a Excel
  async exportToExcel(filters: LeaderFiltersDto = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      );

      const response = await apiClient.get(`/leaders/export?${params}`, {
        responseType: 'blob',
      });

      return new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    } catch (error) {
      console.error('Error exporting leaders:', error);
      throw new Error('Error al exportar líderes');
    }
  },

  // ✅ Obtener líderes para dropdowns
  async getForSelect(): Promise<Array<{ id: number; name: string; groupName?: string }>> {
    try {
      const response = await apiClient.get('/leaders/for-select');
      return response.data;
    } catch (error) {
      console.error('Error fetching leaders for select:', error);
      return [];
    }
  },

  // ✅ Obtener planillados de un líder
  async getPlanillados(leaderId: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`/leaders/${leaderId}/planillados`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leader planillados:', error);
      return [];
    }
  },

  // ✅ Validar líder
  async validate(data: Partial<Leader>): Promise<ValidationResult> {
    try {
      const response = await apiClient.post('/leaders/validate', data);
      return response.data;
    } catch (error) {
      console.error('Error validating leader:', error);
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
      const response = await apiClient.get(`/leaders/duplicates/check?cedula=${cedula}`);
      return response.data;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return { exists: false };
    }
  },

  // ✅ Obtener grupos para dropdowns
  async getGroups(): Promise<Array<{ id: number; name: string }>> {
    try {
      const response = await apiClient.get('/groups/for-select');
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      // Fallback a datos de ejemplo
      return [
        { id: 1, name: 'Grupo Norte' },
        { id: 2, name: 'Grupo Sur' },
        { id: 3, name: 'Grupo Centro' },
        { id: 4, name: 'Grupo Este' },
        { id: 5, name: 'Grupo Oeste' }
      ];
    }
  },

  // ✅ Obtener barrios únicos
  async getNeighborhoods(): Promise<string[]> {
    try {
      const response = await apiClient.get('/leaders/neighborhoods');
      return response.data;
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
      // Fallback a lista estática
      return [
        'EL PRADO', 'CENTRO', 'ALTO PRADO', 'GRANADILLO', 'LAS FLORES',
        'BOSTON', 'CIUDAD JARDIN', 'LA CONCEPCION', 'VILLA CAROLINA',
        'SAN NICOLAS', 'RIOMAR', 'BUENAVISTA', 'LOS ANGELES'
      ];
    }
  },

  // ✅ Obtener municipios únicos
  async getMunicipalities(): Promise<string[]> {
    try {
      const response = await apiClient.get('/leaders/municipalities');
      return response.data;
    } catch (error) {
      console.error('Error fetching municipalities:', error);
      return ['Barranquilla', 'Soledad', 'Malambo', 'Puerto Colombia'];
    }
  },

  // ✅ Utilidades
  downloadExcel(blob: Blob, filename: string = 'lideres.xlsx') {
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

export default leadersService;