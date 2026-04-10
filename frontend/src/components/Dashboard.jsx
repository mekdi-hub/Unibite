import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaUtensils, FaSignOutAlt, FaUser } from 'react-icons/fa'
import LogoutConfirmModal from './LogoutConfirmModal'
import AdminDashboard from './AdminDashboard'
import RestaurantDashboard from './RestaurantDashboard'

const Dashboard = () => {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, loading, navigate])

  // Prevent back button after logout
  useEffect(() => {
    const handlePopState = () => {
      if (!user) {
        navigate('/login', { replace: true })
      }
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [user, navigate])

  const handleLogout = async () => {
    setShowLogoutModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Show Admin Dashboard for admin users
  if (user.role === 'admin') {
    return <AdminDashboard />
  }

  // Show Restaurant Dashboard for restaurant users
  if (user.role === 'restaurant') {
    return <RestaurantDashboard />
  }

  // Show Rider Dashboard for rider users
  if (user.role === 'rider') {
    navigate('/rider-dashboard')
    return null
  }

  // Default dashboard for students and riders
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-500 rounded-full mr-3">
                  <FaUtensils className="text-xl text-white" />
                </div>
                <h1 className="text-2xl font-bold text-orange-600">UniBite</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-700">
                <FaUser className="mr-2 text-orange-500" />
                <span className="font-medium">{user.name}</span>
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full capitalize">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-orange-600 transition-colors"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome back, {user.name}!
            </h2>
            <p className="text-gray-600 mb-6">
              You are logged in as a <span className="font-semibold capitalize text-orange-600">{user.role}</span>.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-orange-50 rounded-lg p-6 border border-orange-100">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">Profile Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {user.name}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Phone:</span> {user.phone || 'Not provided'}</p>
                  <p><span className="font-medium">Role:</span> <span className="capitalize">{user.role}</span></p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  {user.role === 'student' && (
                    <>
                      <button className="block w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded transition-colors">
                        Browse Restaurants
                      </button>
                      <button className="block w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded transition-colors">
                        View Order History
                      </button>
                    </>
                  )}
                  {user.role === 'rider' && (
                    <>
                      <button className="block w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded transition-colors">
                        Available Deliveries
                      </button>
                      <button className="block w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded transition-colors">
                        My Deliveries
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                <h3 className="text-lg font-semibold text-green-800 mb-2">System Status</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    API Connected
                  </p>
                  <p className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Authentication Active
                  </p>
                  <p className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    All Systems Operational
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">🚀 Coming Soon</h4>
              <p className="text-orange-700 text-sm">
                Full restaurant browsing, order management, and delivery tracking features are being developed. 
                Stay tuned for updates!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={async () => {
          setShowLogoutModal(false)
          await logout()
          navigate('/login')
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  )
}

export default Dashboard
