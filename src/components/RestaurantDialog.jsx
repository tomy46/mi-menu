import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function RestaurantDialog({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    website: '',
    hours: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('') // Clear previous errors
    
    if (!formData.name.trim()) {
      setError('El nombre del restaurante es requerido')
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
      // Reset form
      setFormData({
        name: '',
        phone: '',
        address: '',
        website: '',
        hours: ''
      })
      setError('')
      onClose()
    } catch (error) {
      console.error('Error creating restaurant:', error)
      setError(error.message || 'Error al crear el restaurante')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Crear Nuevo Restaurante
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {/* Name - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Restaurante *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              placeholder="Ej: La Pizzería del Centro"
              required
            />
          </div>

          {/* Phone - Optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              placeholder="Ej: +54 11 1234-5678"
            />
          </div>

          {/* Address - Optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              placeholder="Ej: Av. Corrientes 1234, CABA"
            />
          </div>

          {/* Website - Optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sitio Web
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              placeholder="Ej: https://mipizzeria.com"
            />
          </div>

          {/* Hours - Optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horarios
            </label>
            <textarea
              value={formData.hours}
              onChange={(e) => handleChange('hours', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              placeholder="Ej: Lun-Vie: 18:00-00:00, Sáb-Dom: 12:00-01:00"
              rows={2}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-[#111827] bg-white text-[#111827] rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#111827] text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Restaurante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
