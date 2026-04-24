import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastFetchTime, setLastFetchTime] = useState(null)

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    // Initial fetch
    fetchNotifications()

    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications(true) // Silent fetch
    }, 30000)

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      clearInterval(interval)
    }
  }, [user])

  const fetchNotifications = async (silent = false) => {
    try {
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      
      const response = await fetch(`${backendUrl}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const newNotifications = data.data || []
        const newUnreadCount = data.unread_count || 0
        
        // Check for new notifications (only if not the first fetch)
        if (lastFetchTime && !silent) {
          const newNotifs = newNotifications.filter(notif => 
            new Date(notif.created_at) > lastFetchTime
          )
          
          // Show browser notifications for new notifications
          newNotifs.forEach(notif => {
            if (Notification.permission === 'granted') {
              new Notification(notif.title, {
                body: notif.message,
                icon: '/favicon.ico',
                tag: `notification-${notif.id}`,
              })
            }
            
            // Show toast notification
            showToast(notif.title, notif.message, notif.type)
          })
        }
        
        setNotifications(newNotifications)
        setUnreadCount(newUnreadCount)
        setLastFetchTime(new Date())
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    // Optimistic update - update UI immediately
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read_at: new Date().toISOString() }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    // Then update server in background
    try {
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      
      const response = await fetch(`${backendUrl}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        // Revert on error
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read_at: null }
              : notif
          )
        )
        setUnreadCount(prev => prev + 1)
        console.error('Failed to mark notification as read')
      }
    } catch (error) {
      // Revert on error
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read_at: null }
            : notif
        )
      )
      setUnreadCount(prev => prev + 1)
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      
      const response = await fetch(`${backendUrl}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const showToast = (title, message, type) => {
    // Create a simple toast notification
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`
    
    const bgColor = {
      'new_order': 'bg-blue-500',
      'payment_received': 'bg-green-500',
      'payment_confirmed': 'bg-green-500',
      'order_status_update': 'bg-yellow-500',
      'restaurant_approved': 'bg-green-500',
      'new_restaurant_registration': 'bg-purple-500',
    }[type] || 'bg-gray-500'
    
    toast.className += ` ${bgColor} text-white`
    
    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-1">
          <h4 class="font-semibold text-sm">${title}</h4>
          <p class="text-xs mt-1 opacity-90">${message}</p>
        </div>
        <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `
    
    document.body.appendChild(toast)
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full')
    }, 100)
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full')
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove()
        }
      }, 300)
    }, 5000)
  }

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}