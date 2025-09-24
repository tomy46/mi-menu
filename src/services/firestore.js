import { db } from '../firebase'
import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  setDoc,
  limit,
  writeBatch,
} from 'firebase/firestore'
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUS } from '../config/subscriptionPlans'
import { ANALYTICS_EVENTS, STATS_TYPES, AGGREGATION_CONFIG } from '../config/analytics'
import { createMultiLanguageField, DEFAULT_LANGUAGE, migrateToMultiLanguage } from '../config/languages'

// Collections
export const colRestaurants = () => collection(db, 'restaurants')
export const colMenus = () => collection(db, 'menus')
export const colCategories = () => collection(db, 'categories')
export const colItems = () => collection(db, 'items')
export const colSubscriptions = () => collection(db, 'subscriptions')
export const colPlans = () => collection(db, 'plans')
export const colTeamMembers = () => collection(db, 'teamMembers')
export const colAnalyticsEvents = () => collection(db, 'analyticsEvents')
export const colAnalyticsStats = () => collection(db, 'analyticsStats')
export const colAnalyticsVisitStats = () => collection(db, 'analyticsVisitStats')

// Restaurant helpers
export async function getRestaurant(id) {
  const snap = await getDoc(doc(db, 'restaurants', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// List all restaurants owned by a user
export async function getOwnedRestaurants(uid) {
  try {
    const q1 = query(colRestaurants(), where('owners', 'array-contains', uid))
    const snaps = await getDocs(q1)
    const list = snaps.docs.map((d) => ({ id: d.id, ...d.data() }))
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  } catch (e) {
    // Fallback to empty list on error
    console.error('Error fetching owned restaurants:', e)
    return []
  }
}

export async function isOwner(restaurantId, uid) {
  const r = await getRestaurant(restaurantId)
  if (!r) return false
  const owners = Array.isArray(r.owners) ? r.owners : []
  return owners.includes(uid)
}

// Owned restaurants
export async function getFirstOwnedRestaurant(uid) {
  try {
    const q1 = query(colRestaurants(), where('owners', 'array-contains', uid), limit(1))
    const snaps = await getDocs(q1)
    if (!snaps.empty) {
      const d = snaps.docs[0]
      return { id: d.id, ...d.data() }
    }
  } catch (e) {
    // ignore and try fallback
  }

  // Fallback: read a small page of public restaurants and filter client-side
  try {
    const q2 = query(colRestaurants(), where('isPublic', '==', true), limit(10))
    const snaps2 = await getDocs(q2)
    for (const d of snaps2.docs) {
      const data = d.data()
      const owners = Array.isArray(data.owners) ? data.owners : []
      if (owners.includes(uid)) return { id: d.id, ...data }
    }
  } catch (e) {
    // swallow and return null
  }
  return null
}

// Get restaurant by slug
export async function getRestaurantBySlug(slug) {
  try {
    const q = query(colRestaurants(), where('slug', '==', slug), where('isPublic', '==', true), limit(1))
    const snaps = await getDocs(q)
    if (!snaps.empty) {
      const d = snaps.docs[0]
      return { id: d.id, ...d.data() }
    }
  } catch (e) {
    console.error('Error getting restaurant by slug:', e)
  }
  return null
}

// Generate slug from name
export function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
}

// Query helpers
export async function getActiveMenuByRestaurant(restaurantId) {
  const q = query(colMenus(), where('restaurantId', '==', restaurantId), where('active', '==', true), where('deleted', '==', false))
  const snaps = await getDocs(q)
  const docs = snaps.docs.map((d) => ({ id: d.id, ...d.data() }))
  return docs[0] || null
}

// Get all menus for a restaurant (including inactive, excluding deleted)
export async function getMenusByRestaurant(restaurantId, { includeInactive = true } = {}) {
  let q = query(colMenus(), where('restaurantId', '==', restaurantId), where('deleted', '==', false), orderBy('order', 'asc'))
  
  const snaps = await getDocs(q)
  let menus = snaps.docs.map((d) => ({ id: d.id, ...d.data() }))
  
  if (!includeInactive) {
    menus = menus.filter(menu => menu.active === true)
  }
  
  return menus
}

// Get specific menu by ID
export async function getMenu(menuId) {
  const snap = await getDoc(doc(db, 'menus', menuId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// Get menu by restaurant and type
export async function getMenuByType(restaurantId, menuType) {
  const q = query(
    colMenus(), 
    where('restaurantId', '==', restaurantId), 
    where('type', '==', menuType),
    where('deleted', '==', false)
  )
  const snaps = await getDocs(q)
  const docs = snaps.docs.map((d) => ({ id: d.id, ...d.data() }))
  return docs[0] || null
}

export async function getCategories(menuId) {
  const q = query(colCategories(), where('menuId', '==', menuId), orderBy('order', 'asc'))
  const snaps = await getDocs(q)
  return snaps.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getItemsByCategory(categoryId, { onlyAvailable = false } = {}) {
  let qBase = query(colItems(), where('categoryId', '==', categoryId), orderBy('order', 'asc'))
  // NOTE: Firestore cannot add conditional where easily; we'll filter client-side for MVP
  const snaps = await getDocs(qBase)
  let items = snaps.docs.map((d) => ({ id: d.id, ...d.data() }))
  if (onlyAvailable) items = items.filter((i) => i.available !== false)
  return items
}

export async function getItems(restaurantId, { onlyAvailable = false } = {}) {
  try {
    // First get the menu for this restaurant
    const menu = await getActiveMenuByRestaurant(restaurantId)
    if (!menu) return []
    
    // Get all categories for this menu
    const categories = await getCategories(menu.id)
    if (categories.length === 0) return []
    
    // Get all items for all categories
    const allItems = []
    for (const category of categories) {
      const categoryItems = await getItemsByCategory(category.id, { onlyAvailable })
      allItems.push(...categoryItems)
    }
    
    return allItems
  } catch (error) {
    console.error('Error fetching items:', error)
    return []
  }
}

// CRUD (basic)
export async function createCategory({ menuId, name, order, description, tag, active = true }) {
  const result = await addDoc(colCategories(), {
    menuId,
    name,
    order: Number(order) || 0,
    description: description || '',
    tag: tag || '',
    active: active !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  
  // Actualizar estadísticas del restaurante
  try {
    const menu = await getMenu(menuId)
    if (menu?.restaurantId) {
      await refreshRestaurantStats(menu.restaurantId)
    }
  } catch (error) {
    console.warn('Error updating stats after category creation:', error)
  }
  
  return result
}

// CRUD con soporte multiidioma
export async function createCategoryMultiLang({ 
  menuId, 
  nameMultiLang, 
  descriptionMultiLang, 
  order, 
  tag, 
  active = true 
}) {
  // Crear campos multiidioma si se pasan valores simples
  const name = typeof nameMultiLang === 'string' 
    ? migrateToMultiLanguage(nameMultiLang) 
    : nameMultiLang || createMultiLanguageField()
    
  const description = typeof descriptionMultiLang === 'string'
    ? migrateToMultiLanguage(descriptionMultiLang)
    : descriptionMultiLang || createMultiLanguageField()

  const result = await addDoc(colCategories(), {
    menuId,
    name, // Objeto multiidioma: { es: "Categoría", en: "Category", ... }
    description, // Objeto multiidioma: { es: "Descripción", en: "Description", ... }
    order: Number(order) || 0,
    tag: tag || '',
    active: active !== false,
    // Metadatos para identificar que es multiidioma
    isMultiLanguage: true,
    supportedLanguages: Object.keys(name),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  
  // Actualizar estadísticas del restaurante
  try {
    const menu = await getMenu(menuId)
    if (menu?.restaurantId) {
      await refreshRestaurantStats(menu.restaurantId)
    }
  } catch (error) {
    console.warn('Error updating stats after category creation:', error)
  }
  
  return result
}

export async function updateCategory(id, data) {
  const result = await updateDoc(doc(db, 'categories', id), { ...data, updatedAt: serverTimestamp() })
  
  // Actualizar estadísticas del restaurante
  try {
    const category = await getDoc(doc(db, 'categories', id))
    if (category.exists()) {
      const menu = await getMenu(category.data().menuId)
      if (menu?.restaurantId) {
        await refreshRestaurantStats(menu.restaurantId)
      }
    }
  } catch (error) {
    console.warn('Error updating stats after category update:', error)
  }
  
  return result
}

export async function deleteCategory(id) {
  // Obtener información antes de eliminar
  let restaurantId = null
  try {
    const category = await getDoc(doc(db, 'categories', id))
    if (category.exists()) {
      const menu = await getMenu(category.data().menuId)
      restaurantId = menu?.restaurantId
    }
  } catch (error) {
    console.warn('Error getting category info before deletion:', error)
  }
  
  const result = await deleteDoc(doc(db, 'categories', id))
  
  // Actualizar estadísticas del restaurante
  if (restaurantId) {
    try {
      await refreshRestaurantStats(restaurantId)
    } catch (error) {
      console.warn('Error updating stats after category deletion:', error)
    }
  }
  
  return result
}

export async function reorderCategories(categories) {
  const batch = writeBatch(db)
  categories.forEach((category, index) => {
    const categoryRef = doc(db, 'categories', category.id)
    batch.update(categoryRef, { order: index, updatedAt: serverTimestamp() })
  })
  return batch.commit()
}

export async function reorderItems(items) {
  const batch = writeBatch(db)
  items.forEach((item, index) => {
    const itemRef = doc(db, 'items', item.id)
    batch.update(itemRef, { order: index, updatedAt: serverTimestamp() })
  })
  return batch.commit()
}

export async function createItem({ categoryId, name, description, price, currency = 'ARS', available = true, order = 0 }) {
  const result = await addDoc(colItems(), {
    categoryId,
    name,
    description: description || '',
    price: Number(price) || 0,
    currency,
    available,
    order: Number(order) || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  
  // Actualizar estadísticas del restaurante
  try {
    const category = await getDoc(doc(db, 'categories', categoryId))
    if (category.exists()) {
      const menu = await getMenu(category.data().menuId)
      if (menu?.restaurantId) {
        await refreshRestaurantStats(menu.restaurantId)
      }
    }
  } catch (error) {
    console.warn('Error updating stats after item creation:', error)
  }
  
  return result
}

export async function createItemMultiLang({ 
  categoryId, 
  nameMultiLang, 
  descriptionMultiLang, 
  price, 
  currency = 'ARS', 
  available = true, 
  order = 0 
}) {
  // Crear campos multiidioma si se pasan valores simples
  const name = typeof nameMultiLang === 'string' 
    ? migrateToMultiLanguage(nameMultiLang) 
    : nameMultiLang || createMultiLanguageField()
    
  const description = typeof descriptionMultiLang === 'string'
    ? migrateToMultiLanguage(descriptionMultiLang)
    : descriptionMultiLang || createMultiLanguageField()

  const result = await addDoc(colItems(), {
    categoryId,
    name, // Objeto multiidioma: { es: "Producto", en: "Product", ... }
    description, // Objeto multiidioma: { es: "Descripción", en: "Description", ... }
    price: Number(price) || 0,
    currency,
    available,
    order: Number(order) || 0,
    // Metadatos para identificar que es multiidioma
    isMultiLanguage: true,
    supportedLanguages: Object.keys(name),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  
  // Actualizar estadísticas del restaurante
  try {
    const category = await getDoc(doc(db, 'categories', categoryId))
    if (category.exists()) {
      const menu = await getMenu(category.data().menuId)
      if (menu?.restaurantId) {
        await refreshRestaurantStats(menu.restaurantId)
      }
    }
  } catch (error) {
    console.warn('Error updating stats after item creation:', error)
  }
  
  return result
}

export async function updateItem(id, data) {
  const result = await updateDoc(doc(db, 'items', id), { ...data, updatedAt: serverTimestamp() })
  
  // Actualizar estadísticas del restaurante
  try {
    const item = await getDoc(doc(db, 'items', id))
    if (item.exists()) {
      const category = await getDoc(doc(db, 'categories', item.data().categoryId))
      if (category.exists()) {
        const menu = await getMenu(category.data().menuId)
        if (menu?.restaurantId) {
          await refreshRestaurantStats(menu.restaurantId)
        }
      }
    }
  } catch (error) {
    console.warn('Error updating stats after item update:', error)
  }
  
  return result
}

export async function deleteItem(id) {
  // Obtener información antes de eliminar
  let restaurantId = null
  try {
    const item = await getDoc(doc(db, 'items', id))
    if (item.exists()) {
      const category = await getDoc(doc(db, 'categories', item.data().categoryId))
      if (category.exists()) {
        const menu = await getMenu(category.data().menuId)
        restaurantId = menu?.restaurantId
      }
    }
  } catch (error) {
    console.warn('Error getting item info before deletion:', error)
  }
  
  const result = await deleteDoc(doc(db, 'items', id))
  
  // Actualizar estadísticas del restaurante
  if (restaurantId) {
    try {
      await refreshRestaurantStats(restaurantId)
    } catch (error) {
      console.warn('Error updating stats after item deletion:', error)
    }
  }
  
  return result
}

// Update restaurant
export async function updateRestaurant(id, data) {
  // If name is being updated, regenerate slug
  if (data.name) {
    data.slug = generateSlug(data.name)
  }
  return updateDoc(doc(db, 'restaurants', id), { ...data, updatedAt: serverTimestamp() })
}

// Menu CRUD operations
export async function createMenu({ restaurantId, title, type = 'main', description = '', active = true, order = 0 }) {
  return addDoc(colMenus(), {
    restaurantId,
    title,
    type, // 'main', 'lunch', 'dinner', 'drinks', 'desserts', etc.
    description,
    active,
    deleted: false,
    order: Number(order) || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function createMenuMultiLang({ 
  restaurantId, 
  titleMultiLang, 
  descriptionMultiLang, 
  type = 'main', 
  active = true, 
  order = 0 
}) {
  // Crear campos multiidioma si se pasan valores simples
  const title = typeof titleMultiLang === 'string' 
    ? migrateToMultiLanguage(titleMultiLang) 
    : titleMultiLang || createMultiLanguageField()
    
  const description = typeof descriptionMultiLang === 'string'
    ? migrateToMultiLanguage(descriptionMultiLang)
    : descriptionMultiLang || createMultiLanguageField()

  return addDoc(colMenus(), {
    restaurantId,
    title, // Objeto multiidioma: { es: "Carta Principal", en: "Main Menu", ... }
    description, // Objeto multiidioma: { es: "Descripción", en: "Description", ... }
    type, // 'main', 'lunch', 'dinner', 'drinks', 'desserts', etc.
    active,
    deleted: false,
    order: Number(order) || 0,
    // Metadatos para identificar que es multiidioma
    isMultiLanguage: true,
    supportedLanguages: Object.keys(title),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateMenu(id, data) {
  return updateDoc(doc(db, 'menus', id), { ...data, updatedAt: serverTimestamp() })
}

// Soft delete menu
export async function deleteMenu(id) {
  return updateDoc(doc(db, 'menus', id), { 
    deleted: true, 
    active: false, // Also deactivate when deleting
    updatedAt: serverTimestamp() 
  })
}

// Toggle menu active status
export async function toggleMenuActive(id, active) {
  return updateDoc(doc(db, 'menus', id), { 
    active: !!active, 
    updatedAt: serverTimestamp() 
  })
}

// Reorder menus
export async function reorderMenus(menus) {
  const batch = writeBatch(db)
  menus.forEach((menu, index) => {
    const menuRef = doc(db, 'menus', menu.id)
    batch.update(menuRef, { order: index, updatedAt: serverTimestamp() })
  })
  return batch.commit()
}

// Create restaurant + default menu
export async function createRestaurantWithDefaultMenu({ uid, name, isPublic = true }) {
  const restaurantName = name || 'Heladeria Pistacho'
  const slug = generateSlug(restaurantName)
  
  const restaurantRef = await addDoc(colRestaurants(), {
    name: restaurantName,
    slug: slug,
    isPublic: !!isPublic,
    owners: [uid],
    phone: '',
    address: '',
    website: '',
    hours: '',
    theme: 'elegant', // Default theme
    socialMedia: [
      { title: '', url: '' },
      { title: '', url: '' },
      { title: '', url: '' }
    ],
    logo: '', // Default empty logo
    // Subscription fields
    subscriptionPlan: SUBSCRIPTION_PLANS.START, // Default to Start plan
    subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE, // Active by default
    subscriptionStartDate: serverTimestamp(),
    subscriptionEndDate: null, // Will be set when implementing billing
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  
  // Create default main menu
  const menuRef = await addDoc(colMenus(), {
    restaurantId: restaurantRef.id,
    title: 'Carta Principal',
    type: 'main',
    description: 'Menú principal del restaurante',
    active: true,
    deleted: false,
    order: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  
  return { restaurantId: restaurantRef.id, menuId: menuRef.id }
}

// Create restaurant with wizard data (name, category, product)
export async function createRestaurantFromWizard({ 
  uid, 
  storeName, 
  category, 
  productName, 
  productPrice 
}) {
  // Create restaurant with default menu
  const { restaurantId, menuId } = await createRestaurantWithDefaultMenu({
    uid,
    name: storeName,
    isPublic: false // Start as private until user makes it public
  })

  // Create the category
  const categoryResult = await createCategory({
    menuId,
    name: category,
    order: 0,
    description: '',
    tag: '',
    active: true
  })

  // Create the first product
  await createItem({
    categoryId: categoryResult.id,
    name: productName,
    description: '',
    price: productPrice,
    currency: 'ARS',
    available: true,
    order: 0
  })

  return { restaurantId, menuId }
}

// Subscription and limits functions
export async function getRestaurantUsage(restaurantId) {
  try {
    // Count menus
    const menusQuery = query(colMenus(), where('restaurantId', '==', restaurantId), where('deleted', '==', false))
    const menusSnap = await getDocs(menusQuery)
    const menusCount = menusSnap.size
    const menus = menusSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    let categoriesCount = 0
    let productsCount = 0

    // Count categories and products for each menu
    for (const menu of menus) {
      // Count categories for this menu
      const categoriesQuery = query(colCategories(), where('menuId', '==', menu.id))
      const categoriesSnap = await getDocs(categoriesQuery)
      categoriesCount += categoriesSnap.size
      
      // Count products for each category in this menu
      const categories = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      for (const category of categories) {
        const itemsQuery = query(colItems(), where('categoryId', '==', category.id))
        const itemsSnap = await getDocs(itemsQuery)
        productsCount += itemsSnap.size
      }
    }

    // Team members count (for now just owners, will expand later)
    const restaurant = await getRestaurant(restaurantId)
    const teamMembersCount = restaurant?.owners?.length || 1

    return {
      menus: menusCount,
      categories: categoriesCount,
      products: productsCount,
      teamMembers: teamMembersCount
    }
  } catch (error) {
    console.error('Error getting restaurant usage:', error)
    return {
      menus: 0,
      categories: 0,
      products: 0,
      teamMembers: 1
    }
  }
}

export async function checkSubscriptionLimit(restaurantId, limitType, increment = 1) {
  try {
    const restaurant = await getRestaurant(restaurantId)
    if (!restaurant) return { allowed: false, reason: 'Restaurant not found' }

    const { subscriptionPlan = SUBSCRIPTION_PLANS.START } = restaurant
    const usage = await getRestaurantUsage(restaurantId)
    
    // Import limit checking functions
    const { isWithinLimit, getLimit } = await import('../config/subscriptionPlans')
    
    const currentCount = usage[limitType] || 0
    const newCount = currentCount + increment
    const limit = getLimit(subscriptionPlan, limitType)
    
    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, current: currentCount, limit: 'unlimited' }
    }
    
    const allowed = newCount <= limit
    
    return {
      allowed,
      current: currentCount,
      limit,
      remaining: Math.max(0, limit - currentCount),
      reason: allowed ? null : `Límite de ${limitType} alcanzado (${limit})`
    }
  } catch (error) {
    console.error('Error checking subscription limit:', error)
    return { allowed: false, reason: 'Error checking limits' }
  }
}

export async function updateSubscriptionPlan(restaurantId, newPlan) {
  try {
    const restaurantRef = doc(db, 'restaurants', restaurantId)
    await updateDoc(restaurantRef, {
      subscriptionPlan: newPlan,
      updatedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error('Error updating subscription plan:', error)
    return false
  }
}


// ===== ANALYTICS FUNCTIONS =====

/**
 * Registra un evento de analytics (escritura frecuente)
 * Optimizado para alta frecuencia de escritura
 */
export async function trackEvent(eventData) {
  try {
    const event = {
      ...eventData,
      createdAt: serverTimestamp()
    }
    
    // Escribir evento sin esperar respuesta para mejor performance
    await addDoc(colAnalyticsEvents(), event)
    
    // Actualizar estadísticas agregadas si es necesario
    if (eventData.type === ANALYTICS_EVENTS.MENU_VIEW) {
      await updateMenuViewStats(eventData.restaurantId, eventData.menuId)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error tracking event:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtiene estadísticas agregadas (lectura frecuente)
 * Optimizado para alta frecuencia de lectura
 */
export async function getRestaurantStats(restaurantId) {
  try {
    const statsDoc = doc(db, 'analyticsStats', `restaurant_${restaurantId}`)
    const snap = await getDoc(statsDoc)
    
    if (snap.exists()) {
      return { success: true, data: snap.data() }
    }
    
    // Si no existen estadísticas, crear estadísticas básicas por defecto
    const defaultStats = {
      restaurantId,
      totalCategories: 0,
      totalItems: 0,
      averagePrice: 0,
      lastCalculated: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    try {
      await setDoc(statsDoc, defaultStats)
      return { success: true, data: defaultStats }
    } catch (createError) {
      console.warn('Could not create default stats, calculating instead:', createError)
      // Fallback: intentar calcular estadísticas
      const stats = await calculateRestaurantStats(restaurantId)
      return { success: true, data: stats }
    }
    
  } catch (error) {
    console.error('Error getting restaurant stats:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtiene estadísticas de un menú específico
 */
export async function getMenuStats(restaurantId, menuId) {
  try {
    const statsDoc = doc(db, 'analyticsStats', `menu_${restaurantId}_${menuId}`)
    const snap = await getDoc(statsDoc)
    
    if (snap.exists()) {
      return { success: true, data: snap.data() }
    }
    
    // Si no existen estadísticas, calcularlas por primera vez
    const stats = await calculateMenuStats(restaurantId, menuId)
    return { success: true, data: stats }
    
  } catch (error) {
    console.error('Error getting menu stats:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Calcula estadísticas agregadas de un restaurante
 * Se ejecuta cuando se crean/actualizan/eliminan productos
 */
export async function calculateRestaurantStats(restaurantId) {
  try {
    // Obtener todos los menús activos del restaurante
    const menusQuery = query(
      colMenus(),
      where('restaurantId', '==', restaurantId),
      where('active', '==', true),
      where('deleted', '==', false)
    )
    const menusSnap = await getDocs(menusQuery)
    const menus = menusSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    let totalItems = 0
    let totalCategories = 0
    let totalPrice = 0
    let itemsWithPrice = 0
    
    // Calcular estadísticas por menú
    for (const menu of menus) {
      // Contar categorías activas
      const categoriesQuery = query(
        colCategories(),
        where('menuId', '==', menu.id),
        where('active', '==', true)
      )
      const categoriesSnap = await getDocs(categoriesQuery)
      totalCategories += categoriesSnap.size
      
      // Para cada categoría, obtener sus items
      const categories = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      for (const category of categories) {
        // Contar productos activos de esta categoría
        const itemsQuery = query(
          colItems(),
          where('categoryId', '==', category.id),
          where('available', '==', true)
        )
        const itemsSnap = await getDocs(itemsQuery)
        totalItems += itemsSnap.size
        
        // Calcular precio promedio
        itemsSnap.docs.forEach(doc => {
          const item = doc.data()
          if (item.price && item.price > 0) {
            totalPrice += item.price
            itemsWithPrice++
          }
        })
      }
    }
    
    const averagePrice = itemsWithPrice > 0 ? totalPrice / itemsWithPrice : 0
    
    const stats = {
      restaurantId,
      totalMenus: menus.length,
      totalCategories,
      totalItems,
      averagePrice: Math.round(averagePrice * 100) / 100, // Redondear a 2 decimales
      lastCalculated: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    // Guardar estadísticas agregadas
    const statsDoc = doc(db, 'analyticsStats', `restaurant_${restaurantId}`)
    await updateDoc(statsDoc, stats).catch(async () => {
      // Si el documento no existe, crearlo
      await setDoc(statsDoc, { restaurantId, ...stats })
    })
    
    return stats
    
  } catch (error) {
    console.error('Error calculating restaurant stats:', error)
    throw error
  }
}

/**
 * Calcula estadísticas de un menú específico
 */
export async function calculateMenuStats(restaurantId, menuId) {
  try {
    // Contar categorías activas del menú
    const categoriesQuery = query(
      colCategories(),
      where('menuId', '==', menuId),
      where('active', '==', true)
    )
    const categoriesSnap = await getDocs(categoriesQuery)
    const categories = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    let totalItems = 0
    let totalPrice = 0
    let itemsWithPrice = 0
    
    // Para cada categoría, obtener sus items
    for (const category of categories) {
      const itemsQuery = query(
        colItems(),
        where('categoryId', '==', category.id),
        where('available', '==', true)
      )
      const itemsSnap = await getDocs(itemsQuery)
      totalItems += itemsSnap.size
      
      // Calcular precio promedio
      itemsSnap.docs.forEach(doc => {
        const item = doc.data()
        if (item.price && item.price > 0) {
          totalPrice += item.price
          itemsWithPrice++
        }
      })
    }
    
    const averagePrice = itemsWithPrice > 0 ? totalPrice / itemsWithPrice : 0
    
    const stats = {
      restaurantId,
      menuId,
      totalCategories: categories.length,
      totalItems,
      averagePrice: Math.round(averagePrice * 100) / 100,
      lastCalculated: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    // Guardar estadísticas del menú
    const statsDoc = doc(db, 'analyticsStats', `menu_${restaurantId}_${menuId}`)
    await updateDoc(statsDoc, stats).catch(async () => {
      // Si el documento no existe, crearlo
      await setDoc(statsDoc, { restaurantId, menuId, ...stats })
    })
    
    return stats
    
  } catch (error) {
    console.error('Error calculating menu stats:', error)
    throw error
  }
}

/**
 * Actualiza estadísticas de visualizaciones de menú
 * Se ejecuta cada vez que alguien ve el menú público
 * Usa la nueva colección analyticsVisitStats con permisos amplios
 */
async function updateMenuViewStats(restaurantId, menuId) {
  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const statsId = `views_${restaurantId}_${menuId}_${today}`
    const statsDoc = doc(db, 'analyticsVisitStats', statsId)
    
    const snap = await getDoc(statsDoc)
    
    if (snap.exists()) {
      // Incrementar contador existente
      await updateDoc(statsDoc, {
        views: (snap.data().views || 0) + 1,
        lastView: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } else {
      // Crear nuevo contador
      await setDoc(statsDoc, {
        restaurantId,
        menuId,
        date: today,
        views: 1,
        type: 'daily_views',
        lastView: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
    
  } catch (error) {
    console.error('Error updating menu view stats:', error)
  }
}

/**
 * Verifica si un restaurante/menú tiene visitas registradas
 * Función más robusta que verifica en múltiples colecciones
 */
export async function checkHasVisits(restaurantId, menuId) {
  try {
    console.log('checkHasVisits called with:', { restaurantId, menuId })
    
    // Primero verificar en analyticsVisitStats
    const visitStatsQuery = query(
      colAnalyticsVisitStats(),
      where('restaurantId', '==', restaurantId),
      where('menuId', '==', menuId),
      where('type', '==', 'daily_views'),
      limit(1)
    )
    
    const visitStatsSnap = await getDocs(visitStatsQuery)
    console.log('Found visit stats documents:', visitStatsSnap.size)
    
    if (!visitStatsSnap.empty) {
      const totalViews = visitStatsSnap.docs.reduce((sum, doc) => sum + (doc.data().views || 0), 0)
      console.log('Total views from visit stats:', totalViews)
      
      if (totalViews > 0) {
        return {
          success: true,
          data: { totalViews, hasVisits: true }
        }
      }
    }
    
    // Si no hay datos en visitStats, verificar en analyticsEvents como respaldo
    const eventsQuery = query(
      colAnalyticsEvents(),
      where('restaurantId', '==', restaurantId),
      where('menuId', '==', menuId),
      where('type', '==', 'MENU_VIEW'),
      limit(1)
    )
    
    const eventsSnap = await getDocs(eventsQuery)
    console.log('Found analytics events:', eventsSnap.size)
    
    const hasVisits = !eventsSnap.empty
    
    return {
      success: true,
      data: { 
        totalViews: eventsSnap.size,
        hasVisits 
      }
    }
    
  } catch (error) {
    console.error('Error checking visits:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtiene estadísticas de visualizaciones por período
 */
export async function getViewStats(restaurantId, menuId = null, days = 30) {
  try {
    console.log('getViewStats called with:', { restaurantId, menuId, days })
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)
    
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]
    
    console.log('Date range:', { startDateStr, endDateStr })
    
    let q
    if (menuId) {
      // Estadísticas de un menú específico
      q = query(
        colAnalyticsVisitStats(),
        where('restaurantId', '==', restaurantId),
        where('menuId', '==', menuId),
        where('type', '==', 'daily_views'),
        where('date', '>=', startDateStr),
        where('date', '<=', endDateStr),
        orderBy('date', 'desc')
      )
    } else {
      // Estadísticas de todo el restaurante
      q = query(
        colAnalyticsVisitStats(),
        where('restaurantId', '==', restaurantId),
        where('type', '==', 'daily_views'),
        where('date', '>=', startDateStr),
        where('date', '<=', endDateStr),
        orderBy('date', 'desc')
      )
    }
    
    const snap = await getDocs(q)
    const viewStats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    console.log('Found view stats documents:', viewStats.length)
    console.log('View stats data:', viewStats)
    
    // Calcular totales
    const totalViews = viewStats.reduce((sum, stat) => sum + (stat.views || 0), 0)
    const avgViewsPerDay = viewStats.length > 0 ? totalViews / viewStats.length : 0
    
    console.log('Calculated totalViews:', totalViews)
    
    return {
      success: true,
      data: {
        totalViews,
        avgViewsPerDay: Math.round(avgViewsPerDay * 100) / 100,
        dailyStats: viewStats,
        period: { startDate: startDateStr, endDate: endDateStr, days }
      }
    }
    
  } catch (error) {
    console.error('Error getting view stats:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Función helper para actualizar estadísticas cuando se modifican productos
 * Debe llamarse después de crear/actualizar/eliminar productos o categorías
 */
export async function refreshRestaurantStats(restaurantId) {
  try {
    // Simplemente actualizar las estadísticas básicas
    await calculateRestaurantStats(restaurantId)
    return { success: true }
  } catch (error) {
    console.error('Error refreshing restaurant stats:', error)
    // Si falla, al menos crear estadísticas básicas
    try {
      const statsDoc = doc(db, 'analyticsStats', `restaurant_${restaurantId}`)
      await setDoc(statsDoc, {
        restaurantId,
        totalCategories: 0,
        totalItems: 0,
        averagePrice: 0,
        lastCalculated: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true })
      return { success: true }
    } catch (fallbackError) {
      console.error('Even fallback failed:', fallbackError)
      return { success: false, error: fallbackError.message }
    }
  }
}

// Obtener estadísticas de visitas únicas
export async function getUniqueVisitStats(restaurantId, menuId = null, days = 30) {
  try {
    console.log('getUniqueVisitStats called with:', { restaurantId, menuId, days })
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    console.log('Date range for unique visits:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() })
    
    // Consultar eventos de visitas únicas
    const eventsQuery = query(
      colAnalyticsEvents(),
      where('restaurantId', '==', restaurantId),
      where('type', '==', ANALYTICS_EVENTS.UNIQUE_VISIT),
      where('timestamp', '>=', startDate.toISOString()),
      where('timestamp', '<=', endDate.toISOString()),
      orderBy('timestamp', 'desc')
    )
    
    const eventsSnapshot = await getDocs(eventsQuery)
    const events = eventsSnapshot.docs.map(doc => doc.data())
    
    console.log('Unique visit events found:', events.length)
    
    // Agrupar por día
    const dailyStats = {}
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0]
      if (!dailyStats[date]) {
        dailyStats[date] = 0
      }
      dailyStats[date]++
    })
    
    // Convertir a array y ordenar
    const dailyArray = Object.entries(dailyStats).map(([date, uniqueVisits]) => ({
      date,
      uniqueVisits
    })).sort((a, b) => new Date(a.date) - new Date(b.date))
    
    const totalUniqueVisits = events.length
    const avgUniqueVisitsPerDay = days > 0 ? totalUniqueVisits / days : 0
    
    console.log('Unique visit stats result:', { totalUniqueVisits, avgUniqueVisitsPerDay, dailyArray })
    
    return {
      success: true,
      data: {
        totalUniqueVisits,
        avgUniqueVisitsPerDay,
        dailyStats: dailyArray
      }
    }
  } catch (error) {
    console.error('Error getting unique visit stats:', error)
    return { success: false, error: error.message }
  }
}

// Obtener estadísticas por mesa
export async function getTableStats(restaurantId, days = 30) {
  try {
    console.log('getTableStats called with:', { restaurantId, days })
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    console.log('Date range for table stats:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() })
    
    // Consultar eventos con número de mesa
    const eventsQuery = query(
      colAnalyticsEvents(),
      where('restaurantId', '==', restaurantId),
      where('type', '==', ANALYTICS_EVENTS.MENU_VIEW),
      where('timestamp', '>=', startDate.toISOString()),
      where('timestamp', '<=', endDate.toISOString())
    )
    
    const eventsSnapshot = await getDocs(eventsQuery)
    const events = eventsSnapshot.docs.map(doc => doc.data())
    
    console.log('Menu view events found:', events.length)
    
    // Filtrar eventos que tienen número de mesa y agrupar
    const tableStats = {}
    let totalTableScans = 0
    
    events.forEach(event => {
      console.log('Event tableNumber:', event.tableNumber)
      if (event.tableNumber) {
        const tableNum = event.tableNumber.toString()
        if (!tableStats[tableNum]) {
          tableStats[tableNum] = 0
        }
        tableStats[tableNum]++
        totalTableScans++
      }
    })
    
    console.log('Table stats found:', tableStats, 'Total table scans:', totalTableScans)
    
    // Convertir a array y ordenar por número de mesa
    const tableArray = Object.entries(tableStats)
      .map(([tableNumber, scans]) => ({
        tableNumber: parseInt(tableNumber),
        scans
      }))
      .sort((a, b) => a.tableNumber - b.tableNumber)
    
    return {
      success: true,
      data: {
        totalTableScans,
        totalTables: tableArray.length,
        avgScansPerTable: tableArray.length > 0 ? totalTableScans / tableArray.length : 0,
        tableStats: tableArray
      }
    }
  } catch (error) {
    console.error('Error getting table stats:', error)
    return { success: false, error: error.message }
  }
}
