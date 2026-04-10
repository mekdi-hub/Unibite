import { useState, useEffect } from 'react'
import axios from 'axios'
import { formatCurrency } from '../../utils/currency'

const RestaurantOrders = ({ onOrderUpdate }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [filter, search])

  const fetchOrders = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
      const token = localStorage.getItem('token')
      
      console.log('Fetching restaurant orders...')
      console.log('Backend URL:', backendUrl)
      console.log('Token:', token ? 'Present' : 'Missing')
      console.log('Filter:', filter)
      console.log('Search:', search)
      
      const response = await axios.get(`${backendUrl}/api/restaurant/orders`, {
        params: { status: filter, search },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      console.log('Restaurant orders response:', response.data)
      console.log('Response structure:', {
        success: response.data.success,
        hasData: !!response.data.data,
        dataType: typeof response.data.data,
        dataKeys: response.data.data ? Object.keys(response.data.data) : null,
      })
      
      if (response.data.success) {
        // Handle both paginated and non-paginated responses
        const ordersData = response.data.data.data || response.data.data || []
        console.log('Orders data:', ordersData)
        console.log('Orders count:', Array.isArray(ordersData) ? ordersData.length : 'Not an array')
        setOrders(ordersData)
      } else {
        console.error('Response not successful:', response.data)
        setErrorMessage(response.data.message || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message)
        setTimeout(() => setErrorMessage(''), 10000)
      }
      if (error.response?.data?.debug) {
        console.log('Debug info:', error.response.data.debug)
      }
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    // Optimistic update - update UI immediately
    const previousOrders = [...orders]
    const previousSelectedOrder = selectedOrder
    
    // Update the order in the list immediately
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    )
    
    // Update selected order if it's the one being updated
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status })
    }
    
    // Close modal immediately for better UX
    setSelectedOrder(null)
    
    // Show success message immediately
    setSuccessMessage('Order status updated successfully!')
    setTimeout(() => setSuccessMessage(''), 5000)
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
      const token = localStorage.getItem('token')
      
      // Make API call in background
      const response = await axios.put(
        `${backendUrl}/api/restaurant/orders/${orderId}/status`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )
      
      console.log('Update status response:', response.data)
      
      // Check if response indicates success
      if (response.data && (response.data.success === true || response.status === 200)) {
        // Refresh to get any server-side updates
        fetchOrders()
        // Notify parent component to update pending orders count
        if (onOrderUpdate) {
          onOrderUpdate()
        }
      } else {
        // Revert on failure
        console.error('Update failed:', response.data)
        setOrders(previousOrders)
        setSelectedOrder(previousSelectedOrder)
        setSuccessMessage('')
        setErrorMessage(response.data?.message || 'Failed to update order status')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      console.error('Error response:', error.response?.data)
      // Revert optimistic update on error
      setOrders(previousOrders)
      setSelectedOrder(previousSelectedOrder)
      setSuccessMessage('')
      setErrorMessage(error.response?.data?.message || 'Failed to update order status')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      preparing: 'bg-purple-100 text-purple-800 border-purple-300',
      ready: 'bg-green-100 text-green-800 border-green-300',
      out_for_delivery: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      delivered: 'bg-teal-100 text-teal-800 border-teal-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
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
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md animate-slide-in-down">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-800 font-medium">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage('')}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md animate-slide-in-down">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 font-medium">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search by Order ID or Customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">#{order.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{order.student?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.student?.phone || ''}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items?.length || 0} items
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-red-600">{formatCurrency(order.total_amount)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Customer Info */}
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-900">Customer Information</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 w-20">Name:</span>
                    <span className="text-gray-900">{selectedOrder.student?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 w-20">Phone:</span>
                    <span className="text-gray-900">{selectedOrder.student?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-20">Address:</span>
                    <span className="text-gray-900 flex-1">{selectedOrder.delivery_address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-900">Order Items</h3>
                </div>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-red-50 rounded-xl border border-red-200 hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-lg">{item.menu_item?.name || item.name || 'Unknown Item'}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Quantity:</span> {item.quantity || 1}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(item.price || item.menu_item?.price || 0)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency((item.price || item.menu_item?.price || 0) * (item.quantity || 1))} total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="mb-6 p-6 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg font-bold text-white">Total Amount:</span>
                  </div>
                  <span className="text-3xl font-black text-white">{formatCurrency(selectedOrder.total_amount || selectedOrder.total_price || 0)}</span>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedOrder.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
                      >
                        ✓ Confirm Order
                      </button>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-medium"
                      >
                        ✗ Cancel Order
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                      className="col-span-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 font-medium"
                    >
                      👨‍🍳 Start Preparing
                    </button>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                      className="col-span-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
                    >
                      ✓ Mark as Ready
                    </button>
                  )}
                  {selectedOrder.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'out_for_delivery')}
                      className="col-span-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-medium"
                    >
                      🚴 Out for Delivery
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurantOrders
