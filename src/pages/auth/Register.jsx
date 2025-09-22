import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      await register(email, password)
      alert('Cuenta creada. Iniciá sesión para continuar.')
      navigate('/auth/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold mb-4 text-center">Crear cuenta</h1>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            className="w-full border rounded px-3 py-2"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button disabled={loading} className="w-full bg-black text-white rounded py-2 disabled:opacity-50">
            {loading ? 'Creando...' : 'Registrarme'}
          </button>
        </form>
        <div className="flex justify-between items-center mt-4 text-sm">
          <Link to="/auth/login" className="text-gray-700 underline">Ya tengo cuenta</Link>
        </div>
      </div>
    </div>
  )
}
