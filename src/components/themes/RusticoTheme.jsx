import { useMenu } from '../../contexts/MenuContext.jsx'
import { getTheme, getGoogleFontsUrl } from '../../config/themes.js'
import { DietaryRestrictionsDisplay } from '../DietaryRestrictionsSelector.jsx'

export default function RusticoTheme() {
  const { restaurant, menu, categories, itemsByCat, loading, tableNumber } = useMenu()
  const theme = getTheme('rustico')
  const googleFontsUrl = getGoogleFontsUrl('rustico')
  


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: theme.colors.primary }}></div>
          <p style={{ color: theme.colors.text.secondary, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Cargando menú...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Load Google Fonts for Rustico Theme */}
      <link href={googleFontsUrl} rel="stylesheet" />
      
      {/* Ensure Inter font is loaded specifically */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      {/* Layout especial para tema rústico - contenedor centrado */}
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8" style={{ backgroundColor: theme.colors.background }}>
        <main 
          className="w-full max-w-2xl rounded-2xl shadow-2xl p-6 sm:p-8"
          style={{ backgroundColor: theme.colors.surface }}
        >
          {/* Header del restaurante para tema rústico */}
          <header className="text-center mb-8">
            {/* Logo */}
            {restaurant?.logo && (
              <div className="mb-4 flex justify-center">
                <img
                  src={restaurant.logo}
                  alt={`Logo de ${restaurant.name}`}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow-lg transition-all duration-500 ease-in-out"
                  style={{
                    border: `2px solid ${theme.colors.text.white}`
                  }}
                />
              </div>
            )}
            
            <h1 
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-2"
              style={{ 
                color: theme.colors.text.white, 
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}
            >
              {restaurant?.name}
            </h1>
            
            {/* Descripción del menú */}
            {menu?.description && (
              <p 
                className="text-lg mt-2"
                style={{ 
                  color: theme.colors.text.muted, 
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                }}
              >
                {menu.description}
              </p>
            )}
            
            {/* Número de mesa si está presente */}
            {tableNumber && (
              <div 
                className="text-lg font-medium mt-4 px-3 py-1 rounded-full inline-block"
                style={{ 
                  color: theme.colors.text.white,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                }}
              >
                Mesa {tableNumber}
              </div>
            )}
          </header>

          {/* Contenido del menú para tema rústico */}
          {categories.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl mb-6 block">📋</span>
              <h3 className="text-2xl font-semibold mb-4" style={{ color: theme.colors.text.white, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Menú en preparación
              </h3>
              <p style={{ color: theme.colors.text.muted, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                Estamos preparando nuestro delicioso menú. ¡Vuelve pronto!
              </p>
            </div>
          ) : (
            categories.map((category) => {
              const categoryItems = (itemsByCat[category.id] || []).filter(item => item.available !== false)
              
              
              if (categoryItems.length === 0) return null

              return (
                <section key={category.id} className="mb-8">
                  {/* Category Header */}
                  <h2 
                    className="text-2xl font-semibold border-b-2 pb-2 mb-6 tracking-wide"
                    style={{ 
                      color: theme.colors.text.white, 
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      borderColor: theme.colors.border
                    }}
                  >
                    {category.name.toUpperCase()}
                  </h2>
                  
                  {/* Items List */}
                  <div className="space-y-6">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-4">
                        <div>
                          <h3 
                            className="text-lg font-semibold"
                            style={{ 
                              color: theme.colors.text.white, 
                              fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                            }}
                          >
                            {item.name}
                          </h3>
                          {item.description && (
                            <p 
                              className="text-sm leading-relaxed mt-1"
                              style={{ 
                                color: theme.colors.text.muted, 
                                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
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
                        <p 
                          className="text-lg font-semibold whitespace-nowrap"
                          style={{ 
                            color: theme.colors.text.white, 
                            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                          }}
                        >
                          {new Intl.NumberFormat('es-AR', { 
                            style: 'currency', 
                            currency: item.currency || 'ARS' 
                          }).format(item.price || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })
          )}
        </main>
      </div>
    </>
  )
}
