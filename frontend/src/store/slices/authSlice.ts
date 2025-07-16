// frontend/src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService, type LoginCredentials, type RegisterData, type AuthResponse } from '../../services/authService';

// Tipos para el estado de autenticación
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Async thunks para operaciones asíncronas
export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en el login';
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterData,
  { rejectValue: string }
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en el registro';
      return rejectWithValue(message);
    }
  }
);

export const verifyToken = createAsyncThunk<
  { user: User },
  string,
  { rejectValue: string }
>(
  'auth/verifyToken',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authService.verifyToken(token);
      return response;
    } catch (error) {
      localStorage.removeItem('token');
      const message = error instanceof Error ? error.message : 'Token inválido';
      return rejectWithValue(message);
    }
  }
);

export const getProfile = createAsyncThunk<
  { user: User },
  string,
  { rejectValue: string }
>(
  'auth/getProfile',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile(token);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error obteniendo perfil';
      return rejectWithValue(message);
    }
  }
);

// Slice de autenticación
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Acción para limpiar errores
    clearError: (state) => {
      state.error = null;
    },
    
    // Acción para establecer usuario manualmente
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isInitialized = true;
    },
    
    // Acción para establecer token manualmente
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    
    // Acción para logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.isLoading = false;
      state.isInitialized = true;
      localStorage.removeItem('token');
    },
    
    // Acción para marcar como inicializado
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    
    // Acción para actualizar datos del usuario
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Error en el login';
        state.user = null;
        state.token = null;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Error en el registro';
        state.user = null;
        state.token = null;
      });

    // Verify Token
    builder
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isInitialized = true;
      });

    // Get Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Error obteniendo perfil';
      });
  },
});

// Exportar acciones
export const {
  clearError,
  setUser,
  setToken,
  logout,
  setInitialized,
  updateUser
} = authSlice.actions;

// Selectores
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => 
  !!state.auth.user && !!state.auth.token;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;

// Exportar reducer
export default authSlice.reducer;