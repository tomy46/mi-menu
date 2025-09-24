import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import OwnerGuard from './components/OwnerGuard.jsx'
import SubdomainHandler from './components/SubdomainHandler.jsx'

// Auth pages
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'

// Public pages
import LandingPage from './pages/LandingPage.jsx'
import PublicMenu from './pages/public/PublicMenu.jsx'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import Productos from './pages/admin/Productos.jsx'
import Menu from './pages/admin/Menu.jsx'
import Analytics from './pages/admin/Analytics.jsx'
import Perfil from './pages/admin/Perfil.jsx'
import Settings from './pages/admin/Settings.jsx'
import HomeRedirect from './pages/HomeRedirect.jsx'
import Welcome from './pages/Welcome.jsx'
import WelcomeWizard from './pages/WelcomeWizard.jsx'

function App() {
  return (
    <SubdomainHandler>
      <Routes>
      {/* Landing Page */}
      <Route path="/landing" element={<LandingPage />} />
      
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />

      {/* Public menu */}
      <Route path="/r/:restaurantId" element={<PublicMenu />} />

      {/* Admin (protected) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin/:restaurantId" element={<AdminLayout />}>
          <Route
            index
            element={
              <OwnerGuard>
                <Dashboard />
              </OwnerGuard>
            }
          />
          <Route
            path="productos"
            element={
              <OwnerGuard>
                <Productos />
              </OwnerGuard>
            }
          />
          <Route
            path="menu"
            element={
              <OwnerGuard>
                <Menu />
              </OwnerGuard>
            }
          />
          <Route
            path="analytics"
            element={
              <OwnerGuard>
                <Analytics />
              </OwnerGuard>
            }
          />
          <Route
            path="perfil"
            element={
              <OwnerGuard>
                <Perfil />
              </OwnerGuard>
            }
          />
          <Route
            path="ajustes"
            element={
              <OwnerGuard>
                <Settings />
              </OwnerGuard>
            }
          />
        </Route>
      </Route>

      {/* Default route: redirect based on session/ownership */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/welcome-wizard" element={<WelcomeWizard />} />

      {/* 404 */}
      <Route path="*" element={<div className="p-4">Página no encontrada</div>} />
      </Routes>
    </SubdomainHandler>
  )
}

export default App
