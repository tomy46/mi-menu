import { useState, useEffect } from 'react'

export default function CategoryDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  category = null, 
  title = "Nueva Categoría" 
}) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    tag: '',
    active: true
  })
  const [saving, setSaving] = useState(false)

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setForm({
          name: category.name || '',
          description: category.description || '',
          tag: category.tag || '',
          active: category.active !== false
        })
      } else {
        setForm({
          name: '',
          description: '',
          tag: '',
          active: true
        })
      }
    }
  }, [isOpen, category])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    
    setSaving(true)
    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        tag: form.tag.trim()
      })
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl text-gray-400">×</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              placeholder="Nombre de la categoría"
              spellCheck={true}
              required
              autoFocus
            />
          </div>

          {/* Description - Optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent resize-none"
              placeholder="Descripción se mostrara debajo del titulo del producto.  (opcional)"
              spellCheck={true}
              rows={3}
            />
          </div>

          {/* Tag - Optional, only when editing */}
          {category && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiqueta
              </label>
              <input
                type="text"
                value={form.tag}
                onChange={(e) => setForm(f => ({ ...f, tag: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                placeholder="Etiqueta (opcional)"
                spellCheck={true}
              />
            </div>
          )}

          {/* Active toggle - Only when editing */}
          {category && (
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Categoría disponible</label>
                <p className="text-xs text-gray-500">Controla si la categoría está disponible para los clientes</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.active ? 'bg-[#111827]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {/* Delete button - only when editing */}
            {category && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(category.id, category.name)}
                className="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                Eliminar
              </button>
            )}
            
            <button
              type="submit"
              disabled={!form.name.trim() || saving}
              className={`px-4 py-2 text-sm font-medium text-white bg-[#111827] rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center ${
                category && onDelete ? 'flex-1' : 'w-full'
              }`}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                category ? 'Guardar' : 'Crear'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
