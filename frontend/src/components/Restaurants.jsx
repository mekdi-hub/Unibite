import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaSearch, FaMapMarkerAlt, FaStar, FaFilter, FaClock, FaArrowLeft } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { getRestaurantImage } from '../utils/imageHelpers'
import axios from 'axios'

const Restaurants = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [filteredRestaurants, setFilteredRestaurants] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const response = await axios.get(`${backendUrl}/restaurants`)
      
      if (response.data.data) {
        // Only show approved/active restaurants to customers
        const approvedRestaurants = response.data.data.filter(restaurant => 
          restaurant.status === 'approved' || restaurant.status === 'active'
        )
        setRestaurants(approvedRestaurants)
        setFilteredRestaurants(approvedRestaurants)
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = restaurants

    if (searchQuery) {
      filtered = filtered.filter(restaurant =>
        restaurant.restaurant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredRestaurants(filtered)
  }, [searchQuery, restaurants])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading restaurants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl shadow-lg z-50 border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/')}
                className="group flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-all duration-300 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl"
              >
                <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-semibold">Back</span>
              </button>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-red-200 to-transparent"></div>
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="relative w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    UniBite
                  </h1>
                  <p className="text-xs text-gray-600 font-medium">Delivery to your campus</p>
                </div>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-red-50 to-red-50 px-4 py-2 rounded-xl border border-red-100">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-semibold">Welcome, {user.name}!</span>
                </div>
                <Link 
                  to="/orders" 
                  className="group flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <span>📦</span>
                  <span>My Orders</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-50 via-white to-red-50 py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/restaurant 1.jpg" 
            alt="Restaurant background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <span>🎉</span>
              <span>Free delivery on orders over 200 ETB</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl">
              All Campus
              <span className="block mt-2 bg-gradient-to-r from-red-400 via-red-400 to-red-400 bg-clip-text text-transparent">
                Restaurants
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
              Discover amazing food from all our partner restaurants around campus
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search for restaurants, cuisines, or dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 text-lg border-2 border-white/20 rounded-2xl focus:ring-4 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-2xl bg-white/95 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <FaMapMarkerAlt className="mr-2 text-red-400" />
                <span className="font-medium">Campus Wide Delivery</span>
              </div>
              <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <FaClock className="mr-2 text-red-400" />
                <span className="font-medium">25-30 min Average</span>
              </div>
              <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <FaStar className="mr-2 text-yellow-400" />
                <span className="font-medium">4.5+ Rated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {filteredRestaurants.length} Restaurant{filteredRestaurants.length !== 1 ? 's' : ''} Available
              </h2>
              <p className="text-gray-600">Choose from our amazing selection of campus dining</p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="group bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="relative h-56 bg-gradient-to-br from-red-100 to-red-100 overflow-hidden">
                  <img 
                    src={getRestaurantImage(restaurant)}
                    alt={restaurant.restaurant_name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                      🟢 Open Now
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <FaStar className="w-3.5 h-3.5 text-yellow-400 mr-1" />
                        <span className="text-sm font-bold text-gray-900">4.5</span>
                        <span className="text-xs text-gray-600 ml-1">(120+)</span>
                      </div>
                      <div className="flex items-center bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-gray-700">
                        <FaClock className="w-3 h-3 mr-1.5" />
                        <span className="font-medium">25-30 min</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-red-600 transition-colors">{restaurant.restaurant_name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{restaurant.description || 'Delicious food awaits you!'}</p>
                  
                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2 text-base">📍</span>
                      <span className="truncate">{restaurant.address || 'Campus Location'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="mr-2 text-base">🚚</span>
                      <span className="text-green-600 font-semibold">Free delivery</span>
                      <span className="text-gray-400 mx-1.5">•</span>
                      <span className="text-gray-500">Min. 200 ETB</span>
                    </div>
                  </div>
                  
                  {user ? (
                    <Link 
                      to={`/restaurant/${restaurant.id}/menu`}
                      className="block w-full text-center bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      View Menu →
                    </Link>
                  ) : (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-red-500 to-red-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Can't find what you're looking for?</h2>
          <p className="text-xl text-red-100 mb-8">Suggest a restaurant to join our platform</p>
          <Link 
            to="/restaurant-registration"
            className="inline-flex items-center justify-center bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-50 transition-all shadow-lg"
          >
            🏪 Partner with UniBite
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">UniBite</h3>
              </div>
              <p className="text-gray-400">Delicious food delivered to your campus doorstep</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-red-400 transition-colors">Home</Link></li>
                <li><Link to="/menu" className="hover:text-red-400 transition-colors">Menu</Link></li>
                <li><Link to="/orders" className="hover:text-red-400 transition-colors">Track Order</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-red-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Partner</h4>
              <ul className="space-y-2">
                <li><Link to="/restaurant-registration" className="hover:text-red-400 transition-colors">Join as Restaurant</Link></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Become a Rider</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-500">© 2026 UniBite. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Restaurants