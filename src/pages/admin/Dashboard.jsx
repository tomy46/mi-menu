import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  CheckCircleIcon, 
  EyeIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  PhotoIcon,
  ShareIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { getRestaurant, getAllCategories, getItems, getActiveMenuByRestaurant, getViewStats, checkHasVisits } from '../../services/firestore.js'
import { migrateRestaurantsWithoutSlug } from '../../utils/migrateRestaurantSlugs.js'
import { verifyAndFixAllSlugs, verifyRestaurantById } from '../../utils/fixSlugs.js'
import { createSlugRegistrySimple } from '../../utils/createSlugRegistry.js'
import { normalizeSlug } from '../../utils/slugUtils.js'
import { useSnackbar } from '../../hooks/useSnackbar.js'
import Snackbar from '../../components/Snackbar.jsx'

export default function Dashboard() {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [hasVisits, setHasVisits] = useState(false)
  const [loading, setLoading] = useState(true)
  const [migrating, setMigrating] = useState(false)
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar()

  const loadData = async () => {
    try {
      // Load restaurant data
      const restaurantData = await getRestaurant(restaurantId)
      setRestaurant(restaurantData)
      
      // Load menu and categories
      const menu = await getActiveMenuByRestaurant(restaurantId)
      if (menu) {
        const [categoriesData, itemsData, viewStatsResult] = await Promise.all([
          getAllCategories(menu.id),
          getItems(restaurantId),
          checkHasVisits(restaurantId, menu.id) // Verificar visitas con función más robusta
        ])
        setCategories(categoriesData)
        setItems(itemsData)
        
        // Verificar si hay visitas
        if (viewStatsResult.success && (viewStatsResult.data.hasVisits || viewStatsResult.data.totalViews > 0)) {
          setHasVisits(true)
        } else {
          setHasVisits(false)
        }
      } else {
        setCategories([])
        setItems([])
        setHasVisits(false)
      }
    } catch (error) {
      // Error loading dashboard data
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
      title: 'Obtener tu primera visita',
      description: 'Comparte tu menú digital y recibe tus primeros clientes',
      completed: hasVisits,
      icon: ShareIcon,
      link: null, // No tiene link directo, se maneja con botones personalizados
      action: null // Se maneja con botones personalizados
    }
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const progress = (completedSteps / steps.length) * 100

  // Funciones para el cuarto paso
  const handleShareLink = () => {
    const publicUrl = `${window.location.origin}/r/${restaurantId}`
    navigator.clipboard.writeText(publicUrl).then(() => {
      showSuccess('¡Enlace copiado al portapapeles!')
    }).catch(() => {
      // Fallback: mostrar el enlace para copiar manualmente
      const copied = prompt('Copia este enlace:', publicUrl)
      if (copied) {
        showSuccess('Enlace listo para compartir')
      }
    })
  }

  const handleGenerateQR = () => {
    // Navegar a la página Menu y hacer scroll a la sección QR
    window.location.href = `/admin/${restaurantId}/menu#qr-section`
  }

  const handleMigrateSlugs = async () => {
    try {
      setMigrating(true)
      showSuccess('Iniciando migración de slugs...')
      
      const result = await migrateRestaurantsWithoutSlug()
      
      if (result.success) {
        if (result.migrated > 0) {
          showSuccess(`✅ Migración exitosa: ${result.migrated} restaurante(s) migrado(s)`)
          // Recargar datos del restaurante
          loadData()
        } else {
          showSuccess('✅ Todos los restaurantes ya tienen slug configurado')
        }
        
        if (result.errors && result.errors.length > 0) {
          // Errores en migración
          showError(`⚠️ Migrados: ${result.migrated}, Errores: ${result.errors.length}`)
        }
      } else {
        showError('❌ Error en la migración: ' + result.error)
      }
    } catch (error) {
      // Error ejecutando migración
      showError('❌ Error ejecutando migración')
    } finally {
      setMigrating(false)
    }
  }

  const handleVerifyAndFix = async () => {
    try {
      setMigrating(true)
      showSuccess('🔍 Verificando y corrigiendo slugs...')
      
      const result = await verifyAndFixAllSlugs()
      
      if (result.restaurantsFixed > 0 || result.registryCreated > 0) {
        showSuccess(`✅ Corregidos: ${result.restaurantsFixed} restaurantes, ${result.registryCreated} registros creados`)
        // Recargar datos
        loadData()
      } else {
        showSuccess('✅ Todo está correcto')
      }
      
      if (result.errors.length > 0) {
        showError(`⚠️ Se encontraron ${result.errors.length} errores. Ver consola.`)
      }
    } catch (error) {
      showError('❌ Error: ' + error.message)
    } finally {
      setMigrating(false)
    }
  }

  const handleVerifyThis = async () => {
    try {
      await verifyRestaurantById(restaurantId)
      showSuccess('✅ Verificación completa. Ver consola para detalles.')
    } catch (error) {
      showError('❌ Error: ' + error.message)
    }
  }

  const handleQuickFix = async () => {
    try {
      setMigrating(true)
      
      // Obtener el slug del restaurante
      const slug = restaurant?.slug || normalizeSlug(restaurant?.name || '')
      
      showSuccess('🚀 Creando slug_registry...')
      const result = await createSlugRegistrySimple(restaurantId, slug)
      
      if (result.success) {
        showSuccess(`✅ ¡Listo! Prueba ${window.location.origin}/${slug}`)
      } else {
        showError('❌ Error: ' + result.error)
      }
    } catch (error) {
      showError('❌ Error: ' + error.message)
    } finally {
      setMigrating(false)
    }
  }

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
                ) : step.id === 4 ? (
                  // Botones personalizados para el cuarto paso
                  restaurant?.isPublic ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={handleShareLink}
                        className="inline-flex items-center px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Compartir enlace
                      </button>
                      <button
                        onClick={handleGenerateQR}
                        className="inline-flex items-center px-4 py-2 border border-[#111827] bg-white text-[#111827] text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Generar QR
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                        Primero debes hacer tu menú público en Ajustes
                      </p>
                      <a
                        href={`/admin/${restaurantId}/ajustes`}
                        className="inline-flex items-center px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Ir a Ajustes
                      </a>
                    </div>
                  )
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


      {/* Snackbar */}
      <Snackbar
        isOpen={snackbar.isOpen}
        onClose={hideSnackbar}
        message={snackbar.message}
        type={snackbar.type}
        duration={snackbar.duration}
        position={snackbar.position}
        action={snackbar.action}
      />
    </div>
  )
}
