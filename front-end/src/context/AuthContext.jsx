// context/AuthContext.jsx
// Drop-in replacement — adds faculty login support
// The login() function tries /api/auth/login first (admin/tpo/student),
// then /api/faculty/login if the first attempt returns 401.

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null)
  const [token, setToken] = useState(null)

  // Restore session on reload
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser  = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
    }
  }, [])

  const login = async (email, password) => {
    let userData = null
    let authToken = null

    // 1️⃣ Try the main auth route (admin / tpo / student)
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      authToken = res.data.token
      userData  = res.data.user
    } catch (err) {
      if (err?.response?.status !== 401 && err?.response?.status !== 404) throw err
    }

    // 2️⃣ If not found, try faculty route
    if (!userData) {
      const res = await axios.post('/api/faculty/login', { email, password })
      authToken = res.data.token
      userData  = { ...res.data.faculty, role: 'faculty' }
    }

    // Persist
    setToken(authToken)
    setUser(userData)
    localStorage.setItem('token',  authToken)
    localStorage.setItem('user',   JSON.stringify(userData))
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`

    return userData
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)