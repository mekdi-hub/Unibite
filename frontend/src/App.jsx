import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { checkAndClearOldCache } from './utils/cacheCleaner'
import './styles/mobile.css'

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Loading...</p>
    </div>
  </div>
)

// Eager load critical pages (shown immediately on app load)
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'

// Lazy load all other pages (loaded on demand)
const Dashboard = lazy(() => import('./components/Dashboard'))
const ForgotPassword = lazy(() => import('./components/ForgotPassword'))
const ResetPassword = lazy(() => import('./components/ResetPassword'))
const GoogleCallback = lazy(() => import('./components/GoogleCallback'))
const Menu = lazy(() => import('./components/Menu'))
const Restaurants = lazy(() => import('./components/Restaurants'))
const Orders = lazy(() => import('./components/Orders'))
const Checkout = lazy(() => import('./components/Checkout'))
const PaymentCallback = lazy(() => import('./components/PaymentCallback'))
const RiderDashboard = lazy(() => import('./components/RiderDashboard'))
const RestaurantDashboard = lazy(() => import('./components/RestaurantDashboard'))
const Users = lazy(() => import('./components/Users'))
const RestaurantRegistration = lazy(() => import('./components/RestaurantRegistration'))
const NotificationsRouter = lazy(() => import('./components/NotificationsRouter'))
const AdminRestaurants = lazy(() => import('./components/AdminRestaurants'))
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const AdminRiders = lazy(() => import('./components/AdminRiders'))
const Profile = lazy(() => import('./components/Profile'))
const Reports = lazy(() => import('./components/Reports'))
const Settings = lazy(() => import('./components/Settings'))
const PWAInstallPrompt = lazy(() => import('./components/PWAInstallPrompt'))
const ContactUs = lazy(() => import('./components/ContactUs'))

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  // Clear old caches on app load
  useEffect(() => {
    checkAndClearOldCache();
  }, []);

  return (
    <SettingsProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <div className="min-h-screen bg-gray-100">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/rider-dashboard" element={<RiderDashboard />} />
            <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
            <Route path="/restaurant-registration" element={<RestaurantRegistration />} />
            <Route path="/notifications" element={<NotificationsRouter />} />
            <Route path="/users" element={<Users />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/restaurants" element={<AdminRestaurants />} />
            <Route path="/admin/riders" element={<AdminRiders />} />
            <Route path="/restaurant/:id" element={<Menu />} />
            <Route path="/restaurant/:id/menu" element={<Menu />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/contact" element={<ContactUs />} />
            </Routes>
            <Suspense fallback={null}>
              <PWAInstallPrompt />
            </Suspense>
          </Suspense>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  </LanguageProvider>
  </SettingsProvider>
  )
}

export default App