import { useState } from 'react'
import DietaryRestrictionsSelector, { DietaryRestrictionsDisplay } from './DietaryRestrictionsSelector'
import { DIETARY_RESTRICTIONS_LIST } from '../config/dietaryRestrictions'

// Componente de ejemplo para probar el sistema de restricciones alimenticias
export default function DietaryRestrictionsExample() {
  const [selectedRestrictions, setSelectedRestrictions] = useState(['vegetarian', 'gluten_free'])

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Sistema de Restricciones Alimenticias
        </h2>
        
        <div className="space-y-6">
          {/* Selector */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Selector de Restricciones</h3>
            <DietaryRestrictionsSelector
              selectedRestrictions={selectedRestrictions}
              onChange={setSelectedRestrictions}
            />
          </div>

          {/* Display de restricciones seleccionadas */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Restricciones Seleccionadas</h3>
            {selectedRestrictions.length > 0 ? (
              <DietaryRestrictionsDisplay restrictions={selectedRestrictions} />
            ) : (
              <p className="text-gray-500 text-sm">No hay restricciones seleccionadas</p>
            )}
          </div>

          {/* Lista de todas las restricciones disponibles */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Restricciones Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DIETARY_RESTRICTIONS_LIST.map(restriction => (
                <div key={restriction.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    restriction.color === 'green' ? 'bg-green-100 text-green-600' :
                    restriction.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    restriction.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                    restriction.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <div className="w-4 h-4">
                      {/* Aquí se mostraría el icono SVG */}
                      <div className="w-full h-full bg-current rounded-sm opacity-60"></div>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{restriction.name}</p>
                    <p className="text-sm text-gray-500">ID: {restriction.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ejemplo de uso en un producto */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Ejemplo en Producto</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Ensalada Mediterránea</h4>
                <span className="font-semibold text-gray-900">$1,250</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Mezcla fresca de lechuga, tomates cherry, aceitunas, queso feta y aderezo de hierbas.
              </p>
              <DietaryRestrictionsDisplay restrictions={selectedRestrictions} />
            </div>
          </div>

          {/* Información de debugging */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Debug Info</h3>
            <pre className="text-xs text-blue-800 overflow-x-auto">
              {JSON.stringify({ selectedRestrictions }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

// Función helper para testing
export function testDietaryRestrictions() {
  // console.log('🧪 Testing Dietary Restrictions System')
  // console.log('Available restrictions:', DIETARY_RESTRICTIONS_LIST.length)
  
  // DIETARY_RESTRICTIONS_LIST.forEach(restriction => {
  //   console.log(`✅ ${restriction.name} (${restriction.id}) - ${restriction.color}`)
  // })
  
  // console.log('✨ All restrictions loaded successfully!')
}
