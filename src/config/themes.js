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
        muted: '#4A3728' // Marrón medio para elementos secundarios
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
      section: '5rem',
      item: '2.5rem',
      padding: '2.5rem'
    },
    borderRadius: '8px',
    shadows: {
      card: '0 4px 12px rgba(185, 28, 28, 0.1)',
      hover: '0 8px 24px rgba(185, 28, 28, 0.15)'
    }
  },

  colombia: {
    id: 'colombia',
    name: 'Colombia',
    description: 'Diseño inspirado en los colores cálidos de Colombia',
    preview: '🇨🇴',
    colors: {
      primary: '#2A1C0C', // Marrón oscuro para textos
      secondary: '#2A1C0C', // Mismo color para consistencia
      accent: '#EDD2B1', // Beige cálido
      background: '#EDD2B1', // Fondo beige cálido
      surface: 'transparent', // Transparente para productos
      text: {
        primary: '#2A1C0C', // Marrón oscuro para todo el texto
        secondary: '#2A1C0C', // Mismo color para consistencia
        muted: '#2A1C0C', // Mismo color para elementos secundarios
        white: '#FFFFFF' // Blanco para contraste si es necesario
      },
      border: '#D4B896' // Beige más oscuro para bordes
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
    borderRadius: '8px',
    shadows: {
      card: '0 2px 8px rgba(42, 28, 12, 0.1)',
      hover: '0 4px 16px rgba(42, 28, 12, 0.15)'
    }
  },

  rustico: {
    id: 'rustico',
    name: 'Rústico',
    description: 'Diseño cálido y elegante con fondo oscuro y tonos terrosos',
    preview: '🏔️',
    colors: {
      primary: '#442C2E', // Marrón rojizo cálido del contenedor
      secondary: '#634749', // Tono intermedio para separadores
      accent: '#F3E5D8', // Tono hueso cálido
      background: '#1a1a1a', // Fondo oscuro y neutro
      surface: '#442C2E', // Marrón rojizo para el contenedor principal
      text: {
        primary: '#FFFFFF', // Blanco para títulos destacados
        secondary: '#F3E5D8', // Tono hueso cálido para texto general
        muted: '#D3C1B3', // Tono más suave para descripciones
        white: '#FFFFFF' // Blanco puro
      },
      border: '#634749' // Separador sutil
    },
    fonts: {
      primary: 'Inter', // Inter como en el diseño original
      secondary: 'Inter', // Inter para texto
      accent: 'Inter' // Inter para elementos decorativos
    },
    spacing: {
      section: '2rem',
      item: '1.5rem',
      padding: '2rem'
    },
    borderRadius: '16px', // Bordes más redondeados como en el diseño
    shadows: {
      card: '0 8px 32px rgba(0, 0, 0, 0.3)', // Sombra más dramática para el fondo oscuro
      hover: '0 12px 48px rgba(0, 0, 0, 0.4)'
    }
  },

  modern: {
    id: 'modern',
    name: 'Moderno',
    description: 'Diseño limpio y minimalista con tipografía Epilogue',
    preview: '✨',
    colors: {
      primary: '#181411', // Color principal oscuro
      secondary: '#887563', // Color secundario marrón claro
      accent: '#f4f2f0', // Color de acento claro
      background: '#ffffff', // Fondo blanco
      surface: '#ffffff', // Superficie blanca
      text: {
        primary: '#181411', // Texto principal oscuro
        secondary: '#887563', // Texto secundario marrón
        muted: '#887563', // Texto atenuado
        white: '#ffffff' // Texto blanco
      },
      border: '#f4f2f0' // Bordes claros
    },
    fonts: {
      primary: 'Epilogue', // Epilogue para títulos
      secondary: 'Epilogue', // Epilogue para texto
      accent: 'Epilogue' // Epilogue para elementos decorativos
    },
    spacing: {
      section: '2rem',
      item: '1rem',
      padding: '1.5rem'
    },
    borderRadius: '8px', // Bordes suaves
    shadows: {
      card: '0 1px 3px rgba(24, 20, 17, 0.1)', // Sombra sutil
      hover: '0 4px 12px rgba(24, 20, 17, 0.15)' // Sombra en hover
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
