import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const GoogleCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    // Prevent double processing
    if (processing) return
    
    const token = searchParams.get('token')
    const userParam = searchParams.get('user')
    const error = searchParams.get('error')

    if (error) {
      navigate('/login?error=' + error, { replace: true })
      return
    }

    if (token && userParam) {
      setProcessing(true)
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        
        // Save token and user
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Redirect based on role
        if (user.role === 'student') {
          navigate('/', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      } catch (err) {
        console.error('Error parsing user data:', err)
        navigate('/login?error=invalid_response', { replace: true })
      }
    } else {
      navigate('/login?error=missing_data', { replace: true })
    }
  }, [searchParams, navigate, processing])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <p className="mt-4 text-gray-600 font-medium">Completing Google sign in...</p>
      </div>
    </div>
  )
}

export default GoogleCallback
