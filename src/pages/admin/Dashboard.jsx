import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  EyeIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  PaintBrushIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { getRestaurant, getCategories, getItems } from '../../services/firestore.js'

export default function Dashboard() {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [restaurantData, categoriesData, itemsData] = await Promise.all([
          getRestaurant(restaurantId),
          getCategories(restaurantId),
          getItems(restaurantId)
        ])
        
        setRestaurant(restaurantData)
        setCategories(categoriesData)
        setItems(itemsData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (restaurantId) {
      loadData()
    }
  }, [restaurantId])

  const steps = [
    {
      id: 1,
      title: 'Configurar información básica',
      description: 'Completa los datos de tu restaurante',
      completed: restaurant?.name && restaurant?.phone,
      icon: CheckCircleIcon,
      link: `/admin/${restaurantId}/ajustes`
    },
    {
      id: 2,
      title: 'Crear categorías',
      description: 'Organiza tu menú en categorías',
      completed: categories.length > 0,
      icon: Squares2X2Icon,
      link: `/admin/${restaurantId}/productos`
    },
    {
      id: 3,
      title: 'Agregar productos',
      description: 'Añade los platos de tu menú',
      completed: items.length > 0,
      icon: ShoppingBagIcon,
      link: `/admin/${restaurantId}/productos`
    },
    {
      id: 4,
      title: 'Personalizar tema',
      description: 'Elige el diseño de tu menú público',
      completed: restaurant?.theme && restaurant.theme !== 'elegant',
      icon: PaintBrushIcon,
      link: `/admin/${restaurantId}/menu`
    },
    {
      id: 5,
      title: 'Publicar menú',
      description: 'Haz tu menú visible para los clientes',
      completed: restaurant?.isPublic,
      icon: EyeIcon,
      link: `/r/${restaurantId}`
    }
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const progress = (completedSteps / steps.length) * 100

  const stats = [
    {
      name: 'Categorías',
      value: categories.length,
      icon: Squares2X2Icon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Productos',
      value: items.length,
      icon: ShoppingBagIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Productos activos',
      value: items.filter(item => item.available !== false).length,
      icon: ArrowTrendingUpIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Progreso',
      value: `${Math.round(progress)}%`,
      icon: ChartBarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Bienvenido a {restaurant?.name || 'tu restaurante'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Gestiona tu menú digital y haz crecer tu negocio
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Progreso de configuración</h2>
          <span className="text-sm text-gray-500">{completedSteps} de {steps.length} completados</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-[#111827] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <a
              key={step.id}
              href={step.link}
              className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <step.icon className={`w-4 h-4 ${
                  step.completed ? 'text-green-600' : 'text-gray-500'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900">{step.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                {step.completed && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-2">
                    <CheckCircleIcon className="w-3 h-3" />
                    Completado
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a
            href={`/admin/${restaurantId}/productos`}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
          >
            <ShoppingBagIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Gestionar productos</span>
          </a>
          
          <a
            href={`/admin/${restaurantId}/menu`}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
          >
            <PaintBrushIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Personalizar diseño</span>
          </a>
          
          <a
            href={`/r/${restaurantId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
          >
            <EyeIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Ver menú público</span>
          </a>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">💡 Consejos para el éxito</h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Mantén tus precios actualizados regularmente</li>
          <li>• Usa descripciones atractivas para tus platos</li>
          <li>• Organiza tu menú en categorías claras</li>
          <li>• Marca los platos vegetarianos, veganos y sin gluten</li>
          <li>• Comparte el enlace de tu menú en redes sociales</li>
        </ul>
      </div>
    </div>
  )
}
