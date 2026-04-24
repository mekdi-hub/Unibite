import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import axios from 'axios'
import { FaBiking, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa'

const AdminRiders = () => {
  const navigate = useNavigate()
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    busy: 0
  })

  useEffect(() => {
    fetchRiders()
  }, [])

  const fetchRiders = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/admin/riders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (response.data.success) {
        const ridersData = response.data.data || []
        setRiders(ridersData)
        
        // Calculate stats
        setStats({
          total: ridersData.length,
          online: ridersData.filter(r => r.is_online).length,
          offline: ridersData.filter(r => !r.is_online).length,
          busy: ridersData.filter(r => r.status === 'busy').length
        })
      }
    } catch (error) {
      console.error('Error fetching riders:', error)
      // Use mock data for development
      const mockRiders = [
        {
          id: 1,
          name: 'John Rider',
          email: 'john@rider.com',
          phone: '+251911234567',
          vehicle_type: 'Bike',
          is_online: true,
          status: 'available',
          total_deliveries: 145,
          rating: 4.8
        },
        {
          id: 2,
          name: 'Sarah Delivery',
          email: 'sarah@rider.com',
          phone: '+251922345678',
          vehicle_type: 'Motorcycle',
          is_online: true,
          status: 'busy',
          total_deliveries: 203,
          rating: 4.9
        },
        {
          id: 3,
          name: 'Mike Transport',
          email: 'mike@rider.com',
          phone: '+251933456789',
          vehicle_type: 'Car',
          is_online: false,
          status: 'offline',
          total_deliveries: 89,
          rating: 4.6
        }
      ]
      setRiders(mockRiders)
      setStats({
        total: mockRiders.length,
        online: mockRiders.filter(r => r.is_online).length,
        offline: mockRiders.filter(r => !r.is_online).length,
        busy: mockRiders.filter(r => r.status === 'busy').length
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (rider) => {
    if (!rider.is_online) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 flex items-center space-x-1">
          <FaTimesCircle className="w-3 h-3" />
          <span>Offline</span>
        </span>
      )
    }
    if (rider.status === 'busy') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center space-x-1">
          <FaClock className="w-3 h-3" />
          <span>Busy</span>
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center space-x-1">
        <FaCheckCircle className="w-3 h-3" />
        <span>Available</span>
      </span>
    )
  }

  return (
    <AdminLayout 
      title="Riders Management"
      subtitle="Manage delivery riders and their status"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Riders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FaBiking className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Online</p>
              <p className="text-2xl font-bold text-green-600">{stats.online}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FaCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Busy</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.busy}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <FaClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Offline</p>
              <p className="text-2xl font-bold text-gray-600">{stats.offline}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <FaTimesCircle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Riders Grid */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All Riders</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : riders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {riders.map((rider) => (
              <div key={rider.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{rider.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{rider.name}</h3>
                      <p className="text-xs text-gray-500">{rider.vehicle_type}</p>
                    </div>
                  </div>
                  {getStatusBadge(rider)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FaEnvelope className="w-4 h-4" />
                    <span>{rider.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FaPhone className="w-4 h-4" />
                    <span>{rider.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Deliveries</p>
                    <p className="text-lg font-bold text-gray-900">{rider.total_deliveries || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="text-lg font-bold text-yellow-500">⭐ {rider.rating || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FaBiking className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No riders found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminRiders
