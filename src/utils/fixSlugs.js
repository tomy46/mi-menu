import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { normalizeSlug } from './slugUtils'

/**
 * Script completo para verificar y arreglar slugs
 * Ejecutar desde la consola del navegador
 */

export async function verifyAndFixAllSlugs() {
  // console.log('🔍 Iniciando verificación y corrección de slugs...\n')
  
  const results = {
    restaurantsChecked: 0,
    restaurantsFixed: 0,
    registryCreated: 0,
    errors: []
  }
  
  try {
    // 1. Obtener todos los restaurantes
    const restaurantsRef = collection(db, 'restaurants')
    const restaurantsSnap = await getDocs(restaurantsRef)
    
    console.log(`📊 Encontrados ${restaurantsSnap.size} restaurantes\n`)
    
    for (const restaurantDoc of restaurantsSnap.docs) {
      const restaurantId = restaurantDoc.id
      const restaurant = restaurantDoc.data()
      results.restaurantsChecked++
      
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`🍽️  Restaurante: ${restaurant.name}`)
      console.log(`   ID: ${restaurantId}`)
      
      let needsFix = false
      let slug = restaurant.slug
      let normalizedSlug = restaurant.normalized_slug
      
      // 2. Verificar si tiene slug
      if (!slug || !normalizedSlug) {
        console.log(`   ⚠️  FALTA SLUG - Generando...`)
        slug = normalizeSlug(restaurant.name)
        normalizedSlug = slug
        needsFix = true
      } else {
        console.log(`   ✅ Tiene slug: ${slug}`)
      }
      
      // 3. Verificar slug_registry
      const registryRef = doc(db, 'slug_registry', normalizedSlug)
      const registryDoc = await getDoc(registryRef)
      
      if (!registryDoc.exists()) {
        console.log(`   ⚠️  FALTA en slug_registry - Creando...`)
        await setDoc(registryRef, {
          restaurantId: restaurantId,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        console.log(`   ✅ Creado slug_registry/${normalizedSlug}`)
        results.registryCreated++
        needsFix = true
      } else {
        const registryData = registryDoc.data()
        if (registryData.restaurantId !== restaurantId) {
          console.log(`   ⚠️  slug_registry apunta a otro restaurante!`)
          console.log(`      Registry: ${registryData.restaurantId}`)
          console.log(`      Actual: ${restaurantId}`)
          results.errors.push({
            restaurant: restaurant.name,
            issue: 'slug_registry apunta a otro restaurante'
          })
        } else {
          console.log(`   ✅ slug_registry correcto`)
        }
      }
      
      // 4. Actualizar documento del restaurante si es necesario
      if (needsFix) {
        console.log(`   🔧 Actualizando restaurante...`)
        await updateDoc(doc(db, 'restaurants', restaurantId), {
          slug: slug,
          normalized_slug: normalizedSlug,
          updatedAt: new Date()
        })
        console.log(`   ✅ Restaurante actualizado`)
        results.restaurantsFixed++
      }
      
      // 5. Verificar isPublic
      if (!restaurant.isPublic) {
        console.log(`   ⚠️  Restaurante NO es público (isPublic: false)`)
        console.log(`      El menú no será accesible por slug`)
      }
      
      // 6. Verificar menú activo
      try {
        const menusRef = collection(db, 'menus')
        const menusSnap = await getDocs(menusRef)
        const restaurantMenus = menusSnap.docs
          .filter(doc => doc.data().restaurantId === restaurantId)
          .filter(doc => doc.data().active === true && doc.data().deleted !== true)
        
        if (restaurantMenus.length === 0) {
          console.log(`   ⚠️  No tiene menús activos`)
        } else {
          console.log(`   ✅ Tiene ${restaurantMenus.length} menú(s) activo(s)`)
        }
      } catch (error) {
        console.log(`   ⚠️  No se pudieron verificar menús (permisos)`)
      }
      
      // 7. URLs disponibles
      console.log(`\n   📍 URLs disponibles:`)
      console.log(`      ${window.location.origin}/${slug}`)
      console.log(`      ${window.location.origin}/r/${slug}`)
      console.log(`      ${window.location.origin}/r/${restaurantId}`)
    }
    
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`✨ RESUMEN:`)
    console.log(`   Restaurantes revisados: ${results.restaurantsChecked}`)
    console.log(`   Restaurantes corregidos: ${results.restaurantsFixed}`)
    console.log(`   Registros creados: ${results.registryCreated}`)
    console.log(`   Errores: ${results.errors.length}`)
    
    if (results.errors.length > 0) {
      console.log(`\n❌ Errores encontrados:`)
      results.errors.forEach(err => {
        console.log(`   - ${err.restaurant}: ${err.issue}`)
      })
    }
    
    return results
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error)
    throw error
  }
}

/**
 * Verificar un restaurante específico por ID
 */
export async function verifyRestaurantById(restaurantId) {
  console.log(`\n🔍 Verificando restaurante: ${restaurantId}\n`)
  
  try {
    // 1. Obtener restaurante
    const restaurantRef = doc(db, 'restaurants', restaurantId)
    const restaurantDoc = await getDoc(restaurantRef)
    
    if (!restaurantDoc.exists()) {
      console.log('❌ Restaurante no encontrado')
      return { exists: false }
    }
    
    const restaurant = restaurantDoc.data()
    
    console.log('📋 Información del Restaurante:')
    console.log(`   Nombre: ${restaurant.name}`)
    console.log(`   ID: ${restaurantId}`)
    console.log(`   Slug: ${restaurant.slug || '❌ NO TIENE'}`)
    console.log(`   Normalized Slug: ${restaurant.normalized_slug || '❌ NO TIENE'}`)
    console.log(`   Público: ${restaurant.isPublic ? '✅ Sí' : '❌ No'}`)
    
    // 2. Verificar slug_registry
    if (restaurant.normalized_slug) {
      console.log(`\n📋 Verificando slug_registry/${restaurant.normalized_slug}:`)
      const registryRef = doc(db, 'slug_registry', restaurant.normalized_slug)
      const registryDoc = await getDoc(registryRef)
      
      if (registryDoc.exists()) {
        const registryData = registryDoc.data()
        console.log(`   ✅ Existe`)
        console.log(`   Restaurant ID: ${registryData.restaurantId}`)
        console.log(`   Coincide: ${registryData.restaurantId === restaurantId ? '✅ Sí' : '❌ No'}`)
      } else {
        console.log(`   ❌ NO EXISTE - Este es el problema!`)
        console.log(`   Necesitas crear: slug_registry/${restaurant.normalized_slug}`)
      }
    }
    
    // 3. Verificar menús
    console.log(`\n📋 Verificando menús:`)
    let activeMenus = []
    try {
      const menusRef = collection(db, 'menus')
      const menusSnap = await getDocs(menusRef)
      const restaurantMenus = menusSnap.docs
        .filter(doc => doc.data().restaurantId === restaurantId)
      
      console.log(`   Total menús: ${restaurantMenus.length}`)
      restaurantMenus.forEach(menuDoc => {
        const menu = menuDoc.data()
        console.log(`   - ${menu.title}: active=${menu.active}, deleted=${menu.deleted}`)
      })
      
      activeMenus = restaurantMenus.filter(doc => 
        doc.data().active === true && doc.data().deleted !== true
      )
      console.log(`   Menús activos: ${activeMenus.length}`)
    } catch (error) {
      console.log(`   ⚠️ No se pudieron verificar menús (permisos): ${error.message}`)
      console.log(`   Esto no afecta la funcionalidad de slugs`)
    }
    
    // 4. URLs
    console.log(`\n📍 URLs que deberían funcionar:`)
    if (restaurant.slug) {
      console.log(`   ${window.location.origin}/${restaurant.slug}`)
      console.log(`   ${window.location.origin}/r/${restaurant.slug}`)
    }
    console.log(`   ${window.location.origin}/r/${restaurantId}`)
    
    return {
      exists: true,
      restaurant,
      hasSlug: !!restaurant.slug,
      hasRegistry: restaurant.normalized_slug ? (await getDoc(doc(db, 'slug_registry', restaurant.normalized_slug))).exists() : false,
      isPublic: restaurant.isPublic,
      hasActiveMenus: activeMenus.length > 0
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    return { exists: false, error: error.message }
  }
}

// Hacer las funciones disponibles globalmente en la consola
if (typeof window !== 'undefined') {
  window.verifyAndFixAllSlugs = verifyAndFixAllSlugs
  window.verifyRestaurantById = verifyRestaurantById
}
