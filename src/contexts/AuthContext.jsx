import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
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

  const updateUserProfile = async (profileData) => {
    if (!auth.currentUser) throw new Error('No user logged in')
    await updateProfile(auth.currentUser, profileData)
  }

  const updateUserPassword = async (currentPassword, newPassword) => {
    if (!auth.currentUser) throw new Error('No user logged in')
    
    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)
    await reauthenticateWithCredential(auth.currentUser, credential)
    
    // Update password
    await updatePassword(auth.currentUser, newPassword)
  }

  const value = { 
    user, 
    loading, 
    login, 
    register, 
    resetPassword, 
    logout, 
    updateUserProfile, 
    updateUserPassword 
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
