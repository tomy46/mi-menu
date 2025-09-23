import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  PaintBrushIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { getRestaurant, updateRestaurant, getActiveMenuByRestaurant, toggleMenuActive, createMenu } from '../../services/firestore.js'
import { getTheme } from '../../config/themes.js'
import { useSnackbar } from '../../hooks/useSnackbar.js'
import Snackbar from '../../components/Snackbar.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

const themes = [
  { id: 'elegant', name: 'Elegante', description: 'Diseño clásico y sofisticado' },
  { id: 'modern', name: 'Moderno', description: 'Limpio y contemporáneo' },
  { id: 'classic', name: 'Clásico', description: 'Tradicional y elegante' },
  { id: 'fresh', name: 'Fresco', description: 'Vibrante y energético' },
  { id: 'cupido', name: 'Cupido', description: 'Romántico y delicado' }
]


export default function Menu() {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [menu, setMenu] = useState(null)
  const [selectedTheme, setSelectedTheme] = useState('elegant')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const { snackbar, showSuccess, showError } = useSnackbar()

  useEffect(() => {
    async function loadData() {
      try {
        const [restaurantData, menuData] = await Promise.all([
          getRestaurant(restaurantId),
          getActiveMenuByRestaurant(restaurantId)
        ])
        
        setRestaurant(restaurantData)
        setMenu(menuData)
        setSelectedTheme(restaurantData.theme || 'elegant')
      } catch (error) {
        console.error('Error loading data:', error)
        showError('Error al cargar la información')
      } finally {
        setLoading(false)
      }
    }

    if (restaurantId) {
      loadData()
    }
  }, [restaurantId])

  const handleThemeChange = async (themeId) => {
    setSelectedTheme(themeId)
    await saveChanges({ theme: themeId })
  }


  const saveChanges = async (updates) => {
    setSaving(true)
    try {
      await updateRestaurant(restaurantId, updates)
      showSuccess('Cambios guardados exitosamente')
    } catch (error) {
      console.error('Error saving changes:', error)
      showError('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleMenu = () => {
    if (menu?.active) {
      setShowDeactivateDialog(true)
    } else {
      handleConfirmToggle()
    }
  }

  const handleConfirmToggle = async () => {
    if (!menu) return
    
    setSaving(true)
    try {
      await toggleMenuActive(menu.id, !menu.active)
      setMenu({ ...menu, active: !menu.active })
      showSuccess(menu.active ? 'Menú desactivado exitosamente' : 'Menú activado exitosamente')
    } catch (error) {
      console.error('Error toggling menu:', error)
      showError('Error al cambiar el estado del menú')
    } finally {
      setSaving(false)
      setShowDeactivateDialog(false)
    }
  }

  const handleCreateDefaultMenu = async () => {
    setSaving(true)
    try {
      const menuRef = await createMenu({
        restaurantId,
        title: 'Carta Principal',
        type: 'main',
        description: 'Menú principal del restaurante',
        active: true,
        order: 0
      })
      
      const newMenu = {
        id: menuRef.id,
        restaurantId,
        title: 'Carta Principal',
        type: 'main',
        description: 'Menú principal del restaurante',
        active: true,
        deleted: false,
        order: 0
      }
      
      setMenu(newMenu)
      showSuccess('Menú creado y activado exitosamente')
    } catch (error) {
      console.error('Error creating menu:', error)
      showError('Error al crear el menú')
    } finally {
      setSaving(false)
    }
  }

  const getThemePreview = (themeId) => {
    const theme = getTheme(themeId)
    return (
      <div 
        className="w-full h-24 rounded-lg border-2 border-gray-200 p-3 flex flex-col justify-between"
        style={{ 
          backgroundColor: theme.colors.background,
          borderColor: selectedTheme === themeId ? theme.colors.primary : '#e5e7eb'
        }}
      >
        <div className="flex items-center justify-between">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.colors.primary }}
          ></div>
          <div 
            className="w-8 h-1 rounded"
            style={{ backgroundColor: theme.colors.secondary }}
          ></div>
        </div>
        <div className="space-y-1">
          <div 
            className="w-full h-1 rounded"
            style={{ backgroundColor: theme.colors.text }}
          ></div>
          <div 
            className="w-3/4 h-1 rounded"
            style={{ backgroundColor: theme.colors.textSecondary }}
          ></div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Menú</h1>
        <p className="text-gray-600 mt-1">
          Personaliza el diseño de tu menú público y controla su disponibilidad
        </p>
      </div>

      {/* Theme Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <PaintBrushIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Tema del Menú</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Elige el diseño que mejor represente la personalidad de tu restaurante
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {themes.map((theme) => (
            <div key={theme.id} className="space-y-3">
              <button
                onClick={() => handleThemeChange(theme.id)}
                className={`w-full transition-all duration-200 ${
                  selectedTheme === theme.id
                    ? 'ring-2 ring-[#111827] ring-offset-2'
                    : 'hover:shadow-md'
                }`}
                disabled={saving}
              >
                {getThemePreview(theme.id)}
              </button>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-900">{theme.name}</h3>
                <p className="text-xs text-gray-500">{theme.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <EyeIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Vista previa</span>
          </div>
          <p className="text-sm text-blue-800 mt-1">
            Puedes ver cómo se ve tu menú con el tema seleccionado visitando{' '}
            <a 
              href={`/r/${restaurantId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              tu menú público
            </a>
          </p>
        </div>
      </div>

      {/* Menu Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ExclamationTriangleIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Estado del Menú</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Controla la disponibilidad de tu menú para los clientes
        </p>

        {menu ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {menu.active ? 'Menú Activo' : 'Menú Desactivado'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {menu.active 
                  ? 'Tu menú está visible para los clientes' 
                  : 'Tu menú no está disponible públicamente'
                }
              </p>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleToggleMenu}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  menu.active ? 'bg-[#111827]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    menu.active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  Sin Menú Configurado
                </h3>
                <p className="text-sm text-blue-800 mt-1">
                  Tu restaurante necesita un menú para estar disponible públicamente
                </p>
              </div>
              <button
                onClick={handleCreateDefaultMenu}
                disabled={saving}
                className="px-4 py-2 bg-[#111827] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {saving ? 'Creando...' : 'Crear Menú'}
              </button>
            </div>
          </div>
        )}

        {menu && !menu.active && (
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900">Menú desactivado</span>
            </div>
            <p className="text-sm text-amber-800 mt-1">
              Los clientes verán un mensaje de "menú no disponible" cuando visiten tu enlace público.
            </p>
          </div>
        )}
      </div>


      {/* Tips */}
      <div className="bg-green-50 rounded-lg border border-green-200 p-6">
        <h2 className="text-lg font-semibold text-green-900 mb-2">💡 Consejos de diseño</h2>
        <ul className="space-y-2 text-sm text-green-800">
          <li>• El tema elegante es perfecto para restaurantes tradicionales</li>
          <li>• El tema moderno funciona bien para cafeterías y lugares casuales</li>
          <li>• El tema fresco es ideal para restaurantes saludables o veganos</li>
          <li>• El tema cupido es romántico, ideal para cenas especiales</li>
          <li>• Puedes cambiar el tema en cualquier momento</li>
        </ul>
      </div>

      <Snackbar
        isOpen={snackbar.isOpen}
        message={snackbar.message}
        type={snackbar.type}
        duration={snackbar.duration}
      />

      <ConfirmDialog
        isOpen={showDeactivateDialog}
        onClose={() => setShowDeactivateDialog(false)}
        onConfirm={handleConfirmToggle}
        title="¿Desactivar menú?"
        description="Al desactivar el menú, los clientes verán un mensaje de 'menú no disponible' cuando visiten tu enlace público. Puedes reactivarlo en cualquier momento."
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}
