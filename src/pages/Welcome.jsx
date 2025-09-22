import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { createRestaurantWithDefaultMenu } from '../services/firestore.js'

export default function Welcome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('Mi Restaurante')
  const [loading, setLoading] = useState(false)

  async function createRestaurant() {
    if (!user) return navigate('/auth/login')
    if (!name.trim()) return alert('Ingresá un nombre')
    setLoading(true)
    try {
      const { restaurantId } = await createRestaurantWithDefaultMenu({ uid: user.uid, name, isPublic: true })
      navigate(`/admin/${restaurantId}`)
    } catch (e) {
      alert('Error al crear el restaurante: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-6 space-y-3">
        <h1 className="text-xl font-semibold text-center">Bienvenido</h1>
        <p className="text-sm text-gray-600 text-center">Creá tu primer restaurante para empezar.</p>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Nombre del restaurante"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={createRestaurant}
          disabled={loading}
          className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear restaurante'}
        </button>
      </div>
    </div>
  )
}
