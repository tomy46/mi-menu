import { useState } from 'react'
import { DIETARY_RESTRICTIONS_LIST, DIETARY_RESTRICTION_ICON_PATHS } from '../config/dietaryRestrictions'

// Helper para renderizar iconos SVG
function DietaryRestrictionIcon({ iconKey, className = "w-4 h-4" }) {
  const path = DIETARY_RESTRICTION_ICON_PATHS[iconKey]
  if (!path) return null
  
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={path} />
    </svg>
  )
}

export default function DietaryRestrictionsSelector({ 
  selectedRestrictions = [], 
  onChange,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggleRestriction = (restrictionId) => {
    const newRestrictions = selectedRestrictions.includes(restrictionId)
      ? selectedRestrictions.filter(id => id !== restrictionId)
      : [...selectedRestrictions, restrictionId]
    
    onChange(newRestrictions)
  }

  const getColorClasses = (color, isSelected) => {
    const colorMap = {
      green: isSelected 
        ? 'bg-green-100 border-green-300 text-green-800' 
        : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700',
      blue: isSelected 
        ? 'bg-blue-100 border-blue-300 text-blue-800' 
        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700',
      orange: isSelected 
        ? 'bg-orange-100 border-orange-300 text-orange-800' 
        : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-700',
      purple: isSelected 
        ? 'bg-purple-100 border-purple-300 text-purple-800' 
        : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700'
    }
    return colorMap[color] || colorMap.green
  }

  return (
    <div className={className}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
        >
          <span className="flex items-center gap-2">
            {selectedRestrictions.length > 0 ? (
              <>
                <span className="text-gray-700">
                  {selectedRestrictions.length} restricción{selectedRestrictions.length !== 1 ? 'es' : ''} seleccionada{selectedRestrictions.length !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-1">
                  {selectedRestrictions.slice(0, 3).map(id => {
                    const restriction = DIETARY_RESTRICTIONS_LIST.find(r => r.id === id)
                    return restriction ? (
                      <div key={id} className={`p-1 rounded ${getColorClasses(restriction.color, true)}`}>
                        <DietaryRestrictionIcon iconKey={restriction.icon} />
                      </div>
                    ) : null
                  })}
                  {selectedRestrictions.length > 3 && (
                    <span className="text-xs text-gray-500 self-center">+{selectedRestrictions.length - 3}</span>
                  )}
                </div>
              </>
            ) : (
              <span className="text-gray-500">Seleccionar restricciones alimenticias</span>
            )}
          </span>
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
              <div className="p-2 space-y-1">
                {DIETARY_RESTRICTIONS_LIST.map((restriction) => {
                  const isSelected = selectedRestrictions.includes(restriction.id)
                  return (
                    <button
                      key={restriction.id}
                      type="button"
                      onClick={() => handleToggleRestriction(restriction.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg border transition-colors ${getColorClasses(restriction.color, isSelected)}`}
                    >
                      <div className="flex-shrink-0">
                        <DietaryRestrictionIcon iconKey={restriction.icon} />
                      </div>
                      <span className="flex-1 text-left font-medium">
                        {restriction.name}
                      </span>
                      {isSelected && (
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
              
              {selectedRestrictions.length > 0 && (
                <div className="border-t border-gray-200 p-2">
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Limpiar selección
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Componente para mostrar las restricciones seleccionadas (solo lectura)
export function DietaryRestrictionsDisplay({ restrictions = [], className = "" }) {
  if (!restrictions || restrictions.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {restrictions.map(restrictionId => {
        const restriction = DIETARY_RESTRICTIONS_LIST.find(r => r.id === restrictionId)
        if (!restriction) return null

        const getColorClasses = (color) => {
          const colorMap = {
            green: 'bg-green-100 text-green-800',
            blue: 'bg-blue-100 text-blue-800',
            orange: 'bg-orange-100 text-orange-800',
            purple: 'bg-purple-100 text-purple-800'
          }
          return colorMap[color] || colorMap.green
        }

        return (
          <div
            key={restriction.id}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(restriction.color)}`}
            title={restriction.name}
          >
            <DietaryRestrictionIcon iconKey={restriction.icon} />
            <span>{restriction.name}</span>
          </div>
        )
      })}
    </div>
  )
}
