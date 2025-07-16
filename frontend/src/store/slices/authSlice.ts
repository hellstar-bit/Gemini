import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types';
import { authService, type LoginCredentials } from '../../services/authService';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('gemini_token'),
  isLoading: false,
  error: null,
};

// Thunks asíncronos
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem('gemini_token', response.token);
    return response;
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  localStorage.removeItem('gemini_token');
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

export const { clearError, setUser, setToken } = authSlice.actions;
export default authSlice.reducer;