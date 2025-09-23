import { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getRestaurant, updateRestaurant } from '../../services/firestore.js'
import Snackbar from '../../components/Snackbar.jsx'
import InfoTab from '../../components/InfoTab.jsx'
import SocialTab from '../../components/SocialTab.jsx'
import TeamTab from '../../components/TeamTab.jsx'
import SubscriptionTab from '../../components/SubscriptionTab.jsx'
import { useSnackbar } from '../../hooks/useSnackbar.js'
import { 
  InformationCircleIcon, 
  ShareIcon, 
  UsersIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'

export default function Settings() {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    website: '',
    hours: '',
    isPublic: false
  })
  
  // Social media state
  const [socialMedia, setSocialMedia] = useState({
    instagram: '',
    facebook: '',
    whatsapp: ''
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
            hours: r.hours || '',
            isPublic: r.isPublic || false
          })
          
          // Handle social media normalization
          let normalizedSocialMedia = { instagram: '', facebook: '', whatsapp: '' }
          if (Array.isArray(r.socialMedia)) {
            // Convert from old array format
            r.socialMedia.forEach(social => {
              if (social.title && social.url) {
                const title = social.title.toLowerCase()
                if (title.includes('instagram')) {
                  const username = social.url.split('instagram.com/')[1]?.split('/')[0]
                  normalizedSocialMedia.instagram = username ? `@${username}` : social.url
                } else if (title.includes('facebook')) {
                  normalizedSocialMedia.facebook = social.url
                } else if (title.includes('whatsapp')) {
                  normalizedSocialMedia.whatsapp = social.url
                }
              }
            })
          } else if (r.socialMedia && typeof r.socialMedia === 'object') {
            normalizedSocialMedia = r.socialMedia
          }
          setSocialMedia(normalizedSocialMedia)
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
      // Convert social media to array format for storage
      const socialMediaArray = []
      if (socialMedia.instagram) {
        let instagramUrl = socialMedia.instagram
        if (instagramUrl.startsWith('@')) {
          instagramUrl = `https://www.instagram.com/${instagramUrl.substring(1)}`
        }
        socialMediaArray.push({ title: 'Instagram', url: instagramUrl })
      }
      if (socialMedia.facebook) {
        let facebookUrl = socialMedia.facebook
        if (!facebookUrl.startsWith('http')) {
          facebookUrl = `https://${facebookUrl}`
        }
        socialMediaArray.push({ title: 'Facebook', url: facebookUrl })
      }
      if (socialMedia.whatsapp) {
        let whatsappUrl = socialMedia.whatsapp
        if (whatsappUrl.startsWith('+') || /^\d/.test(whatsappUrl)) {
          whatsappUrl = `https://wa.me/${whatsappUrl.replace(/[^\d]/g, '')}`
        }
        socialMediaArray.push({ title: 'WhatsApp', url: whatsappUrl })
      }
      
      const updateData = {
        ...formData,
        socialMedia: socialMediaArray
      }
      
      await updateRestaurant(restaurantId, updateData)
      
      // Reload restaurant data to get updated slug
      const updatedRestaurant = await getRestaurant(restaurantId)
      setRestaurant(updatedRestaurant)
      
      // Dispatch event for dashboard update
      window.dispatchEvent(new CustomEvent('dashboardUpdate'))
      
      showSuccess('Información guardada exitosamente')
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

  const tabs = [
    {
      id: 'info',
      name: 'Información',
      icon: InformationCircleIcon,
      count: null
    },
    {
      id: 'social',
      name: 'Redes Sociales',
      icon: ShareIcon,
      count: null
    },
    {
      id: 'team',
      name: 'Equipo',
      icon: UsersIcon,
      count: restaurant?.owners?.length || 1
    },
    {
      id: 'subscription',
      name: 'Suscripción',
      icon: CreditCardIcon,
      count: null
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajustes</h1>
          <p className="text-gray-600">Configurá tu restaurante y equipo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-[#111827] text-[#111827]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
                {tab.count && (
                  <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'info' && (
          <InfoTab 
            formData={formData} 
            setFormData={setFormData} 
            saving={saving} 
            handleSave={handleSave}
            publicUrl={publicUrl}
            subdomainUrl={subdomainUrl}
            copy={copy}
          />
        )}
        
        {activeTab === 'social' && (
          <SocialTab 
            socialMedia={socialMedia}
            setSocialMedia={setSocialMedia}
            saving={saving} 
            handleSave={handleSave}
          />
        )}
        
        {activeTab === 'team' && (
          <TeamTab 
            restaurant={restaurant}
            restaurantId={restaurantId}
          />
        )}
        
        {activeTab === 'subscription' && (
          <SubscriptionTab 
            restaurant={restaurant}
            restaurantId={restaurantId}
          />
        )}
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
