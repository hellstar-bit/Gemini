// frontend/src/services/candidatesService.ts
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

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  meta: number;
  description?: string;
  position?: string;
  party?: string;
  isActive: boolean;
  groupsCount?: number;
  leadersCount?: number;
  votersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateDto {
  name: string;
  email: string;
  phone?: string;
  meta: number;
  description?: string;
  position?: string;
  party?: string;
  isActive?: boolean;
}

export interface CandidateFiltersDto {
  buscar?: string;
  position?: string;
  party?: string;
  isActive?: boolean;
  conGrupos?: boolean;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface CandidateStatsDto {
  total: number;
  activos: number;
  inactivos: number;
  totalGrupos: number;
  totalLideres: number;
  totalVotantes: number;
  promedioGruposPorCandidato: number;
  porPartido: Record<string, number>;
  porPosicion: Record<string, number>;
  cumplimientoMeta: Array<{
    candidatoId: number;
    nombre: string;
    meta: number;
    actual: number;
    porcentaje: number;
  }>;
  topCandidatos: Array<{
    candidatoId: number;
    nombre: string;
    grupos: number;
    lideres: number;
    votantes: number;
  }>;
}

const candidatesService = {
  async getAll(filters: CandidateFiltersDto = {}, page = 1, limit = 20) {
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

    const response = await apiClient.get(`/candidates?${params}`);
    return response.data;
  },

  async getById(id: number): Promise<Candidate> {
    const response = await apiClient.get(`/candidates/${id}`);
    return response.data;
  },

  async create(data: CreateCandidateDto): Promise<Candidate> {
    const response = await apiClient.post('/candidates', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateCandidateDto>): Promise<Candidate> {
    const response = await apiClient.patch(`/candidates/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/candidates/${id}`);
  },

  async getStats(filters: CandidateFiltersDto = {}): Promise<CandidateStatsDto> {
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

    const response = await apiClient.get(`/candidates/stats?${params}`);
    return response.data;
  },

  async exportToExcel(filters: CandidateFiltersDto = {}) {
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

    const response = await apiClient.get(`/candidates/export?${params}`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `candidatos_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export default candidatesService;