import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationContext'

const NotificationBell = () => {
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Animate bell when new notifications arrive
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [unreadCount])

  const handleNotificationClick = (notification) => {
    // Mark as read immediately (optimistic update)
    if (!notification.read_at) {
      markAsRead(notification.id)
    }
    
    // Small delay to show the count update before closing
    setTimeout(() => {
      setIsOpen(false)
      
      // Navigate based on notification type
      if (notification.type === 'new_restaurant_registration') {
        navigate('/admin/restaurants')
      } else if (notification.type === 'new_order') {
        navigate('/orders')
      } else if (notification.data?.action_url) {
        navigate(notification.data.action_url)
      }
    }, 100)
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getNotificationIcon = (type) => {
    const icons = {
      'new_order': '📦',
      'payment_received': '💰',
      'payment_confirmed': '✅',
      'order_status_update': '🔄',
      'restaurant_approved': '🎉',
      'new_restaurant_registration': '🏪',
      'payment_completed': '💳',
    }
    return icons[type] || '🔔'
  }

  const getNotificationColor = (type) => {
    const colors = {
      'new_order': 'from-blue-500 to-blue-600',
      'payment_received': 'from-green-500 to-green-600',
      'payment_confirmed': 'from-emerald-500 to-emerald-600',
      'order_status_update': 'from-yellow-500 to-yellow-600',
      'restaurant_approved': 'from-purple-500 to-purple-600',
      'new_restaurant_registration': 'from-orange-500 to-orange-600',
      'payment_completed': 'from-teal-500 to-teal-600',
    }
    return colors[type] || 'from-gray-500 to-gray-600'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 rounded-xl transition-all duration-300 group ${
          isAnimating ? 'animate-bounce' : ''
        }`}
        aria-label="Notifications"
      >
        <svg 
          className={`w-6 h-6 transition-all duration-300 ${
            unreadCount > 0 
              ? 'text-orange-600 group-hover:text-orange-700' 
              : 'text-gray-600 group-hover:text-orange-600'
          }`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg animate-pulse ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Active indicator dot */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      markAllAsRead()
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">No notifications</p>
                  <p className="text-xs text-gray-500 mt-1">When you get notifications, they'll show up here</p>
                </div>
              ) : (
                <>
                  {notifications.slice(0, 6).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors relative ${
                        !notification.read_at ? 'bg-blue-50' : ''
                      }`}
                    >
                      {/* Unread indicator */}
                      {!notification.read_at && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                      
                      <div className={!notification.read_at ? 'pl-3' : ''}>
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-snug ${
                            !notification.read_at ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {/* Tags */}
                        {(notification.data?.order_id || notification.data?.amount) && (
                          <div className="flex items-center gap-2 mt-2">
                            {notification.data?.order_id && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                Order #{notification.data.order_id}
                              </span>
                            )}
                            {notification.data?.amount && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                ${notification.data.amount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    navigate('/notifications')
                  }}
                  className="w-full px-4 py-3 text-sm font-medium text-blue-600 hover:bg-gray-50 transition-colors text-center"
                >
                  See all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  )
}

export default NotificationBell