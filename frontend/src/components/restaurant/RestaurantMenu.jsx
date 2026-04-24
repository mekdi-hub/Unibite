import { useState, useEffect } from 'react'
import axios from 'axios'

const RestaurantMenu = () => {
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [errors, setErrors] = useState({}) // Form validation errors
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: true,
    image: null
  })

  useEffect(() => {
    fetchMenuItems()
    fetchCategories()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/api/restaurant/menu-items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (response.data.success) {
        setMenuItems(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
      const response = await axios.get(`${backendUrl}/api/categories`)
      if (response.data.data) {
        setCategories(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }


  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }))
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    setErrors({}) // Clear previous errors
    
    console.log('=== ADD MENU ITEM DEBUG ===')
    console.log('Form data:', formData)
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
      const token = localStorage.getItem('token')
      
      console.log('Backend URL:', backendUrl)
      console.log('Token exists:', !!token)
      
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          // Convert boolean to 1 or 0 for Laravel
          const value = key === 'is_available' ? (formData[key] ? '1' : '0') : formData[key]
          formDataToSend.append(key, value)
          console.log(`FormData: ${key} =`, value)
        }
      })
      
      console.log('Sending request to:', `${backendUrl}/api/restaurant/menu-items`)
      
      const response = await axios.post(
        `${backendUrl}/api/restaurant/menu-items`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      console.log('Response:', response.data)
      
      if (response.data.success) {
        alert('Menu item added successfully!')
        setShowAddModal(false)
        resetForm()
        setErrors({})
        fetchMenuItems()
      }
    } catch (error) {
      console.error('Error adding menu item:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Validation errors:', error.response?.data?.errors)
      console.error('Error message:', error.response?.data?.message)
      
      // Log the full error response as JSON string for easy reading
      if (error.response?.data) {
        console.log('FULL ERROR DATA:', JSON.stringify(error.response.data, null, 2))
      }
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        console.log('Setting validation errors:', error.response.data.errors)
        setErrors(error.response.data.errors)
      } else if (error.response?.data?.message) {
        console.log('Setting general error:', error.response.data.message)
        setErrors({ general: error.response.data.message })
      } else {
        console.log('Setting unknown error')
        setErrors({ general: 'Failed to add menu item. Please try again.' })
      }
    }
  }

  const handleEditItem = async (e) => {
    e.preventDefault()
    setErrors({}) // Clear previous errors
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
      const token = localStorage.getItem('token')
      
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          // Convert boolean to 1 or 0 for Laravel
          const value = key === 'is_available' ? (formData[key] ? '1' : '0') : formData[key]
          formDataToSend.append(key, value)
        }
      })
      formDataToSend.append('_method', 'PUT')
      
      const response = await axios.post(
        `${backendUrl}/api/restaurant/menu-items/${selectedItem.id}`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      if (response.data.success) {
        alert('Menu item updated successfully!')
        setShowEditModal(false)
        resetForm()
        fetchMenuItems()
      }
    } catch (error) {
      console.error('Error updating menu item:', error)
      console.error('Error response:', error.response?.data)
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to update menu item'
        setErrors({ general: errorMessage })
      }
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendi.test'
      const token = localStorage.getItem('token')
      
      const response = await axios.delete(
        `${backendUrl}/api/restaurant/menu-items/${itemId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      )
      
      if (response.data.success) {
        alert('Menu item deleted successfully!')
        fetchMenuItems()
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
      alert('Failed to delete menu item')
    }
  }

  const openEditModal = (item) => {
    setSelectedItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category_id: item.category_id,
      is_available: item.is_available,
      image: null
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      is_available: true,
      image: null
    })
    setSelectedItem(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
          const imageUrl = item.image ? `${backendUrl}/storage/${item.image}` : null
          
          console.log('Menu item:', item.name)
          console.log('Image path from DB:', item.image)
          console.log('Constructed image URL:', imageUrl)
          
          return (
            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-gray-200">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', imageUrl)
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg></div>'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.is_available
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-red-600">{item.price} ETB</span>
                  <span className="text-sm text-gray-500">{item.category?.name}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {menuItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-lg">No menu items yet. Add your first item!</p>
        </div>
      )}


      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Menu Item</h2>
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-4">
                {/* General Error Message */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errors.general}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.category_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.category_id[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    accept="image/*"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.image ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.image && (
                    <p className="text-red-500 text-sm mt-1">{errors.image[0]}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Available</label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); resetForm(); setErrors({}); }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Menu Item</h2>
                <button
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEditItem} className="space-y-4">
                {/* General Error Message */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errors.general}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.category_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.category_id[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    accept="image/*"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.image ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.image && (
                    <p className="text-red-500 text-sm mt-1">{errors.image[0]}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Available</label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); resetForm(); setErrors({}); }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Update Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurantMenu
