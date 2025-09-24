import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline'
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../config/languages'

export default function LanguageSelector({ 
  currentLanguage, 
  onLanguageChange, 
  theme,
  compact = false 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  
  const currentLang = getLanguageByCode(currentLanguage)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLanguageSelect = (langCode) => {
    onLanguageChange(langCode)
    setIsOpen(false)
  }

  if (compact) {
    // Versión compacta para usar en headers o espacios reducidos
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-black/10"
          style={{ 
            color: theme?.colors?.text?.primary || '#1F2937',
            backgroundColor: isOpen ? 'rgba(0,0,0,0.1)' : 'transparent'
          }}
        >
          <span className="text-lg">{currentLang.flag}</span>
          <span className="text-sm font-medium">{currentLang.code.toUpperCase()}</span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div 
            className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[160px]"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                  currentLanguage === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <div>
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-gray-500">{lang.name}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Versión completa para footer del menú público
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-black/5"
        style={{ 
          color: theme?.colors?.text?.primary || '#1F2937',
          backgroundColor: isOpen ? 'rgba(0,0,0,0.05)' : 'transparent',
          border: `1px solid ${theme?.colors?.primary || '#1F2937'}20`
        }}
      >
        <LanguageIcon className="w-5 h-5" />
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentLang.flag}</span>
          <div className="text-left">
            <div className="font-medium text-sm">{currentLang.nativeName}</div>
            <div className="text-xs opacity-70">Cambiar idioma</div>
          </div>
        </div>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[200px]"
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">Seleccionar idioma</div>
            <div className="text-xs text-gray-500">Choose your language</div>
          </div>
          
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                currentLanguage === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <div className="flex-1">
                <div className="font-medium">{lang.nativeName}</div>
                <div className="text-xs text-gray-500">{lang.name}</div>
              </div>
              {currentLanguage === lang.code && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
