// Configuración de restricciones alimenticias
export const DIETARY_RESTRICTIONS = {
  VEGETARIAN: {
    id: 'vegetarian',
    name: 'Vegetariano',
    icon: 'leaf',
    color: 'green'
  },
  VEGAN: {
    id: 'vegan',
    name: 'Vegano',
    icon: 'vegan-leaves',
    color: 'green'
  },
  LACTOSE_FREE: {
    id: 'lactose_free',
    name: 'Sin Lactosa',
    icon: 'milk-off',
    color: 'blue'
  },
  GLUTEN_FREE: {
    id: 'gluten_free',
    name: 'Sin TACC',
    icon: 'wheat-off',
    color: 'orange'
  },
  KOSHER: {
    id: 'kosher',
    name: 'Kosher',
    icon: 'star-of-david',
    color: 'purple'
  }
}

// Array para facilitar iteración
export const DIETARY_RESTRICTIONS_LIST = Object.values(DIETARY_RESTRICTIONS)

// Helper para obtener restricción por ID
export function getDietaryRestriction(id) {
  return DIETARY_RESTRICTIONS_LIST.find(restriction => restriction.id === id)
}

// Helper para obtener múltiples restricciones
export function getDietaryRestrictions(ids = []) {
  return ids.map(id => getDietaryRestriction(id)).filter(Boolean)
}

// SVG Icons paths para las restricciones alimenticias (sin JSX)
export const DIETARY_RESTRICTION_ICON_PATHS = {
  leaf: "M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z",
  'vegan-leaves': "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M7.5,8.5C8.2,8.5 8.8,8.8 9.3,9.3C9.8,9.8 10.1,10.4 10.3,11.1C10.5,11.8 10.5,12.5 10.3,13.2C10.1,13.9 9.7,14.5 9.2,14.9C8.7,15.3 8.1,15.5 7.5,15.5C6.9,15.5 6.3,15.3 5.8,14.9C5.3,14.5 4.9,13.9 4.7,13.2C4.5,12.5 4.5,11.8 4.7,11.1C4.9,10.4 5.2,9.8 5.7,9.3C6.2,8.8 6.8,8.5 7.5,8.5M16.5,8.5C17.2,8.5 17.8,8.8 18.3,9.3C18.8,9.8 19.1,10.4 19.3,11.1C19.5,11.8 19.5,12.5 19.3,13.2C19.1,13.9 18.7,14.5 18.2,14.9C17.7,15.3 17.1,15.5 16.5,15.5C15.9,15.5 15.3,15.3 14.8,14.9C14.3,14.5 13.9,13.9 13.7,13.2C13.5,12.5 13.5,11.8 13.7,11.1C13.9,10.4 14.2,9.8 14.7,9.3C15.2,8.8 15.8,8.5 16.5,8.5Z",
  'milk-off': "M1.39,4.22L2.8,2.81L21.19,21.2L19.78,22.61L18,20.84V21A2,2 0 0,1 16,23H8A2,2 0 0,1 6,21V9L1.39,4.22M8,21H16V18.84L8,10.84V21M18,9V7A2,2 0 0,0 16,5V3A1,1 0 0,0 15,2H9A1,1 0 0,0 8,3V5A2,2 0 0,0 6,7V7.8L8,9.8V7H16V9H18Z",
  'wheat-off': "M1.39,4.22L2.8,2.81L21.19,21.2L19.78,22.61L1.39,4.22M8.5,2L9.91,3.41L8.5,4.82L7.09,3.41L8.5,2M11.32,4.82L12.73,6.23L11.32,7.64L9.91,6.23L11.32,4.82M14.14,7.64L15.55,9.05L14.14,10.46L12.73,9.05L14.14,7.64M16.96,10.46L18.37,11.87L16.96,13.28L15.55,11.87L16.96,10.46M19.78,13.28L21.19,14.69L19.78,16.1L18.37,14.69L19.78,13.28M17,16.1L18.41,17.51L17,18.92L15.59,17.51L17,16.1M14.18,18.92L15.59,20.33L14.18,21.74L12.77,20.33L14.18,18.92Z",
  'star-of-david': "M12,2L13.09,8.26L22,7L14.74,12L22,17L13.09,15.74L12,22L10.91,15.74L2,17L9.26,12L2,7L10.91,8.26L12,2Z"
}
