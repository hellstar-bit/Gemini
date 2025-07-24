// frontend/src/App.tsx - CORREGIDO: Añadidas rutas principales faltantes

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Componentes existentes
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Páginas existentes
import { Dashboard } from './pages/Dashboard';
import { AuthPage } from './pages/AuthPage';
import { NotificationContainer } from './components/common/NotificationContainer';
import { PlanilladosPage } from './pages/campaign/PlanilladosPage';
import ImportPage from './pages/operations/ImportPage';
import { LeadersPage } from './pages/campaign/LeadersPage';
import { GroupsPage } from './pages/campaign/GroupsPage';
import { CandidatesPage } from './pages/campaign/CandidatesPage';

// ✅ SOLO IMPORTAR CampaignPage - las otras no son necesarias por ahora
import { CampaignPage } from './pages/campaign/CampaignPage';

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
// ✅ COMPONENTE DE RUTAS CORREGIDO
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
            {/* ✅ Ruta principal de campaña - SOLO ESTA ES NECESARIA */}
            <Route path="campaign" element={<CampaignPage />} />
            <Route path="campaign/candidates" element={<CandidatesPage />} />
            <Route path="campaign/groups" element={<GroupsPage />} />
            <Route path="campaign/leaders" element={<LeadersPage />} />
            <Route path="campaign/planillados" element={<PlanilladosPage />} />
            
            {/* ===== CENTRO DE OPERACIONES ===== */}
            <Route path="operations" element={<ComingSoon />} />
            <Route path="operations/import" element={<ImportPage />} />
            <Route path="operations/leaders" element={<ComingSoon />} />
            <Route path="operations/voters" element={<ComingSoon />} />
            
            {/* ===== VALIDACIÓN DE DATOS ===== */}
            <Route path="validation" element={<ComingSoon />} />
            <Route path="validation/orphan-voters" element={<ComingSoon />} />
            <Route path="validation/duplicates" element={<ComingSoon />} />
            <Route path="validation/geo-errors" element={<ComingSoon />} />
            
            {/* ===== OTRAS RUTAS ===== */}
            <Route path="analytics/*" element={<ComingSoon />} />
            <Route path="command" element={<ComingSoon />} />
            <Route path="reference" element={<ComingSoon />} />
            
            {/* Rutas de configuración y otras */}
            <Route path="settings" element={<ComingSoon />} />
            <Route path="help" element={<ComingSoon />} />
          </Route>
        </Routes>
        
        {/* Container de notificaciones */}
        <NotificationContainer />
      </div>
    </Router>
  );
};

// =====================================
// ✅ COMPONENTE PRINCIPAL
// =====================================

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
};

export default App;