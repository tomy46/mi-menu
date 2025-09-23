/**
 * Configuración del sistema de analytics
 */

// Tipos de eventos de tracking
export const ANALYTICS_EVENTS = {
  MENU_VIEW: 'menu_view',
  UNIQUE_VISIT: 'unique_visit',
  CATEGORY_VIEW: 'category_view',
  ITEM_VIEW: 'item_view',
  SEARCH: 'search',
  QR_SCAN: 'qr_scan'
}

// Tipos de estadísticas agregadas
export const STATS_TYPES = {
  AVERAGE_PRICE: 'average_price',
  TOTAL_ITEMS: 'total_items',
  TOTAL_CATEGORIES: 'total_categories',
  MENU_VIEWS: 'menu_views',
  POPULAR_ITEMS: 'popular_items'
}

// Configuración de agregación
export const AGGREGATION_CONFIG = {
  // Estadísticas que se calculan en tiempo real (escritura ocasional, lectura frecuente)
  COMPUTED_STATS: [
    STATS_TYPES.AVERAGE_PRICE,
    STATS_TYPES.TOTAL_ITEMS,
    STATS_TYPES.TOTAL_CATEGORIES
  ],
  
  // Estadísticas que se agregan por lotes (escritura frecuente, lectura ocasional)
  BATCHED_STATS: [
    STATS_TYPES.MENU_VIEWS,
    STATS_TYPES.POPULAR_ITEMS
  ],
  
  // Intervalos de agregación para estadísticas por lotes
  BATCH_INTERVALS: {
    HOURLY: 'hourly',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
  }
}

// Configuración de retención de datos
export const RETENTION_CONFIG = {
  // Eventos individuales se mantienen por 30 días
  EVENTS_RETENTION_DAYS: 30,
  
  // Estadísticas agregadas se mantienen por períodos más largos
  STATS_RETENTION: {
    hourly: 7,    // 7 días de datos por hora
    daily: 90,    // 90 días de datos diarios
    weekly: 52,   // 52 semanas de datos semanales
    monthly: 24   // 24 meses de datos mensuales
  }
}

// Configuración de límites por plan de suscripción
export const ANALYTICS_LIMITS = {
  start: {
    retentionDays: 7,
    maxEvents: 1000,
    advancedMetrics: false
  },
  pro: {
    retentionDays: 30,
    maxEvents: 10000,
    advancedMetrics: true
  },
  enterprise: {
    retentionDays: 365,
    maxEvents: -1, // ilimitado
    advancedMetrics: true
  }
}

/**
 * Genera un fingerprint único del dispositivo basado en características del navegador
 * Esto nos permite trackear visitas únicas sin usar cookies
 */
export function generateDeviceFingerprint() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('Device fingerprint', 2, 2)
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.cookieEnabled,
    canvas.toDataURL()
  ].join('|')
  
  // Crear hash simple del fingerprint
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convertir a 32-bit integer
  }
  
  return Math.abs(hash).toString(36)
}

/**
 * Verifica si es una visita única del dispositivo para un restaurante específico
 * Usa localStorage para persistir entre sesiones
 */
export function isUniqueVisit(restaurantId) {
  const deviceId = generateDeviceFingerprint()
  const storageKey = `visited_restaurants_${deviceId}`
  
  try {
    const visitedRestaurants = JSON.parse(localStorage.getItem(storageKey) || '{}')
    const hasVisited = visitedRestaurants[restaurantId]
    
    if (!hasVisited) {
      // Marcar como visitado
      visitedRestaurants[restaurantId] = {
        firstVisit: new Date().toISOString(),
        deviceId: deviceId
      }
      localStorage.setItem(storageKey, JSON.stringify(visitedRestaurants))
      return true // Es visita única
    }
    
    return false // Ya visitó antes
  } catch (error) {
    console.warn('Error checking unique visit:', error)
    return true // En caso de error, asumir que es única
  }
}
