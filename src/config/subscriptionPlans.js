// Configuración de planes de suscripción
export const SUBSCRIPTION_PLANS = {
  START: 'start',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
}

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
}

// Límites por plan de suscripción
export const PLAN_LIMITS = {
  [SUBSCRIPTION_PLANS.START]: {
    name: 'Start',
    price: 0.00, // USD por mes
    limits: {
      menus: 1,
      categories: 3,
      products: 15,
      teamMembers: 1
    },
    features: [
      'Menú digital básico',
      'Hasta 3 categorías',
      'Hasta 15 productos',
      '1 usuario administrador',
      'Temas básicos',
      'Soporte por email'
    ]
  },
  [SUBSCRIPTION_PLANS.PRO]: {
    name: 'Pro',
    price: 10.00, // USD por mes
    limits: {
      menus: 5,
      categories: 20,
      products: 50,
      teamMembers: 3
    },
    features: [
      'Múltiples menús (hasta 5)',
      'Hasta 20 categorías',
      'Hasta 50 productos',
      'Hasta 3 miembros del equipo',
      'Todos los temas disponibles',
      'Analytics básicos',
      'Redes sociales integradas',
      'Soporte prioritario'
    ]
  },
  [SUBSCRIPTION_PLANS.ENTERPRISE]: {
    name: 'Enterprise',
    price: 99.99, // USD por mes
    limits: {
      menus: -1, // Ilimitado
      categories: -1, // Ilimitado
      products: -1, // Ilimitado
      teamMembers: -1 // Ilimitado
    },
    features: [
      'Menús ilimitados',
      'Categorías ilimitadas',
      'Productos ilimitados',
      'Miembros del equipo ilimitados',
      'Todos los temas + temas premium',
      'Analytics avanzados',
      'API personalizada',
      'White-label disponible',
      'Soporte 24/7',
      'Gestor de cuenta dedicado'
    ]
  }
}

// Función para obtener información de un plan
export const getPlanInfo = (planType) => {
  return PLAN_LIMITS[planType] || PLAN_LIMITS[SUBSCRIPTION_PLANS.START]
}

// Función para verificar si un límite está dentro del plan
export const isWithinLimit = (planType, limitType, currentCount) => {
  const planInfo = getPlanInfo(planType)
  const limit = planInfo.limits[limitType]
  
  // -1 significa ilimitado
  if (limit === -1) return true
  
  return currentCount < limit
}

// Función para obtener el límite de un plan
export const getLimit = (planType, limitType) => {
  const planInfo = getPlanInfo(planType)
  return planInfo.limits[limitType]
}

// Función para verificar si una funcionalidad está disponible en el plan
export const hasFeature = (planType, feature) => {
  const planInfo = getPlanInfo(planType)
  return planInfo.features.includes(feature)
}

// Función para obtener el siguiente plan recomendado
export const getNextPlan = (currentPlan) => {
  switch (currentPlan) {
    case SUBSCRIPTION_PLANS.START:
      return SUBSCRIPTION_PLANS.PRO
    case SUBSCRIPTION_PLANS.PRO:
      return SUBSCRIPTION_PLANS.ENTERPRISE
    default:
      return null
  }
}
