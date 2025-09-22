import { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getRestaurant, updateRestaurant } from '../../services/firestore.js'
import Snackbar from '../../components/Snackbar.jsx'
import { useSnackbar } from '../../hooks/useSnackbar.js'

export default function Settings() {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    website: '',
    hours: ''
  })
  
  // Snackbar hook
  const { snackbar, showSuccess, showError } = useSnackbar()
  
  const publicUrl = useMemo(() => `${window.location.origin}/r/${restaurantId}`, [restaurantId])
  const subdomainUrl = useMemo(() => {
    if (!restaurant?.slug) return null
    
    // For now, we have a specific site for heladeria-pistacho
    if (restaurant.slug === 'heladeria-pistacho') {
      return 'https://heladeria-pistacho.web.app'
    }
    
    // For other restaurants, use the standard URL format
    const hostname = window.location.hostname
    const isFirebaseApp = hostname.includes('.web.app')
    
    if (isFirebaseApp) {
      return `https://${restaurant.slug}.mi-menu-komin.web.app`
    } else {
      // For custom domains
      const baseDomain = hostname.split('.').slice(-2).join('.')
      return `https://${restaurant.slug}.${baseDomain}`
    }
  }, [restaurant])

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const r = await getRestaurant(restaurantId)
        setRestaurant(r)
        if (r) {
          setFormData({
            name: r.name || '',
            phone: r.phone || '',
            address: r.address || '',
            website: r.website || '',
            hours: r.hours || ''
          })
        }
      } catch (error) {
        console.error('Error loading restaurant:', error)
      } finally {
        setLoading(false)
      }
    }
    loadRestaurant()
  }, [restaurantId])

  async function handleSave() {
    setSaving(true)
    try {
      await updateRestaurant(restaurantId, formData)
      // Reload restaurant data to get updated slug
      const updatedRestaurant = await getRestaurant(restaurantId)
      setRestaurant(updatedRestaurant)
      showSuccess('Información del restaurante guardada exitosamente')
    } catch (error) {
      console.error('Error saving restaurant:', error)
      showError('No se pudo guardar la información. Por favor, intenta nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  async function copy(url) {
    try {
      await navigator.clipboard.writeText(url)
      showSuccess('Enlace copiado al portapapeles')
    } catch (err) {
      showError('No se pudo copiar el enlace al portapapeles')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configurá tu restaurante y menú</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Restaurant Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🏪</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Información del restaurante</h3>
              <p className="text-sm text-gray-600">Datos básicos de tu negocio</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Nombre del restaurante</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de tu restaurante"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Teléfono</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+54 11 1234-5678"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Dirección</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Av. Corrientes 1234, CABA"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Sitio web</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://www.mirestaurante.com"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Horarios</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                rows="3"
                value={formData.hours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                placeholder="Lun-Vie: 12:00-15:00, 19:00-23:00&#10;Sáb-Dom: 12:00-23:00"
              />
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#111827] text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar información'}
            </button>
          </div>
        </div>

        {/* URLs and Technical Info */}
        <div className="space-y-6">
          {/* Subdomain URL */}
          {subdomainUrl && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🌐</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">URL personalizada</h3>
                  <p className="text-sm text-gray-600">Subdominio automático</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Slug del restaurante</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50" 
                    value={restaurant?.slug || ''} 
                    readOnly 
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">URL completa</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50" 
                    value={subdomainUrl} 
                    readOnly 
                  />
                </div>
                <button 
                  onClick={() => copy(subdomainUrl)}
                  className="w-full bg-purple-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Copiar subdominio
                </button>
              </div>
            </div>
          )}

          {/* Standard URL */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔗</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Link estándar</h3>
                <p className="text-sm text-gray-600">URL tradicional del menú</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50" 
                value={publicUrl} 
                readOnly 
              />
              <button 
                onClick={() => copy(publicUrl)}
                className="w-full bg-[#111827] text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Copiar link
              </button>
            </div>
          </div>

          {/* Technical Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⚙️</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Información técnica</h3>
                <p className="text-sm text-gray-600">Datos del sistema</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono text-xs">{restaurantId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="text-green-600">Público</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Slug:</span>
                <span className="font-mono text-xs">{restaurant?.slug || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">❓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ayuda</h3>
              <p className="text-sm text-gray-600">Guías y soporte</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Creá categorías para organizar tu menú</p>
            <p>• Agregá ítems con precios y descripciones</p>
            <p>• Compartí el link público con tus clientes</p>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        isOpen={snackbar.isOpen}
        onClose={() => {}}
        message={snackbar.message}
        type={snackbar.type}
        duration={snackbar.duration}
        position={snackbar.position}
        action={snackbar.action}
      />
    </div>
  )
}
