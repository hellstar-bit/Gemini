// Tipos principales de GEMINI
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  meta: number;
  isActive: boolean;
}

export interface Group {
  id: number;
  name: string;
  candidateId: number;
  leadersCount: number;
  votersCount: number;
}

export interface Leader {
  id: number;
  cedula: string;
  firstName: string;
  lastName: string;
  phone: string;
  groupId: number;
  votersCount: number;
}

export interface Voter {
  id: number;
  cedula: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  neighborhood: string;
  leaderId: number;
  isVerified: boolean;
}

export interface Location {
  id: number;
  name: string;
  type: 'department' | 'municipality' | 'neighborhood';
  parentId?: number;
}

// Estados de la aplicación
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}