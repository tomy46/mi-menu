// Configuración de idiomas soportados por la plataforma

export const SUPPORTED_LANGUAGES = [
  {
    code: 'es',
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸',
    isDefault: true
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    isDefault: false
  },
  {
    code: 'pt',
    name: 'Português',
    nativeName: 'Português',
    flag: '🇧🇷',
    isDefault: false
  },
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    isDefault: false
  },
  {
    code: 'it',
    name: 'Italiano',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    isDefault: false
  },
  {
    code: 'de',
    name: 'Deutsch',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    isDefault: false
  }
]

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.find(lang => lang.isDefault) || SUPPORTED_LANGUAGES[0]

// Función helper para obtener idioma por código
export const getLanguageByCode = (code) => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || DEFAULT_LANGUAGE
}

// Función helper para obtener todos los códigos de idioma
export const getLanguageCodes = () => {
  return SUPPORTED_LANGUAGES.map(lang => lang.code)
}

// Estructura para campos multiidioma
export const createMultiLanguageField = (defaultValue = '', languages = getLanguageCodes()) => {
  const field = {}
  languages.forEach(langCode => {
    field[langCode] = langCode === DEFAULT_LANGUAGE.code ? defaultValue : ''
  })
  return field
}

// Función helper para obtener valor en idioma específico con fallback
export const getLocalizedValue = (multiLangField, languageCode, fallbackLanguage = DEFAULT_LANGUAGE.code) => {
  if (!multiLangField || typeof multiLangField !== 'object') {
    return multiLangField || ''
  }
  
  // Intentar obtener el valor en el idioma solicitado
  if (multiLangField[languageCode] && multiLangField[languageCode].trim()) {
    return multiLangField[languageCode]
  }
  
  // Fallback al idioma por defecto
  if (multiLangField[fallbackLanguage] && multiLangField[fallbackLanguage].trim()) {
    return multiLangField[fallbackLanguage]
  }
  
  // Fallback al primer valor no vacío disponible
  for (const lang of getLanguageCodes()) {
    if (multiLangField[lang] && multiLangField[lang].trim()) {
      return multiLangField[lang]
    }
  }
  
  return ''
}

// Función para validar si un campo multiidioma tiene al menos un valor
export const hasAnyLanguageValue = (multiLangField) => {
  if (!multiLangField || typeof multiLangField !== 'object') {
    return false
  }
  
  return getLanguageCodes().some(langCode => 
    multiLangField[langCode] && multiLangField[langCode].trim()
  )
}

// Función para migrar campos de texto simple a multiidioma
export const migrateToMultiLanguage = (simpleValue, targetLanguage = DEFAULT_LANGUAGE.code) => {
  const multiLangField = createMultiLanguageField()
  if (simpleValue && simpleValue.trim()) {
    multiLangField[targetLanguage] = simpleValue
  }
  return multiLangField
}
