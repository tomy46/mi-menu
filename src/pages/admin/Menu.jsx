import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  PaintBrushIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { getRestaurant, updateRestaurant, getActiveMenuByRestaurant, getMenusByRestaurant, toggleMenuActive, createMenu } from '../../services/firestore.js'
import { getTheme } from '../../config/themes.js'
import { useSnackbar } from '../../hooks/useSnackbar.js'
import Snackbar from '../../components/Snackbar.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import QROptionsDialog from '../../components/QROptionsDialog.jsx'
import QRGeneratorNew from '../../components/QRGeneratorNew.jsx'

const themes = [
  { id: 'elegant', name: 'Elegante', description: 'Diseño clásico y sofisticado' },
  { id: 'modern', name: 'Moderno', description: 'Diseño limpio y minimalista con tipografía Epilogue' },
  { id: 'cupido', name: 'Cupido', description: 'Romántico y delicado' },
  { id: 'colombia', name: 'Colombia', description: 'Colores cálidos inspirados en Colombia' },
  { id: 'rustico', name: 'Rústico', description: 'Diseño cálido y elegante con fondo oscuro y tonos terrosos' }
]


export default function Menu() {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [menus, setMenus] = useState([])
  const [selectedTheme, setSelectedTheme] = useState('elegant')
  const [originalTheme, setOriginalTheme] = useState('elegant')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [menuToToggle, setMenuToToggle] = useState(null)
  const [showQROptions, setShowQROptions] = useState(false)
  const [showQRGenerator, setShowQRGenerator] = useState(false)
  const [qrOptions, setQrOptions] = useState(null)
  const { snackbar, showSuccess, showError } = useSnackbar()

  useEffect(() => {
    async function loadData() {
      try {
        const [restaurantData, menusData] = await Promise.all([
          getRestaurant(restaurantId),
          getMenusByRestaurant(restaurantId)
        ])
        
        setRestaurant(restaurantData)
        setMenus(menusData)
        const currentTheme = restaurantData.theme || 'elegant'
        setSelectedTheme(currentTheme)
        setOriginalTheme(currentTheme)
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

  // Efecto para hacer scroll a la sección QR si viene desde el hash
  useEffect(() => {
    if (!loading && window.location.hash === '#qr-section') {
      setTimeout(() => {
        const qrSection = document.getElementById('qr-section')
        if (qrSection) {
          qrSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }
      }, 100) // Pequeño delay para asegurar que el DOM esté renderizado
    }
  }, [loading])

  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId)
  }


  const handleSaveTheme = async () => {
    setSaving(true)
    try {
      await updateRestaurant(restaurantId, { theme: selectedTheme })
      setOriginalTheme(selectedTheme)
      showSuccess('Tema guardado exitosamente')
    } catch (error) {
      console.error('Error saving theme:', error)
      showError('Error al guardar el tema')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleMenu = (menu) => {
    setMenuToToggle(menu)
    if (menu.active) {
      setShowDeactivateDialog(true)
    } else {
      handleConfirmToggle()
    }
  }

  const handleConfirmToggle = async () => {
    if (!menuToToggle) return
    
    setSaving(true)
    try {
      await toggleMenuActive(menuToToggle.id, !menuToToggle.active)
      
      // Actualizar el menú en la lista local
      setMenus(prevMenus => 
        prevMenus.map(m => 
          m.id === menuToToggle.id 
            ? { ...m, active: !m.active }
            : m
        )
      )
      
      showSuccess(menuToToggle.active ? 'Menú desactivado exitosamente' : 'Menú activado exitosamente')
    } catch (error) {
      console.error('Error toggling menu:', error)
      showError('Error al cambiar el estado del menú')
    } finally {
      setSaving(false)
      setShowDeactivateDialog(false)
      setMenuToToggle(null)
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
      
      setMenus(prevMenus => [...prevMenus, newMenu])
      showSuccess('Menú creado y activado exitosamente')
    } catch (error) {
      console.error('Error creating menu:', error)
      showError('Error al crear el menú')
    } finally {
      setSaving(false)
    }
  }

  const handleQROptionSelect = (options) => {
    setQrOptions(options)
    setShowQROptions(false)
    setShowQRGenerator(true)
  }

  const handleBackToOptions = () => {
    setShowQRGenerator(false)
    setShowQROptions(true)
  }

  const handleCloseQR = () => {
    setShowQRGenerator(false)
    setShowQROptions(false)
    setQrOptions(null)
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {selectedTheme !== originalTheme && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveTheme}
              disabled={saving}
              className="px-6 py-2 bg-[#111827] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Guardando...' : 'Guardar Tema'}
            </button>
          </div>
        )}
      </div>

      {/* Menu Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Gestionar Menú</h2>
          </div>
          <button
            disabled={true}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed font-medium"
          >
            <LockClosedIcon className="w-4 h-4" />
            <PlusIcon className="w-4 h-4" />
            Agregar Menú
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Gestiona tus menús existentes y controla su disponibilidad para los clientes
        </p>

        {menus.length > 0 ? (
          <div className="space-y-4">
            {menus.map((menu) => (
              <div key={menu.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {menu.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        menu.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {menu.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    
                    {menu.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {menu.description}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      {menu.active 
                        ? 'Los clientes pueden ver este menú' 
                        : 'Este menú no está disponible públicamente'
                      }
                    </p>
                  </div>
                  
                  <div className="flex items-center ml-4">
                    <button
                      onClick={() => handleToggleMenu(menu)}
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
              </div>
            ))}
            
            {menus.some(m => !m.active) && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">Menús desactivados</span>
                </div>
                <p className="text-sm text-amber-800 mt-1">
                  Los clientes verán un mensaje de "menú no disponible" para los menús desactivados.
                </p>
              </div>
            )}
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
      </div>

      {/* QR Code Section */}
      <div id="qr-section" className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <QrCodeIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Código QR para Imprimir</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Genera un código QR personalizado para que tus clientes accedan fácilmente a tu menú
        </p>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Generar QR Personalizado
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Personaliza colores, estilo y agrega tu logo para imprimir
            </p>
          </div>
          <button
            onClick={() => setShowQROptions(true)}
            className="px-4 py-2 bg-[#111827] text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Generar QR
          </button>
        </div>
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
        title={`¿Desactivar ${menuToToggle?.title}?`}
        description={`Al desactivar este menú, los clientes verán un mensaje de 'menú no disponible' para ${menuToToggle?.title}. Puedes reactivarlo en cualquier momento.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="danger"
      />

      <QROptionsDialog
        isOpen={showQROptions}
        onClose={() => setShowQROptions(false)}
        onSelectOption={handleQROptionSelect}
      />

      {qrOptions && (
        <QRGeneratorNew
          isOpen={showQRGenerator}
          onClose={handleCloseQR}
          onBack={handleBackToOptions}
          restaurantId={restaurantId}
          restaurantName={restaurant?.name || ''}
          restaurantLogo={restaurant?.logo || null}
          options={qrOptions}
        />
      )}
    </div>
  )
}
