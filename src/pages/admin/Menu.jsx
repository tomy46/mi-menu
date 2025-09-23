import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  PaintBrushIcon,
  ShareIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { getRestaurant, updateRestaurant } from '../../services/firestore.js'
import { getTheme } from '../../config/themes.js'
import { useSnackbar } from '../../hooks/useSnackbar.js'
import Snackbar from '../../components/Snackbar.jsx'

const themes = [
  { id: 'elegant', name: 'Elegante', description: 'Diseño clásico y sofisticado' },
  { id: 'modern', name: 'Moderno', description: 'Limpio y contemporáneo' },
  { id: 'classic', name: 'Clásico', description: 'Tradicional y elegante' },
  { id: 'fresh', name: 'Fresco', description: 'Vibrante y energético' },
  { id: 'cupido', name: 'Cupido', description: 'Romántico y delicado' }
]

const socialPlatforms = [
  { id: 'instagram', name: 'Instagram', placeholder: '@turestaurante' },
  { id: 'facebook', name: 'Facebook', placeholder: 'facebook.com/turestaurante' },
  { id: 'whatsapp', name: 'WhatsApp', placeholder: '+54 9 11 1234-5678' },
  { id: 'website', name: 'Sitio Web', placeholder: 'https://turestaurante.com' }
]

export default function Menu() {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [selectedTheme, setSelectedTheme] = useState('elegant')
  const [socialMedia, setSocialMedia] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { snackbar, showSuccess, showError } = useSnackbar()

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const data = await getRestaurant(restaurantId)
        setRestaurant(data)
        setSelectedTheme(data.theme || 'elegant')
        setSocialMedia(data.socialMedia || {})
      } catch (error) {
        console.error('Error loading restaurant:', error)
        showError('Error al cargar la información del restaurante')
      } finally {
        setLoading(false)
      }
    }

    if (restaurantId) {
      loadRestaurant()
    }
  }, [restaurantId])

  const handleThemeChange = async (themeId) => {
    setSelectedTheme(themeId)
    await saveChanges({ theme: themeId })
  }

  const handleSocialMediaChange = (platform, value) => {
    const newSocialMedia = { ...socialMedia, [platform]: value }
    setSocialMedia(newSocialMedia)
  }

  const saveSocialMedia = async () => {
    await saveChanges({ socialMedia })
  }

  const saveChanges = async (updates) => {
    setSaving(true)
    try {
      await updateRestaurant(restaurantId, updates)
      showSuccess('Cambios guardados exitosamente')
    } catch (error) {
      console.error('Error saving changes:', error)
      showError('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const getThemePreview = (themeId) => {
    const theme = getTheme(themeId)
    return (
      <div 
        className="w-full h-24 rounded-lg border-2 border-gray-200 p-3 flex flex-col justify-between"
        style={{ 
          backgroundColor: theme.colors.background,
          borderColor: selectedTheme === themeId ? theme.colors.primary : '#e5e7eb'
        }}
      >
        <div className="flex items-center justify-between">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.colors.primary }}
          ></div>
          <div 
            className="w-8 h-1 rounded"
            style={{ backgroundColor: theme.colors.secondary }}
          ></div>
        </div>
        <div className="space-y-1">
          <div 
            className="w-full h-1 rounded"
            style={{ backgroundColor: theme.colors.text }}
          ></div>
          <div 
            className="w-3/4 h-1 rounded"
            style={{ backgroundColor: theme.colors.textSecondary }}
          ></div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Menú</h1>
        <p className="text-gray-600 mt-1">
          Personaliza el diseño y las redes sociales de tu menú público
        </p>
      </div>

      {/* Theme Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <PaintBrushIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Tema del Menú</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Elige el diseño que mejor represente la personalidad de tu restaurante
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {themes.map((theme) => (
            <div key={theme.id} className="space-y-3">
              <button
                onClick={() => handleThemeChange(theme.id)}
                className={`w-full transition-all duration-200 ${
                  selectedTheme === theme.id
                    ? 'ring-2 ring-[#111827] ring-offset-2'
                    : 'hover:shadow-md'
                }`}
                disabled={saving}
              >
                {getThemePreview(theme.id)}
              </button>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-900">{theme.name}</h3>
                <p className="text-xs text-gray-500">{theme.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <EyeIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Vista previa</span>
          </div>
          <p className="text-sm text-blue-800 mt-1">
            Puedes ver cómo se ve tu menú con el tema seleccionado visitando{' '}
            <a 
              href={`/r/${restaurantId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              tu menú público
            </a>
          </p>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShareIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Redes Sociales</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Agrega tus redes sociales para que los clientes puedan encontrarte fácilmente
        </p>

        <div className="space-y-4">
          {socialPlatforms.map((platform) => (
            <div key={platform.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {platform.name}
              </label>
              <input
                type="text"
                value={socialMedia[platform.id] || ''}
                onChange={(e) => handleSocialMediaChange(platform.id, e.target.value)}
                placeholder={platform.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={saveSocialMedia}
            disabled={saving}
            className="px-4 py-2 bg-[#111827] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar Redes Sociales'}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-green-50 rounded-lg border border-green-200 p-6">
        <h2 className="text-lg font-semibold text-green-900 mb-2">💡 Consejos de diseño</h2>
        <ul className="space-y-2 text-sm text-green-800">
          <li>• El tema elegante es perfecto para restaurantes tradicionales</li>
          <li>• El tema moderno funciona bien para cafeterías y lugares casuales</li>
          <li>• El tema fresco es ideal para restaurantes saludables o veganos</li>
          <li>• Asegúrate de que tus redes sociales estén actualizadas</li>
          <li>• Usa el mismo nombre de usuario en todas las plataformas</li>
        </ul>
      </div>

      <Snackbar
        isOpen={snackbar.isOpen}
        message={snackbar.message}
        type={snackbar.type}
        duration={snackbar.duration}
      />
    </div>
  )
}
