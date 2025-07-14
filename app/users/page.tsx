'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  Users, 
  Mail, 
  Calendar, 
  MapPin, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
  UserCheck,
  UserX,
  Clock,
  Globe,
  Shield,
  Activity
} from 'lucide-react'

interface User {
  id: string
  email?: string
  display_name?: string
  location?: string
  created_at: string
  last_sign_in_at?: string
  [key: string]: any
}

type SortField = 'display_name' | 'email' | 'created_at' | 'last_sign_in_at';
type SortOrder = 'asc' | 'desc';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'email' | 'guest'>('all')
  const [activityFilter, setActivityFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    filterAndSortUsers()
  }, [users, searchTerm, sortField, sortOrder, userTypeFilter, activityFilter])

  const filterAndSortUsers = () => {
    let filtered = [...users]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // User type filter
    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (userTypeFilter === 'email') {
          return user.email && user.email.length > 0
        } else {
          return !user.email || user.email.length === 0
        }
      })
    }

    // Activity filter
    if (activityFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (!user.last_sign_in_at) return activityFilter === 'inactive'
        
        const lastSignIn = new Date(user.last_sign_in_at)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        if (activityFilter === 'active') {
          return lastSignIn > thirtyDaysAgo
        } else {
          return lastSignIn <= thirtyDaysAgo
        }
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'created_at' || sortField === 'last_sign_in_at') {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      } else {
        aValue = aValue ?? ''
        bValue = bValue ?? ''
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredUsers(filtered)
  }

  const handleBulkAction = async (action: 'delete' | 'activate' | 'deactivate') => {
    if (selectedUsers.length === 0) return

    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('users')
          .delete()
          .in('id', selectedUsers)
        if (error) throw error
      }

      setSelectedUsers([])
      fetchUsers()
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error)
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id))
    }
  }

  const getUserType = (user: User) => {
    if (user.email && user.email.length > 0) {
      return { type: 'Email User', color: 'text-blue-600', bgColor: 'bg-blue-100' }
    } else {
      return { type: 'Guest User', color: 'text-gray-600', bgColor: 'bg-gray-100' }
    }
  }

  const getActivityStatus = (user: User) => {
    if (!user.last_sign_in_at) {
      return { status: 'Never Active', color: 'text-red-600', bgColor: 'bg-red-100' }
    }
    
    const lastSignIn = new Date(user.last_sign_in_at || '')
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    if (lastSignIn > thirtyDaysAgo) {
      return { status: 'Active', color: 'text-green-600', bgColor: 'bg-green-100' }
    } else {
      return { status: 'Inactive', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
              <p className="text-gray-600">Manage your app users</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Email Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.email && user.email.length > 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Guest Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => !user.email || user.email.length === 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => {
                    if (!user.last_sign_in_at) return false
                    const lastSignIn = new Date(user.last_sign_in_at)
                    const thirtyDaysAgo = new Date()
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                    return lastSignIn > thirtyDaysAgo
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                <span className="text-sm text-gray-500">({filteredUsers.length} of {users.length})</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* User Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                  <select
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="email">Email Users</option>
                    <option value="guest">Guest Users</option>
                  </select>
                </div>

                {/* Activity Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Status</label>
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active (Last 30 days)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <div className="flex space-x-2">
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as SortField)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="created_at">Date Created</option>
                      <option value="display_name">Name</option>
                      <option value="email">Email</option>
                      <option value="last_sign_in_at">Last Active</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="p-6 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Users</h3>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </label>
                <button className="text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const userType = getUserType(user)
                    const activityStatus = getActivityStatus(user)
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.display_name || 'Anonymous'}
                              </div>
                              <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userType.bgColor} ${userType.color}`}>
                            {userType.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.location || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activityStatus.bgColor} ${activityStatus.color}`}>
                            {activityStatus.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.last_sign_in_at 
                              ? new Date(user.last_sign_in_at).toLocaleDateString()
                              : 'Never'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 