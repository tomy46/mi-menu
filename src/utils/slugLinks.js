/**
 * Utilidades para generar enlaces con slugs
 */

/**
 * Genera el enlace público del menú usando slug
 * @param {Object} restaurant - Objeto del restaurante
 * @param {Object} menu - Objeto del menú (opcional)
 * @param {Object} params - Parámetros adicionales (mesa, idioma, etc.)
 * @returns {string} - URL completa del menú público
 */
export function getPublicMenuUrl(restaurant, menu = null, params = {}) {
  if (!restaurant) {
    throw new Error('Restaurant is required')
  }

  // Usar slug si está disponible, sino usar ID con /r/
  const baseUrl = restaurant.slug 
    ? `/${restaurant.slug}`
    : `/r/${restaurant.id}`
  
  // Agregar slug del menú si está disponible
  const menuPath = menu?.slug ? `/${menu.slug}` : ''
  
  // Construir query parameters
  const queryParams = new URLSearchParams()
  
  if (params.mesa) {
    queryParams.set('mesa', params.mesa)
  }
  
  if (params.lang && params.lang !== 'es') {
    queryParams.set('lang', params.lang)
  }
  
  // Agregar otros parámetros personalizados
  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'mesa' && key !== 'lang' && value) {
      queryParams.set(key, value)
    }
  })
  
  const queryString = queryParams.toString()
  const fullPath = baseUrl + menuPath + (queryString ? `?${queryString}` : '')
  
  return fullPath
}

/**
 * Genera el enlace completo del menú público (con dominio)
 * @param {Object} restaurant - Objeto del restaurante
 * @param {Object} menu - Objeto del menú (opcional)
 * @param {Object} params - Parámetros adicionales
 * @returns {string} - URL completa con dominio
 */
export function getFullPublicMenuUrl(restaurant, menu = null, params = {}) {
  const path = getPublicMenuUrl(restaurant, menu, params)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio.com'
  return origin + path
}

/**
 * Genera enlace para QR con mesa específica
 * @param {Object} restaurant - Objeto del restaurante
 * @param {number|string} tableNumber - Número de mesa
 * @param {Object} menu - Objeto del menú (opcional)
 * @returns {string} - URL para QR de mesa
 */
export function getTableQRUrl(restaurant, tableNumber, menu = null) {
  return getFullPublicMenuUrl(restaurant, menu, { mesa: tableNumber })
}

/**
 * Genera enlace para compartir en redes sociales
 * @param {Object} restaurant - Objeto del restaurante
 * @param {Object} menu - Objeto del menú (opcional)
 * @param {string} lang - Idioma específico (opcional)
 * @returns {string} - URL para compartir
 */
export function getSocialShareUrl(restaurant, menu = null, lang = null) {
  const params = {}
  if (lang && lang !== 'es') {
    params.lang = lang
  }
  return getFullPublicMenuUrl(restaurant, menu, params)
}

/**
 * Verifica si un enlace es canónico (usa la versión normalizada del slug)
 * @param {string} currentPath - Ruta actual
 * @param {Object} restaurant - Objeto del restaurante
 * @param {Object} menu - Objeto del menú (opcional)
 * @returns {boolean} - True si es canónico
 */
export function isCanonicalUrl(currentPath, restaurant, menu = null) {
  const canonicalPath = getPublicMenuUrl(restaurant, menu)
  return currentPath.split('?')[0] === canonicalPath
}

/**
 * Genera el enlace canónico preservando query parameters
 * @param {string} currentUrl - URL actual completa
 * @param {Object} restaurant - Objeto del restaurante
 * @param {Object} menu - Objeto del menú (opcional)
 * @returns {string} - URL canónica
 */
export function getCanonicalUrl(currentUrl, restaurant, menu = null) {
  try {
    const url = new URL(currentUrl)
    const canonicalPath = getPublicMenuUrl(restaurant, menu)
    return url.origin + canonicalPath + url.search
  } catch (error) {
    // Fallback si la URL no es válida
    return getPublicMenuUrl(restaurant, menu)
  }
}

/**
 * Extrae parámetros de una URL de menú público
 * @param {string} url - URL a analizar
 * @returns {Object} - Objeto con parámetros extraídos
 */
export function parseMenuUrl(url) {
  try {
    const urlObj = new URL(url)
    const params = new URLSearchParams(urlObj.search)
    
    return {
      mesa: params.get('mesa'),
      lang: params.get('lang') || 'es',
      // Agregar otros parámetros según sea necesario
    }
  } catch (error) {
    return {
      mesa: null,
      lang: 'es'
    }
  }
}
