import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

const ComingSoon = ({ title, icon, description }) => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <span className="text-7xl">{icon}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-xl text-gray-600 mb-8">{description}</p>
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 px-6 py-3 rounded-full text-sm font-semibold">
              <span>🚧</span>
              <span>Coming Soon</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-500">
              We're working hard to bring you this feature. Stay tuned!
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComingSoon
