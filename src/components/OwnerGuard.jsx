import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { isOwner } from '../services/firestore.js'

export default function OwnerGuard({ children }) {
  const { restaurantId } = useParams()
  const { user } = useAuth()
  const [allowed, setAllowed] = useState(null)

  useEffect(() => {
    let active = true
    async function check() {
      if (!user || !restaurantId) {
        setAllowed(false)
        return
      }
      const ok = await isOwner(restaurantId, user.uid)
      if (active) setAllowed(ok)
    }
    check()
    return () => {
      active = false
    }
  }, [user, restaurantId])

  if (allowed === null) return <div className="p-4 text-center">Verificando permisos...</div>
  if (!allowed) return <div className="p-4 text-center text-red-600">No tenés permisos</div>
  return children
}
