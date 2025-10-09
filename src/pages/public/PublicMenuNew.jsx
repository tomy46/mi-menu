import { useEffect } from 'react'
import { MenuProvider, useMenu } from '../../contexts/MenuContext.jsx'
import { DEFAULT_THEME } from '../../config/themes.js'
import MenuUnavailable from '../../components/MenuUnavailable.jsx'
import RusticoTheme from '../../components/themes/RusticoTheme.jsx'
import ModernTheme from '../../components/themes/ModernTheme.jsx'
import DefaultTheme from '../../components/themes/DefaultTheme.jsx'

// Componente interno que usa el contexto
function MenuContent() {
  const { restaurant, menu, loading } = useMenu()

  // Update favicon and title
  useEffect(() => {
    if (restaurant?.name) {
      document.title = `Menú - ${restaurant.name}`
      
      // Remove existing favicons
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]')
      existingFavicons.forEach(favicon => favicon.remove())
      
      if (restaurant.logo) {
        // Use restaurant logo as favicon
        const favicon = document.createElement('link')
        favicon.rel = 'icon'
        favicon.type = 'image/x-icon'
        favicon.href = restaurant.logo
        document.head.appendChild(favicon)
      } else {
        // Default favicon
        const defaultFavicon = document.createElement('link')
        defaultFavicon.rel = 'icon'
        defaultFavicon.type = 'image/x-icon'
        defaultFavicon.href = '/favicon.ico'
        document.head.appendChild(defaultFavicon)
      }
    }
  }, [restaurant?.logo, restaurant?.name])

  if (loading) return null

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🍽️</span>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Restaurante no encontrado</h2>
          <p className="text-gray-600">El enlace que seguiste no es válido</p>
        </div>
      </div>
    )
  }
  
  if (restaurant.isPublic === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🔒</span>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Menú privado</h2>
          <p className="text-gray-600">Este menú no está disponible públicamente</p>
        </div>
      </div>
    )
  }

  // Show unavailable message if no active menu found
  if (!menu) {
    return (
      <MenuUnavailable 
        theme={restaurant?.theme || DEFAULT_THEME}
        menuTitle={restaurant?.name ? `Menú de ${restaurant.name}` : 'Menú'}
        message="Este menú no está disponible en este momento. Por favor, inténtalo más tarde."
      />
    )
  }

  // Seleccionar el componente de tema apropiado
  const themeId = restaurant?.theme || DEFAULT_THEME
  
  switch (themeId) {
    case 'rustico':
      return <RusticoTheme />
    case 'modern':
      return <ModernTheme />
    case 'elegant':
    case 'cupido':
    case 'colombia':
    case 'classic':
    case 'fresh':
    default:
      return <DefaultTheme themeId={themeId} />
  }
}

// Componente principal que provee el contexto
export default function PublicMenuNew({ 
  restaurantId: propRestaurantId, 
  menuId: propMenuId, 
  restaurant: propRestaurant, 
  menu: propMenu 
}) {
  return (
    <MenuProvider
      restaurantId={propRestaurantId}
      menuId={propMenuId}
      restaurant={propRestaurant}
      menu={propMenu}
    >
      <MenuContent />
    </MenuProvider>
  )
}
