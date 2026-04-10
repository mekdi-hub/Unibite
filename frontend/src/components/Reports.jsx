import AdminLayout from './AdminLayout'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { FaDollarSign, FaShoppingCart, FaChartLine, FaUsers } from 'react-icons/fa'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Reports = () => {
  const salesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales (ETB)',
        data: [1200, 1900, 1500, 2100, 1800, 2400, 2200],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  }

  const ordersData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Orders',
        data: [45, 52, 48, 61, 55, 67, 63],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(248, 113, 113, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(248, 113, 113, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(248, 113, 113, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            weight: '500'
          }
        }
      }
    }
  }

  return (
    <AdminLayout 
      title="Reports & Analytics"
      subtitle="Business insights and performance metrics"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">13,100 ETB</p>
                  <p className="text-sm text-green-600 mt-1">+12% from last week</p>
                </div>
                <FaDollarSign className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">391</p>
                  <p className="text-sm text-green-600 mt-1">+8% from last week</p>
                </div>
                <FaShoppingCart className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">33.5 ETB</p>
                  <p className="text-sm text-green-600 mt-1">+3% from last week</p>
                </div>
                <FaChartLine className="w-10 h-10 text-purple-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                  <p className="text-sm text-green-600 mt-1">+15% from last week</p>
                </div>
                <FaUsers className="w-10 h-10 text-red-600" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Sales Trend</h2>
              <Line data={salesData} options={chartOptions} />
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Orders</h2>
              <Bar data={ordersData} options={chartOptions} />
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Selling Items</h2>
            <div className="space-y-4">
              {[
                { name: 'Margherita Pizza', sales: 145, revenue: 2175 },
                { name: 'Cheeseburger', sales: 132, revenue: 1980 },
                { name: 'Caesar Salad', sales: 98, revenue: 1470 }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center font-bold text-red-600">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.sales} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{item.revenue} ETB</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
    </AdminLayout>
  )
}

export default Reports
