// frontend/src/components/auth/ProtectedRoute.tsx - VERSION FINAL
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { verifyToken, logout, setInitialized } from '../../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/auth'
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user, token, isLoading, isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      // Si ya está inicializado, no hacer nada
      if (isInitialized) {
        return;
      }

      try {
        // Si no hay token, marcar como inicializado y salir
        if (!token) {
          dispatch(setInitialized());
          return;
        }

        // Si hay token pero no usuario, verificar token
        if (token && !user) {
          await dispatch(verifyToken(token)).unwrap();
        } else {
          // Si ya hay usuario y token, solo marcar como inicializado
          dispatch(setInitialized());
        }
      } catch (error) {
        console.error('Error verificando token:', error);
        dispatch(logout());
      }
    };

    initializeAuth();
  }, [token, user, dispatch, isInitialized]);

  // Mostrar loading durante verificación inicial
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">GEMINI</h2>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no hay token o usuario, redirigir a login
  if (!token || !user) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Verificar rol requerido si se especifica
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta sección. Se requiere el rol: <span className="font-semibold">{requiredRole}</span>
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Usuario autenticado y autorizado, renderizar children
  return <>{children}</>;
};

// Hook personalizado para verificar autenticación
export const useAuth = () => {
  const { user, token, isLoading, isInitialized } = useAppSelector((state) => state.auth);
  
  return {
    user,
    token,
    isLoading,
    isInitialized,
    isAuthenticated: !!user && !!token,
    hasRole: (role: string) => user?.role === role,
    hasAnyRole: (roles: string[]) => user ? roles.includes(user.role) : false
  };
};

// Componente para rutas que requieren roles específicos
export const RoleProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}> = ({ children, allowedRoles, fallbackPath = '/dashboard' }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

// Componente para mostrar contenido solo a usuarios autenticados
export const AuthenticatedOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
};

// Componente para mostrar contenido solo a usuarios NO autenticados
export const GuestOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const { isAuthenticated } = useAuth();

  return !isAuthenticated ? <>{children}</> : <>{fallback}</>;
};