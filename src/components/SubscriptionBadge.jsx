import { useState, useEffect } from 'react'
import { getPlanInfo, SUBSCRIPTION_PLANS } from '../config/subscriptionPlans'
import { getRestaurantUsage } from '../services/firestore'

export default function SubscriptionBadge({ restaurant, className = '', showUsage = true }) {
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (restaurant?.id) {
      loadUsage()
    }
  }, [restaurant?.id])

  const loadUsage = async () => {
    try {
      setLoading(true)
      const usageData = await getRestaurantUsage(restaurant.id)
      setUsage(usageData)
    } catch (error) {
      console.error('Error loading usage:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!restaurant || loading) {
    return null
  }

  const plan = restaurant.subscriptionPlan || SUBSCRIPTION_PLANS.START
  const planInfo = getPlanInfo(plan)

  // Color scheme based on plan
  const getColorScheme = (planType) => {
    switch (planType) {
      case SUBSCRIPTION_PLANS.START:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case SUBSCRIPTION_PLANS.PRO:
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case SUBSCRIPTION_PLANS.ENTERPRISE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const colorScheme = getColorScheme(plan)

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Plan Badge */}
      <span className={`px-2 py-1 text-xs font-medium rounded-md border ${colorScheme}`}>
        {planInfo.name}
      </span>
      
      {/* Usage indicators (only for non-enterprise and when showUsage is true) */}
      {showUsage && plan !== SUBSCRIPTION_PLANS.ENTERPRISE && usage && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>{usage.products}/{planInfo.limits.products} productos</span>
          <span>•</span>
          <span>{usage.menus}/{planInfo.limits.menus} menús</span>
        </div>
      )}
    </div>
  )
}

// Compact version for sidebar
export function SubscriptionBadgeCompact({ restaurant, className = '' }) {
  if (!restaurant) return null

  const plan = restaurant.subscriptionPlan || SUBSCRIPTION_PLANS.START
  const planInfo = getPlanInfo(plan)

  const getColorScheme = (planType) => {
    switch (planType) {
      case SUBSCRIPTION_PLANS.START:
        return 'bg-blue-500'
      case SUBSCRIPTION_PLANS.PRO:
        return 'bg-purple-500'
      case SUBSCRIPTION_PLANS.ENTERPRISE:
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const colorScheme = getColorScheme(plan)

  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className={`w-2 h-2 rounded-full ${colorScheme}`} title={`Plan ${planInfo.name}`}></div>
    </div>
  )
}
