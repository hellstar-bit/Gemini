// frontend/src/App.tsx - RUTAS CORREGIDAS PARA COINCIDIR CON SIDEBAR

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Componentes existentes
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Páginas
import {Dashboard} from './pages/Dashboard';
import { AuthPage } from './pages/AuthPage';
import { NotificationContainer } from './components/common/NotificationContainer';
import { PlanilladosPage } from './pages/campaign/PlanilladosPage';
import ImportPage from './pages/operations/ImportPage';
import { LeadersPage } from './pages/campaign/LeadersPage';
import { GroupsPage } from './pages/campaign/GroupsPage';
import { CandidatesPage } from './pages/campaign/CandidatesPage';

// Página de Coming Soon para rutas no implementadas
const ComingSoon: React.FC = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="text-white text-2xl">🚧</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Próximamente</h2>
      <p className="text-gray-600">Esta funcionalidad estará disponible pronto.</p>
    </div>
  </div>
);

// =====================================
// ✅ COMPONENTE DE RUTAS
// =====================================

const AppRoutes: React.FC = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="App min-h-screen bg-gray-50">
        
        {/* ===== RUTAS PRINCIPALES ===== */}
        <Routes>
          {/* Ruta de autenticación */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Rutas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Dashboard */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* ===== GESTIÓN DE CAMPAÑA ===== */}
            <Route path="campaign">
              <Route path="candidates" element={<CandidatesPage />} />
              <Route path="groups" element={<GroupsPage />} />
              <Route path="leaders" element={<LeadersPage />} />
              <Route path="planillados" element={<PlanilladosPage />} />
            </Route>
            
            {/* ===== CENTRO DE OPERACIONES ===== */}
            <Route path="operations">
              <Route path="import" element={<ImportPage />} />
              <Route path="leaders" element={<ComingSoon />} />
              <Route path="voters" element={<ComingSoon />} />
            </Route>
            
            {/* ===== VALIDACIÓN DE DATOS ===== */}
            <Route path="validation">
              <Route path="orphan-voters" element={<ComingSoon />} />
              <Route path="duplicates" element={<ComingSoon />} />
              <Route path="geo-errors" element={<ComingSoon />} />
            </Route>
            
            {/* ===== INTELIGENCIA ELECTORAL ===== */}
            <Route path="analytics">
              <Route path="maps" element={<ComingSoon />} />
              <Route path="stats" element={<ComingSoon />} />
              <Route path="reports" element={<ComingSoon />} />
            </Route>
            
            {/* ===== OTRAS RUTAS ===== */}
            <Route path="command" element={<ComingSoon />} />
            <Route path="reference" element={<ComingSoon />} />
            
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
        
        {/* Información de desarrollo (solo en dev) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 z-40 text-xs text-gray-500 bg-white bg-opacity-90 px-2 py-1 rounded">
            Modo desarrollo
          </div>
        )}
      </div>
    </Router>
  );
};

// =====================================
// ✅ COMPONENTE PRINCIPAL CON UN SOLO PROVIDER
// =====================================

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
};

export default App;