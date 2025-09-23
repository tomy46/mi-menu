import { useState, useEffect } from 'react'
import { 
  getRestaurantStats, 
  getViewStats, 
  getMenuStats 
} from '../services/firestore.js'
import { 
  ChartBarIcon, 
  EyeIcon, 
  CurrencyDollarIcon, 
  ShoppingBagIcon,
  FolderIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { PLAN_LIMITS, SUBSCRIPTION_PLANS } from '../config/subscriptionPlans.js'

export default function AnalyticsDashboard({ restaurantId, subscriptionPlan = 'start' }) {
  const [stats, setStats] = useState(null)
  const [viewStats, setViewStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(30) // días
  
  // Check if analytics are available for this plan
  const planConfig = PLAN_LIMITS[subscriptionPlan] || PLAN_LIMITS[SUBSCRIPTION_PLANS.START]
  const analyticsEnabled = subscriptionPlan === 'pro' || subscriptionPlan === 'enterprise'
  
  useEffect(() => {
    if (!analyticsEnabled) {
      setLoading(false)
      return
    }
    
    loadAnalytics()
  }, [restaurantId, selectedPeriod, analyticsEnabled])
  
  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Load restaurant stats (cached, optimized for frequent reads)
      const statsResult = await getRestaurantStats(restaurantId)
      if (statsResult.success) {
        setStats(statsResult.data)
      }
      
      // Load view stats for selected period
      const viewsResult = await getViewStats(restaurantId, null, selectedPeriod)
      if (viewsResult.success) {
        setViewStats(viewsResult.data)
      }
      
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-AR').format(num)
  }
  
  if (!analyticsEnabled) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 text-center border border-blue-200">
        <ChartBarIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Analytics Disponibles en Plan Pro
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Obtén insights detallados sobre tu menú, precios promedio, visitas y más con nuestros planes Pro y Enterprise.
        </p>
        <div className="space-y-3 text-left max-w-sm mx-auto">
          <div className="flex items-center gap-3">
            <EyeIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-700">Estadísticas de visitas al menú</span>
          </div>
          <div className="flex items-center gap-3">
            <CurrencyDollarIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-700">Precio promedio de productos</span>
          </div>
          <div className="flex items-center gap-3">
            <ArrowTrendingUpIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-700">Tendencias y reportes</span>
          </div>
        </div>
        <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Actualizar a Pro
        </button>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#111827] focus:border-[#111827]"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Average Price */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.averagePrice ? formatCurrency(stats.averagePrice) : '-'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <ClockIcon className="w-3 h-3 inline mr-1" />
            Actualizado: {stats?.lastCalculated ? 'Hoy' : 'Nunca'}
          </p>
        </div>
        
        {/* Total Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalItems ? formatNumber(stats.totalItems) : '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            En {stats?.totalCategories || 0} categorías
          </p>
        </div>
        
        {/* Total Categories */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categorías</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalCategories ? formatNumber(stats.totalCategories) : '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FolderIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            En {stats?.totalMenus || 1} menú{(stats?.totalMenus || 1) > 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Menu Views */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Visitas al Menú</p>
              <p className="text-2xl font-bold text-gray-900">
                {viewStats?.totalViews ? formatNumber(viewStats.totalViews) : '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <EyeIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {viewStats?.avgViewsPerDay ? `${viewStats.avgViewsPerDay.toFixed(1)} promedio/día` : 'Sin datos'}
          </p>
        </div>
      </div>
      
      {/* Views Chart */}
      {viewStats?.dailyStats && viewStats.dailyStats.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Visitas Diarias</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ArrowTrendingUpIcon className="w-4 h-4" />
              Últimos {selectedPeriod} días
            </div>
          </div>
          
          {/* Simple bar chart */}
          <div className="space-y-3">
            {viewStats.dailyStats.slice(0, 10).reverse().map((stat, index) => {
              const maxViews = Math.max(...viewStats.dailyStats.map(s => s.views || 0))
              const percentage = maxViews > 0 ? ((stat.views || 0) / maxViews) * 100 : 0
              
              return (
                <div key={stat.date} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-gray-600 font-mono">
                    {new Date(stat.date).toLocaleDateString('es-AR', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    >
                      {stat.views > 0 && (
                        <span className="text-xs font-medium text-white">
                          {stat.views}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {viewStats.dailyStats.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <EyeIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay visitas registradas en este período</p>
              <p className="text-sm mt-1">Las visitas aparecerán cuando los clientes vean tu menú</p>
            </div>
          )}
        </div>
      )}
      
      {/* Tips for improving analytics */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          💡 Consejos para mejorar tus métricas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>Aumentar visitas:</strong>
            <ul className="mt-1 space-y-1 text-blue-700">
              <li>• Comparte tu código QR en redes sociales</li>
              <li>• Coloca códigos QR en mesas y entrada</li>
              <li>• Incluye el enlace en tu perfil de Instagram</li>
            </ul>
          </div>
          <div>
            <strong>Optimizar precios:</strong>
            <ul className="mt-1 space-y-1 text-blue-700">
              <li>• Revisa el precio promedio vs competencia</li>
              <li>• Considera ofertas para productos populares</li>
              <li>• Actualiza precios según temporada</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
