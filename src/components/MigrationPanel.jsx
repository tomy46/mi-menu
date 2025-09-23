import { useState, useEffect } from 'react'
import { ExclamationTriangleIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { migrateRestaurantToSubscription } from '../services/firestore'
import { useParams } from 'react-router-dom'

export default function MigrationPanel() {
  const { restaurantId } = useParams()
  const [migrationStatus, setMigrationStatus] = useState(null)
  const [migrating, setMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStatus()
  }, [restaurantId])

  const checkStatus = async () => {
    setLoading(true)
    try {
      // For now, we'll assume migration is needed if we're showing this panel
      setMigrationStatus({ needsMigration: 1, alreadyMigrated: 0, total: 1 })
    } catch (error) {
      console.error('Error checking migration status:', error)
    } finally {
      setLoading(false)
    }
  }

  const runMigration = async () => {
    if (!restaurantId) return
    
    setMigrating(true)
    setMigrationResult(null)
    
    try {
      const result = await migrateRestaurantToSubscription(restaurantId)
      setMigrationResult(result)
      
      if (result.success) {
        // Hide panel after successful migration
        setMigrationStatus({ needsMigration: 0, alreadyMigrated: 1, total: 1 })
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        error: error.message
      })
    } finally {
      setMigrating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  // Don't show panel if migration is complete
  if (migrationStatus?.migrationComplete) {
    return null
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            Migración de Suscripciones Requerida
          </h3>
          
          <div className="mb-4">
            <p className="text-sm text-amber-800 mb-2">
              Este restaurante necesita ser migrado al nuevo sistema de suscripciones 
              para acceder a todas las funcionalidades.
            </p>
            <div className="text-xs text-amber-700">
              • Se asignará automáticamente el plan Start (gratuito)
              <br />
              • No se perderán datos existentes
              <br />
              • El proceso es seguro y reversible
            </div>
          </div>

          {migrationResult && (
            <div className={`mb-4 p-3 rounded-md ${
              migrationResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {migrationResult.success ? (
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircleIcon className="w-5 h-5" />
                  <div>
                    <p className="font-medium">
                      {migrationResult.alreadyMigrated ? 'Restaurante ya migrado' : 'Migración completada exitosamente'}
                    </p>
                    <p className="text-sm">
                      El restaurante ahora tiene acceso al sistema de suscripciones
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-red-800">
                  <p className="font-medium">Error en la migración</p>
                  <p className="text-sm">{migrationResult.error}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={runMigration}
              disabled={migrating}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
            >
              {migrating ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Migrando...
                </>
              ) : (
                'Ejecutar Migración'
              )}
            </button>
            
            <button
              onClick={checkStatus}
              disabled={migrating}
              className="px-4 py-2 bg-white text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 disabled:opacity-50 text-sm font-medium"
            >
              Verificar Estado
            </button>
          </div>

          <div className="mt-4 text-xs text-amber-700">
            <p><strong>Nota:</strong> Esta migración es segura y solo agrega campos de suscripción a restaurantes existentes. No se modificarán datos existentes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
