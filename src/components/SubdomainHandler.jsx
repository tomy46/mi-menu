import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRestaurantBySlug } from '../services/firestore.js'

export default function SubdomainHandler({ children }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [handled, setHandled] = useState(false)

  useEffect(() => {
    async function handleSubdomain() {
      const hostname = window.location.hostname
      
      // Check if it's the specific heladeria site
      if (hostname === 'heladeria-pistacho.web.app') {
        try {
          const restaurant = await getRestaurantBySlug('heladeria-pistacho')
          if (restaurant) {
            // Redirect to public menu
            navigate(`/r/${restaurant.id}`, { replace: true })
            setHandled(true)
          } else {
            // Restaurant not found, show 404 or redirect to main
            navigate('/', { replace: true })
            setHandled(true)
          }
        } catch (error) {
          console.error('Error handling subdomain:', error)
          navigate('/', { replace: true })
          setHandled(true)
        }
        setLoading(false)
        return
      }
      
      // Handle other subdomains (future implementation)
      const parts = hostname.split('.')
      const isSubdomain = parts.length > 2 && parts[0] !== 'www'
      
      if (isSubdomain) {
        const slug = parts[0]
        
        // Don't handle if it's the main domain
        if (slug === 'mi-menu-komin') {
          setLoading(false)
          setHandled(true)
          return
        }
        
        try {
          const restaurant = await getRestaurantBySlug(slug)
          if (restaurant) {
            // Redirect to public menu
            navigate(`/r/${restaurant.id}`, { replace: true })
            setHandled(true)
          } else {
            // Restaurant not found, show 404 or redirect to main
            navigate('/', { replace: true })
            setHandled(true)
          }
        } catch (error) {
          console.error('Error handling subdomain:', error)
          navigate('/', { replace: true })
          setHandled(true)
        }
      } else {
        setHandled(true)
      }
      
      setLoading(false)
    }

    handleSubdomain()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return handled ? children : null
}
