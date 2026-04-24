import { useState, useEffect } from 'react'
import { useNotifications } from '../../contexts/NotificationContext'
import { FaBell, FaCheckCircle } from 'react-icons/fa'

const RiderNotifications = () => {
  const { notifications: contextNotifications, markAsRead, fetchNotifications } = useNotifications()
  const [activeTab, setActiveTab] = useState('unread')
  const [loading, setLoading] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchNotifications().finally(() => setLoading(false))
  }, [])

  const handleAccept = async (notification) => {
    setProcessingId(notification.id)
    
    try {
      const data = typeof notification.data === 'string' 
        ? JSON.parse(notification.data) 
        : (notification.data || {})
      
      console.log('Notification data:', data)
      
      if (!data.delivery_id || !data.order_id) {
        setErrorMessage('Invalid notification data. Missing delivery_id or order_id.')
        setProcessingId(null)
        return
      }
      
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      
      // Ensure IDs are integers
      const deliveryId = parseInt(data.delivery_id)
      const orderId = parseInt(data.order_id)
      
      console.log('Accepting delivery:', {
        delivery_id: deliveryId,
        order_id: orderId,
        rawData: data
      })
      
      // Validate that we have valid IDs
      if (isNaN(deliveryId) || isNaN(orderId)) {
        setErrorMessage(`Invalid IDs: delivery_id=${deliveryId}, order_id=${orderId}`)
        setProcessingId(null)
        return
      }
      
      const response = await fetch(`${backendUrl}/rider/deliveries/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          delivery_id: deliveryId,
          order_id: orderId
        })
      })

      const result = await response.json()

      console.log('Accept delivery response:', result)
      console.log('Response status:', response.status)
      console.log('Response errors:', result.errors)

      if (response.ok && result.success) {
        await markAsRead(notification.id)
        setSuccessMessage('Delivery accepted successfully! Redirecting to deliveries...')
        
        // Reload the page after 1.5 seconds to refresh all data
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        console.error('Failed to accept delivery:', result)
        let errorMsg = 'Failed to accept delivery'
        
        if (result.errors) {
          // Extract the first error message from the errors object
          const firstError = Object.values(result.errors)[0]
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError
        } else if (result.message) {
          errorMsg = result.message
        }
        
        setErrorMessage(errorMsg)
        setTimeout(() => setErrorMessage(''), 5000)
        
        // If delivery no longer exists, mark notification as read
        if (errorMsg.includes('no longer available')) {
          await markAsRead(notification.id)
          await fetchNotifications()
        }
      }
    } catch (error) {
      console.error('Error accepting delivery:', error)
      setErrorMessage(`Error accepting delivery: ${error.message}. Please try again.`)
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (notification) => {
    setProcessingId(notification.id)
    
    try {
      const data = typeof notification.data === 'string' 
        ? JSON.parse(notification.data) 
        : (notification.data || {})
      
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      
      const response = await fetch(`${backendUrl}/rider/deliveries/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          delivery_id: data.delivery_id
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        await markAsRead(notification.id)
        await fetchNotifications()
        setSuccessMessage('Delivery rejected successfully.')
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage(result.message || 'Failed to reject delivery')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error rejecting delivery:', error)
      setErrorMessage('Error rejecting delivery. Please try again.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setProcessingId(null)
    }
  }

  const unreadNotifications = contextNotifications.filter(n => !n.read_at)
  const readNotifications = contextNotifications.filter(n => n.read_at)
  const displayNotifications = activeTab === 'unread' ? unreadNotifications : readNotifications

  const handleRefresh = async () => {
    setLoading(true)
    await fetchNotifications()
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in-right">
          <FaCheckCircle className="w-6 h-6" />
          <span className="font-medium">{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="ml-4 text-white hover:text-gray-200">
            ×
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in-right">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="ml-4 text-white hover:text-gray-200">
            ×
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Available Deliveries</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold shadow-md hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50"
          >
            <svg className={`w-5 h-5 inline mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold shadow-md">
            <p className="text-xs">Available</p>
            <p className="text-xl font-bold">{unreadNotifications.length}</p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('unread')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'unread'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Deliveries ({unreadNotifications.length})
          </button>
          <button
            onClick={() => setActiveTab('read')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'read'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Accepted ({readNotifications.length})
          </button>
        </nav>
      </div>

      {displayNotifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow">
          <div className="flex justify-center mb-6">
            <FaCheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <p className="text-gray-700 text-xl font-bold mb-2">
            {activeTab === 'unread' ? 'No available deliveries' : 'No accepted deliveries'}
          </p>
          <p className="text-gray-500 text-sm">
            {activeTab === 'unread' ? 'New delivery requests will appear here' : 'Accepted deliveries will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayNotifications.map((notification) => {
            let data = {}
            try {
              data = typeof notification.data === 'string' 
                ? JSON.parse(notification.data) 
                : (notification.data || {})
            } catch (e) {
              console.error('Error parsing notification data:', e)
              data = notification.data || {}
            }
            
            const isDeliveryRequest = notification.type === 'delivery_request'
            
            return (
              <div
                key={notification.id}
                className={`group bg-white rounded-xl border-2 ${
                  !notification.read_at ? 'border-red-300 shadow-xl' : 'border-gray-200 shadow-md'
                } hover:shadow-2xl transition-all duration-300 overflow-hidden`}
              >
                {/* Header */}
                <div className="bg-white text-white px-6 py-4 flex items-center justify-between border-b-2 border-red-500">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <FaBell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{notification.title}</h3>
                      <p className="text-sm text-red-600 font-semibold">
                        Order #{data.order_id || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {!notification.read_at && (
                    <span className="px-4 py-2 bg-white text-red-600 text-xs font-bold rounded-full shadow-lg animate-pulse">
                      NEW
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {isDeliveryRequest ? (
                    <div className="space-y-4">
                      {/* Pickup Section */}
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pickup Location</p>
                          <p className="font-bold text-gray-900 text-lg">{data.restaurant_name || 'Restaurant'}</p>
                          <p className="text-sm text-gray-600 mt-1">{data.restaurant_address || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      </div>

                      {/* Drop Section */}
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Drop Location</p>
                          <p className="font-bold text-gray-900 text-lg">Customer</p>
                          <p className="text-sm text-gray-600 mt-1">{data.customer_address || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-4">
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center border border-red-200">
                          <p className="text-xs font-semibold text-red-600 mb-1">Distance</p>
                          <p className="text-2xl font-bold text-red-900">
                            {data.distance ? `${parseFloat(data.distance).toFixed(1)}` : 'N/A'}
                          </p>
                          <p className="text-xs text-red-600">km</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center border border-red-200">
                          <p className="text-xs font-semibold text-red-600 mb-1">Earning</p>
                          <p className="text-2xl font-bold text-red-900">
                            {data.earning ? `${parseFloat(data.earning).toFixed(0)}` : 'N/A'}
                          </p>
                          <p className="text-xs text-red-600">ETB</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {!notification.read_at && (
                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={() => handleAccept(notification)}
                            disabled={processingId === notification.id}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
                          >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{processingId === notification.id ? 'Processing...' : 'Accept'}</span>
                          </button>
                          <button
                            onClick={() => handleReject(notification)}
                            disabled={processingId === notification.id}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
                          >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>{processingId === notification.id ? 'Processing...' : 'Reject'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 mb-3">{notification.message}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(notification.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default RiderNotifications
