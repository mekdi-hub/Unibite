import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// Set base URL from environment variable
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
axios.defaults.timeout = 10000 // 10 second timeout

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage if available
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/user', {
            timeout: 30000 // Increase timeout to 30 seconds
          })
          const userData = response.data
          
          // Verify the token matches the expected user
          const cachedUser = localStorage.getItem('user')
          if (cachedUser) {
            const parsedCachedUser = JSON.parse(cachedUser)
            if (parsedCachedUser.id !== userData.id) {
              console.warn('Token mismatch detected - clearing stale authentication')
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              setToken(null)
              setUser(null)
              setAuthError('Session mismatch detected. Please log in again.')
              setLoading(false)
              return
            }
          }
          
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          setAuthError(null)
        } catch (error) {
          console.error('Auth check error:', error)
          // Only logout if it's an authentication error (401), not network errors
          if (error.response?.status === 401) {
            console.log('Invalid token, clearing authentication')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setToken(null)
            setUser(null)
            setAuthError('Your session has expired. Please log in again.')
          } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            // For timeout errors, clear auth to be safe
            console.log('Auth check timeout - clearing authentication for security')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setToken(null)
            setUser(null)
            setAuthError('Connection timeout. Please log in again.')
          } else {
            // For other network errors, still clear auth to prevent wrong user login
            console.log('Network error during auth check - clearing authentication for security')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setToken(null)
            setUser(null)
            setAuthError('Unable to verify session. Please log in again.')
          }
        }
      } else {
        // If no token, ensure user is also cleared
        setUser(null)
        localStorage.removeItem('user')
      }
      setLoading(false)
    }
    checkAuth()
  }, [token])

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email, baseURL: axios.defaults.baseURL })
      const response = await axios.post('/api/auth/login', { email, password })
      console.log('Login response:', response.data)
      const { user, token } = response.data
      
      const now = Date.now()
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('user_cache_time', now.toString())
      setToken(token)
      setUser(user)
      
      return { success: true, user }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (name, email, password, password_confirmation, phone, role) => {
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        password_confirmation,
        phone,
        role
      })
      const { user, token } = response.data
      
      const now = Date.now()
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('user_cache_time', now.toString())
      setToken(token)
      setUser(user)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors || {}
      }
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
      // Clear axios default headers
      delete axios.defaults.headers.common['Authorization']
      // Redirect to login page and replace history to prevent back button
      window.location.replace('/login')
    }
  }

  const clearAuth = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    authError,
    login,
    register,
    logout,
    clearAuth // Add this for development purposes
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}