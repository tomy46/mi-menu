import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { getRestaurantBySlug, getMenuBySlug } from '../services/firestore'
import { normalizeSlug, canonicalizeSlug } from '../utils/slugUtils'

/**
 * Componente que maneja el enrutamiento basado en slugs
 * Resuelve slugs a IDs y redirige a URLs canónicas si es necesario
 */
function SlugRouter({ children }) {
  const { restaurantSlug, menuSlug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState(null)
  const [menu, setMenu] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function resolveSlug() {
      try {
        setLoading(true)
        setError(null)

        if (!restaurantSlug) {
          setError('Slug de restaurante requerido')
          return
        }

        // Normalizar el slug de entrada
        const normalizedRestaurantSlug = normalizeSlug(restaurantSlug)
        
        // Verificar si necesita redirección canónica
        if (restaurantSlug !== normalizedRestaurantSlug) {
          const canonicalPath = menuSlug 
            ? `/${normalizedRestaurantSlug}/${normalizeSlug(menuSlug)}`
            : `/${normalizedRestaurantSlug}`
          
          // Preservar query parameters
          const search = location.search
          navigate(canonicalPath + search, { replace: true })
          return
        }

        // Resolver restaurante por slug
        const restaurantData = await getRestaurantBySlug(restaurantSlug)
        if (!restaurantData) {
          setError('Restaurante no encontrado')
          return
        }

        setRestaurant(restaurantData)

        // Si hay slug de menú, resolverlo también
        if (menuSlug) {
          const normalizedMenuSlug = normalizeSlug(menuSlug)
          
          // Verificar redirección canónica del menú
          if (menuSlug !== normalizedMenuSlug) {
            const canonicalPath = `/${restaurantSlug}/${normalizedMenuSlug}`
            const search = location.search
            navigate(canonicalPath + search, { replace: true })
            return
          }

          const menuData = await getMenuBySlug(restaurantData.id, menuSlug)
          if (!menuData) {
            setError('Menú no encontrado')
            return
          }

          setMenu(menuData)
        }

      } catch (err) {
        console.error('Error resolving slug:', err)
        setError('Error al cargar el contenido')
      } finally {
        setLoading(false)
      }
    }

    resolveSlug()
  }, [restaurantSlug, menuSlug, location.search, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'Restaurante no encontrado' ? '404' : 'Error'}
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#111827] text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    )
  }

  // Pasar datos resueltos a los componentes hijos
  return children({ restaurant, menu })
}

export default SlugRouter
