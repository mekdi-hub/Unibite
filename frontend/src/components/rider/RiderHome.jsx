import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

const RiderHome = ({ isOnline, toggleOnlineStatus }) => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [earnings, setEarnings] = useState(null)
  const [activeDelivery, setActiveDelivery] = useState(null)
  const [availableOrders, setAvailableOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    fetchEarnings()
    fetchActiveDelivery()
    if (isOnline) {
      fetchAvailableOrders()
    }
  }, [isOnline])

  const fetchDashboardData = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.log('No authentication token found, using fallback data')
        setStats({
          todayDeliveries: 8,
          completedDeliveries: 156,
          pendingDeliveries: 2,
          totalDistance: 45.2,
          averageRating: 4.8,
          onlineHours: 6.5
        })
        return
      }
      
      const response = await axios.get(`${backendUrl}/api/rider/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 3000
      })
      
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.log('Using fallback dashboard data due to API error:', error.response?.status || error.message)
      // Set mock data as fallback
      setStats({
        todayDeliveries: 8,
        completedDeliveries: 156,
        pendingDeliveries: 2,
        totalDistance: 45.2,
        averageRating: 4.8,
        onlineHours: 6.5
      })
    } finally {
      setLoading(false)
    }
  }
  const fetchEarnings = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.log('No authentication token found, using fallback earnings data')
        setEarnings({
          today: 350,
          thisWeek: 1200,
          thisMonth: 4800,
          total: 8500
        })
        return
      }
      
      const response = await axios.get(`${backendUrl}/api/rider/earnings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 3000
      })
      
      if (response.data.success) {
        setEarnings(response.data.data)
      }
    } catch (error) {
      console.log('Using fallback earnings data due to API error:', error.response?.status || error.message)
      // Set mock earnings data
      setEarnings({
        today: 350,
        thisWeek: 1200,
        thisMonth: 4800,
        total: 8500
      })
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
        timeout: 10000 // Increase timeout to 10 seconds
      })
      
      if (response.data.success && response.data.data) {
        setActiveDelivery(response.data.data)
      } else {
        setActiveDelivery(null)
      }
    } catch (error) {
      console.error('Error fetching active delivery:', error)
      setActiveDelivery(null)
    }
  }

  const fetchAvailableOrders = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/api/deliveries/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      })
      
      if (response.data.success) {
        setAvailableOrders(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching available orders:', error)
      // Don't set mock data - only show real orders
      setAvailableOrders([])
    }
  }

  const acceptOrder = async (orderId) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.post(`${backendUrl}/api/deliveries/${orderId}/accept`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (response.data.success) {
        setActiveDelivery(response.data.data)
        setAvailableOrders(prev => prev.filter(order => order.id !== orderId))
      }
    } catch (error) {
      console.error('Error accepting order:', error)
      alert('Failed to accept order')
    }
  }

  const rejectOrder = (orderId) => {
    setAvailableOrders(prev => prev.filter(order => order.id !== orderId))
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
      {/* Online/Offline Status Card */}
      <div className={`rounded-xl shadow-lg border-2 p-6 transition-all duration-300 ${
        isOnline 
          ? 'bg-gradient-to-br from-white to-orange-50 border-orange-300 shadow-orange-100' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`relative w-4 h-4 rounded-full ${isOnline ? 'bg-orange-500' : 'bg-gray-400'}`}>
              {isOnline && (
                <span className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-75"></span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isOnline ? 'You are Online' : 'You are Offline'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {isOnline 
                  ? 'Ready to receive delivery requests' 
                  : 'Go online to start receiving orders'
                }
              </p>
            </div>
          </div>
          <button
            onClick={toggleOnlineStatus}
            className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isOnline
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Active Delivery Card */}
      {activeDelivery && (
        <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-xl border-2 border-orange-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full -mr-20 -mt-20"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center relative">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span>Current Delivery - Order #{activeDelivery.order_id}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Restaurant</p>
              <p className="font-bold text-gray-900">{activeDelivery.restaurant_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Customer</p>
              <p className="font-bold text-gray-900">{activeDelivery.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Pickup Address</p>
              <p className="font-bold text-gray-900">{activeDelivery.pickup_address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
              <p className="font-bold text-gray-900">{activeDelivery.delivery_address}</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              activeDelivery.status === 'going_to_restaurant' ? 'bg-yellow-100 text-yellow-800' :
              activeDelivery.status === 'at_restaurant' ? 'bg-blue-100 text-blue-800' :
              activeDelivery.status === 'picked_up' ? 'bg-purple-100 text-purple-800' :
              'bg-green-100 text-green-800'
            }`}>
              {activeDelivery.status === 'going_to_restaurant' && '🚴 Going to Restaurant'}
              {activeDelivery.status === 'at_restaurant' && '🏪 At Restaurant'}
              {activeDelivery.status === 'picked_up' && '📦 Picked Up - Delivering'}
              {activeDelivery.status === 'delivered' && '✅ Delivered'}
            </span>
          </div>
          
          <div className="mt-4 flex space-x-3">
            {activeDelivery.status === 'going_to_restaurant' && (
              <button className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 font-medium">
                📍 Arrived at Restaurant
              </button>
            )}
            {activeDelivery.status === 'at_restaurant' && (
              <button className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 font-medium">
                📦 Picked Up Food
              </button>
            )}
            {activeDelivery.status === 'picked_up' && (
              <button className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 font-medium">
                ✅ Mark as Delivered
              </button>
            )}
          </div>
        </div>
      )}

      {/* Available Orders */}
      {isOnline && availableOrders.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            New Delivery Requests
          </h2>
          <div className="space-y-4">
            {availableOrders.map((order) => (
              <div key={order.id} className="group bg-white rounded-xl border-2 border-red-100 hover:border-red-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b-2 border-red-500">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Order #{order.id}</h3>
                      <p className="text-red-600 text-sm font-semibold">New Request</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                    order.payment_status === 'paid' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {order.payment_status === 'paid' ? '✓ Paid' : '💰 Cash'}
                  </span>
                </div>
                
                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Pickup Section */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pickup Location</p>
                      <p className="font-bold text-gray-900 text-lg">{order.restaurant}</p>
                      <p className="text-sm text-gray-600 mt-1">{order.pickup_address}</p>
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
                      <p className="text-sm text-gray-600 mt-1">{order.delivery_address}</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center border border-red-200">
                      <p className="text-xs font-semibold text-red-600 mb-1">Distance</p>
                      <p className="text-xl font-bold text-red-900">{order.distance}</p>
                      <p className="text-xs text-red-600">km</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center border border-red-200">
                      <p className="text-xs font-semibold text-red-600 mb-1">Time</p>
                      <p className="text-xl font-bold text-red-900">~{order.estimated_time}</p>
                      <p className="text-xs text-red-600">min</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center border border-red-200">
                      <p className="text-xs font-semibold text-red-600 mb-1">Amount</p>
                      <p className="text-xl font-bold text-red-900">{order.amount}</p>
                      <p className="text-xs text-red-600">ETB</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => acceptOrder(order.id)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl hover:from-red-600 hover:to-red-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 group"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => rejectOrder(order.id)}
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-4 rounded-xl hover:from-gray-600 hover:to-gray-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 group"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Earnings */}
        <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-2">Today's Earnings</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {earnings?.today || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">ETB</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-2">This Week</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {earnings?.thisWeek || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">ETB</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-2">Total Earnings</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {earnings?.total || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">ETB</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Today's Deliveries */}
        <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-2">Today's Deliveries</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {stats?.todayDeliveries || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Completed</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-2">Average Rating</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {stats?.averageRating || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">out of 5.0</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Distance */}
        <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-2">Distance Today</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {stats?.totalDistance || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">kilometers</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Message */}
      {!isOnline && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">You're Currently Offline</h3>
          <p className="text-gray-600 mb-4">
            Go online to start receiving delivery requests and earn money!
          </p>
          <button
            onClick={toggleOnlineStatus}
            className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-all"
          >
            Go Online Now
          </button>
        </div>
      )}
    </div>
  )
}

export default RiderHome