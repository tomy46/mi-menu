import { useState } from 'react'
import { XMarkIcon, ArrowUpIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { getPlanInfo, getNextPlan, SUBSCRIPTION_PLANS } from '../config/subscriptionPlans'

export default function UpgradePrompt({ 
  isOpen, 
  onClose, 
  currentPlan, 
  limitType, 
  currentUsage, 
  limit 
}) {
  if (!isOpen) return null

  const nextPlan = getNextPlan(currentPlan)
  const nextPlanInfo = nextPlan ? getPlanInfo(nextPlan) : null
  const currentPlanInfo = getPlanInfo(currentPlan)

  const getLimitTypeLabel = (type) => {
    switch (type) {
      case 'categories': return 'categorías'
      case 'products': return 'productos'
      case 'menus': return 'menús'
      case 'teamMembers': return 'miembros del equipo'
      default: return type
    }
  }

  const getNextPlanLimit = () => {
    if (!nextPlanInfo) return 'ilimitado'
    const nextLimit = nextPlanInfo.limits[limitType]
    return nextLimit === -1 ? 'ilimitado' : nextLimit
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Límite Alcanzado
              </h3>
              <p className="text-sm text-gray-500">
                Plan {currentPlanInfo.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-2">
              Has alcanzado el límite de <strong>{limit} {getLimitTypeLabel(limitType)}</strong> 
              de tu plan actual.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-600">
                Uso actual: <span className="font-semibold">{currentUsage}/{limit}</span>
              </div>
            </div>
          </div>

          {nextPlanInfo ? (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpIcon className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">
                  Actualiza a {nextPlanInfo.name}
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Obtén hasta <strong>{getNextPlanLimit()} {getLimitTypeLabel(limitType)}</strong> y más funcionalidades.
              </p>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                ${nextPlanInfo.price}
                <span className="text-sm font-normal text-gray-500">/mes</span>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Ya tienes el plan más alto disponible. Contacta con soporte para opciones personalizadas.
              </p>
            </div>
          )}

          {/* Features comparison */}
          {nextPlanInfo && (
            <div className="space-y-2 mb-6">
              <h5 className="font-medium text-gray-900">Lo que obtienes:</h5>
              <ul className="space-y-1">
                {nextPlanInfo.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Más tarde
          </button>
          {nextPlanInfo && (
            <button
              onClick={() => {
                // TODO: Implement upgrade flow
                onClose()
              }}
              className="flex-1 px-4 py-2 bg-[#111827] text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Actualizar Plan
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
