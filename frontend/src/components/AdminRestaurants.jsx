import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import AdminLayout from './AdminLayout'

const AdminRestaurants = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [restaurants, setRestaurants] = useState([])
  const [filter, setFilter] = useState('pending') // pending, approved, all
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login')
    } else {
      fetchRestaurants()
    }
  }, [user, navigate, filter])

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      
      let endpoint = `${backendUrl}/api/admin/restaurants`
      if (filter === 'pending') {
        endpoint = `${backendUrl}/api/admin/restaurants/pending`
      } else if (filter !== 'all') {
        endpoint = `${backendUrl}/api/admin/restaurants?status=${filter}`
      }

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.data.success) {
        setRestaurants(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (restaurantId) => {
    try {
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      
      const response = await axios.post(
        `${backendUrl}/api/admin/restaurants/${restaurantId}/approve`,
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
        fetchRestaurants()
        setShowModal(false)
      }
    } catch (error) {
      console.error('Error approving restaurant:', error)
      alert('Failed to approve restaurant')
    }
  }

  const handleReject = async (restaurantId) => {
    if (!confirm('Are you sure you want to reject this restaurant?')) return

    try {
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      
      const response = await axios.post(
        `${backendUrl}/api/admin/restaurants/${restaurantId}/reject`,
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
        fetchRestaurants()
        setShowModal(false)
      }
    } catch (error) {
      console.error('Error rejecting restaurant:', error)
      alert('Failed to reject restaurant')
    }
  }

  const viewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setShowModal(true)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      suspended: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <AdminLayout 
      title="Restaurant Management"
      subtitle="Review and manage restaurant registrations"
    >
      {/* Filter Tabs */}
      <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'pending'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Pending ({restaurants.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'approved'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filter === 'all'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Restaurants
          </button>
        </div>

        {/* Restaurants List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <div className="flex justify-center mb-4">
              <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-600">No restaurants match the selected filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => {
              const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
              let menuImages = []
              try {
                menuImages = restaurant.menu_images ? JSON.parse(restaurant.menu_images) : []
              } catch (e) {
                console.error('Error parsing menu images:', e)
              }

              return (
                <div key={restaurant.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  {/* Restaurant Header */}
                  <div className="p-6 bg-gradient-to-r from-red-100 to-red-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900 mb-1">{restaurant.restaurant_name}</h3>
                        <p className="text-sm text-gray-600">{restaurant.address}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(restaurant.status)}`}>
                        {restaurant.status}
                      </span>
                    </div>
                    
                    {/* Quick Info */}
                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="flex items-center">
                        <span className="mr-2">👤</span>
                        <span>{restaurant.user?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{restaurant.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{restaurant.opening_hours_text}</span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Images Preview */}
                  {menuImages.length > 0 && (
                    <div className="p-4 bg-gray-50">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Menu Images ({menuImages.length})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {menuImages.slice(0, 3).map((imagePath, idx) => {
                          const imageUrl = `${backendUrl}/storage/${imagePath}`
                          console.log(`Restaurant ${restaurant.name} - Image ${idx}:`, imageUrl)
                          return (
                            <img
                              key={idx}
                              src={imageUrl}
                              alt={`Menu ${idx + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                console.error(`Failed to load image: ${imageUrl}`)
                                e.target.src = 'https://via.placeholder.com/150?text=Menu'
                              }}
                              onLoad={() => {
                                console.log(`Successfully loaded: ${imageUrl}`)
                              }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={() => viewDetails(restaurant)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      {/* Details Modal */}
      {showModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">{selectedRestaurant.restaurant_name}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Restaurant Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Owner Name</p>
                  <p className="font-semibold">{selectedRestaurant.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-semibold">{selectedRestaurant.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-semibold">{selectedRestaurant.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(selectedRestaurant.status)}`}>
                    {selectedRestaurant.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="font-semibold">{selectedRestaurant.address}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Opening Hours</p>
                  <p className="font-semibold">{selectedRestaurant.opening_hours_text}</p>
                </div>
                {selectedRestaurant.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="font-semibold">{selectedRestaurant.description}</p>
                  </div>
                )}
              </div>

              {/* Food Categories */}
              {selectedRestaurant.food_categories && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Food Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(selectedRestaurant.food_categories).map((category, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bank Information */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Bank Account Information</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Holder:</span>
                    <span className="font-semibold">{selectedRestaurant.bank_account_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-semibold">{selectedRestaurant.bank_account_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank Name:</span>
                    <span className="font-semibold">{selectedRestaurant.bank_name}</span>
                  </div>
                </div>
              </div>

              {/* Business License */}
              {selectedRestaurant.business_license && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Business License</p>
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    {selectedRestaurant.business_license.endsWith('.pdf') ? (
                      <div className="p-8 text-center bg-gray-50">
                        <div className="text-6xl mb-4">📄</div>
                        <p className="text-gray-600 mb-4">PDF Document</p>
                        <a
                          href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/storage/${selectedRestaurant.business_license}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all"
                        >
                          View PDF
                        </a>
                      </div>
                    ) : (
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/storage/${selectedRestaurant.business_license}`}
                        alt="Business License"
                        className="w-full h-auto"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=License+Image'
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Menu Images */}
              {(() => {
                let menuImages = []
                try {
                  menuImages = selectedRestaurant.menu_images ? JSON.parse(selectedRestaurant.menu_images) : []
                } catch (e) {
                  console.error('Error parsing menu images:', e)
                }
                
                return menuImages.length > 0 ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Menu Images ({menuImages.length})</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {menuImages.map((imagePath, idx) => (
                        <div key={idx} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                          <img
                            src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/storage/${imagePath}`}
                            alt={`Menu ${idx + 1}`}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=Menu+Image'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No menu images uploaded</p>
                  </div>
                )
              })()}

              {/* Action Buttons */}
              {selectedRestaurant.status === 'pending' && (
                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(selectedRestaurant.id)}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-all shadow-md flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Approve Restaurant</span>
                  </button>
                  <button
                    onClick={() => handleReject(selectedRestaurant.id)}
                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-all shadow-md flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Reject Restaurant</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminRestaurants
