import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createCategory, deleteCategory, getActiveMenuByRestaurant, getCategories, updateCategory } from '../../services/firestore.js'

export default function Categories() {
  const { restaurantId } = useParams()
  const [menuId, setMenuId] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', order: 0 })
  const [editingId, setEditingId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const m = await getActiveMenuByRestaurant(restaurantId)
      if (m) setMenuId(m.id)
      const cats = m ? await getCategories(m.id) : []
      setCategories(cats)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [restaurantId])

  async function onCreate(e) {
    e.preventDefault()
    if (!form.name.trim()) return alert('Nombre requerido')
    await createCategory({ menuId, name: form.name.trim(), order: Number(form.order) || 0 })
    setForm({ name: '', order: 0 })
    await load()
  }

  async function onSave(cat) {
    if (!cat.name.trim()) return alert('Nombre requerido')
    await updateCategory(cat.id, { name: cat.name.trim(), order: Number(cat.order) || 0 })
    setEditingId(null)
    await load()
  }

  async function onDelete(id) {
    if (!confirm('¿Eliminar categoría?')) return
    await deleteCategory(id)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-600">Organizá tu menú en categorías</p>
        </div>
      </div>

      {loading && <div className="text-center py-8">Cargando...</div>}

      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Create new category card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">➕</span>
              </div>
              <h3 className="font-semibold text-gray-900">Nueva categoría</h3>
            </div>
            
            <form onSubmit={onCreate} className="space-y-3">
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Nombre de la categoría"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                type="number"
                placeholder="Orden (opcional)"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
              />
              <button className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                Crear categoría
              </button>
            </form>
          </div>

          {/* Existing categories */}
          {categories.map((c) => (
            <div key={c.id} className="bg-white rounded-lg border border-gray-200 p-6">
              {editingId === c.id ? (
                <EditRow
                  cat={c}
                  onCancel={() => setEditingId(null)}
                  onSave={onSave}
                />
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📋</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{c.name}</h3>
                      <p className="text-sm text-gray-600">Orden: {c.order}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingId(c.id)}
                      className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => onDelete(c.id)}
                      className="flex-1 bg-red-50 text-red-700 rounded-lg py-2 text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Empty state */}
          {categories.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay categorías</h3>
              <p className="text-gray-600">Creá tu primera categoría para organizar tu menú</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EditRow({ cat, onCancel, onSave }) {
  const [name, setName] = useState(cat.name)
  const [order, setOrder] = useState(cat.order || 0)
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
          <span className="text-xl">✏️</span>
        </div>
        <h3 className="font-semibold text-gray-900">Editando categoría</h3>
      </div>
      
      <input 
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Nombre de la categoría"
      />
      <input 
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" 
        type="number" 
        value={order} 
        onChange={(e) => setOrder(e.target.value)} 
        placeholder="Orden"
      />
      <div className="flex gap-2">
        <button 
          className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-200 transition-colors" 
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button 
          className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors" 
          onClick={() => onSave({ ...cat, name, order })}
        >
          Guardar
        </button>
      </div>
    </div>
  )
}
