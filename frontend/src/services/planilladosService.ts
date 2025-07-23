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

interface PlanilladosPendientesResponse {
  planillados: Array<{
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    cedulaLiderPendiente: string;
  }>;
  total: number;
  leader?: {
    id: number;
    cedula: string;
    firstName: string;
    lastName: string;
  };
}

interface RelacionarPlanilladosRequest {
  cedulaLider: string;
  liderId: number;
  planilladoIds?: number[];
}

interface EstadisticasPendientesResponse {
  totalPendientes: number;
  porCedulaLider: Record<string, number>;
  sinLider: number;
  resumen: string;
}

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

  async getPlanilladosPendientesByLiderCedula(cedulaLider: string): Promise<PlanilladosPendientesResponse> {
    try {
      const response = await apiClient.get(`/planillados/pendientes-lider/${encodeURIComponent(cedulaLider)}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener planillados pendientes:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener planillados pendientes');
    }
  },

  

  /**
   * Relacionar planillados pendientes con líder
   */
  async relacionarPlanilladosPendientes(
    cedulaLider: string, 
    liderId: number, 
    planilladoIds?: number[]
  ): Promise<{ affected: number; message: string }> {
    try {
      const payload: RelacionarPlanilladosRequest = {
        cedulaLider,
        liderId,
        planilladoIds
      };

      const response = await apiClient.post('/planillados/relacionar-pendientes', payload);
      
      console.log(`✅ Relacionados ${response.data.affected} planillados exitosamente`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al relacionar planillados:', error);
      throw new Error(error.response?.data?.message || 'Error al relacionar planillados');
    }
  },

  async verificarPlanilladosPendientes(cedulaLider: string): Promise<{
    tienePendientes: boolean;
    cantidad: number;
    planillados: Array<{ id: number; nombreCompleto: string; cedula: string }>;
  }> {
    try {
      const response = await this.getPlanilladosPendientesByLiderCedula(cedulaLider);
      
      return {
        tienePendientes: response.total > 0,
        cantidad: response.total,
        planillados: response.planillados.map(p => ({
          id: p.id,
          nombreCompleto: `${p.nombres} ${p.apellidos}`,
          cedula: p.cedula
        }))
      };
    } catch (error) {
      console.error('❌ Error verificando planillados pendientes:', error);
      return {
        tienePendientes: false,
        cantidad: 0,
        planillados: []
      };
    }
  },

  async getResumenPorEstadoLider(): Promise<{
    conLider: number;
    pendientes: number;
    sinLider: number;
    total: number;
    porcentajes: {
      conLider: string;
      pendientes: string;
      sinLider: string;
    };
  }> {
    try {
      const [estadisticas, statsGenerales] = await Promise.all([
        this.getEstadisticasPlanilladosPendientes(),
        this.getStats({}) // Usar filtros vacíos para obtener stats generales
      ]);

      const total = statsGenerales.total;
      const pendientes = estadisticas.totalPendientes;
      const sinLider = estadisticas.sinLider;
      const conLider = total - pendientes - sinLider;

      return {
        conLider,
        pendientes,
        sinLider,
        total,
        porcentajes: {
          conLider: ((conLider / total) * 100).toFixed(1),
          pendientes: ((pendientes / total) * 100).toFixed(1),
          sinLider: ((sinLider / total) * 100).toFixed(1)
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo resumen por estado líder:', error);
      throw error;
    }
  },

  async buscarPorCedulaLider(cedulaLider: string): Promise<{
    asignados: any[];
    pendientes: any[];
    totalAsignados: number;
    totalPendientes: number;
  }> {
    try {
      // Buscar asignados (con relación activa)
      const asignadosResponse = await this.getAll({
        liderId: undefined, // Se filtrará en el backend por cédula del líder
        cedulaLider: cedulaLider // Parámetro nuevo para filtrar por cédula
      });

      // Buscar pendientes
      const pendientesResponse = await this.getPlanilladosPendientesByLiderCedula(cedulaLider);

      return {
        asignados: asignadosResponse.data || [],
        pendientes: pendientesResponse.planillados || [],
        totalAsignados: asignadosResponse.meta?.total || 0,
        totalPendientes: pendientesResponse.total || 0
      };
    } catch (error) {
      console.error('❌ Error buscando por cédula líder:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de planillados pendientes
   */
  async getEstadisticasPlanilladosPendientes(): Promise<EstadisticasPendientesResponse> {
    try {
      const response = await apiClient.get('/planillados/estadisticas-pendientes');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener estadísticas pendientes:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  /**
   * Limpiar relaciones pendientes órfanas (para mantenimiento)
   */
  async limpiarRelacionesPendientes(confirmar: boolean = false): Promise<{ message: string; eliminados: number }> {
    try {
      const response = await apiClient.post('/planillados/limpiar-pendientes', { confirmar });
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al limpiar relaciones pendientes:', error);
      throw new Error(error.response?.data?.message || 'Error al limpiar relaciones pendientes');
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
  async exportToExcel(filters: PlanilladoFiltersDto = {}): Promise<void> {
    try {
      // Construir parámetros de query
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

      // ✅ HACER SOLICITUD CON RESPONSETYPE BLOB
      const response = await apiClient.get(`/planillados/export?${params}`, {
        responseType: 'blob', // ✅ IMPORTANTE: especificar blob
      });

      // ✅ CREAR BLOB Y DESCARGAR
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nombre de archivo con timestamp y filtros aplicados
      const timestamp = new Date().toISOString().split('T')[0];
      const hasFilters = Object.keys(filters).length > 0;
      const fileName = hasFilters 
        ? `planillados_filtrados_${timestamp}.xlsx`
        : `planillados_completo_${timestamp}.xlsx`;
      
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`✅ Exportación completada: ${fileName}`);

    } catch (error: any) {
      console.error('❌ Error exportando planillados:', error);
      throw new Error(error.response?.data?.message || 'Error al exportar los datos');
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