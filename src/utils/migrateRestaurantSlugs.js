import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { 
  updateRestaurantSlugRegistry, 
  generateUniqueRestaurantSlug 
} from '../services/firestore'

/**
 * Migra restaurantes existentes sin slug para que tengan uno
 * Útil para restaurantes creados antes de implementar el sistema de slugs
 */
export async function migrateRestaurantsWithoutSlug() {
  try {
    console.log('🔍 Buscando restaurantes sin slug...')
    
    // Buscar restaurantes sin slug
    const restaurantsRef = collection(db, 'restaurants')
    const snapshot = await getDocs(restaurantsRef)
    
    const restaurantsWithoutSlug = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (!data.slug || !data.normalized_slug) {
        restaurantsWithoutSlug.push({
          id: doc.id,
          ...data
        })
      }
    })
    
    console.log(`📊 Encontrados ${restaurantsWithoutSlug.length} restaurantes sin slug`)
    
    if (restaurantsWithoutSlug.length === 0) {
      console.log('✅ Todos los restaurantes tienen slug')
      return { success: true, migrated: 0 }
    }
    
    // Migrar cada restaurante
    let migratedCount = 0
    let errors = []
    
    for (const restaurant of restaurantsWithoutSlug) {
      try {
        console.log(`🔄 Migrando: ${restaurant.name}...`)
        
        // Generar slug único basado en el nombre
        const { slug, normalizedSlug } = await generateUniqueRestaurantSlug(
          restaurant.name, 
          restaurant.id
        )
        
        // Registrar el slug (esto también actualiza el documento del restaurante)
        await updateRestaurantSlugRegistry(
          restaurant.id,
          slug,
          normalizedSlug
        )
        
        console.log(`✅ Migrado: ${restaurant.name} → /${slug}`)
        migratedCount++
      } catch (error) {
        console.error(`❌ Error migrando ${restaurant.name}:`, error)
        errors.push({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          error: error.message
        })
      }
    }
    
    console.log(`\n✨ Migración completada:`)
    console.log(`   - Migrados: ${migratedCount}`)
    console.log(`   - Errores: ${errors.length}`)
    
    if (errors.length > 0) {
      console.log('\n❌ Errores encontrados:')
      errors.forEach(err => {
        console.log(`   - ${err.restaurantName}: ${err.error}`)
      })
    }
    
    return {
      success: true,
      migrated: migratedCount,
      errors: errors
    }
  } catch (error) {
    console.error('❌ Error en migración:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Verifica si un restaurante específico tiene slug
 */
export async function checkRestaurantSlug(restaurantId) {
  try {
    const { getRestaurant } = await import('../services/firestore')
    const restaurant = await getRestaurant(restaurantId)
    
    if (!restaurant) {
      console.log('❌ Restaurante no encontrado')
      return { exists: false }
    }
    
    console.log('\n📋 Información del restaurante:')
    console.log(`   - ID: ${restaurantId}`)
    console.log(`   - Nombre: ${restaurant.name}`)
    console.log(`   - Slug: ${restaurant.slug || '❌ NO TIENE'}`)
    console.log(`   - Slug normalizado: ${restaurant.normalized_slug || '❌ NO TIENE'}`)
    
    if (restaurant.slug) {
      console.log(`   - URL: ${window.location.origin}/${restaurant.slug}`)
      console.log(`   - URL alternativa: ${window.location.origin}/r/${restaurantId}`)
    }
    
    return {
      exists: true,
      hasSlug: !!restaurant.slug,
      restaurant
    }
  } catch (error) {
    console.error('❌ Error:', error)
    return { exists: false, error: error.message }
  }
}
