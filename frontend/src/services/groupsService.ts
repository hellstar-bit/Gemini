// frontend/src/services/groupsService.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
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

export interface Group {
  id: number;
  name: string;
  description?: string;
  zone?: string;
  meta: number;
  isActive: boolean;
  candidateId: number;
  candidate?: {
    id: number;
    name: string;
    email: string;
  };
  leadersCount?: number;
  planilladosCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
  zone?: string;
  meta: number;
  candidateId: number;
  isActive?: boolean;
}

export interface GroupFiltersDto {
  buscar?: string;
  candidateId?: number;
  zone?: string;
  isActive?: boolean;
  conLideres?: boolean;
  conPlanillados?: boolean;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface GroupStatsDto {
  total: number;
  activos: number;
  inactivos: number;
  totalLideres: number;
  totalPlanillados: number;
  promedioLideresPorGrupo: number;
  promedioPlanilladosPorGrupo: number;
  porCandidato: Record<string, number>;
  porZona: Record<string, number>;
  cumplimientoMeta: Array<{
    grupoId: number;
    nombre: string;
    meta: number;
    actual: number;
    porcentaje: number;
  }>;
}

const groupsService = {
  async getAll(filters: GroupFiltersDto = {}, page = 1, limit = 20) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof Date) {
          params.append(key, value.toISOString().split('T')[0]);
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await apiClient.get(`/groups?${params}`);
    return response.data;
  },

  async getById(id: number): Promise<Group> {
    const response = await apiClient.get(`/groups/${id}`);
    return response.data;
  },

  async create(data: CreateGroupDto): Promise<Group> {
    const response = await apiClient.post('/groups', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateGroupDto>): Promise<Group> {
    const response = await apiClient.patch(`/groups/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/groups/${id}`);
  },

  async getStats(filters: GroupFiltersDto = {}): Promise<GroupStatsDto> {
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

    const response = await apiClient.get(`/groups/stats?${params}`);
    return response.data;
  },

  async exportToExcel(filters: GroupFiltersDto = {}) {
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

    const response = await apiClient.get(`/groups/export?${params}`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `grupos_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export default groupsService;