import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  CheckCircleIcon, 
  EyeIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  PhotoIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import { getRestaurant, getCategories, getItems, getActiveMenuByRestaurant } from '../../services/firestore.js'

export default function Dashboard() {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      // Load restaurant data
      const restaurantData = await getRestaurant(restaurantId)
      setRestaurant(restaurantData)
      
      // Load menu and categories
      const menu = await getActiveMenuByRestaurant(restaurantId)
      if (menu) {
        const [categoriesData, itemsData] = await Promise.all([
          getCategories(menu.id),
          getItems(restaurantId)
        ])
        setCategories(categoriesData)
        setItems(itemsData)
      } else {
        setCategories([])
        setItems([])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (restaurantId) {
      loadData()
    }
  }, [restaurantId])

  // Add event listener for storage changes to detect updates from other tabs/pages
  useEffect(() => {
    const handleStorageChange = () => {
      // Reload data when localStorage changes (indicating updates from other pages)
      loadData()
    }

    // Listen for custom events that indicate data changes
    const handleDataUpdate = () => {
      loadData()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('dashboardUpdate', handleDataUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('dashboardUpdate', handleDataUpdate)
    }
  }, [restaurantId])

  const steps = [
    {
      id: 1,
      title: 'Crear 1 categoría',
      description: 'Organiza tu menú con al menos una categoría',
      completed: categories.length > 0,
      icon: Squares2X2Icon,
      link: `/admin/${restaurantId}/productos`,
      action: 'Crear categoría'
    },
    {
      id: 2,
      title: 'Crear 1 producto',
      description: 'Añade tu primer plato al menú',
      completed: items.length > 0,
      icon: ShoppingBagIcon,
      link: `/admin/${restaurantId}/productos`,
      action: 'Crear producto'
    },
    {
      id: 3,
      title: 'Subir logo',
      description: 'Personaliza tu menú con el logo de tu restaurante (opcional)',
      completed: restaurant?.logo,
      icon: PhotoIcon,
      link: `/admin/${restaurantId}/ajustes`,
      action: 'Subir logo',
      optional: true
    },
    {
      id: 4,
      title: 'Compartir menú',
      description: 'Haz tu menú público y compártelo con tus clientes',
      completed: restaurant?.isPublic,
      icon: ShareIcon,
      link: `/r/${restaurantId}`,
      action: 'Ver menú público'
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
      name: 'Progreso',
      value: `${Math.round(progress)}%`,
      icon: CheckCircleIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
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
          Configura tu menú digital en 4 pasos simples
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

        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-start gap-4 p-6 rounded-lg border border-gray-200 bg-white"
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                step.completed ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <step.icon className={`w-6 h-6 ${
                  step.completed ? 'text-green-600' : 'text-gray-500'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  {step.optional && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Opcional
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                
                {step.completed ? (
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Completado</span>
                  </div>
                ) : (
                  <a
                    href={step.link}
                    className="inline-flex items-center px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {step.action}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
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

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">💡 Consejos para empezar</h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>Categoría:</strong> Empieza con "Platos Principales" o "Especialidades"</li>
          <li>• <strong>Producto:</strong> Añade tu plato más popular con precio y descripción</li>
          <li>• <strong>Logo:</strong> Usa una imagen cuadrada de buena calidad (opcional)</li>
          <li>• <strong>Compartir:</strong> Una vez público, comparte el enlace en redes sociales</li>
        </ul>
      </div>
    </div>
  )
}
