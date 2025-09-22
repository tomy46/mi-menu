import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { createRestaurantWithDefaultMenu } from '../services/firestore.js'

export default function Welcome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('Mi Restaurante')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createRestaurant() {
    if (!user) return navigate('/auth/login')
    
    setError('') // Clear previous errors
    if (!name.trim()) {
      setError('Ingresá un nombre para el restaurante')
      return
    }
    
    setLoading(true)
    try {
      const { restaurantId } = await createRestaurantWithDefaultMenu({ uid: user.uid, name, isPublic: true })
      navigate(`/admin/${restaurantId}`)
    } catch (e) {
      setError(e.message || 'Error al crear el restaurante')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-6 space-y-3">
        <h1 className="text-xl font-semibold text-center">Bienvenido</h1>
        <p className="text-sm text-gray-600 text-center">Creá tu restaurante para empezar.</p>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Nombre del restaurante"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (error) setError('') // Clear error when user starts typing
          }}
        />
        <button
          onClick={createRestaurant}
          disabled={loading}
          className="w-full bg-[#111827] text-white rounded-lg py-2 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear restaurante'}
        </button>
      </div>
    </div>
  )
}
