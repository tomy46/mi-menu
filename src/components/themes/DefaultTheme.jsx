import { useState, useRef, useEffect } from 'react'
import { useMenu } from '../../contexts/MenuContext.jsx'
import { getTheme, getGoogleFontsUrl } from '../../config/themes.js'
import { DietaryRestrictionsDisplay } from '../DietaryRestrictionsSelector.jsx'

export default function DefaultTheme({ themeId }) {
  const { restaurant, menu, categories, itemsByCat, loading, tableNumber } = useMenu()
  const theme = getTheme(themeId)
  const googleFontsUrl = getGoogleFontsUrl(themeId)

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
    
    const isCupido = themeId === 'cupido'
    const isColombia = themeId === 'colombia'
    
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: theme.colors.primary }}></div>
          <p style={{ color: theme.colors.text.secondary, fontFamily: theme.fonts.secondary }}>Cargando menú...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Load Google Fonts */}
      <link href={googleFontsUrl} rel="stylesheet" />
      
      <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
        {/* Header with restaurant info */}
        <header 
          className="relative overflow-hidden transition-all duration-500 ease-in-out flex items-center justify-center" 
          style={{ 
            backgroundColor: themeId === 'cupido' ? theme.colors.surface : theme.colors.background,
            minHeight: themeId === 'cupido' ? '90vh' : 'auto'
          }}
        >
          <div className="relative max-w-4xl mx-auto px-6 py-6">
            <div className={themeId === 'cupido' ? 'text-center' : 'text-left'}>
              {/* Logo */}
              {restaurant?.logo && (
                <div className={`mb-4 ${themeId === 'cupido' ? 'flex justify-center' : ''}`}>
                  <img
                    src={restaurant.logo}
                    alt={`Logo de ${restaurant.name}`}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow-lg transition-all duration-500 ease-in-out"
                    style={{
                      border: `2px solid ${themeId === 'cupido' ? theme.colors.text.white : theme.colors.primary}`
                    }}
                  />
                </div>
              )}
              
              <div 
                className="text-4xl md:text-5xl font-bold mb-3 transition-all duration-700 ease-out"
                style={{ 
                  color: themeId === 'cupido' ? theme.colors.text.white : theme.colors.text.primary, 
                  fontFamily: theme.fonts.primary
                }}
              >
                {restaurant?.name}
              </div>
              
              {/* Descripción del menú */}
              {menu?.description && (
                <div 
                  className="text-lg mb-4 transition-all duration-500 ease-in-out"
                  style={{ 
                    color: themeId === 'cupido' ? theme.colors.text.white : theme.colors.text.primary, 
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
                    color: themeId === 'cupido' ? theme.colors.text.white : theme.colors.text.primary,
                    backgroundColor: themeId === 'cupido' ? 'rgba(255,255,255,0.2)' : theme.colors.primary + '20',
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
        <main className={`max-w-4xl mx-auto px-6 ${themeId === 'cupido' ? 'py-16' : 'py-4'}`}>
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
              <section key={category.id} className={`${themeId === 'cupido' ? 'mb-12' : 'mb-6'}`}>
                {/* Category Header */}
                <div className={`mb-6 ${themeId === 'cupido' || themeId === 'colombia' ? 'text-center' : ''}`}>
                  <h2 
                    className={`text-2xl md:text-3xl font-bold transition-all duration-500 ease-in-out ${themeId === 'colombia' ? 'italic' : ''}`}
                    style={{ 
                      color: theme.colors.text.primary, 
                      fontFamily: theme.fonts.primary,
                      letterSpacing: themeId === 'cupido' ? '0.05em' : 'normal'
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
                <div className={`${themeId === 'cupido' ? 'space-y-6' : 'space-y-3'}`}>
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
            backgroundColor: themeId === 'cupido' ? theme.colors.surface : theme.colors.background, 
            borderColor: theme.colors.border 
          }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <span 
                className="text-lg font-semibold transition-all duration-300 ease-in-out"
                style={{ 
                  color: themeId === 'cupido' ? theme.colors.text.white : theme.colors.text.primary, 
                  fontFamily: theme.fonts.primary,
                  letterSpacing: themeId === 'cupido' ? '0.05em' : 'normal'
                }}
              >
                {restaurant?.name}
              </span>
            </div>
            
            {/* Información del restaurante */}
            <div className="space-y-2 mb-4">
              {restaurant?.address && (
                <div 
                  className="text-sm transition-all duration-500 ease-in-out"
                  style={{ 
                    color: themeId === 'cupido' ? theme.colors.text.white : theme.colors.text.primary, 
                    fontFamily: theme.fonts.secondary,
                    opacity: 0.9
                  }}
                >
                  📍 {restaurant.address}
                </div>
              )}
              
              {restaurant?.phone && (
                <div 
                  className="text-sm transition-all duration-500 ease-in-out"
                  style={{ 
                    color: themeId === 'cupido' ? theme.colors.text.white : theme.colors.text.primary, 
                    fontFamily: theme.fonts.secondary,
                    opacity: 0.9
                  }}
                >
                  📞 {restaurant.phone}
                </div>
              )}
              
              {restaurant?.hours && (
                <div 
                  className="text-sm transition-all duration-500 ease-in-out"
                  style={{ 
                    color: themeId === 'cupido' ? theme.colors.text.white : theme.colors.text.primary, 
                    fontFamily: theme.fonts.secondary,
                    opacity: 0.9
                  }}
                >
                  🕒 {restaurant.hours}
                </div>
              )}
            </div>
            
            {/* Social Media Links */}
            {restaurant?.socialMedia && restaurant.socialMedia.some(social => social.title && social.url) && (
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
                        color: themeId === 'cupido' ? theme.colors.text.white : theme.colors.text.primary, 
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
