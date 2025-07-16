import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from './store/hooks'
import { AuthPage } from './pages/AuthPage'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { ComingSoon } from './pages/ComingSoon'

function App() {
  const { user } = useAppSelector((state) => state.auth)

  if (!user) {
    return <AuthPage />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="campaign/*" element={<ComingSoon />} />
          <Route path="operations/*" element={<ComingSoon />} />
          <Route path="validation/*" element={<ComingSoon />} />
          <Route path="analytics/*" element={<ComingSoon />} />
          <Route path="command" element={<ComingSoon />} />
          <Route path="reference" element={<ComingSoon />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App