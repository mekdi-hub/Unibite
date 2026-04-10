import { useState, useEffect } from 'react'
import axios from 'axios'

const RiderEarnings = () => {
  const [earnings, setEarnings] = useState(null)
  const [earningsHistory, setEarningsHistory] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEarnings()
    fetchEarningsHistory()
  }, [selectedPeriod])

  const fetchEarnings = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/api/rider/earnings?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      })
      
      if (response.data.success) {
        setEarnings(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching earnings:', error)
      // Set mock earnings data
      setEarnings({
        today: 350,
        thisWeek: 1200,
        thisMonth: 4800,
        total: 8500,
        todayDeliveries: 8,
        weekDeliveries: 32,
        monthDeliveries: 145,
        totalDeliveries: 312,
        averagePerDelivery: 27.2,
        topEarningDay: 420,
        totalDistance: 1250,
        averageRating: 4.8
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchEarningsHistory = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${backendUrl}/api/rider/earnings-history?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      })
      
      if (response.data.success) {
        setEarningsHistory(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching earnings history:', error)
      // Set mock earnings history
      const mockHistory = []
      const today = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        
        mockHistory.push({
          date: date.toISOString().split('T')[0],
          earnings: Math.floor(Math.random() * 200) + 150,
          deliveries: Math.floor(Math.random() * 8) + 3,
          distance: Math.floor(Math.random() * 30) + 15,
          hours: Math.floor(Math.random() * 4) + 4
        })
      }
      
      setEarningsHistory(mockHistory)
    }
  }

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()} ETB`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getEarningsForPeriod = () => {
    switch (selectedPeriod) {
      case 'today':
        return earnings?.today || 0
      case 'week':
        return earnings?.thisWeek || 0
      case 'month':
        return earnings?.thisMonth || 0
      case 'total':
        return earnings?.total || 0
      default:
        return 0
    }
  }

  const getDeliveriesForPeriod = () => {
    switch (selectedPeriod) {
      case 'today':
        return earnings?.todayDeliveries || 0
      case 'week':
        return earnings?.weekDeliveries || 0
      case 'month':
        return earnings?.monthDeliveries || 0
      case 'total':
        return earnings?.totalDeliveries || 0
      default:
        return 0
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Earnings Summary</h1>
        <div className="flex space-x-2">
          {['today', 'week', 'month', 'total'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                selectedPeriod === period
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {period === 'total' ? 'All Time' : period}
            </button>
          ))}
        </div>
      </div>

      {/* Main Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">
                {selectedPeriod === 'today' ? "Today's Earnings" :
                 selectedPeriod === 'week' ? "This Week" :
                 selectedPeriod === 'month' ? "This Month" : "Total Earnings"}
              </p>
              <p className="text-3xl font-bold">{formatCurrency(getEarningsForPeriod())}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        {/* Deliveries */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Deliveries</p>
              <p className="text-3xl font-bold">{getDeliveriesForPeriod()}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        {/* Average per Delivery */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg per Delivery</p>
              <p className="text-3xl font-bold">{formatCurrency(earnings?.averagePerDelivery || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Average Rating</p>
              <p className="text-3xl font-bold">{earnings?.averageRating || 0}/5</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Top Earning Day</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings?.topEarningDay || 0)}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🏆</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Distance</p>
              <p className="text-2xl font-bold text-gray-900">{earnings?.totalDistance || 0} km</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🛣️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{earnings?.totalDeliveries || 0}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings History Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Earnings (Last 7 Days)</h2>
        <div className="space-y-4">
          {earningsHistory.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-900 w-20">
                  {formatDate(day.date)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="bg-orange-500 h-4 rounded-full"
                      style={{ width: `${(day.earnings / 400) * 100}%`, minWidth: '20px' }}
                    ></div>
                    <span className="text-sm font-bold text-orange-600">
                      {formatCurrency(day.earnings)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>📦 {day.deliveries}</span>
                <span>🛣️ {day.distance}km</span>
                <span>⏰ {day.hours}h</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Earnings Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">By Time Period</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Today</span>
                <span className="font-bold text-orange-600">{formatCurrency(earnings?.today || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">This Week</span>
                <span className="font-bold text-orange-600">{formatCurrency(earnings?.thisWeek || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">This Month</span>
                <span className="font-bold text-orange-600">{formatCurrency(earnings?.thisMonth || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-orange-800 font-medium">All Time</span>
                <span className="font-bold text-orange-600">{formatCurrency(earnings?.total || 0)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Average per Delivery</span>
                <span className="font-bold text-blue-600">{formatCurrency(earnings?.averagePerDelivery || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Customer Rating</span>
                <span className="font-bold text-yellow-600">⭐ {earnings?.averageRating || 0}/5</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Total Distance</span>
                <span className="font-bold text-purple-600">{earnings?.totalDistance || 0} km</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Completion Rate</span>
                <span className="font-bold text-orange-600">98.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">🎯</div>
          <div>
            <h3 className="text-lg font-bold text-orange-800">Keep Up the Great Work!</h3>
            <p className="text-orange-700">
              You're earning an average of {formatCurrency(earnings?.averagePerDelivery || 0)} per delivery. 
              Complete more deliveries to increase your daily earnings!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiderEarnings