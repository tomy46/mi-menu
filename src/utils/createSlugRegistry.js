import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Función súper simple: solo crea el documento en slug_registry
 * Sin verificaciones complicadas, sin permisos raros
 */
export async function createSlugRegistrySimple(restaurantId, slug) {
  try {
    console.log(`🔧 Creando slug_registry/${slug} → ${restaurantId}`)
    
    const registryRef = doc(db, 'slug_registry', slug)
    await setDoc(registryRef, {
      restaurantId: restaurantId,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    console.log(`✅ Creado exitosamente!`)
    console.log(`\n📍 Ahora puedes acceder a:`)
    console.log(`   ${window.location.origin}/${slug}`)
    console.log(`   ${window.location.origin}/r/${slug}`)
    console.log(`   ${window.location.origin}/r/${restaurantId}`)
    
    return { success: true }
  } catch (error) {
    console.error(`❌ Error:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Para tu restaurante específico
 */
export async function fixShabatify() {
  return await createSlugRegistrySimple('Jl3VJXhpF2JjU7baOb5h', 'shabatify')
}

// Hacer disponible en la consola
if (typeof window !== 'undefined') {
  window.createSlugRegistrySimple = createSlugRegistrySimple
  window.fixShabatify = fixShabatify
}
