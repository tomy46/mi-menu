import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { 
  BuildingStorefrontIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  ClockIcon,
  EyeIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import { getRestaurant, updateRestaurant } from '../../services/firestore.js'
import { useSnackbar } from '../../hooks/useSnackbar.js'
import Snackbar from '../../components/Snackbar.jsx'

export default function Ajustes() {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { snackbar, showSuccess, showError } = useSnackbar()
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    website: '',
    hours: '',
    isPublic: true
  })

  const publicUrl = useMemo(() => `${window.location.origin}/r/${restaurantId}`, [restaurantId])

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const data = await getRestaurant(restaurantId)
        setRestaurant(data)
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          website: data.website || '',
          hours: data.hours || '',
          isPublic: data.isPublic !== false
        })
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      showError('El nombre del restaurante es requerido')
      return
    }

    setSaving(true)
    try {
      await updateRestaurant(restaurantId, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        website: formData.website.trim(),
        hours: formData.hours.trim(),
        isPublic: formData.isPublic,
        updatedAt: new Date()
      })
      
      showSuccess('Configuración guardada exitosamente')
    } catch (error) {
      console.error('Error saving restaurant:', error)
      showError('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      showSuccess('Enlace copiado al portapapeles')
    } catch (error) {
      showError('Error al copiar el enlace')
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Ajustes del Restaurante</h1>
        <p className="text-gray-600 mt-1">
          Configura la información básica de tu restaurante
        </p>
      </div>

      {/* Restaurant Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BuildingStorefrontIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Información del Restaurante</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del restaurante *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              placeholder="Nombre de tu restaurante"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="w-4 h-4 inline mr-1" />
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                placeholder="+54 9 11 1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <GlobeAltIcon className="w-4 h-4 inline mr-1" />
                Sitio web
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                placeholder="https://turestaurante.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="w-4 h-4 inline mr-1" />
              Dirección
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              placeholder="Calle 123, Ciudad, Provincia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              Horarios de atención
            </label>
            <textarea
              value={formData.hours}
              onChange={(e) => handleInputChange('hours', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              placeholder="Lunes a Viernes: 12:00 - 22:00&#10;Sábados: 12:00 - 23:00&#10;Domingos: 12:00 - 21:00"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => handleInputChange('isPublic', e.target.checked)}
              className="w-4 h-4 text-[#111827] border-gray-300 rounded focus:ring-[#111827]"
            />
            <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
              Hacer el menú público (visible para los clientes)
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#111827] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Public Menu Link */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Enlace del Menú Público</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Comparte este enlace con tus clientes para que puedan ver tu menú
        </p>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
          <input
            type="text"
            value={publicUrl}
            readOnly
            className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
          />
          <button
            onClick={() => copyToClipboard(publicUrl)}
            className="px-3 py-1 text-sm bg-[#111827] text-white rounded hover:bg-gray-800 transition-colors"
          >
            Copiar
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-sm border border-[#111827] text-[#111827] rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <EyeIcon className="w-4 h-4" />
            Ver
          </a>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
        <h2 className="text-lg font-semibold text-yellow-900 mb-2">💡 Consejos</h2>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li>• Completa toda la información para que tus clientes te encuentren fácilmente</li>
          <li>• Mantén tus horarios actualizados, especialmente en fechas especiales</li>
          <li>• Incluye el código de área en tu número de teléfono</li>
          <li>• Asegúrate de que tu sitio web funcione correctamente</li>
          <li>• Comparte el enlace de tu menú en redes sociales y WhatsApp</li>
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
