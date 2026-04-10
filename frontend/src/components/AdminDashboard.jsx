import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import LogoutConfirmModal from './LogoutConfirmModal'
import { NavButton, Button } from './ui'
import axios from 'axios'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRestaurants: 0,
    totalRiders: 0,
    totalOrders: 0,
    ordersToday: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeUsers: 0,
  })
  const [ordersPerDay, setOrdersPerDay] = useState([])
  const [revenuePerDay, setRevenuePerDay] = useState([])
  const [mostOrderedItems, setMostOrderedItems] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [pendingRestaurants, setPendingRestaurants] = useState([])
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login')
    } else {
      fetchDashboardData()
    }
  }, [user, navigate])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      
      console.log('Fetching dashboard data...')
      console.log('Backend URL:', backendUrl)
      console.log('Token:', token ? 'Present' : 'Missing')
      
      const response = await axios.get(`${backendUrl}/api/admin/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      console.log('Dashboard response:', response.data)

      if (response.data.success) {
        const data = response.data.data
        console.log('Stats:', data.stats)
        setStats(data.stats)
        setOrdersPerDay(data.ordersPerDay || [])
        setRevenuePerDay(data.revenuePerDay || [])
        setMostOrderedItems(data.mostOrderedItems || [])
        setRecentOrders(data.recentOrders || [])
      }

      // Fetch pending restaurants
      const pendingResponse = await axios.get(`${backendUrl}/api/admin/restaurants/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      console.log('Pending restaurants response:', pendingResponse.data)

      if (pendingResponse.data.success) {
        const pending = pendingResponse.data.data || []
        setPendingRestaurants(pending)
        setPendingCount(pending.length)
        console.log('Pending count set to:', pending.length)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden relative">
      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      ) : null}

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
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {user?.name || 'Admin'}
              </h1>
              <p className="text-xs text-gray-600 font-medium">System Administrator</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <NavButton
              active={true}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </NavButton>
            
            <NavButton
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>}
              onClick={() => navigate('/users')}
            >
              Users
            </NavButton>
            
            <NavButton
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>}
              badge={pendingCount > 0 ? pendingCount : null}
              onClick={() => navigate('/admin/restaurants')}
            >
              Restaurant
            </NavButton>
            
            <NavButton
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>}
              onClick={() => navigate('/rider-dashboard')}
            >
              Riders
            </NavButton>
            
            <NavButton
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>}
              onClick={() => navigate('/orders')}
            >
              Orders
            </NavButton>
            
            <NavButton
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>}
              onClick={() => navigate('/menu')}
            >
              Menu
            </NavButton>
            
            <NavButton
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>}
              onClick={() => navigate('/payments')}
            >
              Payments
            </NavButton>
            
            <NavButton
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>}
              onClick={() => navigate('/coupons')}
            >
              Coupons
            </NavButton>
            
            <NavButton
              icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>}
              onClick={() => navigate('/reviews')}
            >
              Reviews
            </NavButton>
            
            <NavButton
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>}
              onClick={() => navigate('/reports')}
            >
              Reports
            </NavButton>
            
            <NavButton
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>}
              onClick={() => navigate('/settings')}
            >
              Settings
            </NavButton>
            
            <NavButton
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>}
              onClick={() => navigate('/notifications')}
            >
              Notifications
            </NavButton>

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
                <p className="text-sm font-bold text-gray-800">Premium Plan</p>
                <p className="text-xs text-gray-600">Upgrade now</p>
              </div>
            </div>
            <Button size="sm" fullWidth>
              Upgrade
            </Button>
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
                Welcome, <span className="text-red-500 animate-pulse">{user?.name || 'Admin'}!</span>
              </h2>
              <p className="text-gray-500 mt-1 animate-slide-in-left animation-delay-100 text-sm sm:text-base">Manage your platform operations below.</p>
            </div>
            <div className="flex items-center space-x-3 animate-slide-in-right">
              {/* Notification Bell */}
              <NotificationBell />
              
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">{user?.email}</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 hover:scale-110 animate-bounce-in">
                <span className="text-white font-bold text-base sm:text-lg">{user?.name?.charAt(0) || 'A'}</span>
              </div>
            </div>
          </div>

          <style>{`
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

          {/* Comprehensive Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {/* Total Students */}
            <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Total Students</p>
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                    {stats.totalStudents}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Restaurants */}
            <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Total Restaurants</p>
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                    {stats.totalRestaurants}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Riders */}
            <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Total Riders</p>
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                    {stats.totalRiders}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Total Orders</p>
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Orders Today */}
            <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Orders Today</p>
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                    {stats.ordersToday}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Total Revenue</p>
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                    ${(stats.totalRevenue / 1000).toFixed(1)}k
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Pending Orders</p>
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                    {stats.pendingOrders}
                  </p>
                  <p className="text-xs text-red-500 font-semibold mt-1">Needs attention</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Active Users</p>
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                    {stats.activeUsers}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Restaurant Registrations Alert */}
          {pendingCount > 0 ? (
            <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-6 shadow-lg animate-slide-up">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                    <span className="text-3xl">🏪</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {pendingCount} New Restaurant Registration{pendingCount > 1 ? 's' : ''}!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {pendingCount === 1 
                        ? 'A new restaurant is waiting for your approval.' 
                        : `${pendingCount} restaurants are waiting for your approval.`}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/admin/restaurants')}
                  className="whitespace-nowrap"
                >
                  Review Now →
                </Button>
              </div>

              {/* Restaurant Cards with Menu Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRestaurants.slice(0, 6).map((restaurant) => {
                  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
                  let menuImages = []
                  try {
                    menuImages = restaurant.menu_images ? JSON.parse(restaurant.menu_images) : []
                  } catch (e) {
                    console.error('Error parsing menu images:', e)
                  }

                  return (
                    <div key={restaurant.id} className="bg-white rounded-xl shadow-md border border-red-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      {/* Restaurant Header */}
                      <div className="p-4 bg-gradient-to-r from-red-100 to-red-200">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🍽️</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">{restaurant.restaurant_name}</h4>
                            <p className="text-sm text-gray-600">{restaurant.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Images */}
                      {menuImages.length > 0 ? (
                        <div className="p-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Menu Images:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {menuImages.slice(0, 4).map((imagePath, idx) => (
                              <div key={idx} className="relative group">
                                <img
                                  src={`${backendUrl}/storage/${imagePath}`}
                                  alt={`Menu ${idx + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/150?text=Menu+Image'
                                  }}
                                />
                                {idx === 3 && menuImages.length > 4 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">+{menuImages.length - 4}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <p className="text-sm text-gray-500 italic">No menu images uploaded</p>
                        </div>
                      )}

                      {/* Restaurant Info */}
                      <div className="px-4 pb-4 space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-2">📞</span>
                          <span>{restaurant.phone}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-2">⏰</span>
                          <span>{restaurant.opening_hours_text}</span>
                        </div>
                        {restaurant.food_categories && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {JSON.parse(restaurant.food_categories).slice(0, 3).map((category, idx) => (
                              <span key={idx} className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                                {category}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {pendingCount > 6 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/restaurants')}
                  >
                    View {pendingCount - 6} more pending restaurant{pendingCount - 6 > 1 ? 's' : ''} →
                  </Button>
                </div>
              )}
            </div>
          ) : null}

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {/* Orders per Day Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Orders per Day</h3>
                <span className="px-3 py-1 bg-red-100 text-red-600 text-xs sm:text-sm font-semibold rounded-full">
                  Last 7 Days
                </span>
              </div>
              
              {/* Simple Bar Chart */}
              <div className="space-y-4">
                {ordersPerDay.length > 0 ? (
                  ordersPerDay.map((day, idx) => {
                    const maxValue = Math.max(...ordersPerDay.map(d => d.count))
                    const percentage = (day.count / maxValue) * 100
                    const date = new Date(day.date)
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                    
                    return (
                      <div key={idx} className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-gray-600 w-12">{dayName}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-end pr-3 transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-white text-xs font-bold">{day.count}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-gray-500 py-8">No order data available</p>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-red-600">
                    {ordersPerDay.reduce((sum, day) => sum + day.count, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average/Day</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {ordersPerDay.length > 0 ? Math.round(ordersPerDay.reduce((sum, day) => sum + day.count, 0) / ordersPerDay.length) : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue Graph */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Revenue Graph</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs sm:text-sm font-semibold rounded-full">
                  This Week
                </span>
              </div>
              
              {/* Line Chart Visualization */}
              <div className="relative h-48 flex items-end justify-between space-x-2">
                {revenuePerDay.length > 0 ? (
                  revenuePerDay.map((day, idx) => {
                    const maxValue = Math.max(...revenuePerDay.map(d => parseFloat(d.revenue)))
                    const value = parseFloat(day.revenue)
                    const height = maxValue > 0 ? (value / maxValue) * 100 : 0
                    const date = new Date(day.date)
                    const dayLetter = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)
                    
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div className="relative w-full">
                          <div 
                            className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-1000 hover:from-blue-600 hover:to-blue-500 cursor-pointer group"
                            style={{ height: `${height * 1.5}px`, minHeight: '10px' }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              ${value.toFixed(0)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2 font-medium">
                          {dayLetter}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-gray-500 w-full py-8">No revenue data available</p>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${revenuePerDay.reduce((sum, day) => sum + parseFloat(day.revenue), 0).toFixed(1)}k
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Growth</p>
                  <p className="text-2xl font-bold text-green-600">+18%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Most Ordered Food & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Most Ordered Food */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Most Ordered Food</h3>
                <span className="px-3 py-1 bg-green-100 text-green-600 text-xs sm:text-sm font-semibold rounded-full">
                  Top 5
                </span>
              </div>
              
              <div className="space-y-4">
                {mostOrderedItems.length > 0 ? (
                  mostOrderedItems.map((food, idx) => {
                    const colors = ['orange', 'red', 'green', 'yellow', 'purple']
                    const emojis = ['🍔', '🍕', '🥗', '🍗', '🍝']
                    const color = colors[idx] || 'gray'
                    const emoji = emojis[idx] || '🍽️'
                    const maxOrders = mostOrderedItems[0]?.total_orders || 1
                    
                    return (
                      <div key={idx} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-red-300 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className={`w-12 h-12 bg-gradient-to-br from-${color}-400 to-${color}-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                              <span className="text-2xl">{emoji}</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {idx + 1}
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{food.name}</p>
                            <p className="text-sm text-gray-500">{food.total_orders} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r from-${color}-400 to-${color}-600`}
                              style={{ width: `${(food.total_orders / maxOrders) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-gray-500 py-8">No order data available</p>
                )}
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Recent Orders</h3>
                <span className="px-3 py-1 bg-red-100 text-red-600 text-xs sm:text-sm font-semibold rounded-full">
                  Live
                </span>
              </div>
              
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.slice(0, 2).map((order, idx) => {
                    const statusColors = {
                      'pending': 'orange',
                      'preparing': 'blue',
                      'ready': 'green',
                      'completed': 'green',
                      'cancelled': 'red'
                    }
                    const color = statusColors[order.status] || 'gray'
                    const studentName = order.student?.name || 'Customer'
                    const restaurantName = order.restaurant?.name || 'Restaurant'
                    const timeAgo = new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    
                    return (
                      <div key={order.id} className={`group relative overflow-hidden bg-gradient-to-r from-${color}-50 to-white p-5 rounded-2xl border border-${color}-100 hover:border-${color}-300 hover:shadow-lg transition-all duration-300`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className={`w-14 h-14 bg-gradient-to-br from-${color}-400 to-${color}-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <span className="text-white font-bold text-lg">{studentName.charAt(0)}</span>
                              </div>
                              <div className={`absolute -top-1 -right-1 w-4 h-4 bg-${color === 'green' ? 'green' : 'blue'}-500 rounded-full border-2 border-white`}></div>
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-lg">{studentName}</p>
                              <p className="text-sm text-gray-500 font-medium">Order #{order.id}</p>
                              <p className="text-xs text-gray-400 mt-1">📍 {restaurantName} • {timeAgo}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-4 py-2 bg-gradient-to-r from-${color}-500 to-${color}-600 text-white text-sm font-bold rounded-full shadow-md capitalize`}>
                              {order.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-2">${parseFloat(order.total_amount || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-gray-500 py-8">No recent orders</p>
                )}
              </div>

              <Button 
                variant="secondary"
                fullWidth
                onClick={() => navigate('/orders')}
                className="mt-6"
              >
                View All Orders →
              </Button>
            </div>
          </div>
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
    </div>
  )
}

export default AdminDashboard
