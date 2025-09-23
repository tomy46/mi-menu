import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createCategory, deleteCategory, getActiveMenuByRestaurant, getCategories, updateCategory, reorderCategories, checkSubscriptionLimit } from '../../services/firestore.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import Snackbar from '../../components/Snackbar.jsx'
import CategoryDialog from '../../components/CategoryDialog.jsx'
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

export default function Categories({ onCategoriesChange }) {
  const { restaurantId } = useParams()
  const [menuId, setMenuId] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [createDialog, setCreateDialog] = useState(false)
  const [editDialog, setEditDialog] = useState({ isOpen: false, category: null })
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, categoryId: null, categoryName: '' })
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
      // Notify parent component about categories change
      if (onCategoriesChange) {
        onCategoriesChange(cats)
      }
      // Notify dashboard to update
      window.dispatchEvent(new CustomEvent('dashboardUpdate'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    loadRestaurant()
  }, [restaurantId])

  async function loadRestaurant() {
    try {
      const restaurantData = await getRestaurant(restaurantId)
      setRestaurant(restaurantData)
    } catch (error) {
      console.error('Error loading restaurant:', error)
    }
  }

  // Handle drag end
  async function handleDragEnd(event) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex(cat => cat.id === active.id)
      const newIndex = categories.findIndex(cat => cat.id === over.id)
      
      const newCategories = arrayMove(categories, oldIndex, newIndex)
      setCategories(newCategories)
      // Notify parent component about categories change
      if (onCategoriesChange) {
        onCategoriesChange(newCategories)
      }
      // Notify dashboard to update
      window.dispatchEvent(new CustomEvent('dashboardUpdate'))
      
      try {
        await reorderCategories(newCategories)
        showSuccess('Orden actualizado exitosamente')
      } catch (error) {
        showError('Error al actualizar el orden')
        // Revert on error
        await load()
      }
    }
  }

  // Create category
  async function handleCreate(formData) {
    try {
      // Check subscription limits before creating
      const limitCheck = await checkSubscriptionLimit(restaurantId, 'categories')
      if (!limitCheck.allowed) {
        setUpgradePrompt({ 
          isOpen: true, 
          limitCheck: { 
            ...limitCheck, 
            limitType: 'categories',
            currentPlan: restaurant?.subscriptionPlan || 'start'
          } 
        })
        return
      }

      const nextOrder = categories.length > 0 ? Math.max(...categories.map(c => c.order || 0)) + 1 : 0
      await createCategory({ 
        menuId, 
        name: formData.name,
        description: formData.description,
        tag: formData.tag,
        active: formData.active,
        order: nextOrder
      })
      setCreateDialog(false)
      showSuccess('Categoría creada exitosamente')
      await load()
      
      // Dispatch event for dashboard update
      window.dispatchEvent(new CustomEvent('dashboardUpdate'))
    } catch (error) {
      showError('Error al crear la categoría')
    }
  }

  // Edit category
  async function handleEdit(formData) {
    try {
      await updateCategory(editDialog.category.id, {
        name: formData.name,
        description: formData.description,
        tag: formData.tag,
        active: formData.active
      })
      setEditDialog({ isOpen: false, category: null })
      showSuccess('Categoría actualizada exitosamente')
      await load()
    } catch (error) {
      showError('Error al actualizar la categoría')
    }
  }

  // Delete category
  function handleDeleteClick(id, name) {
    setDeleteDialog({
      isOpen: true,
      categoryId: id,
      categoryName: name
    })
  }

  async function confirmDelete() {
    if (deleteDialog.categoryId) {
      try {
        await deleteCategory(deleteDialog.categoryId)
        showSuccess('Categoría eliminada exitosamente')
        await load()
      } catch (error) {
        showError('Error al eliminar la categoría')
      }
    }
    setDeleteDialog({ isOpen: false, categoryId: null, categoryName: '' })
  }

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-600">Organizá tu menú en categorías</p>
        </div>
        <button
          onClick={() => setCreateDialog(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-[#111827] rounded-lg hover:bg-gray-800 transition-colors"
        >
          Añadir Categoría
        </button>
      </div>

      {loading && <div className="text-center py-8">Cargando...</div>}

      {!loading && (
        <>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay categorías</h3>
              <p className="text-gray-600">Creá tu primera categoría para organizar tu menú</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={categories.map(c => c.id)} strategy={rectSortingStrategy}>
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  {categories.map((category) => (
                    <SortableCategoryCard
                      key={category.id}
                      category={category}
                      onEdit={(cat) => setEditDialog({ isOpen: true, category: cat })}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}

      {/* Dialogs */}
      <CategoryDialog
        isOpen={createDialog}
        onClose={() => setCreateDialog(false)}
        onSave={handleCreate}
        title="Nueva Categoría"
      />

      <CategoryDialog
        isOpen={editDialog.isOpen}
        onClose={() => setEditDialog({ isOpen: false, category: null })}
        onSave={handleEdit}
        onDelete={handleDeleteClick}
        category={editDialog.category}
        title="Editar Categoría"
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, categoryId: null, categoryName: '' })}
        onConfirm={confirmDelete}
        title="¿Eliminar categoría?"
        description={`¿Estás seguro que deseas eliminar la categoría "${deleteDialog.categoryName}"? Esta acción no se puede deshacer.`}
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

// Sortable Category Card Component
function SortableCategoryCard({ category, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleCardClick = (e) => {
    // Only trigger edit if not dragging
    if (!isDragging) {
      onEdit(category)
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
      {/* Category content */}
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
                category.active !== false ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {category.name}
              </h3>
              {category.tag && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full whitespace-nowrap">
                  {category.tag}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                category.active !== false 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {category.active !== false ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {category.description && (
        <p className="text-xs text-gray-600 overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {category.description}
        </p>
      )}

      {/* Visual indicator for interaction */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">Toca para editar • Mantén presionado para reordenar</p>
      </div>
    </div>
  )
}
