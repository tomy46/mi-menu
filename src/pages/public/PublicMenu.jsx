import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getActiveMenuByRestaurant, getCategories, getItemsByCategory, getRestaurant } from '../../services/firestore.js'

export default function PublicMenu() {
  const { restaurantId } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [menu, setMenu] = useState(null)
  const [categories, setCategories] = useState([])
  const [itemsByCat, setItemsByCat] = useState({})
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      try {
        const r = await getRestaurant(restaurantId)
        if (!r) {
          if (active) setRestaurant(null)
          return
        }
        if (active) setRestaurant(r)
        if (r.isPublic === false) {
          if (active) setLoading(false)
          return
        }
        const m = await getActiveMenuByRestaurant(restaurantId)
        if (active) setMenu(m)
        if (m) {
          const cats = await getCategories(m.id)
          if (active) setCategories(cats)
          const itemsMap = {}
          for (const c of cats) {
            itemsMap[c.id] = await getItemsByCategory(c.id, { onlyAvailable: true })
          }
          if (active) setItemsByCat(itemsMap)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [restaurantId])

  const filtered = useMemo(() => {
    if (!q) return itemsByCat
    const term = q.toLowerCase()
    const out = {}
    for (const [cid, items] of Object.entries(itemsByCat)) {
      out[cid] = items.filter((it) =>
        it.name.toLowerCase().includes(term) || (it.description || '').toLowerCase().includes(term)
      )
    }
    return out
  }, [itemsByCat, q])

  if (loading) return <div className="p-4">Cargando...</div>
  if (!restaurant) return <div className="p-4">Restaurante no encontrado</div>
  if (restaurant.isPublic === false) return <div className="p-4">Este menú no es público</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-gray-600 mt-1">Menú público</p>
        </div>
      </header>

      {/* Search */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-md mx-auto">
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
            placeholder="Buscar por nombre o descripción"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay categorías</h3>
            <p className="text-gray-600">Este menú aún no tiene categorías disponibles</p>
          </div>
        )}

        {categories.map((c) => {
          const categoryItems = (filtered[c.id] || []).filter(item => item.available !== false)
          
          if (categoryItems.length === 0) return null

          return (
            <section key={c.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📋</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{c.name}</h2>
              </div>
              
              <div className="space-y-3">
                {categoryItems.map((it) => (
                  <div key={it.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{it.name}</h3>
                        {it.description && (
                          <p className="text-sm text-gray-600 mb-2">{it.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-900">
                          {new Intl.NumberFormat('es-AR', { 
                            style: 'currency', 
                            currency: it.currency || 'ARS' 
                          }).format(it.price || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}

        {/* Empty search results */}
        {q && categories.every(c => (filtered[c.id] || []).filter(item => item.available !== false).length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin resultados</h3>
            <p className="text-gray-600">No encontramos productos que coincidan con "{q}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
