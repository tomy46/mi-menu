import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  PlusIcon,
  Squares2X2Icon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'
import { getCategories, getItems, getActiveMenuByRestaurant } from '../../services/firestore.js'
import Categories from './Categories.jsx'
import Items from './Items.jsx'

export default function Productos() {
  const { restaurantId } = useParams()
  const [activeTab, setActiveTab] = useState('categorias')
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // First get the menu for this restaurant
        const menu = await getActiveMenuByRestaurant(restaurantId)
        
        if (menu) {
          const [categoriesData, itemsData] = await Promise.all([
            getCategories(menu.id),
            getItems(restaurantId)
          ])
          
          setCategories(categoriesData)
          setItems(itemsData)
        } else {
          setCategories([])
          setItems([])
        }
      } catch (error) {
        console.error('Error loading products data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (restaurantId) {
      loadData()
    }
  }, [restaurantId])

  const tabs = [
    {
      id: 'categorias',
      name: 'Categorías',
      icon: Squares2X2Icon,
      count: categories.length
    },
    {
      id: 'productos',
      name: 'Productos',
      icon: ShoppingBagIcon,
      count: items.length
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <p className="text-gray-600 mt-1">
          Gestiona las categorías y productos de tu menú
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                activeTab === tab.id
                  ? 'bg-[#111827] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'categorias' && (
          <Categories 
            onCategoriesChange={(newCategories) => setCategories(newCategories)}
          />
        )}
        {activeTab === 'productos' && (
          <Items 
            onItemsChange={(newItems) => setItems(newItems)}
          />
        )}
      </div>
    </div>
  )
}
