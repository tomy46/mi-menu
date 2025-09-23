import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getFirstOwnedRestaurant } from '../services/firestore.js'

export default function HomeRedirect() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let active = true
    async function run() {
      if (loading) return
      if (!user) return
      try {
         const r = await getFirstOwnedRestaurant(user.uid)
        if (!active) return
        if (r) navigate(`/admin/${r.id}`)
        else navigate('/welcome')
      } catch (e) {
        console.warn('Fallo al obtener restaurantes del usuario, redirigiendo a /welcome', e)
        if (!active) return
        navigate('/welcome')
      }
    }
    run()
    if (!loading && !user) setChecking(false)
    return () => { active = false }
  }, [user, loading, navigate])

  if (loading || checking) return <div className="p-4">Cargando...</div>
  if (!user) return <Navigate to="/landing" replace />
  return null
}
