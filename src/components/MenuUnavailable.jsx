import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function MenuUnavailable({ theme, menuTitle = 'Menú', message }) {
  const currentTheme = theme || 'elegant'
  
  // Default messages based on theme
  const defaultMessage = message || 'Este menú no está disponible en este momento. Por favor, inténtalo más tarde.'
  
  // Theme-specific styling
  const getThemeStyles = () => {
    switch (currentTheme) {
      case 'elegant':
        return {
          container: 'bg-amber-50 border-amber-200 text-amber-800',
          icon: 'text-amber-500',
          title: 'text-amber-900',
          message: 'text-amber-700'
        }
      case 'modern':
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: 'text-gray-500',
          title: 'text-gray-900',
          message: 'text-gray-700'
        }
      case 'classic':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-500',
          title: 'text-red-900',
          message: 'text-red-700'
        }
      case 'fresh':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-500',
          title: 'text-green-900',
          message: 'text-green-700'
        }
      case 'cupido':
        return {
          container: 'bg-pink-50 border-pink-200 text-pink-800',
          icon: 'text-pink-500',
          title: 'text-pink-900',
          message: 'text-pink-700'
        }
      default:
        return {
          container: 'bg-amber-50 border-amber-200 text-amber-800',
          icon: 'text-amber-500',
          title: 'text-amber-900',
          message: 'text-amber-700'
        }
    }
  }

  const styles = getThemeStyles()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-lg border-2 p-8 text-center ${styles.container}`}>
        <div className="flex justify-center mb-4">
          <ExclamationTriangleIcon className={`h-16 w-16 ${styles.icon}`} />
        </div>
        
        <h2 className={`text-2xl font-bold mb-4 ${styles.title}`}>
          {menuTitle} No Disponible
        </h2>
        
        <p className={`text-lg leading-relaxed ${styles.message}`}>
          {defaultMessage}
        </p>
        
        <div className="mt-6 pt-4 border-t border-current border-opacity-20">
          <p className={`text-sm opacity-75 ${styles.message}`}>
            Disculpa las molestias
          </p>
        </div>
      </div>
    </div>
  )
}
