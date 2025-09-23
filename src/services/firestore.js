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
  limit,
  writeBatch,
} from 'firebase/firestore'

// Collections
export const colRestaurants = () => collection(db, 'restaurants')
export const colMenus = () => collection(db, 'menus')
export const colCategories = () => collection(db, 'categories')
export const colItems = () => collection(db, 'items')

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
  return addDoc(colCategories(), {
    menuId,
    name,
    order: Number(order) || 0,
    description: description || '',
    tag: tag || '',
    active: active !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateCategory(id, data) {
  return updateDoc(doc(db, 'categories', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteCategory(id) {
  return deleteDoc(doc(db, 'categories', id))
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
  return addDoc(colItems(), {
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
}

export async function updateItem(id, data) {
  return updateDoc(doc(db, 'items', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteItem(id) {
  return deleteDoc(doc(db, 'items', id))
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
