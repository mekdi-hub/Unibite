import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaGlobe } from 'react-icons/fa'
import axios from 'axios'

const Profile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Initialize form data with user info
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || ''
    })
  }, [user, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')

      if (!token) {
        alert('No authentication token found. Please login again.')
        navigate('/login')
        return
      }

      console.log('Updating profile with data:', formData)
      console.log('Backend URL:', backendUrl)
      console.log('Token exists:', !!token)

      // First, let's test if the user endpoint works
      try {
        const userResponse = await axios.get(`${backendUrl}/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        console.log('User endpoint works:', userResponse.data)
      } catch (userError) {
        console.error('User endpoint failed:', userError)
        if (userError.response?.status === 401) {
          alert('Authentication failed. Please login again.')
          navigate('/login')
          return
        }
      }

      const response = await axios.patch(
        `${backendUrl}/settings/profile`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Profile update response:', response.data)

      if (response.data) {
        alert('Profile updated successfully!')
        setEditing(false)
        // Update the user context or reload user data
        window.location.reload() // Temporary solution to refresh user data
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      let errorMessage = 'Failed to update profile'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        const errorMessages = Object.values(errors).flat()
        errorMessage = errorMessages.join(', ')
      } else if (error.response?.status === 422) {
        errorMessage = 'Validation failed. Please check your input.'
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please login again.'
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.'
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || ''
    })
    setEditing(false)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-all group"
              >
                <div className="p-2 rounded-lg hover:bg-orange-50 transition-colors">
                  <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
                <span className="font-medium hidden sm:inline">Back</span>
              </button>
              
              <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-xl" style={{ filter: 'brightness(0) invert(1)' }}>🚴‍♀️</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-gray-900">UniBite</h1>
                  <p className="text-xs text-gray-600">Delivery to your campus</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium hidden md:inline">Hello, {user.name}!</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FaUser className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">My Profile</h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your account</p>
              </div>
            </div>
            
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
              >
                <FaEdit />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-orange-100 to-red-100 p-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-xl text-white text-4xl font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                <p className="text-gray-600 mt-1">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full">
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-orange-500" />
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                    editing
                      ? 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }`}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-orange-500" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                    editing
                      ? 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }`}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaPhone className="inline mr-2 text-orange-500" />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g., 0911234567 or +251911234567"
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                    editing
                      ? 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }`}
                />
                {editing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your phone number with country code (e.g., +251911234567)
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2 text-orange-500" />
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!editing}
                  rows="3"
                  placeholder="Enter your address"
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all resize-none ${
                    editing
                      ? 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTimes />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Your profile information is used to personalize your experience and for order delivery purposes.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Profile
