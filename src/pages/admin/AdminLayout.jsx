import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import * as eva from 'eva-icons'
import { getOwnedRestaurants } from '../../services/firestore.js'

export default function AdminLayout() {
  const { restaurantId } = useParams()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const accountRef = useRef(null)

  // Initialize Eva Icons
  useEffect(() => {
    eva.replace()
  }, [])

  // Re-run icon replacement when menus or dynamic lists change
  useEffect(() => {
    eva.replace()
  }, [menuOpen, restaurants, sidebarOpen])

  // Load restaurants owned by the user
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        if (!user?.uid) {
          if (mounted) setRestaurants([])
          return
        }
        const userRestaurants = await getOwnedRestaurants(user.uid)
        if (mounted) setRestaurants(userRestaurants)
      } catch (e) {
        // no-op
      }
    }
    load()
    return () => { mounted = false }
  }, [user?.uid])

  // Close account menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function onLogout() {
    await logout()
    navigate('/auth/login')
  }

  const base = `/admin/${restaurantId}`

  const navItems = [
    { to: `${base}`, label: 'Categorías', icon: 'grid-outline' },
    { to: `${base}/items`, label: 'Ítems', icon: 'cube-outline' },
    { to: `${base}/settings`, label: 'Settings', icon: 'settings-outline' },
  ]

  function onRestaurantChange(id) {
    if (!id || id === restaurantId) return
    navigate(`/admin/${id}`)
  }

  const currentRestaurant = restaurants.find((r) => r.id === restaurantId)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900">Panel Admin</h1>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md hover:bg-gray-100"
              >
                <i data-eva="close-outline" className="w-5 h-5"></i>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-[#111827] text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <i data-eva={item.icon} className="w-5 h-5"></i>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer actions */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Link 
              to={`/r/${restaurantId}`}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i data-eva="eye-outline" className="w-5 h-5"></i>
              Ver menú público
            </Link>
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full text-left"
            >
              <i data-eva="log-out-outline" className="w-5 h-5"></i>
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <i data-eva="menu-outline" className="w-5 h-5"></i>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Panel Admin</h1>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </header>

        {/* AppBar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-end gap-3">
            {/* Restaurant selector */}
            <select
              value={restaurantId || ''}
              onChange={(e) => onRestaurantChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent bg-white"
            >
              {restaurants.length === 0 && (
                <option value="" disabled>
                  Cargando restaurantes...
                </option>
              )}
              {restaurants.length > 0 && restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Account menu */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                {currentRestaurant?.name ? (
                  <span className="text-sm font-semibold text-gray-700">
                    {currentRestaurant.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <i data-eva="home-outline" className="w-5 h-5"></i>
                )}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-md py-1 z-50">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i data-eva="log-out-outline" className="w-4 h-4"></i>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
