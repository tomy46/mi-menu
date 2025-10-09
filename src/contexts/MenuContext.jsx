import { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getActiveMenuByRestaurant, getCategories, getItemsByMenu, getRestaurant, trackEvent } from '../services/firestore.js'
import { ANALYTICS_EVENTS, generateDeviceFingerprint, isUniqueVisit } from '../config/analytics.js'

const MenuContext = createContext()

export function MenuProvider({ children, restaurantId: propRestaurantId, menuId: propMenuId, restaurant: propRestaurant, menu: propMenu }) {
  const { restaurantId: paramRestaurantId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const tableNumber = searchParams.get('mesa')
  const languageParam = searchParams.get('lang')
  
  // Usar props si están disponibles, sino usar params
  const restaurantId = propRestaurantId || paramRestaurantId
  const [restaurant, setRestaurant] = useState(propRestaurant || null)
  const [currentLanguage, setCurrentLanguage] = useState('es')
  const [menu, setMenu] = useState(null)
  const [categories, setCategories] = useState([])
  const [itemsByCat, setItemsByCat] = useState({})
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const hasTrackedView = useRef(false)
  
  // Manejar idioma desde URL o localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem(`menu-language-${restaurantId}`)
    
    if (languageParam) {
      setCurrentLanguage(languageParam)
      localStorage.setItem(`menu-language-${restaurantId}`, languageParam)
    } else if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    }
  }, [languageParam, restaurantId])
  
  // Función para cambiar idioma
  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage)
    localStorage.setItem(`menu-language-${restaurantId}`, newLanguage)
    
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('lang', newLanguage)
    setSearchParams(newSearchParams, { replace: true })
  }

  // Cargar datos del menú
  useEffect(() => {
    let active = true
    hasTrackedView.current = false

    async function load() {
      setLoading(true)
      try {
        let r, m
        
        if (propRestaurant && propMenu) {
          r = propRestaurant
          m = propMenu
        } else {
          r = await getRestaurant(restaurantId)
          if (r) {
            m = await getActiveMenuByRestaurant(restaurantId)
          }
        }
        
        if (!active) return
        
        setRestaurant(r)
        setMenu(m)
        
        if (r && m) {
          const [cats, items] = await Promise.all([
            getCategories(m.id),
            getItemsByMenu(m.id)
          ])
          
          if (!active) return
          
          setCategories(cats)
          setItemsByCat(items)
          
          
          // Analytics tracking
          if (!hasTrackedView.current && r.isPublic) {
            try {
              const deviceId = await generateDeviceFingerprint()
              const sessionId = sessionStorage.getItem('sessionId') || 
                               Math.random().toString(36).substring(2, 15)
              sessionStorage.setItem('sessionId', sessionId)
              
              const isUnique = await isUniqueVisit(deviceId, restaurantId)
              const language = currentLanguage || 'es'
              
              const eventData = {
                type: ANALYTICS_EVENTS.MENU_VIEW,
                restaurantId,
                menuId: m.id,
                userAgent: navigator.userAgent,
                deviceId,
                isUniqueVisit: isUnique,
                timestamp: new Date().toISOString(),
                sessionId,
                language
              }
              
              if (tableNumber) {
                eventData.tableNumber = tableNumber
              }
              
              await trackEvent(eventData)
              hasTrackedView.current = true
            } catch (error) {
              console.error('Analytics tracking failed:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error loading menu:', error)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    if (restaurantId) {
      load()
    }

    return () => {
      active = false
    }
  }, [restaurantId, propRestaurant, propMenu, currentLanguage, tableNumber])

  // Filtrado de productos
  const filtered = useMemo(() => {
    if (!q) return itemsByCat
    const term = q.toLowerCase()
    const out = {}
    for (const [cid, items] of Object.entries(itemsByCat)) {
      out[cid] = items.filter((it) =>
        it.name.toLowerCase().includes(term) || (it.description || '').toLowerCase().includes(term)
      )
    }
    return out
  }, [itemsByCat, q])

  const value = {
    // Data
    restaurant,
    menu,
    categories,
    itemsByCat: filtered,
    loading,
    
    // Search
    q,
    setQ,
    
    // Language
    currentLanguage,
    handleLanguageChange,
    
    // URL params
    tableNumber,
    restaurantId
  }

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider')
  }
  return context
}
