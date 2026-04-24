import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import NotificationList from './shared/NotificationList'
import { useNotifications } from '../contexts/NotificationContext'
import axios from 'axios'
import { 
  FaStore, 
  FaCheckCircle, 
  FaSyncAlt, 
  FaBell,
  FaFileAlt,
  FaUtensils,
  FaUniversity
} from 'react-icons/fa'

const Notifications = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [pendingRestaurants, setPendingRestaurants] = useState([])
  const [activeTab, setActiveTab] = useState('unread')
  const { notifications, markAsRead } = useNotifications()

  useEffect(() => {
    fetchPendingRestaurants()
  }, [])

  const fetchPendingRestaurants = async () => {
    try {
      setLoading(true)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/admin/restaurants/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.data.success) {
        setPendingRestaurants(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching pending restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (restaurantId) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.put(
        `${backendUrl}/admin/restaurants/${restaurantId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      )
      
      if (response.data.success) {
        alert('Restaurant approved successfully!')
        fetchPendingRestaurants()
      }
    } catch (error) {
      console.error('Error approving restaurant:', error)
      alert('Failed to approve restaurant')
    }
  }

  const handleReject = async (restaurantId) => {
    if (window.confirm('Are you sure you want to reject this restaurant?')) {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
        const token = localStorage.getItem('token')
        
        const response = await axios.put(
          `${backendUrl}/admin/restaurants/${restaurantId}/reject`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        )
        
        if (response.data.success) {
          alert('Restaurant rejected')
          fetchPendingRestaurants()
        }
      } catch (error) {
        console.error('Error rejecting restaurant:', error)
        alert('Failed to reject restaurant')
      }
    }
  }

  const handleNotificationClick = (notification) => {
    if (notification.type === 'new_restaurant_registration') {
      navigate('/admin/restaurants')
    } else if (notification.type === 'new_order') {
      navigate('/orders')
    } else if (notification.data?.action_url) {
      navigate(notification.data.action_url)
    }
  }

  const handleDelete = async (notificationIds) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      await axios.post(
        `${backendUrl}/notifications/delete-multiple`,
        { ids: notificationIds },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      )
      
      // Refresh notifications context
      window.location.reload()
      return true
    } catch (error) {
      console.error('Error deleting notifications:', error)
      alert('Failed to delete notifications')
      return false
    }
  }

  // Filter out restaurant registration notifications since they're shown separately
  const otherNotifications = notifications.filter(n => n.type !== 'new_restaurant_registration')
  const unreadNotifications = otherNotifications.filter(n => !n.read_at)
  const readNotifications = otherNotifications.filter(n => n.read_at)

  return (
    <AdminLayout 
      title="Notifications"
      subtitle="Manage all notifications and pending approvals"
    >
      {/* Header Stats */}
      <div className="flex justify-end items-center space-x-3 mb-6">
        <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg shadow-md">
          <p className="text-xs font-semibold">Unread</p>
          <p className="text-xl font-bold">{unreadNotifications.length}</p>
        </div>
        <div className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg shadow-md">
          <p className="text-xs font-semibold">Pending</p>
          <p className="text-xl font-bold">{pendingRestaurants.length}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
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
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'restaurants'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Restaurant Approvals ({pendingRestaurants.length})
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            {/* Notifications Tabs */}
            {(activeTab === 'unread' || activeTab === 'read') && (
              <NotificationList
                notifications={activeTab === 'unread' ? unreadNotifications : readNotifications}
                loading={false}
                onMarkAsRead={markAsRead}
                onNotificationClick={handleNotificationClick}
                onDelete={handleDelete}
                showTabs={false}
                showSelection={true}
                emptyMessage="Read notifications will appear here"
              />
            )}

            {/* Restaurant Approvals Tab */}
            {activeTab === 'restaurants' && (
              <>
                {pendingRestaurants.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                    <div className="flex justify-center mb-6">
                      <FaBell className="w-20 h-20 text-gray-400" />
                    </div>
                    <p className="text-gray-700 text-xl font-bold mb-2">No pending approvals</p>
                    <p className="text-gray-500 text-sm">All restaurant registrations have been reviewed</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingRestaurants.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border border-red-100"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FaStore className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                  {restaurant.restaurant_name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Registered {new Date(restaurant.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-full flex items-center space-x-1">
                              <FaSyncAlt className="w-3 h-3" />
                              <span>Pending Review</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-xs text-gray-500 font-semibold mb-1">Owner</p>
                              <p className="font-bold text-gray-900">{restaurant.user?.name || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-xs text-gray-500 font-semibold mb-1">Email</p>
                              <p className="font-bold text-gray-900">{restaurant.user?.email || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-xs text-gray-500 font-semibold mb-1">Phone</p>
                              <p className="font-bold text-gray-900">{restaurant.phone || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-xs text-gray-500 font-semibold mb-1">Address</p>
                              <p className="font-bold text-gray-900">{restaurant.address || 'N/A'}</p>
                            </div>
                          </div>

                          {restaurant.description && (
                            <div className="bg-blue-50 rounded-xl p-4 mb-6">
                              <p className="text-xs text-gray-500 font-semibold mb-2">Description</p>
                              <p className="text-gray-700">{restaurant.description}</p>
                            </div>
                          )}

                          {/* Documents Section */}
                          {(restaurant.business_license || restaurant.menu_images) && (
                            <div className="mb-6">
                              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <FaFileAlt className="w-5 h-5 mr-2 text-gray-700" />
                                Uploaded Documents
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {restaurant.business_license && (
                                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-2">
                                        <FaFileAlt className="w-6 h-6 text-purple-600" />
                                        <div>
                                          <p className="text-sm font-bold text-gray-900">Business License</p>
                                          <p className="text-xs text-gray-600">Required document</p>
                                        </div>
                                      </div>
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center space-x-1">
                                        <FaCheckCircle className="w-3 h-3" />
                                        <span>Uploaded</span>
                                      </span>
                                    </div>
                                    <a
                                      href={`${import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'}/storage/${restaurant.business_license}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block w-full bg-white hover:bg-purple-50 text-purple-700 font-semibold py-2 px-4 rounded-lg transition-all text-center border border-purple-300"
                                    >
                                      View License
                                    </a>
                                  </div>
                                )}

                                {restaurant.menu_images && JSON.parse(restaurant.menu_images).length > 0 && (
                                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-2">
                                        <FaUtensils className="w-6 h-6 text-orange-600" />
                                        <div>
                                          <p className="text-sm font-bold text-gray-900">Menu Images</p>
                                          <p className="text-xs text-gray-600">
                                            {JSON.parse(restaurant.menu_images).length} file(s)
                                          </p>
                                        </div>
                                      </div>
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center space-x-1">
                                        <FaCheckCircle className="w-3 h-3" />
                                        <span>Uploaded</span>
                                      </span>
                                    </div>
                                    <div className="space-y-2">
                                      {JSON.parse(restaurant.menu_images).map((image, idx) => (
                                        <a
                                          key={idx}
                                          href={`${import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'}/storage/${image}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block w-full bg-white hover:bg-orange-50 text-orange-700 font-semibold py-2 px-4 rounded-lg transition-all text-center border border-orange-300"
                                        >
                                          View Menu Image {idx + 1}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => handleApprove(restaurant.id)}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                            >
                              <FaCheckCircle className="w-5 h-5" />
                              <span>Approve Restaurant</span>
                            </button>
                            <button
                              onClick={() => handleReject(restaurant.id)}
                              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                            >
                              <span>✕</span>
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default Notifications
