// frontend/src/services/hierarchyService.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configurar axios con interceptores para auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Mayor timeout para consultas complejas
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

// =====================================
// INTERFACES Y TIPOS
// =====================================

// Candidato con estadísticas jerárquicas
export interface HierarchyCandidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  meta: number;
  description?: string;
  position?: string;
  party?: string;
  isActive: boolean;
  groupsCount: number;
  leadersCount: number;
  votersCount: number;
  createdAt: string;
  updatedAt: string;
}

// Grupo con estadísticas jerárquicas
export interface HierarchyGroup {
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
  };
  leadersCount: number;
  planilladosCount: number;
  votersCount: number;
  createdAt: string;
  updatedAt: string;
}

// Líder con estadísticas jerárquicas
export interface HierarchyLeader {
  id: number;
  cedula: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  municipality?: string;
  meta: number;
  isActive: boolean;
  isVerified: boolean;
  groupId: number;
  group?: {
    id: number;
    name: string;
    candidate?: {
      id: number;
      name: string;
    };
  };
  votersCount: number;
  planilladosCount: number;
  createdAt: string;
  updatedAt: string;
}

// Planillado con información jerárquica
export interface HierarchyPlanillado {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  celular?: string;
  direccion?: string;
  barrioVive?: string;
  departamentoVotacion?: string;
  municipioVotacion?: string;
  direccionVotacion?: string;
  zonaPuesto?: string;
  mesa?: string;
  estado: 'verificado' | 'pendiente';
  esEdil: boolean;
  actualizado: boolean;
  liderId?: number;
  lider?: {
    id: number;
    firstName: string;
    lastName: string;
    cedula: string;
  };
  grupoId?: number;
  grupo?: {
    id: number;
    name: string;
  };
  fechaNacimiento?: string;
  genero?: 'M' | 'F' | 'Otro';
  notas?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Filtros para consultas jerárquicas
export interface HierarchyFilters {
  buscar?: string;
  isActive?: boolean;
  candidateId?: number;
  groupId?: number;
  leaderId?: number;
  estado?: 'verificado' | 'pendiente';
  esEdil?: boolean;
  isVerified?: boolean;
  barrioVive?: string;
  municipioVotacion?: string;
  neighborhood?: string;
  municipality?: string;
  genero?: 'M' | 'F' | 'Otro';
  fechaDesde?: string;
  fechaHasta?: string;
  zone?: string;
  party?: string;
}

// Respuesta paginada genérica
export interface PaginatedResponse<T> {
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

// Estadísticas completas de jerarquía
export interface HierarchyStats {
  candidates: {
    total: number;
    active: number;
    byParty: Record<string, number>;
  };
  groups: {
    total: number;
    active: number;
    byCandidate: Record<string, number>;
    byZone: Record<string, number>;
  };
  leaders: {
    total: number;
    active: number;
    verified: number;
    byGroup: Record<string, number>;
    byNeighborhood: Record<string, number>;
  };
  planillados: {
    total: number;
    verified: number;
    pendientes: number;
    ediles: number;
    byLeader: Record<string, number>;
    byGroup: Record<string, number>;
    byMunicipality: Record<string, number>;
    byGender: Record<string, number>;
  };
}

// Ruta de navegación para breadcrumbs
export interface NavigationPath {
  candidate?: HierarchyCandidate;
  group?: HierarchyGroup;
  leader?: HierarchyLeader;
}

// Resultado de búsqueda global
export interface GlobalSearchResult {
  candidates: HierarchyCandidate[];
  groups: HierarchyGroup[];
  leaders: HierarchyLeader[];
  planillados: HierarchyPlanillado[];
  total: number;
  summary: {
    candidatesCount: number;
    groupsCount: number;
    leadersCount: number;
    planilladosCount: number;
  };
}

// =====================================
// SERVICIO PRINCIPAL
// =====================================

class HierarchyService {
  
  // ✅ Obtener candidatos con estadísticas completas
  async getCandidates(
    filters: HierarchyFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<HierarchyCandidate>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        includeStats: 'true', // Incluir conteos de grupos, líderes y votantes
        ...this.buildFilterParams(filters),
      });

      const response = await apiClient.get(`/candidates?${params}`);
      return this.transformCandidatesResponse(response.data);
    } catch (error: any) {
      console.error('Error fetching candidates:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar candidatos');
    }
  }

  // ✅ Obtener grupos de un candidato específico
  async getGroupsByCandidate(
    candidateId: number,
    filters: HierarchyFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<HierarchyGroup>> {
    try {
      const params = new URLSearchParams({
        candidateId: candidateId.toString(),
        page: page.toString(),
        limit: limit.toString(),
        includeStats: 'true',
        ...this.buildFilterParams(filters),
      });

      const response = await apiClient.get(`/groups?${params}`);
      return this.transformGroupsResponse(response.data);
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar grupos');
    }
  }

  // ✅ Obtener líderes de un grupo específico
  async getLeadersByGroup(
    groupId: number,
    filters: HierarchyFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<HierarchyLeader>> {
    try {
      const params = new URLSearchParams({
        groupId: groupId.toString(),
        page: page.toString(),
        limit: limit.toString(),
        includeStats: 'true',
        ...this.buildFilterParams(filters),
      });

      const response = await apiClient.get(`/leaders?${params}`);
      return this.transformLeadersResponse(response.data);
    } catch (error: any) {
      console.error('Error fetching leaders:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar líderes');
    }
  }

  // ✅ Obtener planillados de un líder específico
  async getPlanilladosByLeader(
    leaderId: number,
    filters: HierarchyFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<HierarchyPlanillado>> {
    try {
      const params = new URLSearchParams({
        liderId: leaderId.toString(),
        page: page.toString(),
        limit: limit.toString(),
        ...this.buildFilterParams(filters),
      });

      const response = await apiClient.get(`/planillados?${params}`);
      return this.transformPlanilladosResponse(response.data);
    } catch (error: any) {
      console.error('Error fetching planillados:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar planillados');
    }
  }

  // ✅ Obtener estadísticas completas de jerarquía
  async getHierarchyStats(filters: HierarchyFilters = {}): Promise<HierarchyStats> {
    try {
      const params = new URLSearchParams(this.buildFilterParams(filters));
      
      // Intentar endpoint unificado primero
      try {
        const response = await apiClient.get(`/hierarchy/stats?${params}`);
        return response.data;
      } catch (unifiedError) {
        // Fallback: llamadas individuales
        console.log('Unified endpoint not available, using individual calls');
        return await this.getStatsFallback(filters);
      }
    } catch (error: any) {
      console.error('Error fetching hierarchy stats:', error);
      throw new Error('Error al cargar estadísticas de jerarquía');
    }
  }

  // ✅ Obtener ruta de navegación completa (breadcrumbs)
  async getNavigationPath(
    candidateId?: number,
    groupId?: number,
    leaderId?: number
  ): Promise<NavigationPath> {
    try {
      const path: NavigationPath = {};

      if (candidateId) {
        const candidateResponse = await apiClient.get(`/candidates/${candidateId}`);
        path.candidate = this.transformSingleCandidate(candidateResponse.data);
      }

      if (groupId) {
        const groupResponse = await apiClient.get(`/groups/${groupId}`);
        path.group = this.transformSingleGroup(groupResponse.data);
        
        // Si no tenemos candidato pero el grupo tiene candidateId, obtenerlo
        if (!path.candidate && groupResponse.data.candidateId) {
          const candidateResponse = await apiClient.get(`/candidates/${groupResponse.data.candidateId}`);
          path.candidate = this.transformSingleCandidate(candidateResponse.data);
        }
      }

      if (leaderId) {
        const leaderResponse = await apiClient.get(`/leaders/${leaderId}`);
        path.leader = this.transformSingleLeader(leaderResponse.data);
        
        // Si no tenemos grupo pero el líder tiene groupId, obtenerlo
        if (!path.group && leaderResponse.data.groupId) {
          const groupResponse = await apiClient.get(`/groups/${leaderResponse.data.groupId}`);
          path.group = this.transformSingleGroup(groupResponse.data);
          
          // Si no tenemos candidato pero el grupo tiene candidateId, obtenerlo
          if (!path.candidate && groupResponse.data.candidateId) {
            const candidateResponse = await apiClient.get(`/candidates/${groupResponse.data.candidateId}`);
            path.candidate = this.transformSingleCandidate(candidateResponse.data);
          }
        }
      }

      return path;
    } catch (error: any) {
      console.error('Error fetching navigation path:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar ruta de navegación');
    }
  }

  // ✅ Búsqueda global en toda la jerarquía
  async globalSearch(
    searchTerm: string,
    entityTypes: ('candidates' | 'groups' | 'leaders' | 'planillados')[] = ['candidates', 'groups', 'leaders', 'planillados'],
    limit: number = 10
  ): Promise<GlobalSearchResult> {
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        entities: entityTypes.join(','),
        limit: limit.toString()
      });

      // Intentar endpoint unificado primero
      try {
        const response = await apiClient.get(`/hierarchy/search?${params}`);
        return response.data;
      } catch (unifiedError) {
        // Fallback: búsquedas individuales
        return await this.globalSearchFallback(searchTerm, entityTypes, limit);
      }
    } catch (error: any) {
      console.error('Error in global search:', error);
      throw new Error(error.response?.data?.message || 'Error en búsqueda global');
    }
  }

  // ✅ Exportar datos jerárquicos
  async exportHierarchy(
    filters: HierarchyFilters = {},
    format: 'excel' | 'csv' | 'pdf' = 'excel'
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams({
        format,
        ...this.buildFilterParams(filters),
      });

      const response = await apiClient.get(`/hierarchy/export?${params}`, {
        responseType: 'blob'
      });

      return response.data;
    } catch (error: any) {
      console.error('Error exporting hierarchy:', error);
      throw new Error(error.response?.data?.message || 'Error al exportar datos');
    }
  }

  // ✅ Obtener candidato individual por ID
  async getCandidateById(id: number): Promise<HierarchyCandidate> {
    try {
      const response = await apiClient.get(`/candidates/${id}?includeStats=true`);
      return this.transformSingleCandidate(response.data);
    } catch (error: any) {
      console.error('Error fetching candidate:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar candidato');
    }
  }

  // ✅ Obtener grupo individual por ID
  async getGroupById(id: number): Promise<HierarchyGroup> {
    try {
      const response = await apiClient.get(`/groups/${id}?includeStats=true`);
      return this.transformSingleGroup(response.data);
    } catch (error: any) {
      console.error('Error fetching group:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar grupo');
    }
  }

  // ✅ Obtener líder individual por ID
  async getLeaderById(id: number): Promise<HierarchyLeader> {
    try {
      const response = await apiClient.get(`/leaders/${id}?includeStats=true`);
      return this.transformSingleLeader(response.data);
    } catch (error: any) {
      console.error('Error fetching leader:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar líder');
    }
  }

  // =====================================
  // MÉTODOS PRIVADOS Y UTILITARIOS
  // =====================================

  // Construir parámetros de filtro
  private buildFilterParams(filters: HierarchyFilters): Record<string, string> {
    const params: Record<string, string> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value.toString();
      }
    });
    
    return params;
  }

  // Transformar respuesta de candidatos
  private transformCandidatesResponse(data: any): PaginatedResponse<HierarchyCandidate> {
    return {
      data: data.data?.map((item: any) => this.transformSingleCandidate(item)) || [],
      meta: data.meta || {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }

  // Transformar respuesta de grupos
  private transformGroupsResponse(data: any): PaginatedResponse<HierarchyGroup> {
    return {
      data: data.data?.map((item: any) => this.transformSingleGroup(item)) || [],
      meta: data.meta || {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }

  // Transformar respuesta de líderes
  private transformLeadersResponse(data: any): PaginatedResponse<HierarchyLeader> {
    return {
      data: data.data?.map((item: any) => this.transformSingleLeader(item)) || [],
      meta: data.meta || {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }

  // Transformar respuesta de planillados
  private transformPlanilladosResponse(data: any): PaginatedResponse<HierarchyPlanillado> {
    return {
      data: data.data?.map((item: any) => this.transformSinglePlanillado(item)) || [],
      meta: data.meta || {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }

  // Transformar candidato individual
  private transformSingleCandidate(data: any): HierarchyCandidate {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      meta: data.meta || 0,
      description: data.description,
      position: data.position,
      party: data.party,
      isActive: data.isActive ?? true,
      groupsCount: data.groupsCount || 0,
      leadersCount: data.leadersCount || 0,
      votersCount: data.votersCount || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  // Transformar grupo individual
  private transformSingleGroup(data: any): HierarchyGroup {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      zone: data.zone,
      meta: data.meta || 0,
      isActive: data.isActive ?? true,
      candidateId: data.candidateId,
      candidate: data.candidate ? {
        id: data.candidate.id,
        name: data.candidate.name
      } : undefined,
      leadersCount: data.leadersCount || 0,
      planilladosCount: data.planilladosCount || 0,
      votersCount: data.votersCount || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  // Transformar líder individual
  private transformSingleLeader(data: any): HierarchyLeader {
    return {
      id: data.id,
      cedula: data.cedula,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      neighborhood: data.neighborhood,
      municipality: data.municipality,
      meta: data.meta || 0,
      isActive: data.isActive ?? true,
      isVerified: data.isVerified ?? false,
      groupId: data.groupId,
      group: data.group ? {
        id: data.group.id,
        name: data.group.name,
        candidate: data.group.candidate ? {
          id: data.group.candidate.id,
          name: data.group.candidate.name
        } : undefined
      } : undefined,
      votersCount: data.votersCount || 0,
      planilladosCount: data.planilladosCount || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  // Transformar planillado individual
  private transformSinglePlanillado(data: any): HierarchyPlanillado {
    return {
      id: data.id,
      cedula: data.cedula,
      nombres: data.nombres,
      apellidos: data.apellidos,
      celular: data.celular,
      direccion: data.direccion,
      barrioVive: data.barrioVive,
      departamentoVotacion: data.departamentoVotacion,
      municipioVotacion: data.municipioVotacion,
      direccionVotacion: data.direccionVotacion,
      zonaPuesto: data.zonaPuesto,
      mesa: data.mesa,
      estado: data.estado || 'pendiente',
      esEdil: data.esEdil ?? false,
      actualizado: data.actualizado ?? false,
      liderId: data.liderId,
      lider: data.lider ? {
        id: data.lider.id,
        firstName: data.lider.firstName,
        lastName: data.lider.lastName,
        cedula: data.lider.cedula
      } : undefined,
      grupoId: data.grupoId,
      grupo: data.grupo ? {
        id: data.grupo.id,
        name: data.grupo.name
      } : undefined,
      fechaNacimiento: data.fechaNacimiento,
      genero: data.genero,
      notas: data.notas,
      fechaCreacion: data.fechaCreacion || data.createdAt,
      fechaActualizacion: data.fechaActualizacion || data.updatedAt
    };
  }

  // Fallback para estadísticas cuando no hay endpoint unificado
  private async getStatsFallback(_filters: HierarchyFilters): Promise<HierarchyStats> {
    try {
      const [candidatesStats, groupsStats, leadersStats, planilladosStats] = await Promise.allSettled([
        apiClient.get('/candidates/stats'),
        apiClient.get('/groups/stats'),
        apiClient.get('/leaders/stats'),
        apiClient.get('/planillados/stats')
      ]);

      const stats: HierarchyStats = {
        candidates: candidatesStats.status === 'fulfilled' 
          ? { 
              total: candidatesStats.value.data.total || 0, 
              active: candidatesStats.value.data.activos || 0,
              byParty: candidatesStats.value.data.porPartido || {}
            }
          : { total: 0, active: 0, byParty: {} },
        groups: groupsStats.status === 'fulfilled'
          ? { 
              total: groupsStats.value.data.total || 0, 
              active: groupsStats.value.data.activos || 0,
              byCandidate: groupsStats.value.data.porCandidato || {},
              byZone: groupsStats.value.data.porZona || {}
            }
          : { total: 0, active: 0, byCandidate: {}, byZone: {} },
        leaders: leadersStats.status === 'fulfilled'
          ? { 
              total: leadersStats.value.data.total || 0, 
              active: leadersStats.value.data.activos || 0,
              verified: leadersStats.value.data.verificados || 0,
              byGroup: leadersStats.value.data.porGrupo || {},
              byNeighborhood: leadersStats.value.data.porBarrio || {}
            }
          : { total: 0, active: 0, verified: 0, byGroup: {}, byNeighborhood: {} },
        planillados: planilladosStats.status === 'fulfilled'
          ? { 
              total: planilladosStats.value.data.total || 0, 
              verified: planilladosStats.value.data.verificados || 0,
              pendientes: planilladosStats.value.data.pendientes || 0,
              ediles: planilladosStats.value.data.ediles || 0,
              byLeader: planilladosStats.value.data.porLider || {},
              byGroup: planilladosStats.value.data.porGrupo || {},
              byMunicipality: planilladosStats.value.data.porMunicipio || {},
              byGender: planilladosStats.value.data.porGenero || {}
            }
          : { total: 0, verified: 0, pendientes: 0, ediles: 0, byLeader: {}, byGroup: {}, byMunicipality: {}, byGender: {} }
      };

      return stats;
    } catch (error) {
      throw new Error('Error al cargar estadísticas');
    }
  }

  // Fallback para búsqueda global cuando no hay endpoint unificado
  private async globalSearchFallback(
    searchTerm: string, 
    entityTypes: string[], 
    limit: number
  ): Promise<GlobalSearchResult> {
    try {
      const searches = [];

      if (entityTypes.includes('candidates')) {
        searches.push(this.getCandidates({ buscar: searchTerm }, 1, limit));
      }
      if (entityTypes.includes('groups')) {
        searches.push(apiClient.get(`/groups?buscar=${searchTerm}&limit=${limit}`));
      }
      if (entityTypes.includes('leaders')) {
        searches.push(apiClient.get(`/leaders?buscar=${searchTerm}&limit=${limit}`));
      }
      if (entityTypes.includes('planillados')) {
        searches.push(apiClient.get(`/planillados?buscar=${searchTerm}&limit=${limit}`));
      }

      const results = await Promise.allSettled(searches);
      
      const candidates: HierarchyCandidate[] = [];
      const groups: HierarchyGroup[] = [];
      const leaders: HierarchyLeader[] = [];
      const planillados: HierarchyPlanillado[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const data = result.value.data ? result.value.data.data : result.value.data;
          
          switch (entityTypes[index]) {
            case 'candidates':
              candidates.push(...data.map((item: any) => this.transformSingleCandidate(item)));
              break;
            case 'groups':
              groups.push(...data.map((item: any) => this.transformSingleGroup(item)));
              break;
            case 'leaders':
              leaders.push(...data.map((item: any) => this.transformSingleLeader(item)));
              break;
            case 'planillados':
              planillados.push(...data.map((item: any) => this.transformSinglePlanillado(item)));
              break;
          }
        }
      });

      return {
        candidates,
        groups,
        leaders,
        planillados,
        total: candidates.length + groups.length + leaders.length + planillados.length,
        summary: {
          candidatesCount: candidates.length,
          groupsCount: groups.length,
          leadersCount: leaders.length,
          planilladosCount: planillados.length
        }
      };
    } catch (error) {
      throw new Error('Error en búsqueda global');
    }
  }
}

// Crear instancia única del servicio
const hierarchyService = new HierarchyService();

// Exportar la instancia como default
export default hierarchyService;

// También exportar la clase para casos especiales
export { HierarchyService };