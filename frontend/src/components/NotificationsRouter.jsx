import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import CustomerNotifications from './CustomerNotifications'
import Notifications from './Notifications'

const NotificationsRouter = () => {
  const { user } = useAuth()

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Route based on user role
  switch (user.role) {
    case 'admin':
      return <Notifications />
    case 'student':
    case 'rider':
    case 'restaurant':
    default:
      return <CustomerNotifications />
  }
}

export default NotificationsRouter