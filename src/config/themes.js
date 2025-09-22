// Configuración de temas para el menú público
export const MENU_THEMES = {
  elegant: {
    id: 'elegant',
    name: 'Elegante',
    description: 'Diseño minimalista con colores cálidos',
    preview: '🎨',
    colors: {
      primary: '#4A3728', // Marrón oscuro como en la imagen
      secondary: '#6B5B73', // Marrón medio
      accent: '#F5F0E8', // Crema muy claro
      background: '#F5F0E8', // Fondo crema como en la imagen
      surface: 'transparent', // Transparente para productos
      text: {
        primary: '#4A3728', // Marrón oscuro para todo el texto
        secondary: '#4A3728', // Mismo color para consistencia
        muted: '#6B5B73' // Marrón medio para elementos secundarios
      },
      border: '#E8D5B7' // Beige para bordes
    },
    fonts: {
      primary: 'Poppins', // Poppins para títulos
      secondary: 'Poppins', // Poppins para texto
      accent: 'Poppins' // Poppins para elementos decorativos
    },
    spacing: {
      section: '3rem',
      item: '1.5rem',
      padding: '1.5rem'
    },
    borderRadius: '12px',
    shadows: {
      card: '0 2px 8px rgba(139, 69, 19, 0.1)',
      hover: '0 4px 16px rgba(139, 69, 19, 0.15)'
    }
  },
  
  cupido: {
    id: 'cupido',
    name: 'Cupido',
    description: 'Diseño fancy old school con rojo intenso',
    preview: '💘',
    colors: {
      primary: '#f05659', // Marrón crema suave
      secondary: '#f05659', // Dorado suave
      accent: '#FEF7F0', // Crema muy claro
      background: '#FEF7F0', // Fondo crema suave
      surface: '#f05659', // Beige suave para header/footer
      text: {
        primary: '#f05659', // Marrón crema para todo el texto
        secondary: '#f05659', // Mismo color para consistencia
        muted: '#f05659', // Dorado suave para elementos secundarios
        white: '#FFFFFF' // Blanco para texto en header/footer
      },
      border: '#E5E7EB' // Gris claro para bordes sutiles
    },
    fonts: {
      primary: 'Poppins', // Poppins para títulos
      secondary: 'Poppins', // Poppins para texto
      accent: 'Poppins' // Poppins para elementos decorativos
    },
    spacing: {
      section: '4rem',
      item: '2rem',
      padding: '2rem'
    },
    borderRadius: '8px',
    shadows: {
      card: '0 4px 12px rgba(185, 28, 28, 0.1)',
      hover: '0 8px 24px rgba(185, 28, 28, 0.15)'
    }
  },

  modern: {
    id: 'modern',
    name: 'Moderno',
    description: 'Diseño limpio y contemporáneo',
    preview: '🔥',
    colors: {
      primary: '#1F2937',
      secondary: '#6B7280',
      accent: '#3B82F6',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: {
        primary: '#111827',
        secondary: '#374151',
        muted: '#6B7280'
      },
      border: '#E5E7EB'
    },
    fonts: {
      primary: 'Poppins',
      secondary: 'Poppins',
      accent: 'Poppins'
    },
    spacing: {
      section: '2.5rem',
      item: '1rem',
      padding: '1.25rem'
    },
    borderRadius: '8px',
    shadows: {
      card: '0 1px 3px rgba(0, 0, 0, 0.1)',
      hover: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }
  },

  classic: {
    id: 'classic',
    name: 'Clásico',
    description: 'Estilo tradicional y sofisticado',
    preview: '👑',
    colors: {
      primary: '#8B0000', // Rojo oscuro
      secondary: '#CD853F', // Dorado
      accent: '#F5DEB3', // Trigo
      background: '#FFF8DC', // Cornsilk
      surface: '#FFFFFF',
      text: {
        primary: '#2F1B14',
        secondary: '#8B4513',
        muted: '#A0522D'
      },
      border: '#DEB887'
    },
    fonts: {
      primary: 'Poppins',
      secondary: 'Poppins',
      accent: 'Poppins'
    },
    spacing: {
      section: '3.5rem',
      item: '2rem',
      padding: '2rem'
    },
    borderRadius: '6px',
    shadows: {
      card: '0 2px 4px rgba(139, 0, 0, 0.1)',
      hover: '0 4px 8px rgba(139, 0, 0, 0.15)'
    }
  },

  fresh: {
    id: 'fresh',
    name: 'Fresco',
    description: 'Colores vibrantes y energéticos',
    preview: '🌿',
    colors: {
      primary: '#059669', // Verde
      secondary: '#10B981',
      accent: '#D1FAE5',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: {
        primary: '#064E3B',
        secondary: '#047857',
        muted: '#6B7280'
      },
      border: '#BBF7D0'
    },
    fonts: {
      primary: 'Poppins',
      secondary: 'Poppins',
      accent: 'Poppins'
    },
    spacing: {
      section: '2.5rem',
      item: '1.25rem',
      padding: '1.5rem'
    },
    borderRadius: '16px',
    shadows: {
      card: '0 2px 8px rgba(5, 150, 105, 0.1)',
      hover: '0 4px 16px rgba(5, 150, 105, 0.15)'
    }
  }
}

// Tema por defecto
export const DEFAULT_THEME = 'elegant'

// Función para obtener un tema
export function getTheme(themeId) {
  return MENU_THEMES[themeId] || MENU_THEMES[DEFAULT_THEME]
}

// Función para obtener las Google Fonts necesarias
export function getGoogleFontsUrl(themeId) {
  const theme = getTheme(themeId)
  const fonts = new Set([theme.fonts.primary, theme.fonts.secondary, theme.fonts.accent])
  
  const fontParams = Array.from(fonts).map(font => {
    const weights = font === theme.fonts.primary ? ':400,600,700' : ':400,600'
    return `${font.replace(' ', '+')}${weights}`
  }).join('&family=')
  
  return `https://fonts.googleapis.com/css2?family=${fontParams}&display=swap`
}

// Iconos para categorías (basados en el diseño)
export const CATEGORY_ICONS = {
  // Comidas
  'ensaladas': '🥗',
  'sandwiches': '🥪', 
  'platos': '🍽️',
  'platitos': '🍤',
  'adicionales': '➕',
  'bebidas': '🥤',
  'postres': '🍰',
  'entradas': '🥙',
  'principales': '🍖',
  'pastas': '🍝',
  'pizzas': '🍕',
  'carnes': '🥩',
  'pescados': '🐟',
  'vegetariano': '🌱',
  'vegano': '🌿',
  'sin_gluten': '🌾',
  // Iconos genéricos
  'default': '📋'
}

// Función para obtener icono de categoría
export function getCategoryIcon(categoryName) {
  const name = categoryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (name.includes(key.replace('_', ' ')) || name.includes(key)) {
      return icon
    }
  }
  
  return CATEGORY_ICONS.default
}
