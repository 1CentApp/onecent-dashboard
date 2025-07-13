'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Users, 
  ShoppingCart, 
  Store, 
  TrendingUp, 
  Activity,
  MapPin,
  Star,
  Package
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalStores: number
  totalShoppingLists: number
  totalPosts: number
  totalReviews: number
  totalOrders: number
  totalRevenue: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalStores: 0,
    totalShoppingLists: 0,
    totalPosts: 0,
    totalReviews: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Fetch stores count
      const { count: storesCount } = await supabase
        .from('stores')
        .select('*', { count: 'exact', head: true })

      // Fetch shopping lists count
      const { count: shoppingListsCount } = await supabase
        .from('shopping_lists')
        .select('*', { count: 'exact', head: true })

      // Fetch store posts count
      const { count: postsCount } = await supabase
        .from('store_posts')
        .select('*', { count: 'exact', head: true })

      // Fetch reviews count
      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalUsers: usersCount || 0,
        totalProducts: productsCount || 0,
        totalStores: storesCount || 0,
        totalShoppingLists: shoppingListsCount || 0,
        totalPosts: postsCount || 0,
        totalReviews: reviewsCount || 0,
        totalOrders: 0, // Placeholder
        totalRevenue: 0 // Placeholder
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )

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
              <h1 className="text-3xl font-bold text-gray-900">1Cent Dashboard</h1>
              <p className="text-gray-600">Analytics and management overview</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            color="bg-green-500"
          />
          <StatCard
            title="Total Stores"
            value={stats.totalStores}
            icon={Store}
            color="bg-purple-500"
          />
          <StatCard
            title="Shopping Lists"
            value={stats.totalShoppingLists}
            icon={ShoppingCart}
            color="bg-orange-500"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Store Posts"
            value={stats.totalPosts}
            icon={Activity}
            color="bg-indigo-500"
          />
          <StatCard
            title="Reviews"
            value={stats.totalReviews}
            icon={Star}
            color="bg-yellow-500"
          />
          <StatCard
            title="Orders"
            value={stats.totalOrders}
            icon={TrendingUp}
            color="bg-red-500"
          />
          <StatCard
            title="Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={TrendingUp}
            color="bg-emerald-500"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">New user registered</span>
                <span className="text-xs text-gray-400 ml-auto">2 min ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Product added to store</span>
                <span className="text-xs text-gray-400 ml-auto">5 min ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">New shopping list created</span>
                <span className="text-xs text-gray-400 ml-auto">10 min ago</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 text-sm">
                View Users
              </button>
              <button className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 text-sm">
                Manage Products
              </button>
              <button className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 text-sm">
                Store Analytics
              </button>
              <button className="bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 text-sm">
                Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 