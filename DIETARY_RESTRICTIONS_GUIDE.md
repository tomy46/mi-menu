# Guía de Restricciones Alimenticias

## 📋 Resumen
El sistema de restricciones alimenticias permite a los restaurantes etiquetar sus productos con información nutricional y de dieta especial, ayudando a los clientes a tomar decisiones informadas.

## 🏷️ Restricciones Disponibles

### Vegetariano 🌱
- **ID**: `vegetarian`
- **Color**: Verde
- **Descripción**: Productos sin carne ni pescado

### Vegano 🌿
- **ID**: `vegan`
- **Color**: Verde
- **Descripción**: Productos sin ingredientes de origen animal

### Sin Lactosa 🥛
- **ID**: `lactose_free`
- **Color**: Azul
- **Descripción**: Productos sin lactosa o lácteos

### Sin TACC 🌾
- **ID**: `gluten_free`
- **Color**: Naranja
- **Descripción**: Productos sin trigo, avena, cebada, centeno

### Kosher ✡️
- **ID**: `kosher`
- **Color**: Morado
- **Descripción**: Productos que cumplen las leyes dietéticas judías

## 🎯 Cómo Usar

### Para Administradores de Restaurante

1. **Crear Producto Nuevo**:
   - Ve a la sección "Productos" en el panel de administración
   - Click en "Añadir Producto"
   - Completa nombre, descripción y precio
   - En la sección "Restricciones Alimenticias", selecciona las que apliquen
   - Guarda el producto

2. **Editar Producto Existente**:
   - Click en cualquier producto de la lista
   - Se abre el modal de edición
   - Modifica las restricciones en la sección correspondiente
   - Guarda los cambios

3. **Ver Restricciones**:
   - Las restricciones aparecen como badges coloridos en las cards de productos
   - Cada restricción tiene su icono y color distintivo

### Para Clientes

1. **En el Menú Público**:
   - Las restricciones aparecen debajo de la descripción de cada producto
   - Cada restricción se muestra como un badge con icono y nombre
   - Los colores ayudan a identificar rápidamente el tipo de restricción

## 🔧 Implementación Técnica

### Archivos Principales

```
src/
├── config/
│   └── dietaryRestrictions.js      # Configuración de restricciones
├── components/
│   ├── DietaryRestrictionsSelector.jsx  # Selector multi-opción
│   └── DietaryRestrictionsExample.jsx   # Componente de prueba
└── pages/
    ├── admin/Items.jsx             # Integración en admin
    └── public/PublicMenu.jsx       # Display en menú público
```

### Base de Datos

```javascript
// Estructura del producto en Firestore
{
  id: "product_123",
  name: "Ensalada César",
  description: "Lechuga romana, crutones, parmesano...",
  price: 850,
  currency: "ARS",
  available: true,
  dietaryRestrictions: ["vegetarian", "gluten_free"], // ← Nuevo campo
  categoryId: "category_456",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Reglas de Firestore

```javascript
// En firestore.rules - campo agregado a items
allow create: if isOwnerOfRestaurant(itemRestaurantIdFromNew())
  && request.resource.data.keys().hasOnly([
    'categoryId','name','description','price','currency',
    'available','order','dietaryRestrictions', // ← Nuevo campo permitido
    'isMultiLanguage','supportedLanguages',
    'createdAt','updatedAt'
  ]);
```

## 🎨 Personalización

### Colores por Restricción
- **Verde**: Vegetariano, Vegano (natural, saludable)
- **Azul**: Sin Lactosa (fresco, limpio)
- **Naranja**: Sin TACC (energía, atención)
- **Morado**: Kosher (espiritualidad, tradición)

### Iconos SVG
Cada restricción tiene un icono SVG personalizado:
- Hoja para vegetariano
- Brote para vegano
- Leche tachada para sin lactosa
- Trigo tachado para sin TACC
- Estrella de David para kosher

## 📊 Beneficios

### Para el Restaurante
- ✅ **Transparencia**: Información clara sobre ingredientes
- ✅ **Inclusión**: Atrae clientes con dietas especiales
- ✅ **Profesionalismo**: Imagen más cuidada y responsable
- ✅ **Compliance**: Cumple regulaciones de etiquetado
- ✅ **Marketing**: Diferenciación competitiva

### Para los Clientes
- ✅ **Confianza**: Información nutricional clara
- ✅ **Conveniencia**: Identificación rápida de opciones
- ✅ **Seguridad**: Evita ingredientes problemáticos
- ✅ **Experiencia**: Mejor toma de decisiones

## 🚀 Próximas Mejoras

### Funcionalidades Futuras
- [ ] Filtros por restricción en el menú público
- [ ] Búsqueda por tipo de dieta
- [ ] Estadísticas de productos más solicitados por restricción
- [ ] Integración con sistemas de inventario
- [ ] Alertas de ingredientes cruzados
- [ ] Certificaciones oficiales (ej: certificado vegano)

### Restricciones Adicionales
- [ ] Bajo en sodio
- [ ] Sin azúcar
- [ ] Keto-friendly
- [ ] Paleo
- [ ] Halal
- [ ] Sin frutos secos
- [ ] Sin mariscos

## 🛠️ Troubleshooting

### Problemas Comunes

**Las restricciones no aparecen en el menú público**
- Verificar que el producto tenga restricciones asignadas
- Comprobar que las reglas de Firestore estén desplegadas
- Revisar la consola del navegador por errores

**El selector no funciona en el admin**
- Verificar imports de componentes
- Comprobar que el estado del formulario incluya `dietaryRestrictions`
- Revisar permisos de Firestore

**Los iconos no se muestran**
- Verificar que los SVG estén correctamente definidos
- Comprobar clases CSS de los iconos
- Revisar compatibilidad del navegador

### Logs de Debug

```javascript
// En la consola del navegador
import { testDietaryRestrictions } from './components/DietaryRestrictionsExample'
testDietaryRestrictions()
```

## 📞 Soporte

Para problemas técnicos o sugerencias de mejora, contactar al equipo de desarrollo con:
- Descripción detallada del problema
- Screenshots si es necesario
- Información del navegador y dispositivo
- Pasos para reproducir el error

---

**Versión**: 1.0.0  
**Última actualización**: Septiembre 2024  
**Compatibilidad**: Todos los temas del menú público
