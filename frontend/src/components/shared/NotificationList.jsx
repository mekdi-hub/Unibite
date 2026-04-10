import { useState } from 'react'

/**
 * Shared NotificationList component for displaying notifications
 * Used by admin, restaurant, and rider dashboards
 */
const NotificationList = ({ 
  notifications = [], 
  loading = false,
  onMarkAsRead,
  onNotificationClick,
  onDelete,
  showTabs = true,
  showSelection = true,
  emptyMessage = "No notifications"
}) => {
  const [activeTab, setActiveTab] = useState('unread')
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Separate read and unread notifications
  // A notification is unread if is_read is false/null AND read_at is null
  const unreadNotifications = notifications.filter(n => !n.is_read && !n.read_at)
  const readNotifications = notifications.filter(n => n.is_read || n.read_at)
  
  // Get notifications to display based on active tab
  const displayNotifications = activeTab === 'unread' ? unreadNotifications : readNotifications

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getNotificationIcon = (type) => {
    const iconMap = {
      'new_order': (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      'order': (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      'payment_received': (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'payment_confirmed': (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'payment': (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'order_status_update': (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      'restaurant_approved': (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      'approval': (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'new_restaurant_registration': (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      'payment_completed': (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      'delivery': (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      'delivery_assigned': (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      'system': (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      'promotion': (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
    }
    return iconMap[type] || (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )
  }

  const getNotificationColor = (type) => {
    const colors = {
      'order': 'from-orange-500 to-red-500',
      'new_order': 'from-orange-500 to-red-500',
      'payment': 'from-green-500 to-emerald-600',
      'payment_received': 'from-green-500 to-emerald-600',
      'payment_confirmed': 'from-green-500 to-emerald-600',
      'payment_completed': 'from-green-500 to-emerald-600',
      'approval': 'from-emerald-500 to-green-600',
      'restaurant_approved': 'from-emerald-500 to-green-600',
      'delivery': 'from-orange-600 to-red-600',
      'delivery_assigned': 'from-orange-600 to-red-600',
      'system': 'from-gray-500 to-gray-600',
      'promotion': 'from-orange-500 to-red-500',
      'order_status_update': 'from-orange-500 to-red-600',
      'new_restaurant_registration': 'from-red-500 to-red-600',
    }
    return colors[type] || 'from-orange-500 to-red-500'
  }

  const handleNotificationClick = (notification) => {
    if (isSelectionMode) {
      toggleSelectNotification(notification.id)
      return
    }

    // Mark as read if unread
    if (!notification.is_read && !notification.read_at && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }

    // Call custom click handler if provided
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
  }

  const toggleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notifId => notifId !== id)
        : [...prev, id]
    )
  }

  const selectAllNotifications = () => {
    if (selectedNotifications.length === displayNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(displayNotifications.map(n => n.id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return
    
    if (!window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notification(s)?`)) {
      return
    }

    setDeleting(true)
    
    if (onDelete) {
      const success = await onDelete(selectedNotifications)
      if (success) {
        setSelectedNotifications([])
        setIsSelectionMode(false)
      }
    }
    
    setDeleting(false)
  }

  const cancelSelection = () => {
    setIsSelectionMode(false)
    setSelectedNotifications([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs for Read/Unread */}
      {showTabs && (
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('unread')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'unread'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Unread ({unreadNotifications.length})
            </button>
            <button
              onClick={() => setActiveTab('read')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'read'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Read ({readNotifications.length})
            </button>
          </nav>
        </div>
      )}

      {/* Selection Mode Controls */}
      {showSelection && displayNotifications.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center space-x-4">
            {!isSelectionMode ? (
              <button
                onClick={() => setIsSelectionMode(true)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-md flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Select</span>
              </button>
            ) : (
              <>
                <button
                  onClick={selectAllNotifications}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-md flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span>{selectedNotifications.length === displayNotifications.length ? 'Deselect All' : 'Select All'}</span>
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedNotifications.length === 0 || deleting}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-md flex items-center space-x-2 ${
                    selectedNotifications.length === 0 || deleting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>{deleting ? 'Deleting...' : `Delete (${selectedNotifications.length})`}</span>
                </button>
                <button
                  onClick={cancelSelection}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all shadow-md"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
          {isSelectionMode && (
            <div className="text-sm text-gray-600 font-medium">
              {selectedNotifications.length} of {displayNotifications.length} selected
            </div>
          )}
        </div>
      )}

      {/* Notifications List */}
      {displayNotifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
          <div className="flex justify-center mb-6">
            {activeTab === 'unread' ? (
              <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            )}
          </div>
          <p className="text-gray-700 text-xl font-bold mb-2">
            {activeTab === 'unread' ? 'No unread notifications' : 'No read notifications'}
          </p>
          <p className="text-gray-500 text-sm">
            {activeTab === 'unread' ? "You're all caught up!" : emptyMessage}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border cursor-pointer ${
                selectedNotifications.includes(notification.id)
                  ? 'border-blue-500 ring-2 ring-blue-300'
                  : 'border-gray-100'
              } ${(!notification.is_read && !notification.read_at) ? 'ring-2 ring-red-200' : ''}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {isSelectionMode && (
                      <div className="flex items-center pt-2">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleSelectNotification(notification.id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                    <div className={`w-14 h-14 bg-gradient-to-br ${getNotificationColor(notification.type)} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900 truncate">
                          {notification.title}
                        </h3>
                        {(!notification.is_read && !notification.read_at) && (
                          <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full flex items-center space-x-1 flex-shrink-0">
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                            <span>NEW</span>
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-500">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  {(!notification.is_read && !notification.read_at) && onMarkAsRead && !isSelectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onMarkAsRead(notification.id)
                      }}
                      className="ml-4 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 font-medium border border-gray-300 flex-shrink-0"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>

                {/* Additional notification data */}
                {notification.data && Object.keys(notification.data).length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {notification.data.order_id && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Order ID</p>
                        <p className="font-bold text-gray-900">#{notification.data.order_id}</p>
                      </div>
                    )}
                    {notification.data.amount && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Amount</p>
                        <p className="font-bold text-gray-900">ETB {notification.data.amount}</p>
                      </div>
                    )}
                    {notification.data.restaurant_name && (
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Restaurant</p>
                        <p className="font-bold text-gray-900">{notification.data.restaurant_name}</p>
                      </div>
                    )}
                    {notification.data.customer_name && (
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-semibold mb-1">Customer</p>
                        <p className="font-bold text-gray-900">{notification.data.customer_name}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationList
