import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from './AdminLayout'

const Users = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'rider'
  })
  const { user: currentUser } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [filterRole, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      
      const params = new URLSearchParams()
      if (filterRole !== 'all') params.append('role', filterRole)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`${backendUrl}/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
        setFilteredUsers(data.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId) => {
    try {
      const user = users.find(u => u.id === userId)
      const newStatus = user.status === 'active' ? 'inactive' : 'active'
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()
      if (data.success) {
        setUsers(users.map(u =>
          u.id === userId ? { ...u, status: newStatus } : u
        ))
        setFilteredUsers(filteredUsers.map(u =>
          u.id === userId ? { ...u, status: newStatus } : u
        ))
        alert('User status updated!')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Failed to update user status')
    }
  }

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token')
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
        
        const response = await fetch(`${backendUrl}/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        const data = await response.json()
        if (data.success) {
          setUsers(users.filter(u => u.id !== userId))
          setFilteredUsers(filteredUsers.filter(u => u.id !== userId))
          alert('User deleted successfully!')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user')
      }
    }
  }

  const viewProfile = (user) => {
    setSelectedUser(user)
    setShowProfile(true)
  }

  const getRoleIcon = (role) => {
    const icons = {
      student: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
      restaurant: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      rider: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      admin: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
    return icons[role] || (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  }

  const getRoleColor = (role) => {
    const colors = {
      student: 'blue',
      restaurant: 'purple',
      rider: 'green',
      admin: 'red'
    }
    return colors[role] || 'gray'
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      
      const response = await fetch(`${backendUrl}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employeeForm)
      })

      const data = await response.json()
      if (data.success) {
        alert('Employee added successfully!')
        setShowAddEmployee(false)
        setEmployeeForm({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: 'rider'
        })
        fetchUsers()
      } else {
        alert(data.message || 'Failed to add employee')
      }
    } catch (error) {
      console.error('Error adding employee:', error)
      alert('Failed to add employee')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout 
      title="User Management"
      subtitle="Manage platform users"
    >
      {/* Header Actions */}
      <div className="flex justify-end items-center space-x-3 mb-6">
        <button
          onClick={() => setShowAddEmployee(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Employee</span>
        </button>
        <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md">
          <p className="text-xs font-semibold">Total Users</p>
          <p className="text-xl font-bold">{users.length}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 border border-gray-100 hover:border-red-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Total Users</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">{users.length}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 border border-gray-100 hover:border-red-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Students</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">{users.filter(u => u.role === 'student').length}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              </div>
            </div>
          </div>
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 border border-gray-100 hover:border-red-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Restaurants</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">{users.filter(u => u.role === 'restaurant').length}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 border border-gray-100 hover:border-red-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Riders</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">{users.filter(u => u.role === 'rider').length}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterRole('all')}
                className={`px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  filterRole === 'all'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setFilterRole('student')}
                className={`px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  filterRole === 'student'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setFilterRole('restaurant')}
                className={`px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  filterRole === 'restaurant'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Restaurants
              </button>
              <button
                onClick={() => setFilterRole('rider')}
                className={`px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  filterRole === 'rider'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Riders
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-red-50 to-red-100 border-b-2 border-red-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Orders</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-${getRoleColor(user.role)}-100 rounded-full flex items-center justify-center text-${getRoleColor(user.role)}-600`}>
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800 text-sm font-semibold rounded-full capitalize`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{user.phone || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{user.student_orders_count || 0}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      } text-sm font-semibold rounded-full capitalize`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewProfile(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`p-2 ${
                            user.status === 'active'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          } rounded-lg transition-colors`}
                          title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* User Profile Modal */}
      {showProfile && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-20 h-20 bg-${getRoleColor(selectedUser.role)}-100 rounded-full flex items-center justify-center text-${getRoleColor(selectedUser.role)}-600`}>
                    <div className="scale-150">
                      {getRoleIcon(selectedUser.role)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                    <span className={`inline-block px-3 py-1 bg-${getRoleColor(selectedUser.role)}-100 text-${getRoleColor(selectedUser.role)}-800 text-sm font-semibold rounded-full capitalize mt-2`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 ${
                      selectedUser.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    } text-sm font-semibold rounded-full capitalize`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <p className="font-semibold text-gray-900">{selectedUser.student_orders_count || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Joined Date</p>
                    <p className="font-semibold text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">User ID</p>
                    <p className="font-semibold text-gray-900">#{selectedUser.id}</p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      toggleUserStatus(selectedUser.id)
                      setShowProfile(false)
                    }}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    {selectedUser.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                  </button>
                  <button
                    onClick={() => {
                      deleteUser(selectedUser.id)
                      setShowProfile(false)
                    }}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Employee</h2>
                <button
                  onClick={() => setShowAddEmployee(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    required
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={employeeForm.password}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter password"
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    value={employeeForm.role}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="rider">Rider</option>
                    <option value="admin">Admin</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddEmployee(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    Add Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default Users
