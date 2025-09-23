import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  BuildingStorefrontIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  ClockIcon,
  PhotoIcon,
  XMarkIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import { getRestaurant, updateRestaurant } from '../../services/firestore.js'

// Helper functions to normalize social media data
const normalizeSocialMediaFromArray = (socialMediaArray) => {
  if (!Array.isArray(socialMediaArray)) return {}
  
  const normalized = {}
  socialMediaArray.forEach(social => {
    if (social.title && social.url) {
      const title = social.title.toLowerCase()
      if (title.includes('instagram')) {
        // Extract username from Instagram URL or keep as is
        const url = social.url
        if (url.includes('instagram.com/')) {
          const username = url.split('instagram.com/')[1]?.split('/')[0]
          normalized.instagram = username ? `@${username}` : url
        } else {
          normalized.instagram = url
        }
      } else if (title.includes('facebook')) {
        normalized.facebook = social.url
      } else if (title.includes('whatsapp')) {
        normalized.whatsapp = social.url
      }
    }
  })
  return normalized
}

const normalizeSocialMediaToArray = (socialMediaObject) => {
  if (!socialMediaObject || typeof socialMediaObject !== 'object') return []
  
  const array = []
  if (socialMediaObject.instagram && socialMediaObject.instagram.trim()) {
    let instagramUrl = socialMediaObject.instagram.trim()
    // Convert @username to full URL if needed
    if (instagramUrl.startsWith('@')) {
      instagramUrl = `https://www.instagram.com/${instagramUrl.substring(1)}`
    } else if (!instagramUrl.startsWith('http')) {
      instagramUrl = `https://www.instagram.com/${instagramUrl}`
    }
    array.push({ title: 'Instagram', url: instagramUrl })
  }
  if (socialMediaObject.facebook && socialMediaObject.facebook.trim()) {
    let facebookUrl = socialMediaObject.facebook.trim()
    // Ensure Facebook URL is complete
    if (!facebookUrl.startsWith('http')) {
      facebookUrl = `https://${facebookUrl}`
    }
    array.push({ title: 'Facebook', url: facebookUrl })
  }
  if (socialMediaObject.whatsapp && socialMediaObject.whatsapp.trim()) {
    let whatsappUrl = socialMediaObject.whatsapp.trim()
    // Convert phone number to WhatsApp URL if needed
    if (!whatsappUrl.startsWith('http') && !whatsappUrl.startsWith('wa.me')) {
      // Remove spaces and special characters, keep only numbers and +
      const phoneNumber = whatsappUrl.replace(/[^\d+]/g, '')
      whatsappUrl = `https://wa.me/${phoneNumber}`
    }
    array.push({ title: 'WhatsApp', url: whatsappUrl })
  }
  return array
}
import { useSnackbar } from '../../hooks/useSnackbar.js'
import Snackbar from '../../components/Snackbar.jsx'

export default function Ajustes() {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const { snackbar, showSuccess, showError } = useSnackbar()
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    website: '',
    hours: '',
    logo: ''
  })
  
  const [socialMedia, setSocialMedia] = useState({})


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
          logo: data.logo || ''
        })
        // Normalize social media data - handle both array and object formats
        let normalizedSocialMedia = {}
        if (Array.isArray(data.socialMedia)) {
          normalizedSocialMedia = normalizeSocialMediaFromArray(data.socialMedia)
        } else if (data.socialMedia && typeof data.socialMedia === 'object') {
          normalizedSocialMedia = data.socialMedia
        }
        setSocialMedia(normalizedSocialMedia)
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

  const handleSocialMediaChange = (platform, value) => {
    setSocialMedia(prev => ({ ...prev, [platform]: value }))
  }

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showError('Por favor selecciona una imagen válida')
      return
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError('La imagen debe ser menor a 2MB')
      return
    }

    setUploadingLogo(true)
    try {
      // Convertir a base64 para almacenar en Firestore
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target.result
        
        // Actualizar en Firestore
        await updateRestaurant(restaurantId, {
          logo: base64,
          updatedAt: new Date()
        })
        
        // Actualizar estado local
        setFormData(prev => ({ ...prev, logo: base64 }))
        setRestaurant(prev => ({ ...prev, logo: base64 }))
        
        // Notify dashboard to update
        window.dispatchEvent(new CustomEvent('dashboardUpdate'))
        
        showSuccess('Logo subido exitosamente')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading logo:', error)
      showError('Error al subir el logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = async () => {
    try {
      await updateRestaurant(restaurantId, {
        logo: '',
        updatedAt: new Date()
      })
      
      setFormData(prev => ({ ...prev, logo: '' }))
      setRestaurant(prev => ({ ...prev, logo: '' }))
      
      // Notify dashboard to update
      window.dispatchEvent(new CustomEvent('dashboardUpdate'))
      
      showSuccess('Logo eliminado exitosamente')
    } catch (error) {
      console.error('Error removing logo:', error)
      showError('Error al eliminar el logo')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      showError('El nombre del restaurante es requerido')
      return
    }

    setSaving(true)
    try {
      // Convert social media object back to array format for compatibility
      const socialMediaArray = normalizeSocialMediaToArray(socialMedia)
      
      await updateRestaurant(restaurantId, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        website: formData.website.trim(),
        hours: formData.hours.trim(),
        logo: formData.logo,
        socialMedia: socialMediaArray,
        updatedAt: new Date()
      })
      
      // Notify dashboard to update
      window.dispatchEvent(new CustomEvent('dashboardUpdate'))
      
      showSuccess('Configuración guardada exitosamente')
    } catch (error) {
      console.error('Error saving restaurant:', error)
      showError('Error al guardar la configuración')
    } finally {
      setSaving(false)
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

          {/* Logo Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PhotoIcon className="w-4 h-4 inline mr-1" />
              Logo del restaurante (opcional)
            </label>
            <div className="space-y-4">
              {formData.logo ? (
                <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <img
                    src={formData.logo}
                    alt="Logo del restaurante"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-medium">Logo actual</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Este logo aparecerá en tu menú público
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="mt-2 inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Eliminar logo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Sube el logo de tu restaurante
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Formato: JPG, PNG. Tamaño máximo: 2MB
                  </p>
                  <label className="inline-flex items-center px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                    {uploadingLogo ? 'Subiendo...' : 'Seleccionar imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
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

      {/* Social Media */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <ShareIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Redes Sociales</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Agrega tus redes sociales para que los clientes puedan encontrarte fácilmente
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <input
              type="text"
              value={socialMedia.instagram || ''}
              onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
              placeholder="@turestaurante"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook
            </label>
            <input
              type="text"
              value={socialMedia.facebook || ''}
              onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
              placeholder="facebook.com/turestaurante"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp
            </label>
            <input
              type="text"
              value={socialMedia.whatsapp || ''}
              onChange={(e) => handleSocialMediaChange('whatsapp', e.target.value)}
              placeholder="+54 9 11 1234-5678"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
            />
          </div>
        </div>
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
