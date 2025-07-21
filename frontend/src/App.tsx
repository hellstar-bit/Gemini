// frontend/src/App.tsx - Actualizado con CandidatesPage y GroupsPage
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { ComingSoon } from './pages/ComingSoon';
import { ImportPage } from './pages/operations/ImportPage';
import { PlanilladosPage } from './pages/campaign/PlanilladosPage';
import { LeadersPage } from './pages/campaign/LeadersPage';
import { CandidatesPage } from './pages/campaign/CandidatesPage'; // ✅ NUEVO
import { GroupsPage } from './pages/campaign/GroupsPage';       // ✅ NUEVO
import { CampaignPage } from './pages/campaign/CampaignPage';   // ✅ PÁGINA PRINCIPAL DE CAMPAÑA
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Rutas protegidas */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Gestión de Campaña */}
              <Route path="campaign" element={<CampaignPage />} />           {/* ✅ PÁGINA PRINCIPAL */}
              <Route path="campaign/candidates" element={<CandidatesPage />} /> {/* ✅ NUEVO - Candidatos */}
              <Route path="campaign/groups" element={<GroupsPage />} />         {/* ✅ NUEVO - Grupos */}
              <Route path="campaign/leaders" element={<LeadersPage />} />       {/* ✅ ACTIVADO - Líderes */}
              <Route path="campaign/planillados" element={<PlanilladosPage />} /> {/* ✅ ACTIVADO - Planillados */}
              
              {/* Centro de Operaciones */}
              <Route path="operations" element={<ComingSoon />} />
              <Route path="operations/import" element={<ImportPage />} />
              <Route path="operations/leaders" element={<ComingSoon />} />
              <Route path="operations/voters" element={<ComingSoon />} />
              
              {/* Validación de Datos */}
              <Route path="validation" element={<ComingSoon />} />
              <Route path="validation/orphan-voters" element={<ComingSoon />} />
              <Route path="validation/duplicates" element={<ComingSoon />} />
              <Route path="validation/geo-errors" element={<ComingSoon />} />
              
              {/* Inteligencia Electoral */}
              <Route path="intelligence" element={<ComingSoon />} />
              <Route path="intelligence/maps" element={<ComingSoon />} />
              <Route path="intelligence/analysis" element={<ComingSoon />} />
              <Route path="intelligence/validation" element={<ComingSoon />} />
              <Route path="intelligence/activity" element={<ComingSoon />} />
              
              {/* Centro de Reportes */}
              <Route path="reports" element={<ComingSoon />} />
              <Route path="reports/quick" element={<ComingSoon />} />
              <Route path="reports/generator" element={<ComingSoon />} />
              <Route path="reports/config" element={<ComingSoon />} />
              
              {/* Centro de Comando */}
              <Route path="command" element={<ComingSoon />} />
              <Route path="command/dashboard" element={<ComingSoon />} />
              <Route path="command/operations" element={<ComingSoon />} />
              <Route path="command/alerts" element={<ComingSoon />} />
              
              {/* Datos de Referencia */}
              <Route path="reference" element={<ComingSoon />} />
              
              {/* Administración */}
              <Route path="admin" element={<ComingSoon />} />
              <Route path="admin/users" element={<ComingSoon />} />
              <Route path="admin/roles" element={<ComingSoon />} />
              <Route path="admin/settings" element={<ComingSoon />} />
              
              {/* Ruta 404 */}
              <Route path="*" element={<ComingSoon />} />
            </Route>
          </Routes>
      </Router>
    </Provider>
  );
}

export default App;