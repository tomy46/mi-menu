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
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido</h1>
          <p className="text-gray-600 mt-2">Creá tu restaurante para empezar.</p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del restaurante
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              placeholder="Mi Restaurante"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('') // Clear error when user starts typing
              }}
            />
          </div>
          
          <button
            onClick={createRestaurant}
            disabled={loading}
            className="w-full bg-[#111827] text-white rounded-lg py-2 px-4 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear restaurante'}
          </button>
        </div>
      </div>
    </div>
  )
}
