import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-4 text-center">Cargando...</div>
  if (!user) return <Navigate to="/auth/login" replace />
  return <Outlet />
}
