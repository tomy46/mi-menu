import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createItem, deleteItem, getActiveMenuByRestaurant, getCategories, getItemsByCategory, getItems, updateItem, reorderItems, checkSubscriptionLimit, refreshRestaurantStats } from '../../services/firestore.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import Snackbar from '../../components/Snackbar.jsx'
import UpgradePrompt from '../../components/UpgradePrompt.jsx'
import { useSnackbar } from '../../hooks/useSnackbar.js'
import { getRestaurant } from '../../services/firestore.js'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Helper functions for price formatting
function formatPriceDisplay(value, currency = 'ARS') {
  if (!value || value === '' || isNaN(value)) return ''
  const numValue = parseFloat(value)
  if (numValue === 0) return ''
  
  return new Intl.NumberFormat('es-AR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numValue)
}

function parsePriceInput(formattedValue) {
  if (!formattedValue) return ''
  // Remove thousand separators and replace comma with dot for decimal
  const cleaned = formattedValue.replace(/\./g, '').replace(',', '.')
  return cleaned
}

export default function Items({ onItemsChange }) {
  const { restaurantId } = useParams()
  const [menuId, setMenuId] = useState(null)
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', price: '', currency: 'ARS', available: true, order: 0 })
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, itemId: null, itemName: '' })
  const [upgradePrompt, setUpgradePrompt] = useState({ isOpen: false, limitCheck: null })
  const [restaurant, setRestaurant] = useState(null)
  const { snackbar, showError, showSuccess } = useSnackbar()

  // Drag and drop sensors with better mobile support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  // Load all items for the restaurant to notify parent component
  async function loadAllItems() {
    if (onItemsChange) {
      try {
        const allItems = await getItems(restaurantId)
        onItemsChange(allItems)
        // Notify dashboard to update
        window.dispatchEvent(new CustomEvent('dashboardUpdate'))
      } catch (error) {
        console.error('Error loading all items:', error)
      }
    }
  }

  useEffect(() => {
    load()
    loadAllItems()
    loadRestaurant()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId])

  async function loadRestaurant() {
    try {
      const restaurantData = await getRestaurant(restaurantId)
      setRestaurant(restaurantData)
    } catch (error) {
      console.error('Error loading restaurant:', error)
    }
  }

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId])

  async function onCreate(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      showError('El nombre del producto es requerido')
      return
    }
    const numericPrice = parseFloat(parsePriceInput(form.price))
    if (!numericPrice || numericPrice <= 0) {
      showError('El precio debe ser mayor a 0')
      return
    }

    // Check subscription limits before creating
    const limitCheck = await checkSubscriptionLimit(restaurantId, 'products')
    if (!limitCheck.allowed) {
      setUpgradePrompt({ 
        isOpen: true, 
        limitCheck: { 
          ...limitCheck, 
          limitType: 'products',
          currentPlan: restaurant?.subscriptionPlan || 'start'
        } 
      })
      return
    }

    await createItem({ ...form, categoryId, price: numericPrice, order: Number(form.order) || 0 })
    setForm({ name: '', description: '', price: '', currency: 'ARS', available: true, order: 0 })
    setShowCreateDialog(false)
    showSuccess('Producto creado exitosamente')
    await loadItems()
    await loadAllItems()
    
    // Update analytics stats
    refreshRestaurantStats(restaurantId).catch(error => {
      console.warn('Failed to update analytics:', error)
    })
    
    // Dispatch event for dashboard update
    window.dispatchEvent(new CustomEvent('dashboardUpdate'))
  }

  async function onSave(it) {
    if (!it.name.trim()) {
      showError('El nombre del producto es requerido')
      return
    }
    if (Number(it.price) <= 0) {
      showError('El precio debe ser mayor a 0')
      return
    }
    await updateItem(it.id, {
      name: it.name.trim(),
      description: it.description || '',
      price: Number(it.price) || 0,
      currency: it.currency || 'ARS',
      available: !!it.available,
      order: Number(it.order) || 0,
    })
    setEditingItem(null)
    showSuccess('Producto actualizado exitosamente')
    await loadItems()
    await loadAllItems()
    
    // Update analytics stats
    refreshRestaurantStats(restaurantId).catch(error => {
      console.warn('Failed to update analytics:', error)
    })
  }

  function handleDeleteClick(id, name) {
    setDeleteDialog({
      isOpen: true,
      itemId: id,
      itemName: name
    })
  }

  async function confirmDelete() {
    if (deleteDialog.itemId) {
      await deleteItem(deleteDialog.itemId)
      showSuccess('Producto eliminado exitosamente')
      await loadItems()
      await loadAllItems()
      
      // Update analytics stats
      refreshRestaurantStats(restaurantId).catch(error => {
        console.warn('Failed to update analytics:', error)
      })
      
      // Dispatch event for dashboard update
      window.dispatchEvent(new CustomEvent('dashboardUpdate'))
    }
    setDeleteDialog({ isOpen: false, itemId: null, itemName: '' })
  }

  async function onToggleAvailable(it) {
    await updateItem(it.id, { available: !it.available })
    await loadItems()
    await loadAllItems()
    
    // Update analytics stats
    refreshRestaurantStats(restaurantId).catch(error => {
      console.warn('Failed to update analytics:', error)
    })
  }

  // Handle drag end for reordering
  async function handleDragEnd(event) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)
      
      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)
      
      try {
        await reorderItems(newItems)
        showSuccess('Orden actualizado exitosamente')
        await loadAllItems()
      } catch (error) {
        showError('Error al actualizar el orden')
        // Revert on error
        await loadItems()
        await loadAllItems()
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600">Gestioná los productos de tu menú</p>
        </div>
        {categoryId && (
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-[#111827] rounded-lg hover:bg-gray-800 transition-colors"
          >
            Añadir Producto
          </button>
        )}
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
            <>
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay productos</h3>
                  <p className="text-gray-600">Creá tu primer producto para esta categoría</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                      {items.map((item) => (
                        <SortableItemCard
                          key={item.id}
                          item={item}
                          onEdit={() => setEditingItem(item)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </>
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
            handleDeleteClick(editingItem.id, editingItem.name)
            setEditingItem(null)
          }}
        />
      )}

      {/* Create Item Modal */}
      {showCreateDialog && (
        <CreateItemModal
          form={form}
          setForm={setForm}
          onClose={() => {
            setShowCreateDialog(false)
            setForm({ name: '', description: '', price: '', currency: 'ARS', available: true, order: 0 })
          }}
          onSave={onCreate}
        />
      )}

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, itemId: null, itemName: '' })}
        onConfirm={confirmDelete}
        title="¿Eliminar producto?"
        description={`¿Estás seguro que deseas eliminar el producto "${deleteDialog.itemName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      <Snackbar
        isOpen={snackbar.isOpen}
        onClose={() => {}}
        message={snackbar.message}
        type={snackbar.type}
        duration={snackbar.duration}
        position={snackbar.position}
        action={snackbar.action}
      />

      <UpgradePrompt
        isOpen={upgradePrompt.isOpen}
        onClose={() => setUpgradePrompt({ isOpen: false, limitCheck: null })}
        currentPlan={upgradePrompt.limitCheck?.currentPlan}
        limitType={upgradePrompt.limitCheck?.limitType}
        currentUsage={upgradePrompt.limitCheck?.current}
        limit={upgradePrompt.limitCheck?.limit}
      />
    </div>
  )
}

// Sortable Item Card Component
function SortableItemCard({ item, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleCardClick = (e) => {
    // Only trigger edit if not dragging
    if (!isDragging) {
      onEdit(item)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-200 p-4 select-none ${
        isDragging 
          ? 'shadow-lg cursor-grabbing' 
          : 'hover:shadow-md hover:border-gray-300 cursor-pointer touch-manipulation'
      } transition-all`}
      onClick={handleCardClick}
      {...attributes}
      {...listeners}
    >
      {/* Product content */}
      <div className="mb-3">
        <div className="flex items-start gap-3">
          {/* Drag indicator for mobile */}
          <div className="flex flex-col gap-0.5 mt-1 opacity-30">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <h3 className={`font-medium text-sm truncate ${
                item.available !== false ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {item.name}
              </h3>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                item.available !== false 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {item.available !== false ? 'Disponible' : 'No disponible'}
              </span>
              <span className="font-semibold text-xs text-gray-900">
                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: item.currency || 'ARS' }).format(item.price || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-xs text-gray-600 overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {item.description}
        </p>
      )}

    </div>
  )
}

// Item detail modal component
function ItemDetailModal({ item, onClose, onSave, onToggleAvailable, onDelete }) {
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description || '')
  const [price, setPrice] = useState(formatPriceDisplay(item.price || 0))
  const [currency, setCurrency] = useState(item.currency || 'ARS')
  const [available, setAvailable] = useState(item.available !== false)
  const [order, setOrder] = useState(item.order || 0)
  const [saving, setSaving] = useState(false)

  const handlePriceChange = (e) => {
    const inputValue = e.target.value
    // Allow only numbers, dots, and commas
    if (inputValue === '' || /^[0-9.,]*$/.test(inputValue)) {
      setPrice(inputValue)
    }
  }

  const handlePriceBlur = () => {
    const numericValue = parsePriceInput(price)
    if (numericValue && !isNaN(numericValue)) {
      setPrice(formatPriceDisplay(numericValue))
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const numericPrice = parseFloat(parsePriceInput(price))
      await onSave({ ...item, name, description, price: numericPrice || 0, currency, available, order: Number(order) })
      onClose()
    } catch (error) {
      console.error('Error saving item:', error)
    } finally {
      setSaving(false)
    }
  }

  function handleDelete() {
    onDelete()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative z-10 bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all">
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
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Nombre*</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del ítem"
                  spellCheck={true}
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
                  spellCheck={true}
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
                  type="text"
                  value={price}
                  onChange={handlePriceChange}
                  onBlur={handlePriceBlur}
                  placeholder="0,00"
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
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Disponibilidad</label>
                  <p className="text-xs text-gray-500">Controla si el ítem está disponible para los clientes</p>
                </div>
                <button
                  onClick={() => setAvailable(!available)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    available ? 'bg-[#111827]' : 'bg-gray-200'
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
            disabled={saving}
            className="flex-1 bg-red-50 text-red-700 rounded-lg py-2 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Eliminar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#111827] text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}

// Create item modal component
function CreateItemModal({ form, setForm, onClose, onSave }) {
  const [saving, setSaving] = useState(false)
  
  const handlePriceChange = (e) => {
    const inputValue = e.target.value
    // Allow only numbers, dots, and commas
    if (inputValue === '' || /^[0-9.,]*$/.test(inputValue)) {
      setForm(f => ({ ...f, price: inputValue }))
    }
  }

  const handlePriceBlur = () => {
    const numericValue = parsePriceInput(form.price)
    if (numericValue && !isNaN(numericValue)) {
      setForm(f => ({ ...f, price: formatPriceDisplay(numericValue) }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(e)
    } catch (error) {
      console.error('Error creating item:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative z-10 bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Anadir producto</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* General section */}
            <div>
             <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Nombre*</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nombre del ítem"
                    spellCheck={true}
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Descripción</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    rows="3"
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Descripción del ítem"
                    spellCheck={true}
                  />
                </div>
              </div>
            </div>

            {/* Pricing section */}
            <div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Precio</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    type="text"
                    value={form.price}
                    onChange={handlePriceChange}
                    onBlur={handlePriceBlur}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Moneda</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    value={form.currency}
                    onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}
                  >
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Configuration section */}
            <div>
              <div className="space-y-3">
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Disponibilidad</label>
                    <p className="text-xs text-gray-500">Controla si el ítem está disponible para los clientes</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, available: !f.available }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.available ? 'bg-[#111827]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.available ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 text-[#111827] border border-[#111827] bg-white rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#111827] text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Crear ítem'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
