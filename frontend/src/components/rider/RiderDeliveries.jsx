import { useState, useEffect } from 'react'
import axios from 'axios'

const RiderDeliveries = ({ isOnline }) => {
  const [availableDeliveries, setAvailableDeliveries] = useState([])
  const [activeDelivery, setActiveDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [countdown, setCountdown] = useState({})

  useEffect(() => {
    fetchAvailableDeliveries()
    fetchActiveDelivery()
    
    // Refresh available deliveries every 30 seconds when online
    const interval = isOnline ? setInterval(fetchAvailableDeliveries, 30000) : null
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isOnline])

  // Countdown timer for order acceptance
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        const newCountdown = { ...prev }
        Object.keys(newCountdown).forEach(orderId => {
          if (newCountdown[orderId] > 0) {
            newCountdown[orderId] -= 1
          } else {
            // Auto-reject order when countdown reaches 0
            rejectOrder(parseInt(orderId))
            delete newCountdown[orderId]
          }
        })
        return newCountdown
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchAvailableDeliveries = async () => {
    setError(null)
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/api/deliveries/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 10000 // Increase timeout to 10 seconds
      })
      
      if (response.data.success) {
        const deliveries = response.data.data || []
        setAvailableDeliveries(deliveries)
        
        // Initialize countdown for new orders (60 seconds to accept)
        const newCountdown = {}
        deliveries.forEach(delivery => {
          if (!countdown[delivery.id]) {
            newCountdown[delivery.id] = 60
          }
        })
        setCountdown(prev => ({ ...prev, ...newCountdown }))
      }
    } catch (error) {
      console.error('Error fetching available deliveries:', error)
      setError(error.message || 'Failed to load deliveries')
      setAvailableDeliveries([])
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveDelivery = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/api/rider/active-delivery`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      })
      
      console.log('Active delivery response:', response.data)
      
      if (response.data.success && response.data.data) {
        console.log('Setting active delivery:', response.data.data)
        setActiveDelivery(response.data.data)
      } else {
        console.log('No active delivery found')
        setActiveDelivery(null)
      }
    } catch (error) {
      console.error('Error fetching active delivery:', error)
      console.error('Error response:', error.response?.data)
      setActiveDelivery(null)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    await Promise.all([fetchAvailableDeliveries(), fetchActiveDelivery()])
  }

  const acceptOrder = async (deliveryId) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      // Find the delivery to get the order_id
      const delivery = availableDeliveries.find(d => d.id === deliveryId)
      if (!delivery) {
        alert('Delivery not found')
        return
      }
      
      const response = await axios.post(`${backendUrl}/api/deliveries/${deliveryId}/accept`, {
        delivery_id: deliveryId,
        order_id: delivery.order_id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (response.data.success || response.data.message) {
        setActiveDelivery(response.data.data)
        setAvailableDeliveries(prev => prev.filter(delivery => delivery.id !== deliveryId))
        setCountdown(prev => {
          const newCountdown = { ...prev }
          delete newCountdown[deliveryId]
          return newCountdown
        })
        alert('Order accepted successfully!')
        // Refresh active delivery
        fetchActiveDelivery()
      }
    } catch (error) {
      console.error('Error accepting order:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.delivery_id?.[0] || 'Failed to accept order. It may have been assigned to another rider.'
      alert(errorMessage)
    }
  }

  const rejectOrder = (deliveryId) => {
    setAvailableDeliveries(prev => prev.filter(delivery => delivery.id !== deliveryId))
    setCountdown(prev => {
      const newCountdown = { ...prev }
      delete newCountdown[deliveryId]
      return newCountdown
    })
  }

  const updateDeliveryStatus = async (status) => {
    if (!activeDelivery) return

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.put(`${backendUrl}/api/deliveries/${activeDelivery.id}/status`, {
        status
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (response.data.success) {
        setActiveDelivery(response.data.data)
        if (status === 'delivered') {
          setActiveDelivery(null)
          alert('Delivery completed successfully!')
        }
      }
    } catch (error) {
      console.error('Error updating delivery status:', error)
      alert('Failed to update delivery status')
    }
  }

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
            isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 font-medium">Error loading deliveries: {error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Active Delivery */}
      {activeDelivery && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🚚</span>
            Active Delivery - Order #{activeDelivery.order_id}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Restaurant Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-2">🏪</span>
                Restaurant Details
              </h3>
              <p className="font-semibold">{activeDelivery.restaurant?.name}</p>
              <p className="text-sm text-gray-600">{activeDelivery.restaurant?.address}</p>
              <p className="text-sm text-gray-600">{activeDelivery.restaurant?.phone}</p>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-2">👤</span>
                Customer Details
              </h3>
              <p className="font-semibold">{activeDelivery.customer?.name}</p>
              <p className="text-sm text-gray-600">{activeDelivery.customer?.address}</p>
              <p className="text-sm text-gray-600">{activeDelivery.customer?.phone}</p>
            </div>
          </div>

          {/* Delivery Status */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Delivery Progress</h3>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                activeDelivery.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <span>🚴</span>
                <span className="text-sm font-medium">Assigned</span>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                activeDelivery.status === 'picked_up' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <span>📦</span>
                <span className="text-sm font-medium">Picked Up</span>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                activeDelivery.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <span>✅</span>
                <span className="text-sm font-medium">Delivered</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {activeDelivery.status === 'assigned' && (
              <button
                onClick={() => updateDeliveryStatus('picked_up')}
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-medium"
              >
                📦 Pick Up Food
              </button>
            )}
            {activeDelivery.status === 'picked_up' && (
              <button
                onClick={() => updateDeliveryStatus('delivered')}
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-medium"
              >
                ✅ Mark as Delivered
              </button>
            )}
          </div>
        </div>
      )}

      {/* Available Delivery Requests */}
      {isOnline && availableDeliveries.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📦</span>
            New Delivery Requests ({availableDeliveries.length})
          </h2>
          <div className="space-y-4">
            {availableDeliveries.map((delivery) => (
              <div key={delivery.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900">Order #{delivery.order_id}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      delivery.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {delivery.payment_status === 'paid' ? '💳 Paid' : '💰 Cash'}
                    </span>
                    {countdown[delivery.id] && (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                        ⏰ {formatCountdown(countdown[delivery.id])}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Restaurant</p>
                    <p className="font-semibold">{delivery.restaurant?.name}</p>
                    <p className="text-sm text-gray-600">{delivery.restaurant?.address}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Customer</p>
                    <p className="font-semibold">{delivery.customer?.name}</p>
                    <p className="text-sm text-gray-600">{delivery.customer?.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>💰 {delivery.amount} ETB</span>
                    <span>🚚 +{delivery.delivery_fee} ETB</span>
                    <span>📍 {delivery.distance}km</span>
                    <span>⏱️ ~{delivery.estimated_time} min</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => acceptOrder(delivery.id)}
                    className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 font-medium transition-colors"
                  >
                    ✅ Accept Order
                  </button>
                  <button
                    onClick={() => rejectOrder(delivery.id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium transition-colors"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Available Orders */}
      {isOnline && availableDeliveries.length === 0 && !activeDelivery && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Delivery Requests</h3>
          <p className="text-gray-600">
            You're online and ready! New delivery requests will appear here automatically.
          </p>
        </div>
      )}

      {/* Offline Message */}
      {!isOnline && (
        <div className="bg-gray-100 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">😴</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">You're Currently Offline</h3>
          <p className="text-gray-600 mb-4">
            Go online to start receiving delivery requests!
          </p>
        </div>
      )}
    </div>
  )
}

export default RiderDeliveries