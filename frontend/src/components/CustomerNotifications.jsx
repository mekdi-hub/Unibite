import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaBell } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import NotificationList from './shared/NotificationList'
import axios from 'axios'

const CustomerNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { fetchNotifications: refreshGlobalNotifications } = useNotifications()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (response.data.success) {
        setNotifications(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    // Optimistic update
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
    ))

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      await axios.put(
        `${backendUrl}/api/notifications/${notificationId}/read`,
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
      console.error('Error marking notification as read:', error)
      // Revert on error
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: false, read_at: null } : n
      ))
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read && !n.read_at)
    if (unreadNotifications.length === 0) return

    // Optimistic update
    setNotifications(notifications.map(n => ({ 
      ...n, 
      is_read: true, 
      read_at: n.read_at || new Date().toISOString() 
    })))

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      await Promise.all(
        unreadNotifications.map(n => 
          axios.put(
            `${backendUrl}/api/notifications/${n.id}/read`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            }
          )
        )
      )
      
      // Refresh global notifications to update the bell count
      refreshGlobalNotifications(true)
    } catch (error) {
      console.error('Error marking all as read:', error)
      // Revert on error
      await fetchNotifications()
    }
  }

  const handleDelete = async (notificationIds) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      await axios.post(
        `${backendUrl}/api/notifications/delete-multiple`,
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
    if (notification.type === 'order_confirmed' || notification.type === 'order_delivered' || notification.type === 'order_cancelled') {
      navigate('/orders')
    } else if (notification.type === 'promotion') {
      navigate('/restaurants')
    } else if (notification.data?.action_url) {
      navigate(notification.data.action_url)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read && !n.read_at).length

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your notifications</p>
          <Link to="/login" className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors font-semibold">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors group"
              >
                <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Home</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">UB</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">UniBite</h1>
                  <p className="text-xs text-gray-500">Campus Food Delivery</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {user && (
                <span className="text-gray-700 font-medium hidden md:inline">Hello, {user.name}</span>
              )}
              <Link 
                to="/orders" 
                className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
              >
                My Orders
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <FaBell className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
                <p className="text-gray-600 mt-1">Stay updated with your orders and offers</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold">
                {unreadCount} Unread
              </div>
            )}
          </div>
          <div className="h-px bg-gradient-to-r from-orange-200 via-orange-300 to-transparent"></div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 && !loading ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No notifications yet</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              You'll receive notifications about your orders, special offers, and updates here.
            </p>
            <Link 
              to="/restaurants" 
              className="bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-orange-700 transition-colors shadow-sm"
            >
              Browse Restaurants
            </Link>
          </div>
        ) : (
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
        )}

        {/* Quick Actions */}
        {notifications.length > 0 && !loading && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/orders" 
                className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-orange-700 transition-colors text-center"
              >
                View My Orders
              </Link>
              <Link 
                to="/restaurants" 
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-center border border-gray-300"
              >
                Browse Menu
              </Link>
              <button
                onClick={markAllAsRead}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={unreadCount === 0}
              >
                Mark All as Read
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerNotifications
