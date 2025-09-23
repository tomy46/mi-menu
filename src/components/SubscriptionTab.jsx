import { useState } from 'react'
import { 
  CreditCardIcon, 
  CheckCircleIcon,
  ArrowUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { getPlanInfo, getNextPlan, SUBSCRIPTION_PLANS } from '../config/subscriptionPlans'
import SubscriptionBadge from './SubscriptionBadge'

export default function SubscriptionTab({ restaurant, restaurantId }) {
  const [loading, setLoading] = useState(false)

  const currentPlan = restaurant?.subscriptionPlan || SUBSCRIPTION_PLANS.START
  const currentPlanInfo = getPlanInfo(currentPlan)
  const nextPlan = getNextPlan(currentPlan)
  const nextPlanInfo = nextPlan ? getPlanInfo(nextPlan) : null

  const handleUpgrade = async () => {
    if (!nextPlan) return
    
    setLoading(true)
    try {
      // TODO: Implement upgrade flow
      console.log('Upgrading to', nextPlan)
      // showSuccess('Plan actualizado exitosamente')
    } catch (error) {
      console.error('Error upgrading plan:', error)
      // showError('Error al actualizar el plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Current Plan */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CreditCardIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Plan Actual</h3>
            <p className="text-sm text-gray-600">Gestiona tu suscripción y facturación</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
          <div className="flex items-center gap-3">
            <SubscriptionBadge restaurant={restaurant} />
            <div>
              <p className="text-sm font-medium text-gray-900">${currentPlanInfo.price}/mes</p>
              <p className="text-xs text-gray-500">Facturación mensual</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Estado</p>
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircleIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Activo</span>
            </div>
          </div>
        </div>

        {/* Current Plan Features */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Características incluidas:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentPlanInfo.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Usage Summary */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Uso actual:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-xs text-gray-500">Menú</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-xs text-gray-500">Categorías</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-xs text-gray-500">Productos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{restaurant?.owners?.length || 1}</p>
              <p className="text-xs text-gray-500">Miembros</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Section */}
      {nextPlanInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Actualizar a {nextPlanInfo.name}</h3>
              <p className="text-sm text-gray-600">Desbloquea más funcionalidades para tu restaurante</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Lo que obtienes:</h4>
              <div className="space-y-2">
                {nextPlanInfo.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${nextPlanInfo.price}
                <span className="text-lg font-normal text-gray-500">/mes</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Facturación mensual</p>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#111827] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
              >
                <ArrowUpIcon className="w-4 h-4" />
                {loading ? 'Procesando...' : `Actualizar a ${nextPlanInfo.name}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Historial de facturación</h3>
        <div className="text-center py-8 text-gray-500">
          <CreditCardIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No hay facturas disponibles</p>
          <p className="text-xs">Las facturas aparecerán aquí una vez que se procesen los pagos</p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-amber-600 text-sm font-medium">🚧 Próximamente</span>
        </div>
        <p className="text-xs text-amber-800">
          El sistema de facturación y pagos estará disponible próximamente. 
          Podrás gestionar tu suscripción, ver facturas y actualizar tu plan de pago.
        </p>
      </div>
    </div>
  )
}
