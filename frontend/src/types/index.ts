// frontend/src/types/index.ts - TIPOS COMPLETOS PARA GEMINI

// =====================================
// TIPOS PRINCIPALES DEL SISTEMA
// =====================================

// Usuario del sistema
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'operator' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Candidato
export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  meta: number; // Meta de votos
  description?: string;
  position?: string; // Cargo al que aspira
  party?: string; // Partido político
  isActive: boolean;
  groupsCount?: number;
  leadersCount?: number;
  votersCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Grupo de campaña
export interface Group {
  id: number;
  name: string;
  description?: string;
  zone?: string; // Zona geográfica
  meta: number; // Meta de votantes
  isActive: boolean;
  candidateId: number;
  candidate?: Candidate;
  leaders?: Leader[];
  planillados?: Planillado[];
  leadersCount?: number;
  votersCount?: number;
  planilladosCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Líder de campaña
export interface Leader {
  id: number;
  cedula: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  municipality?: string;
  birthDate?: Date;
  gender?: 'M' | 'F' | 'Other';
  meta: number; // Meta de votantes
  isActive: boolean;
  isVerified: boolean;
  groupId: number;
  group?: Group;
  voters?: Voter[];
  planillados?: Planillado[];
  votersCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Planillado (entidad principal)
export interface Planillado {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  celular?: string;
  direccion?: string;
  barrioVive?: string;
  fechaExpedicion?: Date;
  departamentoVotacion?: string;
  municipioVotacion?: string;
  direccionVotacion?: string;
  zonaPuesto?: string;
  mesa?: string;
  estado: 'verificado' | 'pendiente';
  esEdil: boolean;
  actualizado: boolean;
  liderId?: number;
  lider?: Leader;
  grupoId?: number;
  grupo?: Group;
  fechaNacimiento?: Date;
  genero?: 'M' | 'F' | 'Otro';
  notas?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  // ✅ NUEVO CAMPO
  cedulaLiderPendiente?: string;
  
  // Campos calculados
  nombreCompleto?: string;
  edad?: number;
  rangoEdad?: string;
}

// Votante (para importaciones - legacy)
export interface Voter {
  id: number;
  cedula: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  municipality?: string;
  votingPlace?: string;
  birthDate?: Date;
  gender?: 'M' | 'F' | 'Other';
  commitment: 'committed' | 'potential' | 'undecided' | 'opposed';
  notes?: string;
  isVerified: boolean;
  isActive: boolean;
  leaderId?: number;
  leader?: Leader;
  createdAt: Date;
  updatedAt: Date;
}

// Ubicación geográfica
export interface Location {
  id: number;
  name: string;
  type: 'department' | 'municipality' | 'neighborhood' | 'zone';
  code?: string; // Código DANE
  parentId?: number;
  parent?: Location;
  children?: Location[];
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  population: number;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================
// DTÓS Y FILTROS
// =====================================

// Filtros para planillados
export interface PlanilladoFiltersDto {
  buscar?: string;
  estado?: 'verificado' | 'pendiente';
  barrioVive?: string;
  liderId?: number;
  grupoId?: number;
  esEdil?: boolean;
  genero?: 'M' | 'F' | 'Otro';
  municipioVotacion?: string;
  actualizado?: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
  rangoEdad?: '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';
  
  // ✅ NUEVOS CAMPOS
  cedulaLider?: string;
  cedulaLiderPendiente?: string;
  sinLider?: boolean;
  conLiderPendiente?: boolean;
  soloAsignados?: boolean;
}

// Filtros para líderes
export interface LeaderFiltersDto {
  buscar?: string;
  isActive?: boolean;
  isVerified?: boolean;
  groupId?: number;
  neighborhood?: string;
  municipality?: string;
  gender?: 'M' | 'F' | 'Other';
  fechaDesde?: Date;
  fechaHasta?: Date;
}

// DTOs para creación
export interface CreatePlanilladoDto {
  cedula: string;
  nombres: string;
  apellidos: string;
  celular?: string;
  direccion?: string;
  barrioVive?: string;
  fechaExpedicion?: string;
  departamentoVotacion?: string;
  municipioVotacion?: string;
  direccionVotacion?: string;
  zonaPuesto?: string;
  mesa?: string;
  esEdil?: boolean;
  liderId?: number;
  grupoId?: number;
  fechaNacimiento?: string;
  genero?: 'M' | 'F' | 'Otro';
  notas?: string;
}

export interface CreateLeaderDto {
  cedula: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  municipality?: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'Other';
  meta?: number;
  groupId?: number;
}

// =====================================
// ESTADÍSTICAS Y RESPUESTAS
// =====================================

// Estadísticas de planillados
export interface PlanilladosStatsDto {
  total: number;
  verificados: number;
  pendientes: number;
  ediles: number;
  porBarrio: Record<string, number>;
  porGenero: Record<string, number>;
  porEdad: Record<string, number>;
  porLider: Record<string, number>;
  porGrupo: Record<string, number>;
  nuevosHoy: number;
  nuevosEstaSemana: number;
  actualizadosHoy: number;
}

// Estadísticas de líderes
export interface LeaderStatsDto {
  total: number;
  activos: number;
  verificados: number;
  promedioVotantes: number;
  porGrupo: Record<string, number>;
  porBarrio: Record<string, number>;
  topLideres: Record<string, number>;
}

// Respuesta paginada
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

// Resultado de validación
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: {
    municipioVotacion?: string;
    barrioVive?: string;
    zonaPuesto?: string;
  };
}

// Verificación de duplicados
export interface DuplicateCheck {
  exists: boolean;
  planillado?: {
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    estado: string;
  };
}

// =====================================
// IMPORTACIÓN Y EXPORTACIÓN
// =====================================

// Preview de importación
export interface ImportPreview {
  data: Record<string, any>[];
  headers: string[];
  totalRows: number;
  sampleRows: Record<string, any>[];
  errors: string[];
  warnings: string[];
}

// Mapping de importación
export interface ImportMapping {
  fileName: string;
  entityType: 'voters' | 'leaders' | 'candidates' | 'groups' | 'planillados';
  fieldMappings: Record<string, string>;
  previewData: Record<string, any>[];
}

// Resultado de importación
export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  warnings: string[];
  executionTime: number;
}

// Error de importación
export interface ImportError {
  row: number;
  field: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
}

// =====================================
// DATOS GEOGRÁFICOS
// =====================================

// Estadísticas por barrio
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

// Feature geográfico
export interface GeographicFeature {
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

// Datos geográficos completos
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

// =====================================
// ESTADOS DE LA APLICACIÓN
// =====================================

// Estado de autenticación
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Estado general de la app
export interface AppState {
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  sidebarOpen: boolean;
  currentModule: string;
}

// Notificación
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

// =====================================
// UTILIDADES Y HELPERS
// =====================================

// Opciones para selects
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

// Configuración de columna para tablas
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

// Configuración de filtro
export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean' | 'number';
  options?: SelectOption[];
  placeholder?: string;
  multiple?: boolean;
}

// Acción masiva
export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  color?: string;
  description?: string;
  confirmMessage?: string;
  requiresSelection?: boolean;
}

// frontend/src/types/index.ts - TIPOS COMPLETOS PARA GEMINI (CORREGIDO)

// =====================================
// TIPOS PRINCIPALES DEL SISTEMA
// =====================================

// Usuario del sistema
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'operator' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Candidato
export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  meta: number; // Meta de votos
  description?: string;
  position?: string; // Cargo al que aspira
  party?: string; // Partido político
  isActive: boolean;
  groupsCount?: number;
  leadersCount?: number;
  votersCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Grupo de campaña
export interface Group {
  id: number;
  name: string;
  description?: string;
  zone?: string; // Zona geográfica
  meta: number; // Meta de votantes
  isActive: boolean;
  candidateId: number;
  candidate?: Candidate;
  leaders?: Leader[];
  planillados?: Planillado[];
  leadersCount?: number;
  votersCount?: number;
  planilladosCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Líder de campaña
export interface Leader {
  id: number;
  cedula: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  municipality?: string;
  birthDate?: Date;
  gender?: 'M' | 'F' | 'Other';
  meta: number; // Meta de votantes
  isActive: boolean;
  isVerified: boolean;
  groupId: number;
  group?: Group;
  voters?: Voter[];
  planillados?: Planillado[];
  votersCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Planillado (entidad principal)
export interface Planillado {
  id: number;
  
  // Datos personales
  cedula: string;
  nombres: string;
  apellidos: string;
  celular?: string;
  direccion?: string;
  barrioVive?: string;
  fechaExpedicion?: Date;
  
  // Datos de votación
  departamentoVotacion?: string;
  municipioVotacion?: string;
  direccionVotacion?: string;
  zonaPuesto?: string;
  mesa?: string;
  
  // Estado y clasificación
  estado: 'verificado' | 'pendiente';
  esEdil: boolean;
  actualizado: boolean;
  
  // Relaciones
  liderId?: number;
  lider?: Leader;
  grupoId?: number;
  grupo?: Group;
  
  // Datos adicionales
  fechaNacimiento?: Date;
  genero?: 'M' | 'F' | 'Otro';
  notas?: string;
  
  // Timestamps
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  // Campos calculados
  nombreCompleto?: string;
  edad?: number;
  rangoEdad?: string;
}

// Votante (para importaciones - legacy)
export interface Voter {
  id: number;
  cedula: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  municipality?: string;
  votingPlace?: string;
  birthDate?: Date;
  gender?: 'M' | 'F' | 'Other';
  commitment: 'committed' | 'potential' | 'undecided' | 'opposed';
  notes?: string;
  isVerified: boolean;
  isActive: boolean;
  leaderId?: number;
  leader?: Leader;
  createdAt: Date;
  updatedAt: Date;
}

// Ubicación geográfica
export interface Location {
  id: number;
  name: string;
  type: 'department' | 'municipality' | 'neighborhood' | 'zone';
  code?: string; // Código DANE
  parentId?: number;
  parent?: Location;
  children?: Location[];
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  population: number;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================
// DTÓS Y FILTROS
// =====================================

// Filtros para planillados
export interface PlanilladoFiltersDto {
  buscar?: string;
  estado?: 'verificado' | 'pendiente';
  barrioVive?: string;
  liderId?: number;
  grupoId?: number;
  esEdil?: boolean;
  genero?: 'M' | 'F' | 'Otro';
  municipioVotacion?: string;
  actualizado?: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
  rangoEdad?: '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';
  
  // ✅ NUEVOS CAMPOS
  cedulaLider?: string;
  cedulaLiderPendiente?: string;
  sinLider?: boolean;
  conLiderPendiente?: boolean;
  soloAsignados?: boolean;
}

// Filtros para líderes
export interface LeaderFiltersDto {
  buscar?: string;
  isActive?: boolean;
  isVerified?: boolean;
  groupId?: number;
  neighborhood?: string;
  municipality?: string;
  gender?: 'M' | 'F' | 'Other';
  fechaDesde?: Date;
  fechaHasta?: Date;
}

// DTOs para creación
export interface CreatePlanilladoDto {
  cedula: string;
  nombres: string;
  apellidos: string;
  celular?: string;
  direccion?: string;
  barrioVive?: string;
  fechaExpedicion?: string;
  departamentoVotacion?: string;
  municipioVotacion?: string;
  direccionVotacion?: string;
  zonaPuesto?: string;
  mesa?: string;
  esEdil?: boolean;
  liderId?: number;
  grupoId?: number;
  fechaNacimiento?: string;
  genero?: 'M' | 'F' | 'Otro';
  notas?: string;
}

export interface CreateLeaderDto {
  cedula: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  municipality?: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'Other';
  meta?: number;
  groupId?: number;
}

// =====================================
// ESTADÍSTICAS Y RESPUESTAS
// =====================================

// Estadísticas de planillados
export interface PlanilladosStatsDto {
  total: number;
  verificados: number;
  pendientes: number;
  ediles: number;
  porBarrio: Record<string, number>;
  porGenero: Record<string, number>;
  porEdad: Record<string, number>;
  porLider: Record<string, number>;
  porGrupo: Record<string, number>;
  nuevosHoy: number;
  nuevosEstaSemana: number;
  actualizadosHoy: number;
}

// Estadísticas de líderes
export interface LeaderStatsDto {
  total: number;
  activos: number;
  verificados: number;
  promedioVotantes: number;
  porGrupo: Record<string, number>;
  porBarrio: Record<string, number>;
  topLideres: Record<string, number>;
}

// Respuesta paginada
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

// Resultado de validación
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: {
    municipioVotacion?: string;
    barrioVive?: string;
    zonaPuesto?: string;
  };
}

// Verificación de duplicados
export interface DuplicateCheck {
  exists: boolean;
  planillado?: {
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    estado: string;
  };
}

// =====================================
// IMPORTACIÓN Y EXPORTACIÓN
// =====================================

// Preview de importación
export interface ImportPreview {
  data: Record<string, any>[];
  headers: string[];
  totalRows: number;
  sampleRows: Record<string, any>[];
  errors: string[];
  warnings: string[];
}

// Mapping de importación
export interface ImportMapping {
  fileName: string;
  entityType: 'voters' | 'leaders' | 'candidates' | 'groups' | 'planillados';
  fieldMappings: Record<string, string>;
  previewData: Record<string, any>[];
}

// Resultado de importación
export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  warnings: string[];
  executionTime: number;
}

// Error de importación
export interface ImportError {
  row: number;
  field: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
}

// =====================================
// DATOS GEOGRÁFICOS
// =====================================

// Estadísticas por barrio
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

// Feature geográfico
export interface GeographicFeature {
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

// Datos geográficos completos
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

// =====================================
// ESTADOS DE LA APLICACIÓN
// =====================================

// Estado de autenticación
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Estado general de la app
export interface AppState {
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  sidebarOpen: boolean;
  currentModule: string;
}

// Notificación
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

// =====================================
// UTILIDADES Y HELPERS
// =====================================

// Opciones para selects
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

// Configuración de columna para tablas
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

// Configuración de filtro
export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean' | 'number';
  options?: SelectOption[];
  placeholder?: string;
  multiple?: boolean;
}

// Acción masiva
export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  color?: string;
  description?: string;
  confirmMessage?: string;
  requiresSelection?: boolean;
}

// =====================================
// TIPOS ESPECÍFICOS DEL DOMINIO
// =====================================

// Estados posibles de un planillado
export type EstadoPlanillado = 'verificado' | 'pendiente';

// Géneros disponibles
export type Genero = 'M' | 'F' | 'Otro';

// Rangos de edad
export type RangoEdad = '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';

// Roles de usuario
export type UserRole = 'admin' | 'manager' | 'operator' | 'user';

// Tipos de notificación
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Densidad geográfica
export type DensidadGeografica = 'alta' | 'media' | 'baja' | 'sin-datos';

// =====================================
// UTILIDADES DE TIPO
// =====================================

// Tipo para campos opcionales
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Tipo para campos requeridos
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// Tipo para respuestas de API
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Tipo para parámetros de consulta
export type QueryParams = Record<string, string | number | boolean | undefined>;

// =====================================
// CONSTANTES COMO TIPOS
// =====================================

// Valores por defecto
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_TIMEOUT = 10000;

// Mensajes comunes
export const MESSAGES = {
  LOADING: 'Cargando...',
  ERROR_GENERIC: 'Ha ocurrido un error',
  SUCCESS_SAVE: 'Guardado exitosamente',
  SUCCESS_DELETE: 'Eliminado exitosamente',
  CONFIRM_DELETE: '¿Estás seguro de eliminar este elemento?',
} as const;