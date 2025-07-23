// frontend/src/store/slices/appSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppState, Notification } from '../../types';

// ✅ Estado inicial completo
const initialState: AppState = {
  isLoading: false,
  error: null,
  notifications: [],
  sidebarOpen: true, // ✅ Agregar esta propiedad
  currentModule: 'dashboard', // ✅ Agregar esta propiedad
};

// ✅ Función para generar IDs únicos
let notificationCounter = 0;
const generateUniqueId = (): string => {
  notificationCounter += 1;
  return `${Date.now()}-${notificationCounter}-${Math.random().toString(36).substr(2, 9)}`;
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // ✅ Reducers para sidebar y módulo
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setCurrentModule: (state, action: PayloadAction<string>) => {
      state.currentModule = action.payload;
    },
    
    // ✅ Notificaciones con ID único
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: generateUniqueId(), // ✅ ID único garantizado
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setLoading,
  setError,
  setSidebarOpen,
  toggleSidebar,
  setCurrentModule,
  addNotification,
  removeNotification,
  clearNotifications,
} = appSlice.actions;

export default appSlice.reducer;