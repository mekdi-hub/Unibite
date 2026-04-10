import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const GoogleCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser, setToken } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const userParam = searchParams.get('user')
    const error = searchParams.get('error')

    if (error) {
      navigate('/login?error=' + error)
      return
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        
        // Save token and user
        localStorage.setItem('token', token)
        
        // Update auth context if methods exist
        if (setToken) setToken(token)
        if (setUser) setUser(user)
        
        // Redirect to dashboard
        navigate('/dashboard')
      } catch (err) {
        console.error('Error parsing user data:', err)
        navigate('/login?error=invalid_response')
      }
    } else {
      navigate('/login?error=missing_data')
    }
  }, [searchParams, navigate, setUser, setToken])

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
