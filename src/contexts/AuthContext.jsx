import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const register = (email, password) => createUserWithEmailAndPassword(auth, email, password)
  const resetPassword = (email) => sendPasswordResetEmail(auth, email)
  const logout = () => signOut(auth)

  const value = { user, loading, login, register, resetPassword, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
