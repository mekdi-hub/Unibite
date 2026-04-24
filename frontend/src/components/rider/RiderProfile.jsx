import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'

const RiderProfile = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [rider, setRider] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicle_type: '',
    license_number: '',
    emergency_contact: '',
    emergency_phone: '',
    profile_image: null
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [riderStatus, setRiderStatus] = useState('available')

  useEffect(() => {
    fetchRiderProfile()
  }, [])

  const fetchRiderProfile = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/rider/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      })
      
      if (response.data.data) {
        const riderData = response.data.data
        setRider(riderData)
        setRiderStatus(riderData.status || 'available')
        setFormData({
          name: riderData.name || user?.name || '',
          phone: riderData.phone || '',
          vehicle_type: riderData.vehicle_type || '',
          license_number: riderData.license_number || '',
          emergency_contact: riderData.emergency_contact || '',
          emergency_phone: riderData.emergency_phone || '',
          profile_image: null
        })
      }
    } catch (error) {
      console.error('Error fetching rider profile:', error)
      // Set mock rider data
      const mockRider = {
        id: 1,
        name: user?.name || 'Abebe Kebede',
        phone: '+251912345678',
        vehicle_type: 'Bike',
        license_number: 'AA-123456',
        emergency_contact: 'Almaz Kebede',
        emergency_phone: '+251911234567',
        status: 'available',
        is_online: false,
        rating: 4.8,
        total_deliveries: 156,
        total_earnings: 8500,
        join_date: '2024-01-15'
      }
      setRider(mockRider)
      setRiderStatus(mockRider.status)
      setFormData({
        name: mockRider.name,
        phone: mockRider.phone,
        vehicle_type: mockRider.vehicle_type,
        license_number: mockRider.license_number,
        emergency_contact: mockRider.emergency_contact,
        emergency_phone: mockRider.emergency_phone,
        profile_image: null
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key])
        }
      })
      
      const response = await axios.put(
        `${backendUrl}/rider/profile`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      if (response.data.success) {
        alert('Profile updated successfully!')
        setIsEditing(false)
        fetchRiderProfile()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      alert('New passwords do not match!')
      return
    }
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.put(
        `${backendUrl}/auth/change-password`,
        passwordData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      )
      
      if (response.data.success) {
        alert('Password changed successfully!')
        setShowPasswordForm(false)
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      alert(error.response?.data?.message || 'Failed to change password')
    }
  }

  const updateRiderStatus = async (newStatus) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.put(`${backendUrl}/rider/status`, {
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (response.data.success) {
        setRiderStatus(newStatus)
        alert('Status updated successfully!')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      // Update locally as fallback
      setRiderStatus(newStatus)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'available': 'bg-green-100 text-green-800 border-green-300',
      'busy': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'offline': 'bg-gray-100 text-gray-800 border-gray-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rider Profile & Settings</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-medium"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Rider Status Control */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⚙️</span>
          Rider Status Control
        </h2>
        <div className="flex items-center space-x-4">
          {['available', 'busy', 'offline'].map((status) => (
            <button
              key={status}
              onClick={() => updateRiderStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 border-2 ${
                riderStatus === status
                  ? getStatusColor(status)
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {status === 'available' && '✔ Available'}
              {status === 'busy' && '⏳ Busy'}
              {status === 'offline' && '⭕ Offline'}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Current status: <span className="font-medium capitalize">{riderStatus}</span>
        </p>
      </div>

      {/* Rider Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Performance Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{rider?.total_deliveries || 0}</div>
            <div className="text-sm text-gray-600">Total Deliveries</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{rider?.total_earnings || 0} ETB</div>
            <div className="text-sm text-gray-600">Total Earnings</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{rider?.rating || 0}/5</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {rider?.join_date ? Math.floor((new Date() - new Date(rider.join_date)) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <div className="text-sm text-gray-600">Days Active</div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-2">👤</span>
          Personal Information
        </h2>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Vehicle</option>
                  <option value="Bike">🚴 Bike</option>
                  <option value="Motorcycle">🏍️ Motorcycle</option>
                  <option value="Car">🚗 Car</option>
                  <option value="Scooter">🛵 Scooter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
              <input
                type="file"
                name="profile_image"
                onChange={handleInputChange}
                accept="image/*"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  fetchRiderProfile()
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 font-medium"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Full Name</p>
              <p className="font-bold text-gray-900">{rider?.name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Phone Number</p>
              <p className="font-bold text-gray-900">{rider?.phone}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Vehicle Type</p>
              <p className="font-bold text-gray-900">{rider?.vehicle_type}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">License Number</p>
              <p className="font-bold text-gray-900">{rider?.license_number || 'Not provided'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Emergency Contact</p>
              <p className="font-bold text-gray-900">{rider?.emergency_contact || 'Not provided'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Emergency Phone</p>
              <p className="font-bold text-gray-900">{rider?.emergency_phone || 'Not provided'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-2">🔐</span>
          Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Email</p>
            <p className="font-bold text-gray-900">{user?.email}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Account Type</p>
            <p className="font-bold text-gray-900">Delivery Rider</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Member Since</p>
            <p className="font-bold text-gray-900">
              {rider?.join_date ? new Date(rider.join_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(riderStatus)}`}>
              {riderStatus === 'available' && '✔ Available'}
              {riderStatus === 'busy' && '⏳ Busy'}
              {riderStatus === 'offline' && '⭕ Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-2">🔒</span>
          Security Settings
        </h2>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-medium"
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
                minLength="8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                name="new_password_confirmation"
                value={passwordData.new_password_confirmation}
                onChange={handlePasswordChange}
                required
                minLength="8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false)
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                  })
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 font-medium"
              >
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default RiderProfile