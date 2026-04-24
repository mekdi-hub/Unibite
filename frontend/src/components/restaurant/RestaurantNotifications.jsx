import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import NotificationList from '../shared/NotificationList'
import { useNotifications } from '../../contexts/NotificationContext'

const RestaurantNotifications = () => {
  const navigate = useNavigate()
  const { fetchNotifications: refreshGlobalNotifications } = useNotifications()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/restaurant/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (response.data.success) {
        setNotifications(response.data.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    // Optimistic update - update UI immediately
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, is_read: true }
          : notif
      )
    )

    // Then update server in background
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      await axios.put(
        `${backendUrl}/restaurant/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      )
      
      // Refresh global notifications to update the bell count
      refreshGlobalNotifications(true)
    } catch (error) {
      // Revert on error
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: false }
            : notif
        )
      )
      console.error('Error marking notification as read:', error)
    }
  }

  const handleDelete = async (notificationIds) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      await axios.post(
        `${backendUrl}/restaurant/notifications/delete-multiple`,
        { ids: notificationIds },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      )
      
      // Remove deleted notifications from state
      setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)))
      
      // Refresh global notifications to update the bell count
      refreshGlobalNotifications(true)
      
      return true
    } catch (error) {
      console.error('Error deleting notifications:', error)
      alert('Failed to delete notifications')
      return false
    }
  }

  const handleNotificationClick = (notification) => {
    // Navigate based on notification type
    if (notification.type === 'new_order' || notification.type === 'order') {
      // Could navigate to specific order if we have order_id
      if (notification.data?.order_id) {
        navigate(`/restaurant-dashboard?tab=orders&order=${notification.data.order_id}`)
      }
    } else if (notification.type === 'payment_received' || notification.type === 'payment') {
      navigate('/restaurant-dashboard?tab=home')
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold shadow-md">
          <p className="text-xs">Unread</p>
          <p className="text-xl font-bold">{unreadCount}</p>
        </div>
      </div>

      <NotificationList
        notifications={notifications}
        loading={loading}
        onMarkAsRead={markAsRead}
        onNotificationClick={handleNotificationClick}
        onDelete={handleDelete}
        showTabs={true}
        showSelection={true}
        emptyMessage="Read notifications will appear here"
      />
    </div>
  )
}

export default RestaurantNotifications
