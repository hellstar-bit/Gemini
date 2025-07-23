// frontend/src/App.tsx - INTEGRACIÓN COMPLETA

import React, { useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// ✅ Importaciones para la nueva funcionalidad
import { useWebSocket } from './hooks/useWebSocket';
import { ModalManager, type ModalManagerRef } from './components/layout/ModalManager';
;

// Componentes existentes
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Páginas
import {Dashboard} from './pages/Dashboard';
import { NotificationContainer } from './components/common/NotificationContainer';
import { PlanilladosPage } from './pages/campaign/PlanilladosPage';
import ImportPage from './pages/operations/ImportPage';
import { LeadersPage } from './pages/campaign/LeadersPage';
import { GroupsPage } from './pages/campaign/GroupsPage';
import { CandidatesPage } from './pages/campaign/CandidatesPage';

// =====================================
// ✅ COMPONENTE PRINCIPAL CON INTEGRACIONES
// =====================================

const AppContent: React.FC = () => {
  const modalManagerRef = useRef<ModalManagerRef>(null);
  const { isConnected, registerModalManager } = useWebSocket({
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000
  });

  // =====================================
  // ✅ REGISTRO DEL MODAL MANAGER CON WEBSOCKET
  // =====================================

  useEffect(() => {
    if (modalManagerRef.current) {
      registerModalManager({
        showPlanilladosLiderModal: modalManagerRef.current.showPlanilladosLiderModal
      });
      console.log('✅ Modal Manager registrado con WebSocket');
    }
  }, [registerModalManager]);

  // =====================================
  // ✅ INDICADOR DE CONEXIÓN (OPCIONAL)
  // =====================================

  const ConnectionIndicator: React.FC = () => (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isConnected ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      <div className="bg-amber-100 border border-amber-300 text-amber-800 px-3 py-2 rounded-lg shadow-lg flex items-center text-sm">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-2"></div>
        Reconectando notificaciones...
      </div>
    </div>
  );

  // =====================================
  // ✅ RENDER PRINCIPAL
  // =====================================

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        
        {/* ===== RUTAS PRINCIPALES ===== */}
        <Routes>
          {/* Ruta pública - Login */}
          
          {/* Rutas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Dashboard */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Gestión de Campaña */}
            <Route path="planillados" element={<PlanilladosPage />} />
            <Route path="leaders" element={<LeadersPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="candidates" element={<CandidatesPage />} />
            
            {/* Centro de Operaciones */}
            <Route path="import" element={<ImportPage />} />
            
            {/* Rutas adicionales */}
            <Route path="*" element={
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h2>
                  <p className="text-gray-600">La página que buscas no existe.</p>
                </div>
              </div>
            } />
          </Route>
        </Routes>

        {/* ===== COMPONENTES GLOBALES ===== */}
        
        {/* Contenedor de notificaciones */}
        <NotificationContainer />
        
        {/* Modal Manager para gestión centralizada de modales */}
        <ModalManager ref={modalManagerRef} />
        
        {/* Indicador de conexión WebSocket */}
        <ConnectionIndicator />
        
        {/* Información de desarrollo (solo en dev) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 z-40 text-xs text-gray-500 bg-white bg-opacity-90 px-2 py-1 rounded">
            WS: {isConnected ? '🟢' : '🔴'}
          </div>
        )}
      </div>
    </Router>
  );
};

// =====================================
// ✅ APP PRINCIPAL CON PROVIDERS
// =====================================

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;

// =====================================
// ✅ COMPONENTE ADICIONAL - HEALTH CHECK
// =====================================

export const AppHealthCheck: React.FC = () => {
  const [health, setHealth] = React.useState<{
    api: boolean;
    websocket: boolean;
    lastCheck: string;
  }>({
    api: false,
    websocket: false,
    lastCheck: ''
  });

  const checkHealth = async () => {
    try {
      // Verificar API
      const apiResponse = await fetch(`${process.env.REACT_APP_API_URL}/health`);
      const apiHealthy = apiResponse.ok;

      // Verificar WebSocket (simplificado)
      const wsHealthy = true; // Implementar verificación real según necesidades

      setHealth({
        api: apiHealthy,
        websocket: wsHealthy,
        lastCheck: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('❌ Error en health check:', error);
      setHealth(prev => ({
        ...prev,
        api: false,
        lastCheck: new Date().toLocaleTimeString()
      }));
    }
  };

  React.useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-3 text-xs">
      <div className="font-semibold mb-2">System Health</div>
      <div className="space-y-1">
        <div className="flex items-center">
          <span className={`w-2 h-2 rounded-full mr-2 ${health.api ? 'bg-green-500' : 'bg-red-500'}`}></span>
          API: {health.api ? 'OK' : 'Error'}
        </div>
        <div className="flex items-center">
          <span className={`w-2 h-2 rounded-full mr-2 ${health.websocket ? 'bg-green-500' : 'bg-red-500'}`}></span>
          WebSocket: {health.websocket ? 'OK' : 'Error'}
        </div>
        <div className="text-gray-500 text-xs mt-2">
          Last: {health.lastCheck}
        </div>
      </div>
    </div>
  );
};