import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaShoppingCart, FaMapMarkerAlt, FaCreditCard, FaCheckCircle, FaTrash } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { useSettings } from '../contexts/SettingsContext'
import { getRestaurantImage, getFoodImage } from '../utils/imageHelpers'
import axios from 'axios'

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { settings } = useSettings()
  
  const [cart, setCart] = useState([])
  const [restaurant, setRestaurant] = useState(null)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery')
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/login')
      return
    }
    
    // Get cart and restaurant data from navigation state
    if (location.state?.cart && location.state?.restaurant) {
      setCart(location.state.cart)
      setRestaurant(location.state.restaurant)
    } else {
      // If no cart data, redirect back
      navigate('/restaurants')
    }
  }, [location.state, navigate, user])

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)
  }

  const getDeliveryFee = () => {
    const subtotal = parseFloat(getCartTotal())
    const minOrderForFreeDelivery = 500
    const deliveryFee = parseFloat(settings.deliveryFee) || 50
    
    // Free delivery for orders above minimum, otherwise use settings delivery fee
    return subtotal >= minOrderForFreeDelivery ? 0 : deliveryFee
  }

  const getTax = () => {
    const subtotal = parseFloat(getCartTotal())
    const taxRate = parseFloat(settings.taxRate) || 15
    // Apply tax rate from settings
    return (subtotal * (taxRate / 100)).toFixed(2)
  }

  const getGrandTotal = () => {
    const subtotal = parseFloat(getCartTotal())
    const delivery = getDeliveryFee()
    const tax = parseFloat(getTax())
    return (subtotal + delivery + tax).toFixed(2)
  }

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId)
      return
    }
    setCart(cart.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ))
  }

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      alert('Please enter a delivery address')
      return
    }

    if (cart.length === 0) {
      alert('Your cart is empty')
      return
    }

    // Check minimum order amount
    const subtotal = parseFloat(getCartTotal())
    const minOrder = parseFloat(settings.minOrder) || 200
    if (subtotal < minOrder) {
      alert(`Minimum order amount is ${minOrder} ${settings.currency}. Your current order is ${subtotal} ${settings.currency}.`)
      return
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      alert('You are not logged in. Please login and try again.')
      navigate('/login')
      return
    }

    setLoading(true)

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'

      const orderData = {
        restaurant_id: restaurant.id,
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity
        }))
      }

      console.log('Placing order with data:', orderData)
      console.log('Backend URL:', backendUrl)
      console.log('Token present:', !!token)

      // For cash on delivery, use the old endpoint
      if (paymentMethod === 'cash_on_delivery') {
        const response = await axios.post(`${backendUrl}/api/orders`, orderData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        })

        console.log('Order response:', response.data)

        if (response.status === 201 || response.data.data) {
          setOrderPlaced(true)
          setTimeout(() => {
            navigate('/orders')
          }, 2000)
        }
      } else {
        // For other payment methods, use the new checkout flow
        console.log('Using new checkout flow for payment method:', paymentMethod)
        console.log('Order data being sent:', orderData)
        
        const response = await axios.post(`${backendUrl}/api/orders/checkout`, orderData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        })

        console.log('Checkout response:', response.data)

        if (response.status === 200 && response.data.data) {
          const checkoutData = response.data.data
          
          // Store checkout ID for later use (backup, URL param is primary)
          localStorage.setItem('checkout_id', checkoutData.checkout_id)
          console.log('✅ Stored checkout_id in localStorage:', checkoutData.checkout_id)
          
          // Redirect to payment URL (backend already includes checkout_id in callback URL)
          if (checkoutData.payment_url) {
            console.log('🚀 Redirecting to Chapa:', checkoutData.payment_url)
            window.location.href = checkoutData.payment_url
          } else {
            throw new Error('Payment URL not provided')
          }
        }
      }
    } catch (error) {
      console.error('Error placing order:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error headers:', error.response?.headers)
      console.error('Request config:', error.config)
      
      let errorMessage = 'Failed to place order. '
      
      // Check if it's a timeout error
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. The backend server might not be responding. Please try again later.'
        alert(errorMessage)
        setLoading(false)
        return
      }
      
      // Check if it's a network error
      if (error.message === 'Network Error' || !error.response) {
        errorMessage = 'Cannot connect to backend server. Please check your internet connection and try again.'
        alert(errorMessage)
        setLoading(false)
        return
      }
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.errors) {
        // Validation errors
        const errors = error.response.data.errors
        const errorList = Object.values(errors).flat().join(', ')
        errorMessage = `Validation error: ${errorList}`
      } else if (error.message) {
        errorMessage += error.message
      } else {
        errorMessage += 'Please try again.'
      }
      
      alert(errorMessage)
      setLoading(false)
    }
  }

  const initializeChapaPayment = async (orderId) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
      const token = localStorage.getItem('token')

      console.log('Initializing Chapa payment for order:', orderId)
      console.log('Backend URL:', backendUrl)
      console.log('User:', user)
      console.log('User phone from profile:', user.phone)

      // Format phone number for Chapa (Ethiopian format: 251XXXXXXXXX without +)
      let phoneNumber = '251911234567' // Default test phone number
      
      console.log('Phone number before formatting:', user.phone)
      
      // If phone exists, ensure it's in the correct format
      if (user.phone) {
        // Remove any spaces, dashes, or special characters including +
        let cleanPhone = user.phone.replace(/[\s\-\(\)\+]/g, '')
        
        console.log('Phone after removing special chars:', cleanPhone)
        
        // Check if it's an Ethiopian number
        // Ethiopian numbers: 0911234567 (10 digits starting with 0) or 911234567 (9 digits starting with 7 or 9)
        if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
          // Ethiopian format: 0911234567
          phoneNumber = '251' + cleanPhone.substring(1)
        } else if (cleanPhone.startsWith('251') && cleanPhone.length === 12) {
          // Already in correct format: 251911234567
          phoneNumber = cleanPhone
        } else if ((cleanPhone.startsWith('7') || cleanPhone.startsWith('9')) && cleanPhone.length === 9) {
          // Ethiopian format without 0: 911234567
          phoneNumber = '251' + cleanPhone
        } else {
          // Not a valid Ethiopian number, use default test number
          console.warn('Invalid Ethiopian phone number format, using default test number')
          phoneNumber = '251911234567'
          alert('Your phone number is not in Ethiopian format. Using test number for payment. Please update your phone number in your profile to: 0911234567 or similar Ethiopian number.')
        }
      }

      console.log('Final formatted phone number:', phoneNumber)
      console.log('Phone number length:', phoneNumber.length)

      // Get user info for Chapa payment
      // Use a simple test email that Chapa will accept
      const paymentData = {
        email: 'customer@unibite.com', // Use a simple test email
        first_name: user.name.split(' ')[0] || 'Customer',
        last_name: user.name.split(' ').slice(1).join(' ') || 'User',
        phone_number: phoneNumber
      }

      console.log('Payment data:', paymentData)
      console.log('Formatted phone number:', phoneNumber)

      const response = await axios.post(
        `${backendUrl}/api/orders/${orderId}/payment/chapa/initialize`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Chapa initialization response:', response.data)

      if (response.data.data?.checkout_url) {
        console.log('Redirecting to Chapa checkout:', response.data.data.checkout_url)
        // Redirect to Chapa checkout page
        window.location.href = response.data.data.checkout_url
      } else {
        throw new Error('Checkout URL not received from server')
      }
    } catch (error) {
      console.error('Error initializing Chapa payment:', error)
      console.error('Error response FULL:', JSON.stringify(error.response?.data, null, 2))
      console.error('Error message:', error.response?.data?.message)
      console.error('Error debug:', error.response?.data?.debug)
      
      let errorMessage = 'Failed to initialize payment. '
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error
      } else if (error.message) {
        errorMessage += error.message
      } else {
        errorMessage += 'Please try again or choose a different payment method.'
      }
      
      // Show debug info if available
      if (error.response?.data?.debug) {
        console.log('Debug info:', error.response.data.debug)
        errorMessage += '\n\nDebug: ' + JSON.stringify(error.response.data.debug)
      }
      
      alert(errorMessage)
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md mx-4">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to checkout</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md mx-4">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <FaCheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Placed!</h2>
          <p className="text-gray-600 mb-6 text-lg">Your order has been successfully placed. Redirecting to orders page...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md mx-4">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaShoppingCart className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious items to your cart first!</p>
          <button 
            onClick={() => navigate('/restaurants')}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-md"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50/30 to-orange-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b-2 border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-all group"
              >
                <div className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 transition-all">
                  <FaArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </div>
                <span className="font-semibold hidden sm:inline">Back</span>
              </button>
              
              <div className="h-8 w-px bg-gradient-to-b from-orange-300 to-red-300 hidden sm:block"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl" style={{ filter: 'brightness(0) invert(1)' }}>🚴‍♀️</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">UniBite</h1>
                  <p className="text-xs text-gray-600 font-medium">Delivery to your campus</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 rounded-xl">
                  <span className="text-sm font-semibold text-gray-700">Hello, {user.name}!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
              <FaShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Checkout</h2>
              <p className="text-gray-700 mt-2 text-sm sm:text-base font-medium">Review your order and complete payment</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Restaurant Info */}
            {restaurant && (
              <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 p-6 hover:shadow-2xl transition-all">
                <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4 flex items-center space-x-2">
                  <span className="text-2xl">🏪</span>
                  <span>Restaurant</span>
                </h3>
                <div className="flex items-center space-x-4 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-200 to-red-200 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-orange-100">
                    <img 
                      src={getRestaurantImage(restaurant)}
                      alt={restaurant.restaurant_name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xl">{restaurant.restaurant_name}</h4>
                    <p className="text-sm text-gray-600 font-medium mt-1">{restaurant.address || 'Campus Location'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 p-6 hover:shadow-2xl transition-all">
              <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
                <span className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  <span className="text-2xl">🛒</span>
                  <span>Your Order</span>
                </span>
                <span className="text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full">{getCartItemsCount()} items</span>
              </h3>
              
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200 hover:shadow-lg transition-all">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-200 to-red-200 rounded-2xl flex items-center justify-center overflow-hidden shadow-md ring-2 ring-orange-100">
                        <img 
                          src={getFoodImage(item)}
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                        <p className="text-sm text-gray-600 font-medium">{item.price} ETB each</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 bg-white rounded-xl p-1 shadow-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all font-bold shadow-md"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-9 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all font-bold shadow-md"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right min-w-[90px]">
                        <p className="font-extrabold text-gray-900 text-lg">{(item.price * item.quantity).toFixed(2)} ETB</p>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-100 rounded-lg"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 p-6 hover:shadow-2xl transition-all">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FaMapMarkerAlt className="text-white w-5 h-5" />
                </div>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Delivery Address</span>
              </h3>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address (e.g., Dorm Building A, Room 205)"
                className="w-full px-5 py-4 border-2 border-orange-300 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all resize-none font-medium text-gray-900 placeholder-gray-500 bg-gradient-to-r from-orange-50/50 to-red-50/50"
                rows="3"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 p-6 hover:shadow-2xl transition-all">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FaCreditCard className="text-white w-5 h-5" />
                </div>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Payment Method</span>
              </h3>
              <div className="space-y-3">
                <label className={`flex items-center space-x-3 p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery' 
                    ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg' 
                    : 'border-orange-200 hover:border-orange-400 hover:shadow-md'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-6 h-6 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">Cash on Delivery</p>
                    <p className="text-sm text-gray-600 font-medium">Pay when you receive your order</p>
                  </div>
                  <span className="text-3xl">💵</span>
                </label>
                
                <label className={`flex items-center space-x-3 p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === 'mobile_payment' 
                    ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg' 
                    : 'border-orange-200 hover:border-orange-400 hover:shadow-md'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="mobile_payment"
                    checked={paymentMethod === 'mobile_payment'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-6 h-6 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">Mobile Payment (Chapa)</p>
                    <p className="text-sm text-gray-600 font-medium">Pay with Chapa - Fast & Secure</p>
                  </div>
                  <span className="text-3xl">📱</span>
                </label>
                
                <label className={`flex items-center space-x-3 p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === 'digital_wallet' 
                    ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg' 
                    : 'border-orange-200 hover:border-orange-400 hover:shadow-md'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="digital_wallet"
                    checked={paymentMethod === 'digital_wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-6 h-6 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">Digital Wallet</p>
                    <p className="text-sm text-gray-600 font-medium">Pay with your digital wallet or bank transfer</p>
                  </div>
                  <span className="text-3xl">💳</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-200 p-6 sticky top-24 hover:shadow-3xl transition-all">
              <h3 className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold">{getCartTotal()} ETB</span>
                </div>
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Delivery Fee</span>
                  {getDeliveryFee() === 0 ? (
                    <span className="font-bold text-green-600">Free 🎉</span>
                  ) : (
                    <span className="font-bold">{getDeliveryFee()} ETB</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Tax (15% VAT)</span>
                  <span className="font-bold">{getTax()} ETB</span>
                </div>
                
                <div className="border-t-2 border-gradient-to-r from-orange-300 to-red-300 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {getGrandTotal()} ETB
                    </span>
                  </div>
                </div>
              </div>

              {getDeliveryFee() === 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-md">
                  <p className="text-sm text-green-700 font-bold">🎉 You got free delivery!</p>
                </div>
              )}

              {parseFloat(getCartTotal()) < 500 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl shadow-md">
                  <p className="text-sm text-blue-700 font-bold">Add {(500 - parseFloat(getCartTotal())).toFixed(2)} ETB more for free delivery 🚚</p>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !deliveryAddress.trim()}
                className={`w-full py-5 rounded-2xl font-extrabold text-xl transition-all shadow-xl ${
                  loading || !deliveryAddress.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white hover:from-orange-600 hover:via-orange-700 hover:to-red-600 hover:shadow-2xl hover:scale-105 active:scale-95'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Placing Order...</span>
                  </span>
                ) : (
                  '🛒 Place Order'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4 font-medium">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
