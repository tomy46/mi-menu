import { useMenu } from '../../contexts/MenuContext.jsx'
import { getTheme, getGoogleFontsUrl } from '../../config/themes.js'
import { DietaryRestrictionsDisplay } from '../DietaryRestrictionsSelector.jsx'

export default function ModernTheme() {
  const { restaurant, menu, categories, itemsByCat, loading, tableNumber } = useMenu()
  const theme = getTheme('modern')
  const googleFontsUrl = getGoogleFontsUrl('modern')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: theme.colors.primary }}></div>
          <p style={{ color: theme.colors.text.secondary, fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif' }}>Cargando menú...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Load Google Fonts for Modern Theme */}
      <link href={googleFontsUrl} rel="stylesheet" />
      
      {/* Ensure Epilogue font is loaded specifically */}
      <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
        {/* Header with restaurant info */}
        <header className="py-8 px-6" style={{ backgroundColor: theme.colors.surface }}>
          <div className="max-w-4xl mx-auto">
            {/* Logo */}
            {restaurant?.logo && (
              <div className="mb-6 flex justify-center">
                <img
                  src={restaurant.logo}
                  alt={`Logo de ${restaurant.name}`}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow-sm"
                  style={{
                    border: `1px solid ${theme.colors.border}`
                  }}
                />
              </div>
            )}
            
            <div className="text-center">
              <h1 
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ 
                  color: theme.colors.text.primary, 
                  fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif'
                }}
              >
                {restaurant?.name}
              </h1>
              
              {/* Descripción del menú */}
              {menu?.description && (
                <p 
                  className="text-lg mb-4"
                  style={{ 
                    color: theme.colors.text.secondary, 
                    fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif'
                  }}
                >
                  {menu.description}
                </p>
              )}
              
              {/* Número de mesa si está presente */}
              {tableNumber && (
                <div 
                  className="text-base font-medium px-4 py-2 rounded-lg inline-block"
                  style={{ 
                    color: theme.colors.text.primary,
                    backgroundColor: theme.colors.border,
                    fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif'
                  }}
                >
                  Mesa {tableNumber}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Menu Content */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          {categories.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl mb-6 block">📋</span>
              <h3 className="text-2xl font-semibold mb-4" style={{ color: theme.colors.text.primary, fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif' }}>
                Menú en preparación
              </h3>
              <p style={{ color: theme.colors.text.secondary, fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif' }}>
                Estamos preparando nuestro delicioso menú. ¡Vuelve pronto!
              </p>
            </div>
          ) : (
            categories.map((category) => {
              const categoryItems = (itemsByCat[category.id] || []).filter(item => item.available !== false)
              
              if (categoryItems.length === 0) return null

              return (
                <section key={category.id} className="mb-12">
                  {/* Category Header */}
                  <div className="mb-8">
                    <h2 
                      className="text-2xl md:text-3xl font-bold"
                      style={{ 
                        color: theme.colors.text.primary, 
                        fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif'
                      }}
                    >
                      {category.name}
                    </h2>
                    {category.description && (
                      <p 
                        className="text-sm mt-2" 
                        style={{ 
                          color: theme.colors.text.secondary, 
                          fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif'
                        }}
                      >
                        {category.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Items List */}
                  <div className="space-y-6">
                    {categoryItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-start justify-between gap-4 py-4"
                        style={{ borderBottom: `1px solid ${theme.colors.border}` }}
                      >
                        <div className="flex-1">
                          {/* Product name - siguiendo el ejemplo */}
                          <p 
                            className="text-base font-medium leading-normal line-clamp-1 mb-1"
                            style={{ 
                              color: theme.colors.text.primary, 
                              fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif'
                            }}
                          >
                            {item.name}
                          </p>
                          
                          {/* Product description - siguiendo el ejemplo */}
                          {item.description && (
                            <p 
                              className="text-sm font-normal leading-normal line-clamp-2 mb-2"
                              style={{ 
                                color: theme.colors.text.secondary, 
                                fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif'
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
                        
                        {/* Price - siguiendo el ejemplo */}
                        <div className="shrink-0">
                          <p 
                            className="text-base font-normal leading-normal"
                            style={{ 
                              color: theme.colors.text.primary, 
                              fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif'
                            }}
                          >
                            {new Intl.NumberFormat('es-AR', { 
                              style: 'currency', 
                              currency: item.currency || 'ARS' 
                            }).format(item.price || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })
          )}
        </main>

        {/* Footer */}
        <footer 
          className="border-t mt-12 py-8" 
          style={{ 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border 
          }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="mb-4">
              <span 
                className="text-lg font-semibold"
                style={{ 
                  color: theme.colors.text.primary, 
                  fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif'
                }}
              >
                {restaurant?.name}
              </span>
            </div>
            
            {/* Información del restaurante */}
            <div className="space-y-2 mb-4">
              {restaurant?.address && (
                <div 
                  className="text-sm"
                  style={{ 
                    color: theme.colors.text.secondary, 
                    fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif'
                  }}
                >
                  📍 {restaurant.address}
                </div>
              )}
              
              {restaurant?.phone && (
                <div 
                  className="text-sm"
                  style={{ 
                    color: theme.colors.text.secondary, 
                    fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif'
                  }}
                >
                  📞 {restaurant.phone}
                </div>
              )}
              
              {restaurant?.hours && (
                <div 
                  className="text-sm"
                  style={{ 
                    color: theme.colors.text.secondary, 
                    fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif'
                  }}
                >
                  🕒 {restaurant.hours}
                </div>
              )}
            </div>
            
            {/* Social Media Links */}
            {restaurant?.socialMedia && restaurant.socialMedia.some(social => social.title && social.url) && (
              <div className="flex justify-center gap-6">
                {restaurant.socialMedia
                  .filter(social => social.title && social.url)
                  .map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline hover:no-underline transition-colors"
                      style={{ 
                        color: theme.colors.text.secondary, 
                        fontFamily: 'Epilogue, system-ui, -apple-system, sans-serif'
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
