import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const SettingsContext = createContext()

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    currency: 'ETB',
    currencySymbol: 'Br',
    taxRate: 0,
    deliveryFee: 0,
    minOrderAmount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
      const response = await axios.get(`${backendUrl}/api/settings`)
      
      if (response.data.success) {
        setSettings(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      // Use default settings if fetch fails
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
      const token = localStorage.getItem('token')
      
      const response = await axios.put(`${backendUrl}/api/settings`, newSettings, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (response.data.success) {
        setSettings(response.data.data)
        return { success: true, message: response.data.message }
      }
      
      return { success: false, message: 'Failed to update settings' }
    } catch (error) {
      console.error('Error updating settings:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update settings' 
      }
    }
  }

  const value = {
    settings,
    loading,
    updateSettings,
    refreshSettings: fetchSettings
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}
