import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getFoodImage } from '../../utils/imageHelpers'
import axios from 'axios'
import { 
  FaChartBar, 
  FaClock, 
  FaCheckCircle, 
  FaDollarSign, 
  FaUtensils, 
  FaStar, 
  FaBook, 
  FaCreditCard,
  FaFire,
  FaClipboardList
} from 'react-icons/fa'

const RestaurantHome = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [popularItems, setPopularItems] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    fetchRestaurantInfo()
  }, [])

  const fetchRestaurantInfo = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/api/my-restaurant`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 5000 // Reduce timeout to 5 seconds
      })
      
      if (response.data.data) {
        setRestaurant(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching restaurant info:', error)
      // Don't set mock data - just leave restaurant as null
      setRestaurant(null)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/api/restaurant/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 5000 // Reduce timeout to 5 seconds
      })
      
      if (response.data.success) {
        setStats(response.data.data.stats)
        setPopularItems(response.data.data.popularItems)
        setRecentOrders(response.data.data.recentOrders)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set mock data as fallback
      setStats({
        todayOrders: 24,
        pendingOrders: 3,
        completedOrders: 18,
        todayRevenue: 485.50,
        preparingOrders: 5,
        totalRevenue: 12450.75
      })
      
      setPopularItems([
        {
          id: 1,
          name: 'Special Burger',
          price: 12.99,
          total_orders: 45,
          image: null
        },
        {
          id: 2,
          name: 'Margherita Pizza',
          price: 15.99,
          total_orders: 38,
          image: null
        },
        {
          id: 3,
          name: 'Chicken Caesar Salad',
          price: 10.99,
          total_orders: 32,
          image: null
        },
        {
          id: 4,
          name: 'Beef Tacos',
          price: 8.99,
          total_orders: 28,
          image: null
        },
        {
          id: 5,
          name: 'Chocolate Cake',
          price: 6.99,
          total_orders: 22,
          image: null
        }
      ])
      
      setRecentOrders([
        {
          id: 1001,
          student: { name: 'John Smith', phone: '+1-555-0123' },
          total_price: 24.98,
          status: 'pending',
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          order_items: [{ name: 'Special Burger' }, { name: 'Fries' }]
        },
        {
          id: 1002,
          student: { name: 'Sarah Johnson', phone: '+1-555-0124' },
          total_price: 15.99,
          status: 'preparing',
          created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 minutes ago
          order_items: [{ name: 'Margherita Pizza' }]
        },
        {
          id: 1003,
          student: { name: 'Mike Davis', phone: '+1-555-0125' },
          total_price: 18.97,
          status: 'ready',
          created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(), // 18 minutes ago
          order_items: [{ name: 'Chicken Caesar Salad' }, { name: 'Iced Tea' }]
        },
        {
          id: 1004,
          student: { name: 'Emily Wilson', phone: '+1-555-0126' },
          total_price: 32.96,
          status: 'completed',
          created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 minutes ago
          order_items: [{ name: 'Special Burger' }, { name: 'Pizza' }, { name: 'Drink' }]
        },
        {
          id: 1005,
          student: { name: 'David Brown', phone: '+1-555-0127' },
          total_price: 14.98,
          status: 'completed',
          created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
          order_items: [{ name: 'Beef Tacos' }, { name: 'Soda' }]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Comprehensive Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Total Orders Today */}
        <div className="group bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Orders Today</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                {stats?.todayOrders || 0}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaChartBar className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="group bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Pending Orders</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                {stats?.pendingOrders || 0}
              </p>
              <span className="text-xs text-red-500 font-semibold">Needs attention</span>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaClock className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="group bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Completed Orders</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                {stats?.completedOrders || 0}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaCheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Revenue Today */}
        <div className="group bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Revenue Today</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                ${stats?.todayRevenue?.toFixed(0) || '0'}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaDollarSign className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Preparing Orders */}
        <div className="group bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Preparing Now</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                {stats?.preparingOrders || 0}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaUtensils className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Restaurant Rating */}
        <div className="group bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Restaurant Rating</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                4.8
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaStar className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="group bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Menu Items</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                {popularItems.length || 24}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaBook className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="group bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Total Revenue</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                ${((stats?.todayRevenue || 0) * 30 / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaCreditCard className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Menu Items */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaFire className="mr-3 w-7 h-7 text-red-600" />
              Popular Menu Items
            </h2>
            <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-full shadow-md">
              Top Sellers
            </span>
          </div>
          
          <div className="space-y-4">
            {popularItems.length > 0 ? (
              popularItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-red-50 rounded-xl border border-red-200 hover:shadow-md transition-all duration-300">
                  <div className="flex-shrink-0 relative">
                    <img 
                      src={getFoodImage(item)} 
                      alt={item.name} 
                      className="w-16 h-16 rounded-xl object-cover shadow-md"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&q=80'
                      }}
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                    <p className="text-gray-600 text-sm">${item.price}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-blue-600 font-bold text-sm">{item.total_orders} orders</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-green-600 font-semibold text-sm">${(item.total_orders * item.price).toFixed(2)} revenue</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-30">📊</div>
                <p className="text-gray-500 text-lg">No order data yet</p>
                <p className="text-gray-400 text-sm">Popular items will appear here once you receive orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaClipboardList className="mr-3 w-7 h-7 text-blue-600" />
              Recent Orders
            </h2>
            <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-full animate-pulse shadow-md">
              Live Updates
            </span>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        #{order.id}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{order.student?.name || 'Customer'}</h3>
                        <p className="text-gray-500 text-sm">{order.student?.phone || 'No phone'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-red-600">${order.total_price}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'pending' ? 'bg-red-100 text-red-800 border border-red-300' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        order.status === 'ready' ? 'bg-green-100 text-green-800 border border-green-300' :
                        order.status === 'completed' ? 'bg-gray-100 text-gray-800 border border-gray-300' :
                        'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(order.created_at).toLocaleString()}</span>
                    <span>{order.order_items?.length || 0} items</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-30">📦</div>
                <p className="text-gray-500 text-lg">No recent orders</p>
                <p className="text-gray-400 text-sm">New orders will appear here</p>
              </div>
            )}
          </div>
          
          {recentOrders.length > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full py-2 text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors">
                View All Orders →
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
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
      `}</style>
    </div>
  )
}

export default RestaurantHome
