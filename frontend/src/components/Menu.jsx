import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaStar, FaClock, FaMapMarkerAlt, FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { getRestaurantImage, getFoodImage } from '../utils/imageHelpers'
import axios from 'axios'

const Menu = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [showCartModal, setShowCartModal] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/login')
      return
    }
    
    if (id) {
      fetchRestaurantData()
    } else {
      // If no ID, redirect to restaurants page
      navigate('/restaurants')
    }
  }, [id, navigate, user])

  // Handle reorder items from navigation state
  useEffect(() => {
    if (location.state?.reorderItems && menuItems.length > 0) {
      const reorderItems = location.state.reorderItems
      
      // Map reorder items to cart format with full menu item data
      const cartItems = reorderItems.map(reorderItem => {
        const menuItem = menuItems.find(item => item.id === reorderItem.id)
        if (menuItem) {
          return {
            ...menuItem,
            quantity: reorderItem.quantity
          }
        }
        return null
      }).filter(item => item !== null)
      
      if (cartItems.length > 0) {
        setCart(cartItems)
        setShowCartModal(true)
        
        // Show success message
        setTimeout(() => {
          alert(`✅ ${cartItems.length} item(s) from your previous order have been added to your cart!`)
        }, 500)
      }
      
      // Clear the navigation state to prevent re-adding on refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, menuItems, navigate, location.pathname])

  const fetchRestaurantData = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
      
      // Fetch restaurant details and menu items
      const [restaurantRes, menuRes, catRes] = await Promise.all([
        axios.get(`${backendUrl}/api/restaurants/${id}`),
        axios.get(`${backendUrl}/api/restaurants/${id}/menu-items`),
        axios.get(`${backendUrl}/api/categories`)
      ])
      
      setRestaurant(restaurantRes.data.data)
      setMenuItems(menuRes.data.data || [])
      setCategories(catRes.data.data || [])
    } catch (error) {
      console.error('Error fetching restaurant data:', error)
      // If restaurant not found, redirect to restaurants page
      navigate('/restaurants')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item) => {
    console.log('Add to cart clicked for:', item.name)
    
    // Check if user is logged in
    if (!user) {
      alert('Please login to add items to cart')
      navigate('/login')
      return
    }
    
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    
    if (existingItem) {
      const updatedCart = cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      )
      setCart(updatedCart)
      console.log('Updated cart:', updatedCart)
    } else {
      const newCart = [...cart, { ...item, quantity: 1 }]
      setCart(newCart)
      console.log('New cart:', newCart)
    }
  }

  const removeFromCart = (itemId) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId)
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem => 
        cartItem.id === itemId 
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ))
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId))
    }
  }

  const getCartItemQuantity = (itemId) => {
    const item = cart.find(cartItem => cartItem.id === itemId)
    return item ? item.quantity : 0
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)
  }

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category_id === parseInt(selectedCategory))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🏪</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h2>
          <Link 
            to="/restaurants"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Compact on Mobile */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate('/#restaurants')}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">Back</span>
              </button>
              <div className="h-4 sm:h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-base sm:text-xl" style={{ filter: 'brightness(0) invert(1)' }}>🚴‍♀️</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">UniBite</h1>
                  <p className="text-xs text-gray-600">Delivery to your campus</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user && (
                <span className="text-gray-700 font-medium hidden md:inline">Welcome, {user.name}!</span>
              )}
              {cart.length > 0 && (
                <div className="relative">
                  <button 
                    onClick={() => setShowCartModal(true)}
                    className="flex items-center space-x-1 sm:space-x-2 bg-orange-500 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    <FaShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-semibold text-xs sm:text-base">{getCartTotal()} ETB</span>
                  </button>
                  <span className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Restaurant Info - Compact on Mobile */}
      <section className="bg-gradient-to-br from-orange-50 via-red-50/30 to-orange-50 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 sm:space-y-6 md:space-y-0 md:space-x-8">
            <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-4xl sm:text-6xl shadow-lg overflow-hidden">
              <img 
                src={getRestaurantImage(restaurant)}
                alt={restaurant.restaurant_name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">{restaurant.restaurant_name}</h1>
              <p className="text-sm sm:text-lg text-gray-600 mb-3 sm:mb-4">{restaurant.description || 'Delicious food awaits you!'}</p>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center text-yellow-400">
                  <FaStar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="text-gray-700 font-semibold">4.5 (120+)</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <FaClock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>25-30 min</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">{restaurant.address || 'Campus Location'}</span>
                  <span className="sm:hidden">Campus</span>
                </div>
                <div className="bg-green-100 text-green-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold text-xs">
                  🟢 Open
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Categories - Scrollable on Mobile */}
      <section className="py-4 sm:py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all whitespace-nowrap text-xs sm:text-base ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({menuItems.length})
            </button>
            {categories.map((category) => {
              const categoryItemCount = menuItems.filter(item => item.category_id === category.id).length
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id.toString())}
                  className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all whitespace-nowrap text-xs sm:text-base ${
                    selectedCategory === category.id.toString()
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({categoryItemCount})
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Menu Items - Single Column on Mobile */}
      <section className="py-6 sm:py-16 bg-white pb-32">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map((item) => {
              const quantity = getCartItemQuantity(item.id)
              return (
                <div key={item.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-gray-100">
                  <div className="relative h-40 sm:h-48 bg-gradient-to-br from-orange-100 to-red-100">
                    <img 
                      src={getFoodImage(item)}
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                    {item.is_available ? (
                      <span className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-green-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold">
                        Available
                      </span>
                    ) : (
                      <span className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold">
                        Sold Out
                      </span>
                    )}
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 sm:mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{item.description || 'Delicious and fresh!'}</p>
                    
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <span className="text-xl sm:text-2xl font-bold text-orange-600">{item.price} ETB</span>
                      <div className="flex items-center text-yellow-400">
                        <FaStar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="ml-1 text-gray-700 font-semibold text-sm">4.5</span>
                      </div>
                    </div>
                    
                    {item.is_available ? (
                      quantity > 0 ? (
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="bg-gray-200 text-gray-700 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <FaMinus className="w-3 h-3" />
                          </button>
                          <span className="text-base sm:text-lg font-bold text-gray-900">{quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-orange-500 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                          >
                            <FaPlus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-orange-600 hover:to-red-600 transition-all shadow-md transform hover:scale-105"
                        >
                          Add to Cart
                        </button>
                      )
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base cursor-not-allowed"
                      >
                        Sold Out
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12 sm:py-20">
              <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🍽️</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">No items found</h3>
              <p className="text-gray-600 text-sm sm:text-base">Try selecting a different category</p>
            </div>
          )}
        </div>
      </section>

      {/* Cart Summary (Fixed Bottom) - Compact on Mobile */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-lg z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">
                {cart.reduce((total, item) => total + item.quantity, 0)} items
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{getCartTotal()} ETB</p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowCartModal(true)}
                className="bg-gray-100 text-gray-700 px-3 sm:px-6 py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg hover:bg-gray-200 transition-all"
              >
                <span className="hidden sm:inline">View Cart</span>
                <span className="sm:hidden">View</span>
              </button>
              <button 
                onClick={() => navigate('/checkout', { state: { cart, restaurant } })}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-8 py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
              >
                <span className="hidden sm:inline">Proceed to Checkout</span>
                <span className="sm:hidden">Checkout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 sm:p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Your Cart</h2>
                <p className="text-sm text-white/90">{cart.reduce((total, item) => total + item.quantity, 0)} items</p>
              </div>
              <button
                onClick={() => setShowCartModal(false)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 bg-gray-50 rounded-xl p-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={getFoodImage(item)}
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.price} ETB each</p>
                      <p className="text-lg font-bold text-orange-600">{(item.price * item.quantity).toFixed(2)} ETB</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <FaMinus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                      >
                        <FaPlus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-700">Total</span>
                <span className="text-2xl font-bold text-gray-900">{getCartTotal()} ETB</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCartModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => {
                    setShowCartModal(false)
                    navigate('/checkout', { state: { cart, restaurant } })
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Menu