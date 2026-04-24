import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaUser, FaPhone } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'student'
  })
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setErrors({})

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.password_confirmation,
      formData.phone,
      formData.role
    )
    
    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(result.message)
      setErrors(result.errors || {})
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Side - Marketing Content with Huge Burger - Hidden on Mobile */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-start justify-start p-8 pl-20 pr-2 pt-16">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-red-200 rounded-full opacity-20 animate-float blur-2xl"></div>
          
          {/* Middle area circles - filling empty space */}
          <div className="absolute top-1/3 left-1/3 w-36 h-36 bg-orange-300 rounded-full opacity-20 animate-float blur-2xl" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-2/5 right-1/3 w-32 h-32 bg-red-300 rounded-full opacity-25 animate-sway blur-2xl" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-3/5 right-2/5 w-28 h-28 bg-orange-400 rounded-full opacity-22 animate-float blur-2xl" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-2/5 w-32 h-32 bg-red-200 rounded-full opacity-20 animate-sway blur-xl" style={{ animationDelay: '0.8s' }}></div>
          
          {/* Bottom area circles */}
          <div className="absolute bottom-32 left-16 w-40 h-40 bg-orange-200 rounded-full opacity-25 animate-wiggle blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-red-300 rounded-full opacity-20 animate-float blur-xl"></div>
          <div className="absolute bottom-24 left-1/3 w-32 h-32 bg-yellow-300 rounded-full opacity-22 animate-sway blur-2xl" style={{ animationDelay: '0.6s' }}></div>
          <div className="absolute bottom-28 right-1/4 w-36 h-36 bg-orange-300 rounded-full opacity-20 animate-float blur-3xl" style={{ animationDelay: '1.3s' }}></div>
          <div className="absolute bottom-16 left-1/4 w-28 h-28 bg-red-200 rounded-full opacity-25 animate-wiggle blur-xl" style={{ animationDelay: '1.8s' }}></div>
          <div className="absolute bottom-40 right-1/3 w-32 h-32 bg-yellow-200 rounded-full opacity-18 animate-sway blur-2xl" style={{ animationDelay: '0.4s' }}></div>
          
          <div className="absolute top-16 right-16">
            <div className="grid grid-cols-4 gap-3 opacity-40">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-3xl">
          {/* Logo */}
          <div className="flex items-center mb-8 justify-center lg:justify-start">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mr-4 sm:mr-5">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl sm:text-4xl lg:text-5xl" style={{ filter: 'brightness(0) invert(1)' }}>🚴‍♀️</span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-1">
                UniBite
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">
                Delivery to your campus
              </p>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-8 ml-auto mr-0 lg:mr-8 max-w-xl text-center lg:text-left">
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed">
              Join thousands of <span className="text-red-600 font-semibold">happy students</span> & get your food <span className="text-red-600 font-semibold">delivered fast!</span>
            </p>
          </div>

          {/* Marketing Content */}
          <div className="mb-0 ml-auto mr-0 lg:mr-8 max-w-xl text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Join Us Today!
            </h2>
            
            <div className="flex items-center mb-6 justify-center lg:justify-start">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600 leading-tight">
                Fast Campus Delivery
              </h2>
              <div className="ml-4 text-3xl sm:text-4xl lg:text-5xl">🚀</div>
            </div>
            
            <div className="space-y-2">
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-tight">
                Your <span className="text-red-600 font-semibold">Favorite Meals</span>, Delivered Fresh
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-tight">
                Right to Your <span className="text-red-600 font-semibold">Campus Door!</span>
              </p>
            </div>
          </div>

          {/* MASSIVE Burger Image - Closer to text above */}
          <div className="hidden lg:block -mt-12 -mb-8">
            <img 
              src="/op.png"
              alt="Delicious Burger"
              className="w-[850px] h-[600px] object-contain drop-shadow-2xl"
              style={{
                filter: 'none',
                imageRendering: 'crisp-edges'
              }}
              onError={(e) => {
                e.target.src = "/o.png";
              }}
            />
          </div>

          {/* Features */}
          <div className="hidden sm:flex space-x-6 lg:space-x-12 mt-4 justify-center lg:justify-start">
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-red-100 rounded-xl flex items-center justify-center mb-2 lg:mb-3 shadow-lg mx-auto">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-base lg:text-lg font-bold">⚡</span>
                </div>
              </div>
              <p className="text-xs lg:text-sm text-gray-700 font-semibold">Fast Delivery</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-yellow-100 rounded-xl flex items-center justify-center mb-2 lg:mb-3 shadow-lg mx-auto">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg lg:text-xl">✓</span>
                </div>
              </div>
              <p className="text-xs lg:text-sm text-gray-700 font-semibold">Quality Food</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-xl flex items-center justify-center mb-2 lg:mb-3 shadow-lg mx-auto">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-base lg:text-lg">💳</span>
                </div>
              </div>
              <p className="text-xs lg:text-sm text-gray-700 font-semibold">Easy Payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form - Centered on Mobile */}
      <div className="flex items-center justify-center lg:items-start lg:justify-start p-3 sm:p-6 lg:p-8 lg:pl-0 lg:pr-20 w-full lg:w-auto pt-4 lg:pt-16">
        <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-md">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 rounded-t-3xl"></div>
          
          <div className="w-full px-4 sm:px-8 lg:px-10 py-4 sm:py-8">
          <div className="text-center mb-4 sm:mb-8">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl sm:text-3xl" style={{ filter: 'brightness(0) invert(1)' }}>🚴‍♀️</span>
              </div>
            </div>
            <h3 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Create Account
            </h3>
            <p className="text-gray-600 text-xs sm:text-base">
              Join <span className="text-red-600 font-semibold">UniBite</span> community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <FaUser className="h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-2.5 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-800 placeholder-gray-400 text-sm sm:text-base transition-all duration-200 hover:border-gray-300"
                  placeholder="Enter your full name"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500 to-yellow-400 opacity-0 group-focus-within:opacity-10 transition-opacity duration-200 pointer-events-none"></div>
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <FaEnvelope className="h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-2.5 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-800 placeholder-gray-400 text-sm sm:text-base transition-all duration-200 hover:border-gray-300"
                  placeholder="Enter your email"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500 to-yellow-400 opacity-0 group-focus-within:opacity-10 transition-opacity duration-200 pointer-events-none"></div>
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <FaPhone className="h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-2.5 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-800 placeholder-gray-400 text-sm sm:text-base transition-all duration-200 hover:border-gray-300"
                  placeholder="Enter your phone"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500 to-yellow-400 opacity-0 group-focus-within:opacity-10 transition-opacity duration-200 pointer-events-none"></div>
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone[0]}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <FaLock className="h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-12 py-2.5 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-800 placeholder-gray-400 text-sm sm:text-base transition-all duration-200 hover:border-gray-300"
                  placeholder="Create password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors duration-200" />
                  ) : (
                    <FaEye className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors duration-200" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500 to-yellow-400 opacity-0 group-focus-within:opacity-10 transition-opacity duration-200 pointer-events-none"></div>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <FaLock className="h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-12 py-2.5 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-800 placeholder-gray-400 text-sm sm:text-base transition-all duration-200 hover:border-gray-300"
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors duration-200" />
                  ) : (
                    <FaEye className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors duration-200" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500 to-yellow-400 opacity-0 group-focus-within:opacity-10 transition-opacity duration-200 pointer-events-none"></div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 sm:py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                <>
                  Create Account
                  <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-8 mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <button className="w-full flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-red-200 transition-all duration-200 group">
              <FcGoogle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
              <span className="text-sm sm:text-base text-gray-700 font-medium group-hover:text-gray-800">Continue with Google</span>
            </button>
          </div>

          <div className="mt-4 sm:mt-8 text-center">
            <p className="text-xs sm:text-base text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-red-500 hover:text-red-600 font-bold transition-colors duration-200">
                Login
              </Link>
            </p>
            <p className="text-xs sm:text-base text-gray-600 mt-2 sm:mt-3">
              Own a restaurant?{' '}
              <Link to="/restaurant-registration" className="text-orange-600 hover:text-orange-700 font-bold transition-colors duration-200">
                🏪 Partner with UniBite
              </Link>
            </p>
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 sm:space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1 sm:mr-2"></span>
                <span className="hidden sm:inline">Safe & Secure</span>
                <span className="sm:hidden">Secure</span>
              </span>
              <span>•</span>
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full mr-1 sm:mr-2"></span>
                <span className="hidden sm:inline">Fast Delivery</span>
                <span className="sm:hidden">Fast</span>
              </span>
              <span>•</span>
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full mr-1 sm:mr-2"></span>
                <span className="hidden sm:inline">24/7 Support</span>
                <span className="sm:hidden">24/7</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Register
