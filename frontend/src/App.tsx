// frontend/src/App.tsx - Actualizar las rutas

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { ComingSoon } from './pages/ComingSoon';
import { ImportPage } from './pages/operations/ImportPage'; // Nueva página
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
            <Route path="campaign" element={<ComingSoon />} />
            <Route path="campaign/candidates" element={<ComingSoon />} />
            <Route path="campaign/groups" element={<ComingSoon />} />
            <Route path="campaign/leaders" element={<ComingSoon />} />
            
            {/* Centro de Operaciones */}
            <Route path="operations" element={<ComingSoon />} />
            <Route path="operations/import" element={<ImportPage />} /> {/* Nueva ruta funcional */}
            <Route path="operations/leaders" element={<ComingSoon />} />
            <Route path="operations/voters" element={<ComingSoon />} />
            
            {/* Validación de Datos */}
            <Route path="validation" element={<ComingSoon />} />
            <Route path="validation/orphan-voters" element={<ComingSoon />} />
            <Route path="validation/duplicates" element={<ComingSoon />} />
            <Route path="validation/geo-errors" element={<ComingSoon />} />
            
            {/* Inteligencia Electoral */}
            <Route path="analytics" element={<ComingSoon />} />
            <Route path="analytics/maps" element={<ComingSoon />} />
            <Route path="analytics/stats" element={<ComingSoon />} />
            <Route path="analytics/reports" element={<ComingSoon />} />
            
            {/* Centro de Comando */}
            <Route path="command" element={<ComingSoon />} />
            
            {/* Datos de Referencia */}
            <Route path="reference" element={<ComingSoon />} />
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;