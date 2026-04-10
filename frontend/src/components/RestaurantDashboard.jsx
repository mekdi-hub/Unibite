import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import LogoutConfirmModal from './LogoutConfirmModal'
import axios from 'axios'
import RestaurantHome from './restaurant/RestaurantHome'
import RestaurantOrders from './restaurant/RestaurantOrders'
import RestaurantMenu from './restaurant/RestaurantMenu'
import RestaurantNotifications from './restaurant/RestaurantNotifications'
import RestaurantProfile from './restaurant/RestaurantProfile'
import { NavButton } from './ui'

const RestaurantDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [restaurant, setRestaurant] = useState(null)
  const [restaurantLoading, setRestaurantLoading] = useState(true)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    if (user.role !== 'restaurant') {
      navigate('/', { replace: true })
      return
    }
    fetchRestaurantData()
    fetchNotificationCount()
    fetchPendingOrders()
  }, [user, navigate])

  // Prevent back button after logout
  useEffect(() => {
    const handlePopState = () => {
      if (!user || user.role !== 'restaurant') {
        navigate('/login', { replace: true })
      }
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [user, navigate])

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchPendingOrders()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'orders') {
      const interval = setInterval(() => {
        fetchPendingOrders()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [activeTab])

  const fetchRestaurantData = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/api/my-restaurant`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      })
      
      if (response.data.data) {
        setRestaurant(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error)
      setRestaurant(null)
    } finally {
      setRestaurantLoading(false)
    }
  }

  const fetchNotificationCount = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/api/restaurant/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      })
      
      if (response.data.success) {
        const notifications = response.data.data.data || []
        setUnreadNotifications(notifications.filter(n => !n.is_read && !n.read_at).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setUnreadNotifications(0)
    }
  }

  const fetchPendingOrders = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/api/restaurant/orders?status=pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      })
      
      if (response.data.success) {
        setPendingOrders(response.data.data.data?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error)
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
      id: 'orders', 
      name: 'Orders', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>,
      badge: pendingOrders > 0 ? pendingOrders : null 
    },
    { 
      id: 'menu', 
      name: 'Menu Management', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
      'approved': 'bg-green-100 text-green-800 border-green-300',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'rejected': 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <RestaurantHome />
      case 'orders':
        return <RestaurantOrders onOrderUpdate={fetchPendingOrders} />
      case 'menu':
        return <RestaurantMenu />
      case 'notifications':
        return <RestaurantNotifications />
      case 'profile':
        return <RestaurantProfile />
      default:
        return <RestaurantHome />
    }
  }

  if (!user || user.role !== 'restaurant') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden relative">
      {restaurantLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
            {/* Logo & Restaurant Name */}
            <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                {restaurantLoading ? (
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-20"></div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl font-bold text-gray-900">
                      {restaurant?.restaurant_name || 'Restaurant'}
                    </h1>
                    <p className="text-xs text-gray-600 font-medium">Restaurant Dashboard</p>
                  </>
                )}
              </div>
            </div>

            {/* Restaurant Status Badge */}
            {restaurant && !restaurantLoading && (
              <div className="mb-6 flex items-center justify-between">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(restaurant.status)}`}>
                  {restaurant.status === 'approved' && '✓ '}
                  {restaurant.status === 'pending' && '⏳ '}
                  {restaurant.status === 'rejected' && '✗ '}
                  {restaurant.status?.toUpperCase()}
                </span>
                {restaurant.is_open !== undefined && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    restaurant.is_open 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {restaurant.is_open ? '🟢 Open' : '🔴 Closed'}
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
                    if (item.id === 'notifications') fetchNotificationCount()
                    if (item.id === 'orders') fetchPendingOrders()
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
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Premium Plan</p>
                  <p className="text-xs text-gray-600">Upgrade now</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="w-full mt-2 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Upgrade
              </button>
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
                Welcome, <span className="text-red-600 animate-pulse">{restaurant?.restaurant_name || user?.name || 'Restaurant'}!</span>
              </h2>
              <p className="text-gray-500 mt-1 animate-slide-in-left animation-delay-100 text-sm sm:text-base">Manage your restaurant operations below.</p>
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

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
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
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
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
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
          animation-fill-mode: both;
        }
      `}</style>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={() => {
          setShowLogoutModal(false)
          logout()
        }}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUpgradeModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-1">Upgrade to Premium</h2>
                  <p className="text-orange-100 text-sm">Unlock powerful features to grow your restaurant</p>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Basic Plan */}
                <div className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Basic</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-1">Free</div>
                    <p className="text-sm text-gray-600">Current Plan</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Up to 50 orders/month</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Basic analytics</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Email support</span>
                    </li>
                  </ul>
                  <button disabled className="w-full py-3 bg-gray-200 text-gray-500 rounded-lg font-semibold cursor-not-allowed">
                    Current Plan
                  </button>
                </div>

                {/* Pro Plan */}
                <div className="border-2 border-orange-500 rounded-xl p-6 relative hover:shadow-xl transition-all transform hover:scale-105">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                      POPULAR
                    </span>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                    <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
                      2,500 <span className="text-lg">ETB</span>
                    </div>
                    <p className="text-sm text-gray-600">per month</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Unlimited orders</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Advanced analytics</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Priority support</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Custom branding</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Marketing tools</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => {
                      alert('Pro plan upgrade coming soon! Contact support for early access.')
                      setShowUpgradeModal(false)
                    }}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                  >
                    Upgrade to Pro
                  </button>
                </div>

                {/* Enterprise Plan */}
                <div className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-1">Custom</div>
                    <p className="text-sm text-gray-600">Contact us</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Everything in Pro</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Multiple locations</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Dedicated account manager</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">API access</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">Custom integrations</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => {
                      alert('Contact us at support@unibite.com for enterprise pricing')
                      setShowUpgradeModal(false)
                    }}
                    className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-all"
                  >
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurantDashboard
