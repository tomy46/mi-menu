import { useState, useEffect } from 'react'
import { validateSlug, normalizeSlug, generateSlugSuggestions } from '../utils/slugUtils'
import { getPublicMenuUrl, getFullPublicMenuUrl } from '../utils/slugLinks'
import { 
  LinkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'

export default function SlugTab({ 
  restaurant, 
  formData, 
  setFormData, 
  saving, 
  onSave,
  showSuccess 
}) {
  const [slugValidation, setSlugValidation] = useState({ isValid: true })
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Validar slug cuando cambie
  useEffect(() => {
    if (formData.slug) {
      const validation = validateSlug(formData.slug)
      setSlugValidation(validation)
      
      if (!validation.isValid) {
        const newSuggestions = generateSlugSuggestions(formData.name || restaurant?.name || '')
        setSuggestions(newSuggestions.slice(0, 3))
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }
    } else {
      setSlugValidation({ isValid: true })
      setShowSuggestions(false)
    }
  }, [formData.slug, formData.name, restaurant?.name])

  const handleSlugChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, slug: value }))
  }

  const handleSlugBlur = () => {
    if (formData.slug) {
      const normalized = normalizeSlug(formData.slug)
      if (normalized !== formData.slug) {
        setFormData(prev => ({ ...prev, slug: normalized }))
      }
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({ ...prev, slug: suggestion }))
    setShowSuggestions(false)
  }

  const handleGenerateFromName = () => {
    const name = formData.name || restaurant?.name || ''
    if (name) {
      const suggestions = generateSlugSuggestions(name)
      if (suggestions.length > 0) {
        setFormData(prev => ({ ...prev, slug: suggestions[0] }))
      }
    }
  }

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      showSuccess('Enlace copiado al portapapeles')
    } catch (error) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showSuccess('Enlace copiado al portapapeles')
    }
  }

  const currentUrl = restaurant ? getFullPublicMenuUrl(restaurant) : null
  const previewUrl = formData.slug ? getFullPublicMenuUrl({ ...restaurant, slug: formData.slug }) : null
  const legacyUrl = `${window.location.origin}/r/${restaurant?.id}`

  return (
    <div className="space-y-6">
      {/* Información sobre slugs */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              Personaliza tu enlace
            </h3>
            <p className="text-sm text-blue-700">
              Crea un enlace personalizado y fácil de recordar para tu menú. 
              Los slugs deben tener entre 3-50 caracteres, solo letras minúsculas, números y guiones.
            </p>
          </div>
        </div>
      </div>

      {/* Campo de slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
          Slug personalizado
        </label>
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {window.location.origin}/
              </span>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={handleSlugChange}
                onBlur={handleSlugBlur}
                placeholder="mi-restaurante"
                className={`flex-1 rounded-none rounded-r-lg border ${
                  slugValidation.isValid ? 'border-gray-300' : 'border-red-300'
                } px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent`}
                disabled={saving}
              />
            </div>
            {!slugValidation.isValid && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                {slugValidation.error}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleGenerateFromName}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            disabled={saving || !formData.name}
          >
            Generar
          </button>
        </div>
      </div>

      {/* Sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Sugerencias:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors"
                disabled={saving}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vista previa de URLs */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Enlaces del menú</h3>
        
        {/* URL actual */}
        {currentUrl && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-1">Enlace actual</p>
                <p className="text-sm text-gray-900 truncate">{currentUrl}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCopyUrl(currentUrl)}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                title="Copiar enlace"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Vista previa del nuevo URL */}
        {previewUrl && previewUrl !== currentUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-green-600 mb-1 flex items-center">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Vista previa del nuevo enlace
                </p>
                <p className="text-sm text-green-800 truncate">{previewUrl}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCopyUrl(previewUrl)}
                className="ml-2 p-1 text-green-400 hover:text-green-600"
                title="Copiar enlace"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* URL legacy */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 mb-1">Enlace alternativo (siempre funciona)</p>
              <p className="text-sm text-gray-900 truncate">{legacyUrl}</p>
            </div>
            <button
              type="button"
              onClick={() => handleCopyUrl(legacyUrl)}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600"
              title="Copiar enlace"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !slugValidation.isValid}
          className="bg-[#111827] text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {/* Información adicional */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 mb-1">
              Importante
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Cambiar el slug afectará todos los enlaces existentes</li>
              <li>• Los enlaces antiguos redirigirán automáticamente al nuevo</li>
              <li>• El enlace alternativo siempre funcionará como respaldo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
