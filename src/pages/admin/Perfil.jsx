import { useState, useEffect } from 'react'
import { 
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useSnackbar } from '../../hooks/useSnackbar.js'
import Snackbar from '../../components/Snackbar.jsx'

export default function Perfil() {
  const { user, updateUserProfile, updateUserPassword } = useAuth()
  const [profile, setProfile] = useState({
    displayName: '',
    email: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const { snackbar, showSuccess, showError } = useSnackbar()

  useEffect(() => {
    if (user) {
      setProfile({
        displayName: user.displayName || '',
        email: user.email || ''
      })
    }
  }, [user])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    
    if (!profile.displayName.trim()) {
      showError('El nombre es requerido')
      return
    }

    setLoading(true)
    try {
      await updateUserProfile({
        displayName: profile.displayName.trim()
      })
      showSuccess('Perfil actualizado exitosamente')
    } catch (error) {
      console.error('Error updating profile:', error)
      showError('Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!passwordData.currentPassword) {
      showError('La contraseña actual es requerida')
      return
    }
    
    if (!passwordData.newPassword) {
      showError('La nueva contraseña es requerida')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      showError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      await updateUserPassword(passwordData.currentPassword, passwordData.newPassword)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      showSuccess('Contraseña actualizada exitosamente')
    } catch (error) {
      console.error('Error updating password:', error)
      if (error.code === 'auth/wrong-password') {
        showError('La contraseña actual es incorrecta')
      } else if (error.code === 'auth/weak-password') {
        showError('La nueva contraseña es muy débil')
      } else {
        showError('Error al actualizar la contraseña')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
        <p className="text-gray-600 mt-1">
          Gestiona tu información personal y configuración de seguridad
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <UserIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                value={profile.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled
              />
              <EnvelopeIcon className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              El correo electrónico no se puede modificar
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#111827] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <KeyIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña actual
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              placeholder="Tu contraseña actual"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              placeholder="Confirma tu nueva contraseña"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#111827] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Info */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-blue-900">Seguridad</h2>
        </div>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Usa una contraseña fuerte con al menos 8 caracteres</li>
          <li>• Incluye mayúsculas, minúsculas, números y símbolos</li>
          <li>• No compartas tu contraseña con nadie</li>
          <li>• Cambia tu contraseña regularmente</li>
          <li>• Cierra sesión en dispositivos compartidos</li>
        </ul>
      </div>

      <Snackbar
        isOpen={snackbar.isOpen}
        message={snackbar.message}
        type={snackbar.type}
        duration={snackbar.duration}
      />
    </div>
  )
}
