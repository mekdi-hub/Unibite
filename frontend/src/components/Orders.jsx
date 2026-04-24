import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaShoppingBag, FaClock, FaMapMarkerAlt, FaPhone, FaCheckCircle, FaTimesCircle, FaReceipt, FaRedo } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from './AdminLayout'
import StudentLayout from './StudentLayout'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active') // 'active' or 'history'
  const [trackingOrder, setTrackingOrder] = useState(null) // For tracking modal
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/login')
      return
    }
    
    fetchOrders()
  }, [user, navigate])

  const fetchOrders = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      console.log('User role:', user?.role)
      
      // If user is admin, fetch all orders, otherwise fetch user's orders
      const endpoint = user?.role === 'admin' 
        ? `${backendUrl}/api/admin/orders`
        : `${backendUrl}/api/orders`
      
      console.log('Fetching orders from:', endpoint)
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      const data = await response.json()
      console.log('Orders response:', data)
      setOrders(data.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      preparing: 'bg-purple-50 text-purple-700 border-purple-200',
      ready: 'bg-green-50 text-green-700 border-green-200',
      delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    }
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const getStatusIcon = (status) => {
    const iconMap = {
      pending: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      confirmed: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preparing: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      ),
      ready: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      out_for_delivery: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      delivered: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      cancelled: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
    return iconMap[status] || (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  }

  const getStatusProgress = (status) => {
    const progress = {
      pending: 20,
      confirmed: 40,
      preparing: 60,
      ready: 80,
      delivered: 100,
      cancelled: 0
    }
    return progress[status] || 0
  }

  // Filter orders based on active tab
  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status)
  )

  const historyOrders = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  )

  const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')

      const response = await fetch(`${backendUrl}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        alert('Order deleted successfully')
        // Remove the order from the list
        setOrders(orders.filter(order => order.id !== orderId))
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to delete order')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Failed to delete order. Please try again.')
    }
  }

  const getOrderTimeline = (order) => {
    const timeline = [
      { status: 'pending', label: 'Order Placed', icon: 'clipboard', completed: false },
      { status: 'confirmed', label: 'Order Confirmed', icon: 'check-circle', completed: false },
      { status: 'preparing', label: 'Preparing Food', icon: 'fire', completed: false },
      { status: 'ready', label: 'Ready for Pickup', icon: 'utensils', completed: false },
      { status: 'out_for_delivery', label: 'Out for Delivery', icon: 'truck', completed: false },
      { status: 'delivered', label: 'Delivered', icon: 'check', completed: false }
    ]

    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']
    const currentIndex = statusOrder.indexOf(order.status)

    return timeline.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }))
  }

  const getEstimatedDeliveryTime = (order) => {
    const statusTimes = {
      pending: '30-40 minutes',
      confirmed: '25-35 minutes',
      preparing: '20-30 minutes',
      ready: '10-15 minutes',
      out_for_delivery: '5-10 minutes',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }
    return statusTimes[order.status] || 'Calculating...'
  }

  const handleTrackOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId)
    if (order) {
      setTrackingOrder(order)
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')

      const response = await fetch(`${backendUrl}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        alert('Order cancelled successfully!')
        // Refresh orders
        fetchOrders()
      } else {
        alert(data.message || 'Failed to cancel order')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert('Failed to cancel order. Please try again.')
    }
  }

  const handleReorder = (order) => {
    // Navigate to restaurant menu with items pre-added to cart
    alert(`Reordering from ${order.restaurant.restaurant_name}\n\nThis feature will:\n- Take you to the restaurant menu\n- Add all items from this order to your cart\n- Allow you to modify and place a new order`)
    // In a real implementation:
    // navigate(`/restaurant/${order.restaurant_id}`, { state: { reorderItems: order.items } })
  }

  const handleViewReceipt = (order) => {
    // Show receipt details
    const receiptText = `
ORDER RECEIPT
Order #${order.id}
${new Date(order.created_at).toLocaleString()}

Restaurant: ${order.restaurant.restaurant_name}
Delivery Address: ${order.delivery_address}

Items:
${order.items.map(item => `- ${item.menu_item?.name || 'Item'} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ETB`).join('\n')}

Total: ${order.total_amount} ETB
Payment Method: ${order.payment_method}
Status: ${order.status}
    `
    alert(receiptText)
  }

  // Helper function to get food name summary for order
  const getOrderFoodSummary = (order) => {
    if (!order.items || order.items.length === 0) {
      return `Order #${order.id}`
    }
    
    const firstItem = order.items[0]
    const firstName = firstItem.menu_item?.name || 'Item'
    
    if (order.items.length === 1) {
      return firstName
    } else if (order.items.length === 2) {
      const secondName = order.items[1].menu_item?.name || 'Item'
      return `${firstName} & ${secondName}`
    } else {
      const remainingCount = order.items.length - 1
      return `${firstName} +${remainingCount} more`
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md mx-4">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders</p>
          <Link to="/login" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-md">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading your orders...</p>
        </div>
      </div>
    )
  }

  // Wrap in AdminLayout if user is admin
  const ordersContent = (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-all group"
              >
                <div className="p-2 rounded-lg hover:bg-orange-50 transition-colors">
                  <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
                <span className="font-medium hidden sm:inline">Back to Home</span>
              </button>
              
              <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-xl" style={{ filter: 'brightness(0) invert(1)' }}>🚴‍♀️</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-gray-900">UniBite</h1>
                  <p className="text-xs text-gray-600">Delivery to your campus</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-gray-700 font-medium hidden md:inline">Hello, {user.name}!</span>
              )}
              <Link 
                to="/restaurants" 
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-2 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-semibold text-sm shadow-md"
              >
                <span className="hidden sm:inline">Browse Menu</span>
                <span className="sm:hidden">Menu</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Title */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center space-x-4 mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <FaShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {user?.role === 'admin' ? 'All Orders' : 'My Orders'}
              </h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {user?.role === 'admin' 
                  ? 'View and manage all customer orders' 
                  : 'Track and manage your food orders'}
              </p>
            </div>
          </div>
          
          {/* Stats Bar */}
          {orders.length > 0 && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs text-gray-500 mb-1 font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs text-gray-500 mb-1 font-medium">Active</p>
                <p className="text-2xl font-bold text-orange-600">
                  {activeOrders.length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs text-gray-500 mb-1 font-medium">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs text-gray-500 mb-1 font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0).toFixed(2)} ETB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 inline-flex">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                activeTab === 'active'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                <span>Active Orders</span>
                {activeOrders.length > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'active' ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {activeOrders.length}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Order History</span>
                {historyOrders.length > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'history' ? 'bg-white text-orange-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {historyOrders.length}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {displayedOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
              {/* Order Header */}
              <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                      <FaShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{getOrderFoodSummary(order)}</h3>
                      {user?.role === 'admin' && order.student && (
                        <p className="text-sm font-semibold text-blue-600 flex items-center space-x-1 mt-0.5">
                          <span>👤</span>
                          <span>{order.student.name}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 flex items-center space-x-1 mt-0.5">
                        <FaClock className="w-3 h-3" />
                        <span>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 border ${getStatusColor(order.status)} w-fit`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                {order.status !== 'cancelled' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span>Order Progress</span>
                      <span className="font-semibold">{getStatusProgress(order.status)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getStatusProgress(order.status)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Content */}
              <div className="p-4 sm:p-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Customer Info (Admin Only) */}
                    {user?.role === 'admin' && order.student && (
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                            <span className="text-2xl">👤</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-base mb-2">Customer Details</h4>
                            <div className="space-y-1.5 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">Name:</span>
                                <span>{order.student.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">Email:</span>
                                <span className="break-all">{order.student.email}</span>
                              </div>
                              {order.student.phone && (
                                <div className="flex items-center space-x-2">
                                  <FaPhone className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                                  <span>{order.student.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Restaurant Info */}
                    {order.restaurant && (
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                            <span className="text-2xl">🏪</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-base mb-2">{order.restaurant.restaurant_name}</h4>
                            <div className="space-y-1.5 text-sm text-gray-600">
                              <div className="flex items-start space-x-2">
                                <FaMapMarkerAlt className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="break-words">{order.restaurant.address}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FaPhone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                <span>{order.restaurant.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delivery Info */}
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-100">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center space-x-2 text-base">
                        <span className="text-xl">🚚</span>
                        <span>Delivery Address</span>
                      </h4>
                      <div className="flex items-start space-x-2 text-gray-700">
                        <FaMapMarkerAlt className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <span className="font-medium break-words">{order.delivery_address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 text-base flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Order Items</span>
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-orange-600 font-bold text-sm">{item.quantity}×</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900 text-sm truncate">{item.menu_item?.name || 'Item'}</p>
                                <p className="text-xs text-gray-500">{parseFloat(item.price || 0).toFixed(2)} ETB each</p>
                              </div>
                            </div>
                            <div className="text-right ml-3">
                              <p className="font-bold text-gray-900">{(parseFloat(item.price || 0) * item.quantity).toFixed(2)} ETB</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-orange-200">
                          <span className="text-sm text-gray-600">Subtotal</span>
                          <span className="font-semibold text-gray-900">{order.total_amount} ETB</span>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-orange-200">
                          <span className="text-sm text-gray-600">Delivery Fee</span>
                          <span className="font-semibold text-green-600">Free</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                              {order.total_amount} ETB
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600 mb-1">Payment</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-green-100 text-green-700 border border-green-200">
                              <FaCheckCircle className="w-3 h-3 mr-1" />
                              Paid
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={() => handleTrackOrder(order.id)}
                      className="col-span-2 sm:col-span-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                      <FaMapMarkerAlt className="w-4 h-4" />
                      <span>Track Order</span>
                    </button>
                    
                    {order.status === 'delivered' && (
                      <button 
                        onClick={() => handleReorder(order)}
                        className="bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                      >
                        <FaRedo className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reorder</span>
                        <span className="sm:hidden">Reorder</span>
                      </button>
                    )}
                    
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="bg-red-50 text-red-600 py-3 px-4 rounded-xl font-semibold hover:bg-red-100 transition-all border border-red-200 flex items-center justify-center space-x-2"
                      >
                        <FaTimesCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cancel</span>
                        <span className="sm:hidden">Cancel</span>
                      </button>
                    )}
                    
                    {(order.status === 'delivered' || order.status === 'cancelled') && (
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="bg-red-50 text-red-600 py-3 px-4 rounded-xl font-semibold hover:bg-red-100 transition-all border border-red-200 flex items-center justify-center space-x-2"
                      >
                        <FaTimesCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Delete</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleViewReceipt(order)}
                      className="bg-gray-50 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-100 transition-all border border-gray-200 flex items-center justify-center space-x-2"
                    >
                      <FaReceipt className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Receipt</span>
                      <span className="sm:hidden">Receipt</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {displayedOrders.length === 0 && (
          <div className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FaShoppingBag className="w-12 h-12 text-orange-500" />
            </div>
            {activeTab === 'active' ? (
              <>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">No Active Orders</h3>
                <p className="text-gray-600 mb-8 text-base sm:text-lg max-w-md mx-auto px-4">
                  You don't have any active orders at the moment. Start exploring our delicious menu options!
                </p>
              </>
            ) : (
              <>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">No Order History</h3>
                <p className="text-gray-600 mb-8 text-base sm:text-lg max-w-md mx-auto px-4">
                  You haven't completed any orders yet. Your past orders will appear here.
                </p>
              </>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link 
                to="/restaurants" 
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
              >
                Browse Restaurants
              </Link>
              <Link 
                to="/" 
                className="bg-white text-gray-700 border-2 border-gray-300 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Order Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setTrackingOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{getOrderFoodSummary(trackingOrder)}</h2>
                  <p className="text-orange-100 text-sm">
                    {new Date(trackingOrder.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setTrackingOrder(null)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Current Status */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">Current Status</p>
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(trackingOrder.status)}`}>
                      {getStatusIcon(trackingOrder.status)}
                      <span className="capitalize">{trackingOrder.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Estimated Time</p>
                    <p className="text-2xl font-bold text-orange-600">{getEstimatedDeliveryTime(trackingOrder)}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                {trackingOrder.status !== 'cancelled' && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${getStatusProgress(trackingOrder.status)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="text-lg font-bold mb-5 flex items-center space-x-2 text-gray-900">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Order Timeline</span>
                </h3>
                <div className="space-y-4">
                  {getOrderTimeline(trackingOrder).map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        step.completed 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md' 
                          : step.current
                          ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md animate-pulse'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {step.icon === 'clipboard' && (
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        )}
                        {step.icon === 'check-circle' && (
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {step.icon === 'fire' && (
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                          </svg>
                        )}
                        {step.icon === 'utensils' && (
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            <circle cx="12" cy="12" r="10" strokeWidth={2} />
                          </svg>
                        )}
                        {step.icon === 'truck' && (
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                          </svg>
                        )}
                        {step.icon === 'check' && (
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className={`flex-1 pb-4 pl-4 ml-5 -mt-2 ${
                        index < getOrderTimeline(trackingOrder).length - 1 
                          ? 'border-l-2 ' + (step.completed ? 'border-green-300' : step.current ? 'border-orange-300' : 'border-gray-200')
                          : ''
                      }`}>
                        <p className={`font-semibold ${step.completed || step.current ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        {step.current && (
                          <p className="text-sm text-orange-600 font-medium mt-1">In Progress...</p>
                        )}
                        {step.completed && !step.current && (
                          <p className="text-sm text-green-600 font-medium mt-1">✓ Completed</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200 shadow-lg">
                <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center space-x-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Restaurant</span>
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900 text-lg">{trackingOrder.restaurant?.restaurant_name}</p>
                    <p className="text-sm text-gray-600 font-medium mt-1">{trackingOrder.restaurant?.address}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 shadow-lg">
                <h3 className="text-base font-extrabold text-gray-900 mb-3 flex items-center space-x-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Delivery Address</span>
                </h3>
                <p className="text-gray-900 font-bold text-lg">{trackingOrder.delivery_address}</p>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 shadow-lg">
                <h3 className="text-2xl font-extrabold mb-4 flex items-center space-x-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Order Items</span>
                </h3>
                <div className="space-y-3">
                  {trackingOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200 shadow-md">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-white font-extrabold text-base">{item.quantity}×</span>
                        </div>
                        <span className="font-bold text-gray-900 text-lg">{item.menu_item?.name || 'Item'}</span>
                      </div>
                      <span className="font-extrabold text-gray-900 text-xl">{(parseFloat(item.price || 0) * item.quantity).toFixed(2)} ETB</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-br from-orange-50 via-red-50/50 to-orange-50 rounded-2xl p-6 border-2 border-orange-300 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-gray-900">Total Amount</span>
                  <span className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {trackingOrder.total_amount} ETB
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setTrackingOrder(null)}
                  className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-4 rounded-2xl font-extrabold hover:from-gray-200 hover:to-gray-300 transition-all shadow-lg hover:shadow-xl border-2 border-gray-300"
                >
                  Close
                </button>
                {trackingOrder.restaurant?.phone && (
                  <button
                    onClick={() => window.open(`tel:${trackingOrder.restaurant.phone}`)}
                    className="flex-1 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white py-4 px-4 rounded-2xl font-extrabold hover:from-orange-600 hover:via-orange-700 hover:to-red-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Call Restaurant</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Return with or without AdminLayout based on user role
  if (user?.role === 'admin') {
    return (
      <AdminLayout title="All Orders" subtitle="View and manage all customer orders">
        <div className="max-w-6xl mx-auto">
          {ordersContent.props.children[1]}
        </div>
      </AdminLayout>
    )
  }

  // Student users also get a sidebar layout
  return (
    <StudentLayout title="My Orders" subtitle="Track and manage your food orders">
      <div className="max-w-6xl mx-auto">
        {ordersContent.props.children[1]}
      </div>
    </StudentLayout>
  )
}

export default Orders
