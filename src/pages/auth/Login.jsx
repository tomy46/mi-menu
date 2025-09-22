import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function Login() {
  const { login, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search] = useSearchParams()
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const next = search.get('next')
      navigate(next || '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function onReset() {
    if (!email) return alert('Ingresá tu email para resetear la contraseña')
    try {
      await resetPassword(email)
      alert('Te enviamos un email para resetear tu contraseña')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold mb-4 text-center">Ingresar</h1>
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
          <button disabled={loading} className="w-full bg-black text-white rounded py-2 disabled:opacity-50">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="flex justify-between items-center mt-4 text-sm">
          <button onClick={onReset} className="text-gray-700 underline">¿Olvidaste tu contraseña?</button>
          <Link to="/auth/register" className="text-gray-700 underline">Crear cuenta</Link>
        </div>
      </div>
    </div>
  )
}
