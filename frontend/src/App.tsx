// frontend/src/App.tsx - ACTUALIZADO con vista jerárquica

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
import { CampaignPage } from './pages/campaign/CampaignPage';

// ✅ NUEVA PÁGINA - Vista jerárquica
import { CampaignHierarchyPage } from './pages/campaign/CampaignHierarchyPage';

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
// ✅ COMPONENTE DE RUTAS ACTUALIZADO
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
            {/* Ruta principal de campaña */}
            <Route path="campaign" element={<CampaignPage />} />
            
            {/* ✅ NUEVA RUTA - Vista jerárquica completa */}
            <Route path="campaign/hierarchy" element={<CampaignHierarchyPage />} />
            
            {/* Rutas individuales existentes */}
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
            
            {/* ===== INTELIGENCIA ELECTORAL ===== */}
            <Route path="analytics/*" element={<ComingSoon />} />
            <Route path="analytics/maps" element={<ComingSoon />} />
            <Route path="analytics/stats" element={<ComingSoon />} />
            <Route path="analytics/reports" element={<ComingSoon />} />
            
            {/* ===== OTRAS RUTAS ===== */}
            <Route path="command" element={<ComingSoon />} />
            <Route path="reference" element={<ComingSoon />} />
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