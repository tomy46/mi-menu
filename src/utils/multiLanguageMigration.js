import { 
  colMenus, 
  colCategories, 
  colItems, 
  updateMenu, 
  updateCategory, 
  updateItem 
} from '../services/firestore'
import { 
  migrateToMultiLanguage, 
  DEFAULT_LANGUAGE,
  createMultiLanguageField 
} from '../config/languages'
import { getDocs, query, where } from 'firebase/firestore'

/**
 * Migra un restaurante completo al formato multiidioma
 * @param {string} restaurantId - ID del restaurante a migrar
 * @param {string} sourceLanguage - Idioma de los datos existentes (por defecto: español)
 */
export async function migrateRestaurantToMultiLanguage(restaurantId, sourceLanguage = DEFAULT_LANGUAGE.code) {
  console.log(`Iniciando migración multiidioma para restaurante: ${restaurantId}`)
  
  try {
    // 1. Migrar menús
    await migrateMenusToMultiLanguage(restaurantId, sourceLanguage)
    
    // 2. Migrar categorías (por cada menú)
    const menus = await getDocs(query(colMenus(), where('restaurantId', '==', restaurantId)))
    for (const menuDoc of menus.docs) {
      await migrateCategoriesToMultiLanguage(menuDoc.id, sourceLanguage)
    }
    
    // 3. Migrar productos (por cada categoría)
    for (const menuDoc of menus.docs) {
      const categories = await getDocs(query(colCategories(), where('menuId', '==', menuDoc.id)))
      for (const categoryDoc of categories.docs) {
        await migrateItemsToMultiLanguage(categoryDoc.id, sourceLanguage)
      }
    }
    
    console.log(`Migración completada para restaurante: ${restaurantId}`)
    return { success: true, message: 'Migración completada exitosamente' }
    
  } catch (error) {
    console.error('Error durante la migración:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Migra los menús de un restaurante al formato multiidioma
 */
async function migrateMenusToMultiLanguage(restaurantId, sourceLanguage) {
  const menusQuery = query(colMenus(), where('restaurantId', '==', restaurantId))
  const menusSnapshot = await getDocs(menusQuery)
  
  const migrationPromises = menusSnapshot.docs.map(async (menuDoc) => {
    const menuData = menuDoc.data()
    
    // Solo migrar si no es multiidioma ya
    if (menuData.isMultiLanguage) {
      console.log(`Menú ${menuDoc.id} ya está en formato multiidioma`)
      return
    }
    
    const updates = {
      isMultiLanguage: true,
      supportedLanguages: [sourceLanguage]
    }
    
    // Migrar título si existe
    if (menuData.title && typeof menuData.title === 'string') {
      updates.title = migrateToMultiLanguage(menuData.title, sourceLanguage)
    } else if (!menuData.title) {
      updates.title = createMultiLanguageField()
    }
    
    // Migrar descripción si existe
    if (menuData.description && typeof menuData.description === 'string') {
      updates.description = migrateToMultiLanguage(menuData.description, sourceLanguage)
    } else if (!menuData.description) {
      updates.description = createMultiLanguageField()
    }
    
    await updateMenu(menuDoc.id, updates)
    console.log(`Menú migrado: ${menuDoc.id}`)
  })
  
  await Promise.all(migrationPromises)
}

/**
 * Migra las categorías de un menú al formato multiidioma
 */
async function migrateCategoriesToMultiLanguage(menuId, sourceLanguage) {
  const categoriesQuery = query(colCategories(), where('menuId', '==', menuId))
  const categoriesSnapshot = await getDocs(categoriesQuery)
  
  const migrationPromises = categoriesSnapshot.docs.map(async (categoryDoc) => {
    const categoryData = categoryDoc.data()
    
    // Solo migrar si no es multiidioma ya
    if (categoryData.isMultiLanguage) {
      console.log(`Categoría ${categoryDoc.id} ya está en formato multiidioma`)
      return
    }
    
    const updates = {
      isMultiLanguage: true,
      supportedLanguages: [sourceLanguage]
    }
    
    // Migrar nombre si existe
    if (categoryData.name && typeof categoryData.name === 'string') {
      updates.name = migrateToMultiLanguage(categoryData.name, sourceLanguage)
    } else if (!categoryData.name) {
      updates.name = createMultiLanguageField()
    }
    
    // Migrar descripción si existe
    if (categoryData.description && typeof categoryData.description === 'string') {
      updates.description = migrateToMultiLanguage(categoryData.description, sourceLanguage)
    } else if (!categoryData.description) {
      updates.description = createMultiLanguageField()
    }
    
    await updateCategory(categoryDoc.id, updates)
    console.log(`Categoría migrada: ${categoryDoc.id}`)
  })
  
  await Promise.all(migrationPromises)
}

/**
 * Migra los productos de una categoría al formato multiidioma
 */
async function migrateItemsToMultiLanguage(categoryId, sourceLanguage) {
  const itemsQuery = query(colItems(), where('categoryId', '==', categoryId))
  const itemsSnapshot = await getDocs(itemsQuery)
  
  const migrationPromises = itemsSnapshot.docs.map(async (itemDoc) => {
    const itemData = itemDoc.data()
    
    // Solo migrar si no es multiidioma ya
    if (itemData.isMultiLanguage) {
      console.log(`Producto ${itemDoc.id} ya está en formato multiidioma`)
      return
    }
    
    const updates = {
      isMultiLanguage: true,
      supportedLanguages: [sourceLanguage]
    }
    
    // Migrar nombre si existe
    if (itemData.name && typeof itemData.name === 'string') {
      updates.name = migrateToMultiLanguage(itemData.name, sourceLanguage)
    } else if (!itemData.name) {
      updates.name = createMultiLanguageField()
    }
    
    // Migrar descripción si existe
    if (itemData.description && typeof itemData.description === 'string') {
      updates.description = migrateToMultiLanguage(itemData.description, sourceLanguage)
    } else if (!itemData.description) {
      updates.description = createMultiLanguageField()
    }
    
    await updateItem(itemDoc.id, updates)
    console.log(`Producto migrado: ${itemDoc.id}`)
  })
  
  await Promise.all(migrationPromises)
}

/**
 * Verifica si un restaurante necesita migración multiidioma
 */
export async function checkMigrationNeeded(restaurantId) {
  try {
    // Verificar algunos menús, categorías y productos
    const menusQuery = query(colMenus(), where('restaurantId', '==', restaurantId))
    const menusSnapshot = await getDocs(menusQuery)
    
    let needsMigration = false
    
    for (const menuDoc of menusSnapshot.docs) {
      const menuData = menuDoc.data()
      
      // Si encuentra algún menú que no es multiidioma, necesita migración
      if (!menuData.isMultiLanguage) {
        needsMigration = true
        break
      }
      
      // Verificar categorías de este menú
      const categoriesQuery = query(colCategories(), where('menuId', '==', menuDoc.id))
      const categoriesSnapshot = await getDocs(categoriesQuery)
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = categoryDoc.data()
        if (!categoryData.isMultiLanguage) {
          needsMigration = true
          break
        }
      }
      
      if (needsMigration) break
    }
    
    return needsMigration
    
  } catch (error) {
    console.error('Error verificando necesidad de migración:', error)
    return false
  }
}

/**
 * Obtiene estadísticas de migración para un restaurante
 */
export async function getMigrationStats(restaurantId) {
  try {
    const stats = {
      menus: { total: 0, migrated: 0 },
      categories: { total: 0, migrated: 0 },
      items: { total: 0, migrated: 0 }
    }
    
    // Contar menús
    const menusQuery = query(colMenus(), where('restaurantId', '==', restaurantId))
    const menusSnapshot = await getDocs(menusQuery)
    stats.menus.total = menusSnapshot.docs.length
    stats.menus.migrated = menusSnapshot.docs.filter(doc => doc.data().isMultiLanguage).length
    
    // Contar categorías y productos
    for (const menuDoc of menusSnapshot.docs) {
      const categoriesQuery = query(colCategories(), where('menuId', '==', menuDoc.id))
      const categoriesSnapshot = await getDocs(categoriesQuery)
      stats.categories.total += categoriesSnapshot.docs.length
      stats.categories.migrated += categoriesSnapshot.docs.filter(doc => doc.data().isMultiLanguage).length
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const itemsQuery = query(colItems(), where('categoryId', '==', categoryDoc.id))
        const itemsSnapshot = await getDocs(itemsQuery)
        stats.items.total += itemsSnapshot.docs.length
        stats.items.migrated += itemsSnapshot.docs.filter(doc => doc.data().isMultiLanguage).length
      }
    }
    
    return stats
    
  } catch (error) {
    console.error('Error obteniendo estadísticas de migración:', error)
    return null
  }
}
