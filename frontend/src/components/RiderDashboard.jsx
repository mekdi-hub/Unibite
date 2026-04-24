import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import LogoutConfirmModal from './LogoutConfirmModal'
import axios from 'axios'
import RiderHome from './rider/RiderHome'
import RiderDeliveries from './rider/RiderDeliveries'
import RiderHistory from './rider/RiderHistory'
import RiderProfile from './rider/RiderProfile'
import RiderMap from './rider/RiderMap'
import RiderNotifications from './rider/RiderNotifications'
import { NavButton } from './ui'

const RiderDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rider, setRider] = useState(null)
  const [riderLoading, setRiderLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)
  const [availableDeliveries, setAvailableDeliveries] = useState(0)
  const [activeDelivery, setActiveDelivery] = useState(null)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'rider') {
      navigate('/login', { replace: true })
      return
    }
    fetchRiderData()
    fetchAvailableDeliveries()
    fetchNotificationCount()
  }, [user, navigate])

  // Prevent back button after logout
  useEffect(() => {
    const handlePopState = () => {
      if (!user || user.role !== 'rider') {
        navigate('/login', { replace: true })
      }
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [user, navigate])

  const fetchRiderData = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.log('No authentication token found, using fallback rider data')
        setRider({
          id: 1,
          name: user?.name || 'Test Rider',
          email: user?.email || 'rider@test.com',
          phone: '+251912345678',
          vehicle_type: 'Bike',
          is_online: false,
          status: 'available',
          current_location: {
            lat: 9.0192,
            lng: 38.7525
          }
        })
        return
      }
      
      const response = await axios.get(`${backendUrl}/rider/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 3000
      })
      
      if (response.data.data) {
        setRider(response.data.data)
        setIsOnline(response.data.data.is_online || false)
      }
    } catch (error) {
      console.log('Using fallback rider data due to API error:', error.response?.status || error.message)
      // Set mock rider data as fallback
      setRider({
        id: 1,
        name: user?.name || 'Test Rider',
        email: user?.email || 'rider@test.com',
        phone: '+251912345678',
        vehicle_type: 'Bike',
        is_online: false,
        status: 'available',
        current_location: {
          lat: 9.0192,
          lng: 38.7525
        }
      })
    } finally {
      setRiderLoading(false)
    }
  }

  const fetchAvailableDeliveries = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/deliveries/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 3000
      })
      
      if (response.data.success) {
        setAvailableDeliveries(response.data.data.length || 0)
      }
    } catch (error) {
      console.log('Using fallback available deliveries due to API error:', error.response?.status || error.message)
      setAvailableDeliveries(0)
    }
  }

  const fetchNotificationCount = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/rider/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 3000
      })
      
      if (response.data.success) {
        const notifications = response.data.data.data || []
        setUnreadNotifications(notifications.filter(n => !n.is_read).length)
      }
    } catch (error) {
      console.log('Using fallback notification count due to API error:', error.response?.status || error.message)
      setUnreadNotifications(0)
    }
  }

  const toggleOnlineStatus = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.log('No authentication token found, toggling status locally')
        setIsOnline(!isOnline)
        return
      }
      
      const response = await axios.put(`${backendUrl}/rider/toggle-status`, {
        is_online: !isOnline
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 3000
      })
      
      if (response.data.success) {
        setIsOnline(!isOnline)
        if (!isOnline) {
          fetchAvailableDeliveries()
        }
      }
    } catch (error) {
      console.log('Toggling status locally due to API error:', error.response?.status || error.message)
      // Toggle locally as fallback
      setIsOnline(!isOnline)
    }
  }

  const menuItems = [
    { 
      id: 'home', 
      name: 'Dashboard', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      badge: null 
    },
    { 
      id: 'deliveries', 
      name: 'Deliveries', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>,
      badge: availableDeliveries > 0 ? availableDeliveries : null 
    },
    { 
      id: 'map', 
      name: 'Live Map', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>,
      badge: null 
    },
    { 
      id: 'history', 
      name: 'Order History', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      badge: null 
    },
    { 
      id: 'notifications', 
      name: 'Notifications', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>,
      badge: unreadNotifications > 0 ? unreadNotifications : null 
    },
    { 
      id: 'profile', 
      name: 'Profile & Settings', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      badge: null 
    },
  ]

  const getStatusColor = (status) => {
    const colors = {
      'available': 'bg-green-100 text-green-800 border-green-300',
      'busy': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'offline': 'bg-gray-100 text-gray-800 border-gray-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <RiderHome isOnline={isOnline} toggleOnlineStatus={toggleOnlineStatus} />
      case 'deliveries':
        return <RiderDeliveries isOnline={isOnline} />
      case 'map':
        return <RiderMap />
      case 'history':
        return <RiderHistory />
      case 'notifications':
        return <RiderNotifications />
      case 'profile':
        return <RiderProfile />
      default:
        return <RiderHome isOnline={isOnline} toggleOnlineStatus={toggleOnlineStatus} />
    }
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden relative">
      {riderLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading rider dashboard...</p>
          </div>
        </div>
      ) : null}

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-red-200 to-red-300 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-r from-red-200 to-pink-300 rounded-full blur-3xl opacity-20 animate-pulse-slower"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-red-200 to-red-400 rounded-full blur-3xl opacity-15 animate-float"></div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-gradient-to-b from-white to-gray-50 shadow-2xl fixed h-full border-r border-gray-100 z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full overflow-y-auto pb-6">
          <div className="p-6">
            {/* Logo & Rider Name */}
            <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                {riderLoading ? (
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-20"></div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl font-bold text-gray-900">
                      {rider?.name || user?.name || 'Rider'}
                    </h1>
                    <p className="text-xs text-gray-600 font-medium">Delivery Rider</p>
                  </>
                )}
              </div>
            </div>

            {/* Online/Offline Toggle */}
            <div className="mb-6">
              <button
                onClick={toggleOnlineStatus}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg ${
                  isOnline
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  {isOnline ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  )}
                </svg>
                <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
              </button>
            </div>

            {/* Rider Status Badge */}
            {rider && !riderLoading && (
              <div className="mb-6 flex items-center justify-between">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(rider.status)}`}>
                  {rider.status === 'available' && '✔ '}
                  {rider.status === 'busy' && '⏳ '}
                  {rider.status === 'offline' && '⭕ '}
                  {rider.status?.toUpperCase()}
                </span>
                {rider.vehicle_type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    🚴 {rider.vehicle_type}
                  </span>
                )}
              </div>
            )}

            {/* Navigation */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <NavButton
                  key={item.id}
                  active={activeTab === item.id}
                  icon={item.icon}
                  badge={item.badge}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                    if (item.id === 'deliveries') fetchAvailableDeliveries()
                    if (item.id === 'notifications') fetchNotificationCount()
                  }}
                >
                  {item.name}
                </NavButton>
              ))}

              {/* Divider */}
              <div className="pt-4 pb-2">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
              
              <NavButton
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>}
                onClick={() => setShowLogoutModal(true)}
                className="text-red-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600"
              >
                Logout
              </NavButton>
            </nav>

            {/* Bottom Card */}
            <div className="mt-8 p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Rider Rating</p>
                  <p className="text-xs text-gray-600">4.8/5.0 ⭐</p>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                Keep up the great work!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:ml-64 flex-1 relative z-10">
        <div className="p-4 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in ml-12 lg:ml-0">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 animate-slide-in-left">
                Welcome, <span className="text-red-600 animate-pulse">{rider?.name || user?.name || 'Rider'}!</span>
              </h2>
              <p className="text-gray-500 mt-1 animate-slide-in-left animation-delay-100 text-sm sm:text-base">
                {isOnline ? '🟢 You are online and ready for deliveries' : '🔴 You are offline - go online to receive orders'}
              </p>
            </div>
            <div className="flex items-center space-x-3 animate-slide-in-right">
              <NotificationBell />
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">{user?.email}</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 hover:scale-110 animate-bounce-in">
                <span className="text-white font-bold text-base sm:text-lg">{user?.name?.charAt(0) || 'R'}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={() => {
          setShowLogoutModal(false)
          logout()
        }}
        onCancel={() => setShowLogoutModal(false)}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
          animation-fill-mode: both;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  )
}

export default RiderDashboard