# Estructura de Datos para Slugs

## 1. Documento del Restaurante
**Colección:** `restaurants`
**ID del Documento:** `[cualquier-id-de-firebase]` (ej: `xK2mP9qL4nR8sT5v`)

```javascript
{
  // ✅ CAMPOS REQUERIDOS PARA SLUGS
  "name": "Shabatify",
  "slug": "shabatify",              // ← DEBE EXISTIR
  "normalized_slug": "shabatify",   // ← DEBE EXISTIR
  
  // Otros campos normales
  "isPublic": true,
  "owners": ["user-uid-123"],
  "phone": "",
  "address": "",
  "website": "",
  "hours": "",
  "theme": "elegant",
  "socialMedia": [],
  "logo": "",
  "subscriptionPlan": "start",
  "subscriptionStatus": "active",
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

## 2. Documento en slug_registry
**Colección:** `slug_registry`
**ID del Documento:** `shabatify` (el slug normalizado como ID del documento)

```javascript
{
  "restaurantId": "xK2mP9qL4nR8sT5v",  // ← Debe apuntar al ID del restaurante
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

## 3. Menú del Restaurante
**Colección:** `menus`
**ID del Documento:** `[cualquier-id-de-firebase]`

```javascript
{
  "restaurantId": "xK2mP9qL4nR8sT5v",  // ← Debe coincidir con el ID del restaurante
  "title": "Carta Principal",
  "type": "main",
  "description": "Menú principal del restaurante",
  "active": true,                      // ← DEBE SER true
  "deleted": false,                    // ← DEBE SER false
  "order": 0,
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

## URLs Que Deben Funcionar

Con esta estructura:
- ✅ `/shabatify` → Busca en `slug_registry/shabatify` → Obtiene `restaurantId` → Carga restaurante
- ✅ `/r/shabatify` → Igual que arriba
- ✅ `/r/xK2mP9qL4nR8sT5v` → Busca directamente por ID

## Flujo de Resolución

```
Usuario visita: /shabatify
    ↓
SlugRouter detecta que NO es un ID de Firebase (tiene guiones)
    ↓
Llama a getRestaurantBySlug("shabatify")
    ↓
Normaliza el slug: normalizeSlug("shabatify") = "shabatify"
    ↓
Busca documento: slug_registry/shabatify
    ↓
Obtiene: { restaurantId: "xK2mP9qL4nR8sT5v" }
    ↓
Llama a getRestaurant("xK2mP9qL4nR8sT5v")
    ↓
Verifica: restaurant.isPublic === true
    ↓
Retorna el restaurante
```

## ¿Qué Puede Fallar?

❌ **Falta `slug_registry/shabatify`** → 404 Restaurante no encontrado
❌ **Falta `slug` en el documento del restaurante** → El admin no mostrará la URL correcta
❌ **`isPublic: false`** → 404 Restaurante no encontrado (no es público)
❌ **No hay menú `active: true`** → Se muestra "Menú en preparación"
