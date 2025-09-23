import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getRestaurant } from '../../services/firestore.js'
import AnalyticsDashboard from '../../components/AnalyticsDashboard.jsx'
import { ChartBarIcon } from '@heroicons/react/24/outline'

export default function Analytics() {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadRestaurant() {
      try {
        const restaurantData = await getRestaurant(restaurantId)
        setRestaurant(restaurantData)
      } catch (error) {
        console.error('Error loading restaurant:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (restaurantId) {
      loadRestaurant()
    }
  }, [restaurantId])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#111827] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando restaurante...</p>
        </div>
      </div>
    )
  }
  
  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-600">Restaurante no encontrado</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#111827] rounded-lg flex items-center justify-center">
          <ChartBarIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Estadísticas y métricas de tu restaurante
          </p>
        </div>
      </div>
      
      {/* Analytics Dashboard */}
      <AnalyticsDashboard 
        restaurantId={restaurant.id}
        subscriptionPlan={restaurant.subscriptionPlan || 'start'}
      />
    </div>
  )
}
