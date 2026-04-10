import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import LogoutConfirmModal from './LogoutConfirmModal'

const StudentLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const isActive = (path) => location.pathname === path
       
  return (
    <div className="min-h-screen bg-white flex overflow-hidden relative">
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
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🚴‍♀️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">UniBite</h1>
              <p className="text-xs text-gray-600 font-medium">Food Delivery</p>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-2">
            <button
              onClick={() => {
                navigate('/')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                isActive('/')
                  ? 'bg-white text-gray-900 shadow-lg border-2 border-orange-500 transform scale-105'
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50 hover:translate-x-1'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/restaurants')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                isActive('/restaurants')
                  ? 'bg-white text-gray-900 shadow-lg border-2 border-orange-500 transform scale-105'
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50 hover:translate-x-1'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Restaurants</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/orders')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                isActive('/orders')
                  ? 'bg-white text-gray-900 shadow-lg border-2 border-orange-500 transform scale-105'
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50 hover:translate-x-1'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>My Orders</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/notifications')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                isActive('/notifications')
                  ? 'bg-white text-gray-900 shadow-lg border-2 border-orange-500 transform scale-105'
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50 hover:translate-x-1'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Notifications</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/profile')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                isActive('/profile')
                  ? 'bg-white text-gray-900 shadow-lg border-2 border-orange-500 transform scale-105'
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50 hover:translate-x-1'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </button>

            {/* Divider */}
            <div className="pt-4 pb-2">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
            
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center space-x-3 px-4 py-3.5 text-red-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-xl font-medium transition-all hover:shadow-lg hover:translate-x-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:ml-64 flex-1 relative z-10">
        <div className="p-4 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in ml-12 lg:ml-0">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {title || 'Dashboard'}
              </h2>
              {subtitle && (
                <p className="text-gray-500 mt-1 text-sm sm:text-base">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <NotificationBell />
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">{user?.email}</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-md hover:shadow-xl transition-all duration-300 hover:scale-110">
                <span className="text-white font-bold text-base sm:text-lg">{user?.name?.charAt(0) || 'S'}</span>
              </div>
            </div>
          </div>

          {/* Page Content */}
          {children}
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

export default StudentLayout
