import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { FaSearch, FaMapMarkerAlt, FaStar, FaFilter, FaClock, FaFire, FaChevronLeft, FaChevronRight, FaBell, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import LogoutConfirmModal from './LogoutConfirmModal'
import { getRestaurantImage, getRestaurantThumbnail } from '../utils/imageHelpers'
import axios from 'axios'

const Home = () => {
  const { user, logout, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [restaurants, setRestaurants] = useState([])
  const [categories, setCategories] = useState([])
  const [popularItems, setPopularItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Slideshow images using pp, ppi.jpeg, and whisk images
  const slideImages = [
    {
      src: '/pp.jpeg',
      title: 'Delicious Campus Food',
      subtitle: 'Fresh ingredients, amazing taste delivered to your dorm'
    },
    {
      src: '/ppi.jpeg',
      title: 'Fast Delivery Service',
      subtitle: 'Right to your dorm room in minutes'
    },
    {
      src: '/Whisk_1.jpeg',
      title: 'Freshly Prepared Meals',
      subtitle: 'Made with love by our campus chefs'
    },
    {
      src: '/Whisk_2.jpeg',
      title: 'Quality Ingredients',
      subtitle: 'Every dish crafted to perfection'
    },
    {
      src: '/pp.jpeg',
      title: 'Quality You Can Trust',
      subtitle: 'Premium meals from your favorite campus restaurants'
    },
    {
      src: '/ppi.jpeg',
      title: 'Order Anytime, Anywhere',
      subtitle: 'Easy ordering with just a few taps'
    }
  ]

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slideImages.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideImages.length) % slideImages.length)
  }

  const scrollToRestaurants = () => {
    const restaurantsSection = document.getElementById('nearby-restaurants')
    if (restaurantsSection) {
      restaurantsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId)
    // Small delay to ensure state update, then scroll to results
    setTimeout(() => {
      scrollToRestaurants()
    }, 100)
  }

  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Only redirect authenticated users with valid roles once when they first land on the home page
    if (user && !authLoading && !hasRedirected) {
      // Validate user object has required properties
      if (user.role && user.id) {
        if (user.role === 'admin') {
          setHasRedirected(true)
          navigate('/admin-dashboard')
          return
        } else if (user.role === 'restaurant') {
          setHasRedirected(true)
          navigate('/restaurant-dashboard')
          return
        } else if (user.role === 'rider') {
          setHasRedirected(true)
          navigate('/rider-dashboard')
          return
        }
      }
      setHasRedirected(true) // Mark as redirected for students or invalid users
    }
    
    // Only fetch data if not loading and not redirecting
    if (!authLoading) {
      fetchData()
    }
  }, [user, navigate, hasRedirected, authLoading])

  // Handle hash navigation to restaurants section
  useEffect(() => {
    if (window.location.hash === '#restaurants') {
      // Small delay to ensure the page is loaded
      setTimeout(() => {
        scrollToRestaurants()
      }, 100)
    }
  }, [])

  // Also handle hash changes during navigation
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#restaurants') {
        scrollToRestaurants()
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const fetchData = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
      
      // Fetch restaurants, categories, and popular items
      const [restaurantsRes, categoriesRes] = await Promise.all([
        axios.get(`${backendUrl}/api/restaurants`),
        axios.get(`${backendUrl}/api/categories`)
      ])

      if (restaurantsRes.data.data) {
        setRestaurants(restaurantsRes.data.data.slice(0, 8)) // Show first 8 restaurants
      }
      
      if (categoriesRes.data.data) {
        setCategories(categoriesRes.data.data.slice(0, 6)) // Show first 6 categories
      }

      // Mock popular items (you can replace with actual API call)
      setPopularItems([
        { id: 1, name: 'Signature Burger', price: 8.99, image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=300&fit=crop&q=80', restaurant: 'Campus Grill', rating: 4.8, orders: 150 },
        { id: 2, name: 'Margherita Pizza', price: 12.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop&q=80', restaurant: 'Pizza Corner', rating: 4.9, orders: 120 },
        { id: 3, name: 'Chicken Bowl', price: 9.99, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop&q=80', restaurant: 'Healthy Bites', rating: 4.7, orders: 98 },
        { id: 4, name: 'Breakfast Combo', price: 10.99, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=300&fit=crop&q=80', restaurant: 'Morning Cafe', rating: 4.6, orders: 85 }
      ])

      // Fetch unread notifications count if user is logged in
      if (user) {
        fetchUnreadCount()
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get restaurant logo from public folder
  const getRestaurantLogo = (restaurant) => {
    // Map restaurant names to logo files in public folder
    const logoMap = {
      'mekdi': '/mekdi.png',
      'burger house': '/Logo burgerhouse.jpg',
      'lindros kitchen': '/Branding design done for Lindros Kitchen • • • • • #accra #dbc #designsbychief #logos #logodesigns #accra #ghana #africa #africanbrand #designwithus #restaurant #food #dishes #healthyfood #maleownedbrand #branding #br.jpg',
      'restaurant 1': '/restaurant 1.jpg',
      'restaurant 2': '/restaurant 2.jpg',
      'restaurant 3': '/restaurant 3.jpg',
    }

    const restaurantName = restaurant.restaurant_name?.toLowerCase() || ''
    
    // Check if restaurant name matches any key in logoMap
    for (const [key, logo] of Object.entries(logoMap)) {
      if (restaurantName.includes(key)) {
        return logo
      }
    }
    
    // Fallback to backend image or default
    return getRestaurantThumbnail(restaurant)
  }

  // Get category icon based on category name
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'beverages': '🥤',
      'sandwiches & wraps': '🥪',
      'pizza': '🍕',
      'salads': '🥗',
      'snacks': '🍿',
      'desserts': '🍰',
      'burgers': '🍔',
      'pasta': '🍝',
      'chicken': '🍗',
      'seafood': '🦐',
      'vegetarian': '🥬',
      'breakfast': '🍳',
      'coffee': '☕',
      'ice cream': '🍦',
      'healthy': '🥙',
      'fast food': '🍟'
    }
    
    const categoryLower = categoryName.toLowerCase()
    
    // Find matching icon
    for (const [key, icon] of Object.entries(iconMap)) {
      if (categoryLower.includes(key) || key.includes(categoryLower)) {
        return icon
      }
    }
    
    return '🍽️' // Default icon
  }

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
      
      const response = await axios.get(`${backendUrl}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.data.success) {
        setUnreadCount(response.data.count || 0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
      // Set to 0 if there's an error
      setUnreadCount(0)
    }
  }

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000) // 30 seconds
      return () => clearInterval(interval)
    }
  }, [user])

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
    window.location.href = `${backendUrl}/api/auth/google`
  }

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.restaurant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
                           restaurant.category_id === selectedCategory ||
                           (restaurant.categories && restaurant.categories.some(cat => cat.id === selectedCategory))
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading delicious options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Mobile Optimized */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-base sm:text-xl md:text-2xl" style={{ filter: 'brightness(0) invert(1)' }}>🚴‍♀️</span>
              </div>
              <div>
                <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">UniBite</h1>
                <p className="text-[10px] sm:text-xs text-gray-600 hidden sm:block">Delivery to your campus</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              {user ? (
                <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
                  {/* Navigation Links - Mobile Optimized */}
                  <button 
                    onClick={scrollToRestaurants}
                    className="text-gray-700 hover:text-red-600 font-medium transition-colors flex items-center space-x-0.5 sm:space-x-1 p-1.5 sm:p-2"
                  >
                    <span className="text-base sm:text-lg md:text-base">🏪</span>
                    <span className="hidden sm:inline text-xs md:text-sm">Restaurants</span>
                  </button>
                  
                  <Link to="/orders" className="text-gray-700 hover:text-red-600 font-medium transition-colors flex items-center space-x-0.5 sm:space-x-1 p-1.5 sm:p-2">
                    <span className="text-base sm:text-lg md:text-base">📦</span>
                    <span className="hidden sm:inline text-xs md:text-sm">My Orders</span>
                  </Link>
                  
                  {/* Notification Bell */}
                  <Link to="/notifications" className="relative text-gray-700 hover:text-red-600 transition-colors p-1.5 sm:p-2">
                    <FaBell className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[9px] sm:text-[10px] md:text-xs rounded-full min-w-[16px] h-3.5 sm:min-w-[18px] sm:h-4 md:min-w-[20px] md:h-5 flex items-center justify-center px-0.5 sm:px-1 font-bold animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  
                  {/* User Dropdown Menu - Mobile Optimized */}
                  <div className="relative group">
                    <button className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-2 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50 transition-all duration-200 border border-transparent hover:border-red-200">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-[10px] sm:text-xs md:text-sm shadow-md">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden lg:inline text-xs md:text-sm font-medium text-gray-700">{user.name}</span>
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-gray-400 transition-transform duration-200 group-hover:rotate-180 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu - Mobile Optimized */}
                    <div className="absolute right-0 mt-2 w-52 sm:w-56 md:w-64 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1 z-50 overflow-hidden">
                      {/* Decorative gradient bar */}
                      <div className="h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                      
                      {/* User Info Section */}
                      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-red-50 to-red-50 border-b border-gray-100">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-[10px] sm:text-xs text-gray-600 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Language Switcher Section */}
                      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100">
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-2">Language</p>
                        <LanguageSwitcher />
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        <Link 
                          to="/profile" 
                          className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-red-50 transition-colors group/item"
                        >
                          <span className="text-base sm:text-lg">👤</span>
                          <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover/item:text-red-600">My Profile</span>
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                      
                      {/* Logout Section */}
                      <div className="border-t border-gray-100">
                        <button 
                          onClick={() => setShowLogoutModal(true)}
                          className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-red-50 transition-colors group/logout"
                        >
                          <FaSignOutAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                          <span className="text-xs sm:text-sm font-medium text-red-600">Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <LanguageSwitcher variant="compact" />
                  <Link to="/restaurant-registration" className="text-gray-700 hover:text-red-600 font-medium transition-colors hidden md:inline text-xs md:text-sm">
                    🏪 Partner with Us
                  </Link>
                  <Link to="/login" className="text-gray-700 hover:text-red-600 font-medium transition-colors text-xs sm:text-sm md:text-base">
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md text-xs sm:text-sm md:text-base"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Slideshow - Mobile Optimized */}
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-screen overflow-hidden">
        {/* Background Slideshow */}
        <div className="absolute inset-0">
          {slideImages.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url('${slide.src}')`
                }}
              />
            </div>
          ))}
        </div>

        {/* Slideshow Controls - Mobile Optimized */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-3 md:left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm text-white p-1.5 sm:p-2 md:p-3 rounded-full hover:bg-white/30 transition-all shadow-lg"
        >
          <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-3 md:right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm text-white p-1.5 sm:p-2 md:p-3 rounded-full hover:bg-white/30 transition-all shadow-lg"
        >
          <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6" />
        </button>

        {/* Slide Indicators - Mobile Optimized */}
        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1.5 sm:space-x-2 md:space-x-3">
          {slideImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full transition-all shadow-lg ${
                index === currentSlide ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Hero Content - Mobile Optimized */}
        <div className="relative z-10 h-full flex items-center justify-center px-3 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight drop-shadow-2xl px-2">
                {slideImages[currentSlide].title}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 mb-4 sm:mb-6 md:mb-8 max-w-3xl mx-auto drop-shadow-lg font-light px-3 sm:px-4">
                {slideImages[currentSlide].subtitle}
              </p>
            </div>
            
            {/* Search Bar - Mobile Optimized */}
            <div className="max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 px-3 sm:px-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for food or restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 md:pl-12 pr-20 sm:pr-24 md:pr-28 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base border-0 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500/50 shadow-xl bg-white/95 backdrop-blur-sm placeholder-gray-500"
                />
                <div className="absolute inset-y-0 right-0 pr-1 sm:pr-1.5 md:pr-2 flex items-center">
                  <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-md sm:rounded-lg font-semibold text-xs sm:text-sm hover:from-red-600 hover:to-red-700 transition-all shadow-lg">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Location - Mobile Optimized */}
            <div className="flex items-center justify-center text-white/90 mb-4 sm:mb-6 md:mb-8 px-3 sm:px-4">
              <FaMapMarkerAlt className="mr-1.5 sm:mr-2 text-red-400 text-xs sm:text-sm md:text-base" />
              <span className="text-xs sm:text-sm md:text-base font-medium">
                Delivering to: <strong className="text-red-300">Campus Dormitories</strong>
              </span>
            </div>

            {/* CTA Buttons - Hidden on Mobile, Visible on Desktop */}
            <div className="hidden sm:flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4">
              {!user ? (
                <>
                  <Link 
                    to="/register"
                    className="inline-flex items-center justify-center bg-white text-red-600 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base hover:bg-red-50 transition-all shadow-xl transform hover:scale-105"
                  >
                    Order Now - Sign Up Free
                  </Link>
                  <Link 
                    to="/login"
                    className="inline-flex items-center justify-center bg-red-600/90 backdrop-blur-sm text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base hover:bg-red-700/90 transition-all shadow-xl border-2 border-white/20 transform hover:scale-105"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <Link 
                  to="/menu"
                  className="inline-flex items-center justify-center bg-white text-red-600 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base hover:bg-red-50 transition-all shadow-xl transform hover:scale-105"
                >
                  Browse Menu
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* Restaurant Slideshow - Mobile Optimized */}
      <section className="py-6 sm:py-8 md:py-16 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Horizontal Restaurant Slideshow */}
          <div className="relative">
            {/* Slideshow Container */}
            <div className="overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-white p-3 sm:p-6 md:p-12 shadow-sm border border-gray-100">
              <div className="flex animate-slide-infinite space-x-4 sm:space-x-8 md:space-x-16">
                {/* First set of restaurant logos */}
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div
                    key={`first-${num}`}
                    className="flex-shrink-0 p-1 sm:p-2 md:p-4 hover:scale-110 transition-transform cursor-pointer"
                    onClick={() => {
                      navigate('/restaurants')
                    }}
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 bg-white rounded-full shadow-lg sm:shadow-xl hover:shadow-2xl transition-shadow p-1 sm:p-1 md:p-2">
                      <img 
                        src={`/Restaurant Logo ${num}.jpg`}
                        alt={`Restaurant ${num}`}
                        className="w-full h-full object-cover rounded-full border-2 border-gray-100 sm:border-2 md:border-4" 
                        onError={(e) => {
                          console.error(`Failed to load: /Restaurant Logo ${num}.jpg`)
                          e.target.src = 'https://via.placeholder.com/200?text=Restaurant'
                        }}
                      />
                    </div>
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div
                    key={`second-${num}`}
                    className="flex-shrink-0 p-1 sm:p-2 md:p-4 hover:scale-110 transition-transform cursor-pointer"
                    onClick={() => {
                      navigate('/restaurants')
                    }}
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 bg-white rounded-full shadow-lg sm:shadow-xl hover:shadow-2xl transition-shadow p-1 sm:p-1 md:p-2">
                      <img 
                        src={`/Restaurant Logo ${num}.jpg`}
                        alt={`Restaurant ${num}`}
                        className="w-full h-full object-cover rounded-full border-2 border-gray-100 sm:border-2 md:border-4"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200?text=Restaurant'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Category Filters Below Slideshow - Mobile Optimized */}
          <div className="mt-8 sm:mt-12 md:mt-20">
            <div className="text-center mb-6 sm:mb-8 md:mb-12 px-3 sm:px-4">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-xl md:rounded-2xl mb-3 sm:mb-4 md:mb-6 shadow-lg">
                <span className="text-xl sm:text-2xl md:text-3xl">🍽️</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 sm:mb-3 md:mb-4 tracking-tight">
                Filter by <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Category</span>
              </h3>
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-600 font-light mb-2">Find exactly what you're craving</p>
              <div className="w-12 sm:w-16 md:w-24 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto"></div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 max-w-5xl mx-auto px-3 sm:px-4">
              {/* All Categories Button */}
              <button
                onClick={() => handleCategoryFilter('all')}
                className={`group relative overflow-hidden px-3 sm:px-4 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl font-bold text-xs sm:text-sm md:text-base transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl shadow-red-500/30'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3">
                  <span className="text-base sm:text-lg md:text-xl">🍽️</span>
                  <span className="font-black tracking-wide">All</span>
                </div>
                {selectedCategory !== 'all' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg sm:rounded-xl md:rounded-2xl"></div>
                )}
              </button>

              {/* Category Buttons */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  className={`group relative overflow-hidden px-3 sm:px-4 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl font-bold text-xs sm:text-sm md:text-base transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl shadow-red-500/30'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 relative z-10">
                    <span className="text-base sm:text-lg md:text-xl">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full object-cover" />
                      ) : (
                        getCategoryIcon(category.name)
                      )}
                    </span>
                    <span className="font-black tracking-wide">{category.name}</span>
                  </div>
                  {selectedCategory !== category.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg sm:rounded-xl md:rounded-2xl"></div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Decorative Elements */}
            <div className="flex justify-center mt-4 sm:mt-6 md:mt-8 space-x-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Items */}
      <section className="py-8 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 px-4">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-lg">
              <span className="text-2xl sm:text-3xl">🔥</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3 sm:mb-4 tracking-tight">
              Popular <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">This Week</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light">Most ordered items by students</p>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto mt-3 sm:mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {popularItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="relative">
                  <img src={item.image} alt={item.name} className="w-full h-40 sm:h-48 object-cover" />
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                    🔥 {item.orders}+ orders
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{item.restaurant}</p>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center text-yellow-400 mr-2">
                      <FaStar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="ml-1 text-gray-700 font-semibold text-sm">{item.rating}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                      <FaClock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span>25-30 min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg sm:text-2xl font-bold text-red-600">{item.price} ETB</span>
                    <button 
                      onClick={() => {
                        if (user) {
                          // Navigate to restaurants page to find this item
                          navigate('/restaurants')
                        } else {
                          navigate('/login')
                        }
                      }}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all text-sm sm:text-base"
                    >
                      {user ? 'Order Now' : 'Login to Order'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Restaurants */}
      <section id="nearby-restaurants" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {filteredRestaurants.length} Restaurant{filteredRestaurants.length !== 1 ? 's' : ''} Available
              </h2>
              <p className="text-gray-600">Choose from our amazing selection of campus dining</p>
            </div>
            <Link 
              to="/restaurants" 
              className="hidden sm:flex items-center space-x-2 text-red-600 hover:text-red-700 font-semibold bg-red-50 hover:bg-red-100 px-6 py-3 rounded-xl transition-all"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Restaurant Image with Overlays */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={getRestaurantImage(restaurant)}
                    alt={restaurant.restaurant_name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  
                  {/* Open Now Badge - Top Right */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-lg">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      <span>Open Now</span>
                    </span>
                  </div>
                  
                  {/* Rating and Time Badges - Bottom Left */}
                  <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                    <div className="bg-white px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-md">
                      <FaStar className="w-3 h-3 text-yellow-500" />
                      <span className="text-sm font-bold text-gray-900">4.5</span>
                      <span className="text-xs text-gray-600">(120+)</span>
                    </div>
                    <div className="bg-white px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-md">
                      <FaClock className="w-3 h-3 text-gray-600" />
                      <span className="text-xs font-semibold text-gray-700">25-30 min</span>
                    </div>
                  </div>
                </div>
                
                {/* Restaurant Details */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-1.5">{restaurant.restaurant_name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-1">{restaurant.description || 'Delicious food awaits you!'}</p>
                  
                  {/* Location */}
                  <div className="flex items-start text-sm text-gray-500 mb-2">
                    <span className="mr-1.5 mt-0.5">📍</span>
                    <span className="line-clamp-1">{restaurant.address || 'in komolcha university'}</span>
                  </div>
                  
                  {/* Delivery Info */}
                  <div className="flex items-center text-sm mb-4">
                    <span className="mr-1.5">🚚</span>
                    <span className="text-green-600 font-semibold">Free delivery</span>
                    <span className="text-gray-400 mx-1.5">•</span>
                    <span className="text-gray-500">Min. 200 ETB</span>
                  </div>
                  
                  {/* View Menu Button */}
                  {user ? (
                    <Link 
                      to={`/restaurant/${restaurant.id}/menu`}
                      className="block w-full text-center bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md"
                    >
                      View Menu →
                    </Link>
                  ) : (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md"
                    >
                      View Menu →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredRestaurants.length === 0 && (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No restaurants found</h3>
              <p className="text-gray-600 mb-8">Try adjusting your search terms or check back later</p>
              <button
                onClick={() => setSearchQuery('')}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
              >
                Clear Search
              </button>
            </div>
          )}
          
          {/* Mobile View All Button */}
          <div className="flex sm:hidden justify-center mt-8">
            <Link 
              to="/restaurants" 
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-semibold bg-red-50 hover:bg-red-100 px-6 py-3 rounded-xl transition-all"
            >
              <span>View All Restaurants</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-red-500 to-red-600 py-8 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">Ready to Order?</h2>
          <p className="text-base sm:text-xl text-red-100 mb-6 sm:mb-8 px-4">Join thousands of students enjoying delicious campus delivery</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            {!user ? (
              <>
                <Link 
                  to="/register"
                  className="inline-flex items-center justify-center bg-white text-red-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-red-50 transition-all shadow-lg"
                >
                  Sign Up Free
                </Link>
                <Link 
                  to="/login"
                  className="inline-flex items-center justify-center bg-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-red-700 transition-all shadow-lg border-2 border-white/20"
                >
                  Login Now
                </Link>
              </>
            ) : (
              <Link 
                to="/menu"
                className="inline-flex items-center justify-center bg-white text-red-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-red-50 transition-all shadow-lg"
              >
                Browse Menu
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <span className="text-lg sm:text-xl">🍔</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">UniBite</h3>
              </div>
              <p className="text-gray-400 text-sm sm:text-base">Delicious food delivered to your campus doorstep</p>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/restaurants" className="hover:text-red-400 transition-colors text-sm sm:text-base">Restaurants</Link></li>
                <li><Link to="/menu" className="hover:text-red-400 transition-colors text-sm sm:text-base">Menu</Link></li>
                <li><Link to="/orders" className="hover:text-red-400 transition-colors text-sm sm:text-base">Track Order</Link></li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-red-400 transition-colors text-sm sm:text-base">Help Center</a></li>
                <li><Link to="/contact" className="hover:text-red-400 transition-colors text-sm sm:text-base">Contact Us</Link></li>
                <li><a href="#" className="hover:text-red-400 transition-colors text-sm sm:text-base">FAQs</a></li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Partner</h4>
              <ul className="space-y-2">
                <li><Link to="/restaurant-registration" className="hover:text-red-400 transition-colors text-sm sm:text-base">Join as Restaurant</Link></li>
                <li><a href="#" className="hover:text-red-400 transition-colors text-sm sm:text-base">Become a Rider</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
            <p className="text-gray-500 text-sm sm:text-base">© 2026 UniBite. All rights reserved.</p>
          </div>
        </div>
      </footer>

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

export default Home