import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import OwnerGuard from './components/OwnerGuard.jsx'
import SubdomainHandler from './components/SubdomainHandler.jsx'

// Auth pages
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'

// Public page
import PublicMenu from './pages/public/PublicMenu.jsx'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Categories from './pages/admin/Categories.jsx'
import Items from './pages/admin/Items.jsx'
import Settings from './pages/admin/Settings.jsx'
import HomeRedirect from './pages/HomeRedirect.jsx'
import Welcome from './pages/Welcome.jsx'

function App() {
  return (
    <SubdomainHandler>
      <Routes>
      {/* Auth */}
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
                <Categories />
              </OwnerGuard>
            }
          />
          <Route
            path="items"
            element={
              <OwnerGuard>
                <Items />
              </OwnerGuard>
            }
          />
          <Route
            path="settings"
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

      {/* 404 */}
      <Route path="*" element={<div className="p-4">Página no encontrada</div>} />
      </Routes>
    </SubdomainHandler>
  )
}

export default App
