import { db } from '../firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUS } from '../config/subscriptionPlans'

/**
 * Migrates existing restaurants to have subscription fields
 * This should be run once to update all existing restaurants
 */
export async function migrateRestaurantsToSubscriptions() {
  try {
    
    const restaurantsRef = collection(db, 'restaurants')
    const snapshot = await getDocs(restaurantsRef)
    
    const updates = []
    let migratedCount = 0
    let skippedCount = 0
    
    snapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data()
      
      // Check if restaurant already has subscription fields
      if (data.subscriptionPlan) {
         skippedCount++
        return
      }
      
      // Add migration update
      updates.push({
        id: docSnapshot.id,
        name: data.name,
        update: {
          subscriptionPlan: SUBSCRIPTION_PLANS.START,
          subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
          subscriptionStartDate: new Date(),
          subscriptionEndDate: null,
          updatedAt: new Date()
        }
      })
    })
    
    
    // Execute updates in batches
    const batchSize = 10
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async ({ id, name, update }) => {
          try {
            const restaurantRef = doc(db, 'restaurants', id)
            await updateDoc(restaurantRef, update)
            migratedCount++
          } catch (error) {
            console.error(`✗ Failed to migrate ${name}:`, error.message)
            console.error('Error details:', error)
            console.error('Update data:', update)
          }
        })
      )
      
      // Small delay between batches to avoid overwhelming Firestore
      if (i + batchSize < updates.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return {
      success: true,
      migrated: migratedCount,
      skipped: skippedCount,
      total: migratedCount + skippedCount
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Check migration status - how many restaurants need migration
 */
export async function checkMigrationStatus() {
  try {
    const restaurantsRef = collection(db, 'restaurants')
    const snapshot = await getDocs(restaurantsRef)
    
    let needsMigration = 0
    let alreadyMigrated = 0
    
    snapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data()
      
      if (data.subscriptionPlan) {
        alreadyMigrated++
      } else {
        needsMigration++
      }
    })
    
    return {
      total: snapshot.size,
      needsMigration,
      alreadyMigrated,
      migrationComplete: needsMigration === 0
    }
    
  } catch (error) {
    console.error('Error checking migration status:', error)
    return null
  }
}
