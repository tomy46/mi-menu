import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createItem, deleteItem, getActiveMenuByRestaurant, getCategories, getItemsByCategory, updateItem } from '../../services/firestore.js'

export default function Items() {
  const { restaurantId } = useParams()
  const [menuId, setMenuId] = useState(null)
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', price: 0, currency: 'ARS', available: true, order: 0 })
  const [editingItem, setEditingItem] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const m = await getActiveMenuByRestaurant(restaurantId)
      if (m) setMenuId(m.id)
      const cats = m ? await getCategories(m.id) : []
      setCategories(cats)
      if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id)
    } finally {
      setLoading(false)
    }
  }

  async function loadItems() {
    if (!categoryId) return setItems([])
    const list = await getItemsByCategory(categoryId, { onlyAvailable: false })
    setItems(list)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId])

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId])

  async function onCreate(e) {
    e.preventDefault()
    if (!form.name.trim()) return alert('Nombre requerido')
    if (Number(form.price) < 0) return alert('Precio inválido')
    await createItem({ ...form, categoryId, price: Number(form.price) || 0, order: Number(form.order) || 0 })
    setForm({ name: '', description: '', price: 0, currency: 'ARS', available: true, order: 0 })
    await loadItems()
  }

  async function onSave(it) {
    if (!it.name.trim()) return alert('Nombre requerido')
    if (Number(it.price) < 0) return alert('Precio inválido')
    await updateItem(it.id, {
      name: it.name.trim(),
      description: it.description || '',
      price: Number(it.price) || 0,
      currency: it.currency || 'ARS',
      available: !!it.available,
      order: Number(it.order) || 0,
    })
    setEditingId(null)
    await loadItems()
  }

  async function onDelete(id) {
    if (!confirm('¿Eliminar ítem?')) return
    await deleteItem(id)
    await loadItems()
  }

  async function onToggleAvailable(it) {
    await updateItem(it.id, { available: !it.available })
    await loadItems()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ítems</h1>
          <p className="text-gray-600">Gestioná los productos de tu menú</p>
        </div>
      </div>

      {loading && <div className="text-center py-8">Cargando...</div>}

      {!loading && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">Categoría</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" 
              value={categoryId} 
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {categoryId ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Create new item card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">➕</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Nuevo ítem</h3>
                </div>
                
                <form onSubmit={onCreate} className="space-y-3">
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Nombre del ítem"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    placeholder="Descripción (opcional)"
                    rows="2"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      type="number"
                      step="0.01"
                      placeholder="Precio"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    />
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      value={form.currency}
                      onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    >
                      <option value="ARS">ARS</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <button className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                    Crear ítem
                  </button>
                </form>
              </div>

              {/* Existing items */}
              {items.map((it) => (
                <ItemCard 
                  key={it.id} 
                  item={it} 
                  onEdit={() => setEditingItem(it)}
                  onToggleAvailable={() => onToggleAvailable(it)}
                  onDelete={() => onDelete(it.id)}
                />
              ))}

              {/* Empty state */}
              {items.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay ítems</h3>
                  <p className="text-gray-600">Agregá tu primer ítem a esta categoría</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Seleccioná una categoría</h3>
              <p className="text-gray-600">Primero creá una categoría para poder agregar ítems</p>
            </div>
          )}
        </>
      )}

      {/* Item Detail Modal */}
      {editingItem && (
        <ItemDetailModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={onSave}
          onToggleAvailable={() => {
            onToggleAvailable(editingItem)
            setEditingItem(null)
          }}
          onDelete={() => {
            onDelete(editingItem.id)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}

// Simple item card component
function ItemCard({ item, onEdit }) {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onEdit}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <span className="text-xl">🍽️</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          {item.available === false && (
            <span className="inline-block text-xs bg-red-100 text-red-700 rounded-full px-2 py-1 mt-1">
              No disponible
            </span>
          )}
        </div>
      </div>
      
      {item.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
      )}
      
      <div className="flex justify-between items-center">
        <span className="font-semibold text-lg text-gray-900">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: item.currency || 'ARS' }).format(item.price || 0)}
        </span>
        <span className="text-xs text-gray-500">Orden: {item.order || 0}</span>
      </div>
    </div>
  )
}

// Item detail modal component
function ItemDetailModal({ item, onClose, onSave, onToggleAvailable, onDelete }) {
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description || '')
  const [price, setPrice] = useState(item.price || 0)
  const [currency, setCurrency] = useState(item.currency || 'ARS')
  const [available, setAvailable] = useState(item.available !== false)
  const [order, setOrder] = useState(item.order || 0)

  function handleSave() {
    onSave({ ...item, name, description, price: Number(price), currency, available, order: Number(order) })
    onClose()
  }

  function handleDelete() {
    if (confirm('¿Estás seguro de que querés eliminar este ítem?')) {
      onDelete()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Editar ítem</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* General section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">General</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Nombre*</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del ítem"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 block mb-1">Descripción</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción del ítem"
                />
              </div>
            </div>
          </div>

          {/* Pricing section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Precio</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Precio</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Moneda</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuration section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Configuración</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Orden</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Disponibilidad</label>
                  <p className="text-xs text-gray-500">Controla si el ítem está disponible para los clientes</p>
                </div>
                <button
                  onClick={() => setAvailable(!available)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    available ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      available ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-50 text-red-700 rounded-lg py-2 text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Eliminar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
