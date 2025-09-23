import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { 
  XMarkIcon,
  Squares2X2Icon,
  CubeIcon,
  Cog6ToothIcon,
  EyeIcon,
  Bars3Icon,
  BuildingStorefrontIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  ShoppingBagIcon,
  PaintBrushIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { getOwnedRestaurants, createRestaurantWithDefaultMenu } from '../../services/firestore.js'
import RestaurantDialog from '../../components/RestaurantDialog.jsx'

export default function AdminLayout() {
  const { restaurantId } = useParams()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [restaurantDropdownOpen, setRestaurantDropdownOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const accountRef = useRef(null)
  const restaurantDropdownRef = useRef(null)

  // No need for icon initialization with Heroicons

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

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
      if (restaurantDropdownRef.current && !restaurantDropdownRef.current.contains(e.target)) {
        setRestaurantDropdownOpen(false)
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
    { to: `${base}`, label: 'Inicio', icon: HomeIcon },
    { to: `${base}/productos`, label: 'Productos', icon: ShoppingBagIcon },
    { to: `${base}/menu`, label: 'Menú', icon: PaintBrushIcon },
  ]

  function onRestaurantChange(id) {
    if (!id || id === restaurantId) return
    setRestaurantDropdownOpen(false)
    navigate(`/admin/${id}`)
  }

  async function handleCreateRestaurant(formData) {
    try {
      const { restaurantId: newRestaurantId } = await createRestaurantWithDefaultMenu({
        uid: user.uid,
        name: formData.name,
        isPublic: true
      })
      
      // Update the restaurant with additional details
      if (formData.phone || formData.address || formData.website || formData.hours) {
        const { updateRestaurant } = await import('../../services/firestore.js')
        await updateRestaurant(newRestaurantId, {
          phone: formData.phone || '',
          address: formData.address || '',
          website: formData.website || '',
          hours: formData.hours || ''
        })
      }
      
      // Refresh restaurants list
      const userRestaurants = await getOwnedRestaurants(user.uid)
      setRestaurants(userRestaurants)
      
      // Navigate to the new restaurant
      navigate(`/admin/${newRestaurantId}`)
    } catch (error) {
      throw error
    }
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
        fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h1 className="text-lg font-semibold text-gray-900 transition-opacity duration-300">
                  Mi Menú
                </h1>
              )}
              {sidebarCollapsed && (
                <div className="w-full flex justify-center">
                  <div className="w-8 h-8 bg-[#111827] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1">
                {/* Collapse toggle button - desktop only */}
                <button 
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
                >
                  {sidebarCollapsed ? (
                    <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {/* Close button - mobile only */}
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-1.5 rounded-md hover:bg-gray-100"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
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
                      `flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                        isActive 
                          ? 'bg-[#111827] text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2'}`
                    }
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <item.icon className={`${sidebarCollapsed ? 'w-6 h-6 mx-auto' : 'w-5 h-5'}`} />
                    {!sidebarCollapsed && (
                      <span className="transition-opacity duration-300">
                        {item.label}
                      </span>
                    )}
                    {/* Tooltip for collapsed state */}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* AppBar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Mobile hamburger menu */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Desktop spacer */}
            <div className="hidden lg:block flex-1" />
            
            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Restaurant selector dropdown */}
              <div className="relative" ref={restaurantDropdownRef}>
                <button
                  onClick={() => setRestaurantDropdownOpen(!restaurantDropdownOpen)}
                  className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="max-w-32 truncate">
                    {currentRestaurant?.name || 'Seleccionar restaurante'}
                  </span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                </button>
                
                {restaurantDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    {/* Restaurant list */}
                    {restaurants.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        Cargando restaurantes...
                      </div>
                    ) : (
                      restaurants.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => onRestaurantChange(r.id)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            r.id === restaurantId ? 'bg-gray-50 font-medium' : ''
                          }`}
                        >
                          <span className="truncate">{r.name}</span>
                        </button>
                      ))
                    )}
                    
                    {/* Separator */}
                    <div className="border-t border-gray-200 my-1" />
                    
                    {/* Create new restaurant option */}
                    <button
                      onClick={() => {
                        setRestaurantDropdownOpen(false)
                        setCreateDialogOpen(true)
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-[#111827] hover:bg-gray-100 transition-colors font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <PlusIcon className="w-4 h-4" />
                        <span>Crear nuevo restaurante</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Restaurant Avatar with Context Menu */}
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-9 h-9 rounded-full bg-[#111827] flex items-center justify-center hover:bg-gray-800 transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  {currentRestaurant?.imageUrl ? (
                    <img 
                      src={currentRestaurant.imageUrl} 
                      alt={currentRestaurant.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-white">
                      {currentRestaurant?.name ? 
                        currentRestaurant.name.charAt(0).toUpperCase() : 
                        'R'
                      }
                    </span>
                  )}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-md py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {currentRestaurant?.name || 'Restaurante'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email}
                      </p>
                    </div>
                    
                    <Link
                      to={`/r/${restaurantId}`}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      <EyeIcon className="w-4 h-4" />
                      Ver como cliente
                    </Link>
                    
                    <Link
                      to={`/admin/${restaurantId}/perfil`}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      Perfil
                    </Link>
                    
                    <Link
                      to={`/admin/${restaurantId}/ajustes`}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Cog6ToothIcon className="w-4 h-4" />
                      Ajustes
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Create Restaurant Dialog */}
      <RestaurantDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleCreateRestaurant}
      />
    </div>
  )
}
