import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getActiveMenuByRestaurant, getCategories, getItemsByCategory, getRestaurant, trackEvent } from '../../services/firestore.js'
import { getTheme, getGoogleFontsUrl, getCategoryIcon, DEFAULT_THEME } from '../../config/themes.js'
import { ANALYTICS_EVENTS, generateDeviceFingerprint, isUniqueVisit } from '../../config/analytics.js'
import MenuUnavailable from '../../components/MenuUnavailable.jsx'
import { DietaryRestrictionsDisplay } from '../../components/DietaryRestrictionsSelector.jsx'

export default function PublicMenu() {
  const { restaurantId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const tableNumber = searchParams.get('mesa') // Obtener número de mesa de la URL
  const languageParam = searchParams.get('lang') // Obtener idioma de la URL
  const [restaurant, setRestaurant] = useState(null)
  const [currentLanguage, setCurrentLanguage] = useState('es') // Idioma por defecto
  const [menu, setMenu] = useState(null)
  const [categories, setCategories] = useState([])
  const [itemsByCat, setItemsByCat] = useState({})
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const hasTrackedView = useRef(false) // Para evitar tracking duplicado
  
  // Manejar idioma desde URL o localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem(`menu-language-${restaurantId}`)
    
    if (languageParam) {
      // Idioma desde URL tiene prioridad
      setCurrentLanguage(languageParam)
      localStorage.setItem(`menu-language-${restaurantId}`, languageParam)
    } else if (savedLanguage) {
      // Usar idioma guardado
      setCurrentLanguage(savedLanguage)
    }
  }, [languageParam, restaurantId])
  
  // Función para cambiar idioma
  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage)
    localStorage.setItem(`menu-language-${restaurantId}`, newLanguage)
    
    // Actualizar URL sin recargar la página
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('lang', newLanguage)
    setSearchParams(newSearchParams, { replace: true })
  }
  
  // Get theme configuration
  const theme = getTheme(restaurant?.theme || DEFAULT_THEME)
  const googleFontsUrl = getGoogleFontsUrl(restaurant?.theme || DEFAULT_THEME)
  
  // Fade-in animation hook
  const useFadeInOnScroll = () => {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef()
    
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        },
        {
          threshold: 0.1,
          rootMargin: '50px'
        }
      )
      
      if (ref.current) {
        observer.observe(ref.current)
      }
      
      return () => {
        if (ref.current) {
          observer.unobserve(ref.current)
        }
      }
    }, [])
    
    return [ref, isVisible]
  }
  
  // Component for individual menu item with fade-in
  const MenuItem = ({ item, index }) => {
    const [ref, isVisible] = useFadeInOnScroll()
    
    const isCupido = theme.id === 'cupido'
    const isColombia = theme.id === 'colombia'
    
    return (
      <div 
        ref={ref}
        className={`group relative transition-all duration-700 ease-out ${
          isCupido ? 'text-center' : ''
        } ${isColombia ? 'md:mx-8' : ''}`}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transitionDelay: `${index * 100}ms`,
          padding: '0',
          backgroundColor: 'transparent'
        }}
      >
        {isColombia ? (
          // Layout para tema Colombia
          <div className="block">
            {/* Título y precio en la misma fila */}
            <div className="flex items-baseline justify-between mb-1">
              <h3 
                className="text-lg font-semibold transition-all duration-300 ease-in-out"
                style={{ 
                  color: theme.colors.text.primary, 
                  fontFamily: theme.fonts.secondary,
                  fontWeight: 600,
                  letterSpacing: 'normal'
                }}
              >
                {item.name.toUpperCase()}
              </h3>
              
              <span 
                className="text-lg transition-all duration-300 ease-in-out"
                style={{ 
                  color: theme.colors.text.primary, 
                  fontFamily: theme.fonts.secondary,
                  fontWeight: 400
                }}
              >
                {new Intl.NumberFormat('es-AR', { 
                  style: 'currency', 
                  currency: item.currency || 'ARS' 
                }).format(item.price || 0)}
              </span>
            </div>
            
            {/* Descripción */}
            {item.description && (
              <p 
                className="text-sm leading-relaxed transition-all duration-300 ease-in-out mb-2"
                style={{ 
                  color: theme.colors.text.muted, 
                  fontFamily: theme.fonts.secondary,
                  opacity: 0.9
                }}
              >
                {item.description}
              </p>
            )}
            
            {/* Restricciones Alimenticias */}
            {item.dietaryRestrictions && item.dietaryRestrictions.length > 0 && (
              <DietaryRestrictionsDisplay 
                restrictions={item.dietaryRestrictions} 
                className="mt-2"
              />
            )}
          </div>
        ) : (
          // Layout original para otros temas
          <div className={isCupido ? 'block' : 'flex items-start gap-4'}>
            <div className="flex-1">
              {/* Product name and price on same line */}
              <div className={`flex items-baseline gap-2 mb-1 ${isCupido ? 'justify-center' : ''}`}>
                <h3 
                  className="text-lg font-semibold transition-all duration-300 ease-in-out"
                  style={{ 
                    color: theme.colors.text.primary, 
                    fontFamily: theme.fonts.secondary,
                    fontWeight: 600,
                    letterSpacing: isCupido ? '0.02em' : 'normal'
                  }}
                >
                  {item.name}
                </h3>
                <span 
                  className="text-lg font-semibold transition-all duration-300 ease-in-out"
                  style={{ 
                    color: theme.colors.text.primary, 
                    fontFamily: theme.fonts.secondary,
                    fontWeight: 600
                  }}
                >
                  {isCupido ? '-' : '/'}
                </span>
                <span 
                  className="text-lg font-semibold transition-all duration-300 ease-in-out"
                  style={{ 
                    color: theme.colors.text.primary, 
                    fontFamily: theme.fonts.secondary,
                    fontWeight: isCupido ? 500 : 600
                  }}
                >
                  {new Intl.NumberFormat('es-AR', { 
                    style: 'currency', 
                    currency: item.currency || 'ARS' 
                  }).format(item.price || 0)}
                </span>
              </div>
              
              {item.description && (
                <p 
                  className="text-sm leading-relaxed transition-all duration-300 ease-in-out mb-2"
                  style={{ 
                    color: theme.colors.text.muted, 
                    fontFamily: theme.fonts.secondary,
                    opacity: 0.8
                  }}
                >
                  {item.description}
                </p>
              )}
              
              {/* Restricciones Alimenticias */}
              {item.dietaryRestrictions && item.dietaryRestrictions.length > 0 && (
                <DietaryRestrictionsDisplay 
                  restrictions={item.dietaryRestrictions} 
                  className="mt-2"
                />
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  useEffect(() => {
    let active = true
    hasTrackedView.current = false // Reset tracking flag para nuevo restaurante
    async function load() {
      setLoading(true)
      try {
        const r = await getRestaurant(restaurantId)
        if (!r) {
          if (active) setRestaurant(null)
          return
        }
        if (active) setRestaurant(r)
        if (r.isPublic === false) {
          if (active) setLoading(false)
          return
        }
        const m = await getActiveMenuByRestaurant(restaurantId)
        if (active) setMenu(m)
        if (m) {
          // Track menu view event solo una vez por sesión
          if (!hasTrackedView.current) {
            hasTrackedView.current = true
            const deviceId = generateDeviceFingerprint()
            const isUnique = isUniqueVisit(restaurantId)
            const sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            
            // Obtener idioma actual (con fallback a español)
            const trackingLanguage = currentLanguage || 'es'
            
            console.log('Tracking event with data:', {
              type: ANALYTICS_EVENTS.MENU_VIEW,
              restaurantId: restaurantId,
              menuId: m.id,
              tableNumber: tableNumber,
              language: trackingLanguage
            })
            
            // Preparar datos del evento
            const eventData = {
              type: ANALYTICS_EVENTS.MENU_VIEW,
              restaurantId: restaurantId,
              menuId: m.id,
              userAgent: navigator.userAgent,
              deviceId: deviceId,
              isUniqueVisit: isUnique,
              timestamp: new Date().toISOString(),
              sessionId: sessionId,
              language: trackingLanguage
            }
            
            // Solo agregar tableNumber si existe
            if (tableNumber) {
              eventData.tableNumber = tableNumber
            }
            
            // Track visita general (siempre)
            trackEvent(eventData).catch(error => {
              console.error('Analytics tracking failed:', error)
              console.error('Event data that failed:', eventData)
            })
            
            // Track visita única (solo si es primera vez del dispositivo)
            if (isUnique) {
              console.log('Tracking unique visit with data:', {
                type: ANALYTICS_EVENTS.UNIQUE_VISIT,
                restaurantId: restaurantId,
                menuId: m.id,
                tableNumber: tableNumber,
                language: trackingLanguage
              })
              
              // Preparar datos del evento único
              const uniqueEventData = {
                type: ANALYTICS_EVENTS.UNIQUE_VISIT,
                restaurantId: restaurantId,
                menuId: m.id,
                userAgent: navigator.userAgent,
                deviceId: deviceId,
                timestamp: new Date().toISOString(),
                sessionId: sessionId,
                language: trackingLanguage
              }
              
              // Solo agregar tableNumber si existe
              if (tableNumber) {
                uniqueEventData.tableNumber = tableNumber
              }
              
              trackEvent(uniqueEventData).catch(error => {
                console.error('Unique visit tracking failed:', error)
                console.error('Unique event data that failed:', uniqueEventData)
              })
            }
          }
          
          // Cargar categorías e items siempre que haya menú
          const cats = await getCategories(m.id)
          if (active) setCategories(cats)
          const itemsMap = {}
          for (const c of cats) {
            itemsMap[c.id] = await getItemsByCategory(c.id, { onlyAvailable: true })
          }
          if (active) setItemsByCat(itemsMap)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [restaurantId])

  // Update favicon when restaurant logo changes
  useEffect(() => {
    if (restaurant?.logo) {
      // Create a new favicon link element
      const favicon = document.createElement('link')
      favicon.rel = 'icon'
      favicon.type = 'image/x-icon'
      favicon.href = restaurant.logo
      
      // Remove existing favicon
      const existingFavicon = document.querySelector('link[rel="icon"]')
      if (existingFavicon) {
        document.head.removeChild(existingFavicon)
      }
      
      // Add new favicon
      document.head.appendChild(favicon)
      
      // Also update the title to include restaurant name
      document.title = `${restaurant.name} - Menú Digital`
    } else {
      // Use default favicon if no logo
      document.title = `${restaurant?.name || 'Restaurante'} - Menú Digital`
    }
    
    // Cleanup function to restore default favicon when component unmounts
    return () => {
      const favicon = document.querySelector('link[rel="icon"]')
      if (favicon && restaurant?.logo) {
        document.head.removeChild(favicon)
        // Restore default favicon
        const defaultFavicon = document.createElement('link')
        defaultFavicon.rel = 'icon'
        defaultFavicon.type = 'image/svg+xml'
        defaultFavicon.href = '/vite.svg'
        document.head.appendChild(defaultFavicon)
      }
    }
  }, [restaurant?.logo, restaurant?.name])

  const filtered = useMemo(() => {
    if (!q) return itemsByCat
    const term = q.toLowerCase()
    const out = {}
    for (const [cid, items] of Object.entries(itemsByCat)) {
      out[cid] = items.filter((it) =>
        it.name.toLowerCase().includes(term) || (it.description || '').toLowerCase().includes(term)
      )
    }
    return out
  }, [itemsByCat, q])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: theme.colors.primary }}></div>
        <p style={{ color: theme.colors.text.secondary, fontFamily: theme.fonts.secondary }}>Cargando menú...</p>
      </div>
    </div>
  )
  
  if (!restaurant) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
      <div className="text-center">
        <span className="text-6xl mb-4 block">🍽️</span>
        <h2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text.primary, fontFamily: theme.fonts.primary }}>Restaurante no encontrado</h2>
        <p style={{ color: theme.colors.text.secondary, fontFamily: theme.fonts.secondary }}>El enlace que seguiste no es válido</p>
      </div>
    </div>
  )
  
  if (restaurant.isPublic === false) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
      <div className="text-center">
        <span className="text-6xl mb-4 block">🔒</span>
        <h2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text.primary, fontFamily: theme.fonts.primary }}>Menú privado</h2>
        <p style={{ color: theme.colors.text.secondary, fontFamily: theme.fonts.secondary }}>Este menú no está disponible públicamente</p>
      </div>
    </div>
  )

  // Show unavailable message if no active menu found
  if (!menu) return (
    <MenuUnavailable 
      theme={restaurant?.theme || DEFAULT_THEME}
      menuTitle={restaurant?.name ? `Menú de ${restaurant.name}` : 'Menú'}
      message="Este menú no está disponible en este momento. Por favor, inténtalo más tarde."
    />
  )

  return (
    <>
      {/* Load Google Fonts */}
      <link href={googleFontsUrl} rel="stylesheet" />
      
      <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
        {/* Header with restaurant info */}
        <header 
          className="relative overflow-hidden transition-all duration-500 ease-in-out flex items-center justify-center" 
          style={{ 
            backgroundColor: restaurant?.theme === 'cupido' ? theme.colors.surface : theme.colors.background,
            minHeight: restaurant?.theme === 'cupido' ? '90vh' : 'auto'
          }}
        >
          <div className="relative max-w-4xl mx-auto px-6 py-6">
            <div className={restaurant?.theme === 'cupido' ? 'text-center' : 'text-left'}>
              {/* Logo */}
              {restaurant.logo && (
                <div className={`mb-4 ${restaurant?.theme === 'cupido' ? 'flex justify-center' : ''}`}>
                  <img
                    src={restaurant.logo}
                    alt={`Logo de ${restaurant.name}`}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow-lg transition-all duration-500 ease-in-out"
                    style={{
                      border: `2px solid ${restaurant?.theme === 'cupido' ? theme.colors.text.white : theme.colors.primary}`
                    }}
                  />
                </div>
              )}
              
              <div 
                className="text-4xl md:text-5xl font-bold mb-3 transition-all duration-700 ease-out"
                style={{ 
                  color: restaurant?.theme === 'cupido' ? theme.colors.text.white : theme.colors.text.primary, 
                  fontFamily: theme.fonts.primary
                }}
              >
                {restaurant.name}
              </div>
              
              {/* Descripción del menú */}
              {menu?.description && (
                <div 
                  className="text-lg mb-4 transition-all duration-500 ease-in-out"
                  style={{ 
                    color: restaurant?.theme === 'cupido' ? theme.colors.text.white : theme.colors.text.primary, 
                    fontFamily: theme.fonts.secondary,
                    opacity: 0.9
                  }}
                >
                  {menu.description}
                </div>
              )}
              
              {/* Número de mesa si está presente */}
              {tableNumber && (
                <div 
                  className="text-lg font-medium mb-2 px-3 py-1 rounded-full inline-block"
                  style={{ 
                    color: restaurant?.theme === 'cupido' ? theme.colors.text.white : theme.colors.text.primary,
                    backgroundColor: restaurant?.theme === 'cupido' ? 'rgba(255,255,255,0.2)' : theme.colors.primary + '20',
                    fontFamily: theme.fonts.secondary
                  }}
                >
                  Mesa {tableNumber}
                </div>
              )}
            </div>
          </div>
        </header>


        {/* Menu Content */}
        <main className={`max-w-4xl mx-auto px-6 ${restaurant?.theme === 'cupido' ? 'py-16' : 'py-4'}`}>
          {categories.length === 0 && (
            <div className="text-center py-16">
              <span className="text-6xl mb-6 block">📋</span>
              <h3 className="text-2xl font-semibold mb-4" style={{ color: theme.colors.text.primary, fontFamily: theme.fonts.primary }}>
                Menú en preparación
              </h3>
              <p style={{ color: theme.colors.text.primary, fontFamily: theme.fonts.secondary }}>
                Estamos preparando nuestro delicioso menú. ¡Vuelve pronto!
              </p>
            </div>
          )}

          {categories.map((category, categoryIndex) => {
            const categoryItems = (itemsByCat[category.id] || []).filter(item => item.available !== false)
            
            if (categoryItems.length === 0) return null

            return (
              <section key={category.id} className={`${restaurant?.theme === 'cupido' ? 'mb-12' : 'mb-6'}`}>
                {/* Category Header */}
                <div className={`mb-6 ${restaurant?.theme === 'cupido' || restaurant?.theme === 'colombia' ? 'text-center' : ''}`}>
                  <h2 
                    className={`text-2xl md:text-3xl font-bold transition-all duration-500 ease-in-out ${restaurant?.theme === 'colombia' ? 'italic' : ''}`}
                    style={{ 
                      color: theme.colors.text.primary, 
                      fontFamily: theme.fonts.primary,
                      letterSpacing: restaurant?.theme === 'cupido' ? '0.05em' : 'normal'
                    }}
                  >
                    {category.name.toUpperCase()}
                  </h2>
                  {category.description && (
                    <p 
                      className="text-sm mt-2 transition-all duration-300 ease-in-out" 
                      style={{ 
                        color: theme.colors.text.muted, 
                        fontFamily: theme.fonts.secondary
                      }}
                    >
                      {category.description}
                    </p>
                  )}
                </div>
                
                {/* Items List */}
                <div className={`${restaurant?.theme === 'cupido' ? 'space-y-6' : 'space-y-3'}`}>
                  {categoryItems.map((item, itemIndex) => (
                    <MenuItem 
                      key={item.id} 
                      item={item} 
                      index={itemIndex}
                    />
                  ))}
                </div>
              </section>
            )
          })}

        </main>

        {/* Footer */}
        <footer 
          className="border-t mt-8 py-6 transition-all duration-500 ease-in-out" 
          style={{ 
            backgroundColor: restaurant?.theme === 'cupido' ? theme.colors.surface : theme.colors.background, 
            borderColor: theme.colors.border 
          }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <span 
                className="text-lg font-semibold transition-all duration-300 ease-in-out"
                style={{ 
                  color: restaurant?.theme === 'cupido' ? theme.colors.text.white : theme.colors.text.primary, 
                  fontFamily: theme.fonts.primary,
                  letterSpacing: restaurant?.theme === 'cupido' ? '0.05em' : 'normal'
                }}
              >
                {restaurant.name}
              </span>
            </div>
            
            {/* Información del restaurante */}
            <div className="space-y-2 mb-4">
              {restaurant.address && (
                <div 
                  className="text-sm transition-all duration-500 ease-in-out"
                  style={{ 
                    color: restaurant?.theme === 'cupido' ? theme.colors.text.white : theme.colors.text.primary, 
                    fontFamily: theme.fonts.secondary,
                    opacity: 0.9
                  }}
                >
                  📍 {restaurant.address}
                </div>
              )}
              
              {restaurant.phone && (
                <div 
                  className="text-sm transition-all duration-500 ease-in-out"
                  style={{ 
                    color: restaurant?.theme === 'cupido' ? theme.colors.text.white : theme.colors.text.primary, 
                    fontFamily: theme.fonts.secondary,
                    opacity: 0.9
                  }}
                >
                  📞 {restaurant.phone}
                </div>
              )}
              
              {restaurant.hours && (
                <div 
                  className="text-sm transition-all duration-500 ease-in-out"
                  style={{ 
                    color: restaurant?.theme === 'cupido' ? theme.colors.text.white : theme.colors.text.primary, 
                    fontFamily: theme.fonts.secondary,
                    opacity: 0.9
                  }}
                >
                  🕒 {restaurant.hours}
                </div>
              )}
            </div>
            
            {/* Social Media Links */}
            {restaurant.socialMedia && restaurant.socialMedia.some(social => social.title && social.url) && (
              <div className="flex justify-center gap-6 mb-4">
                {restaurant.socialMedia
                  .filter(social => social.title && social.url)
                  .map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline hover:no-underline transition-all duration-300 ease-in-out hover:transform hover:scale-110"
                      style={{ 
                        color: restaurant?.theme === 'cupido' ? theme.colors.text.white : theme.colors.text.primary, 
                        fontFamily: theme.fonts.secondary
                      }}
                    >
                      {social.title}
                    </a>
                  ))}
              </div>
            )}
          </div>
        </footer>
      </div>
    </>
  )
}
