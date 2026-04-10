import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const RestaurantRegistration = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    openingHours: '',
    description: '',
    foodCategories: [],
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: ''
  })
  const [files, setFiles] = useState({
    businessLicense: null,
    menuImages: []
  })

  const foodCategoryOptions = [
    'Fast Food', 'Pizza', 'Burgers', 'Asian', 'Italian', 
    'Mexican', 'Desserts', 'Beverages', 'Healthy', 'Vegetarian'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      foodCategories: prev.foodCategories.includes(category)
        ? prev.foodCategories.filter(c => c !== category)
        : [...prev.foodCategories, category]
    }))
  }

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target
    if (name === 'businessLicense') {
      setFiles(prev => ({ ...prev, businessLicense: selectedFiles[0] }))
    } else if (name === 'menuImages') {
      setFiles(prev => ({ ...prev, menuImages: Array.from(selectedFiles) }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Frontend validation
    if (formData.foodCategories.length === 0) {
      alert('Please select at least one food category')
      return
    }
    
    setLoading(true)

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const submitData = new FormData()
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (key === 'foodCategories') {
          submitData.append(key, JSON.stringify(formData[key]))
        } else {
          submitData.append(key, formData[key])
        }
      })

      // Append files
      if (files.businessLicense) {
        submitData.append('businessLicense', files.businessLicense)
      }
      files.menuImages.forEach((file, index) => {
        submitData.append(`menuImages[${index}]`, file)
      })

      const response = await fetch(`${backendUrl}/api/restaurant/register`, {
        method: 'POST',
        body: submitData
      })

      const data = await response.json()

      if (response.ok) {
        alert('Registration submitted successfully! Please wait for admin approval.')
        navigate('/login')
      } else {
        // Display detailed validation errors
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n')
          alert(`Validation failed:\n\n${errorMessages}`)
        } else if (data.error) {
          // Show backend error
          alert(`Registration failed:\n\n${data.error}`)
        } else {
          alert(data.message || 'Registration failed. Please try again.')
        }
        console.error('Registration error:', data)
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert(`An error occurred: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl filter brightness-0 invert">🚴‍♀️</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              UniBite
            </h1>
          </Link>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Restaurant Registration</h2>
          <p className="text-gray-600">Join our platform and start receiving orders</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Restaurant Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🏪</span>
              Restaurant Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  required
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter restaurant name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Owner Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  required
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter owner name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="restaurant@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength="8"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Min 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Opening Hours *
                </label>
                <input
                  type="text"
                  name="openingHours"
                  required
                  value={formData.openingHours}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Mon-Fri: 9AM-9PM"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Full address"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Tell us about your restaurant..."
                />
              </div>
            </div>
          </div>

          {/* Food Categories */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🍽️</span>
              Food Categories *
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {foodCategoryOptions.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    formData.foodCategories.includes(category)
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Bank Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🏦</span>
              Bank Account Information *
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  name="bankAccountName"
                  required
                  value={formData.bankAccountName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Account holder name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  required
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Account number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  name="bankName"
                  required
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Bank name"
                />
              </div>
            </div>
          </div>

          {/* Document Uploads */}
          <div className="pb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📄</span>
              Documents
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business License * (PDF/JPG, Max 5MB)
                </label>
                <input
                  type="file"
                  name="businessLicense"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Menu Images (Optional, Multiple files allowed)
                </label>
                <input
                  type="file"
                  name="menuImages"
                  multiple
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : '🚀 Submit Registration'}
            </button>
            <Link
              to="/login"
              className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all text-center"
            >
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RestaurantRegistration
