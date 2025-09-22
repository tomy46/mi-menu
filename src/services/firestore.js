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
  const q = query(colMenus(), where('restaurantId', '==', restaurantId), where('active', '==', true))
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

// CRUD (basic)
export async function createCategory({ menuId, name, order }) {
  return addDoc(colCategories(), {
    menuId,
    name,
    order: Number(order) || 0,
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  const menuRef = await addDoc(colMenus(), {
    restaurantId: restaurantRef.id,
    title: 'Carta Principal',
    active: true,
  })
  return { restaurantId: restaurantRef.id, menuId: menuRef.id }
}
