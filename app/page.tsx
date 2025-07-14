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
  const [recentActivity, setRecentActivity] = useState<any[]>([])
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

      // Fetch recent users for activity
      const { data: recentUsers } = await supabase
        .from('users')
        .select('id, email, display_name, location, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch recent products
      const { data: recentProducts } = await supabase
        .from('products')
        .select('id, product_name, brand, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch recent shopping lists
      const { data: recentShoppingLists } = await supabase
        .from('shopping_lists')
        .select('id, name, user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      // Generate recent activity
      const activity = [
        ...(recentUsers || []).map(user => ({
          type: 'user_registered',
          description: `${user.display_name || user.email || 'Guest'} registered`,
          details: `User type: ${user.email ? 'Email User' : 'Guest'}, Location: ${user.location || 'Unknown'}`,
          timestamp: user.created_at
        })),
        ...(recentProducts || []).map(product => ({
          type: 'product_added',
          description: `Product "${product.product_name}" added`,
          details: `Brand: ${product.brand || 'Unknown'}`,
          timestamp: product.created_at
        })),
        ...(recentShoppingLists || []).map(list => ({
          type: 'shopping_list_created',
          description: `Shopping list "${list.name}" created`,
          details: `User ID: ${list.user_id}`,
          timestamp: list.created_at
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)

      setRecentActivity(activity)

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
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'user_registered' ? 'bg-blue-500' :
                      activity.type === 'product_added' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <a href="/users" className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 text-sm text-center">
                View Users
              </a>
              <a href="/products" className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 text-sm text-center">
                Manage Products
              </a>
              <a href="/stores" className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 text-sm text-center">
                Store Management
              </a>
              <a href="/analytics" className="bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 text-sm text-center">
                Analytics
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 