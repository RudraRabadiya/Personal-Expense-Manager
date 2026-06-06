import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('kb_token')
    if (token) {
      api.get('/auth/me')
        .then(r => setUser(r.data))
        .catch(() => localStorage.removeItem('kb_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('kb_token', res.data.access_token)
    setUser(res.data.user)
    return res.data.user
  }

  // Step 1: Create account → returns { user_id, otp_sent }
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    return res.data
  }

  // Step 2: Verify OTP → account verified, redirect to login
  const verifyRegistration = async (user_id, code) => {
    const res = await api.post('/auth/verify-registration', { user_id, code })
    return res.data
  }

  // Resend OTP
  const resendOtp = async (user_id) => {
    const res = await api.post('/auth/resend-otp', { user_id })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('kb_token')
    setUser(null)
  }

  const refreshUser = async () => {
    const res = await api.get('/auth/me')
    setUser(res.data)
    return res.data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyRegistration, resendOtp, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
