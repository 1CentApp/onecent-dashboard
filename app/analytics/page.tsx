'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  Users, 
  ShoppingCart, 
  Store, 
  TrendingUp, 
  Activity,
  MapPin,
  Star,
  Package,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Eye,
  Download
} from 'lucide-react'

interface AnalyticsData {
  totalUsers: number
  totalProducts: number
  totalStores: number
  totalShoppingLists: number
  totalPosts: number
  totalReviews: number
  userGrowth: { date: string; count: number }[]
  productGrowth: { date: string; count: number }[]
  topBrands: { brand: string; count: number }[]
  topCategories: { category: string; count: number }[]
  recentActivity: { type: string; description: string; timestamp: string }[]
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalProducts: 0,
    totalStores: 0,
    totalShoppingLists: 0,
    totalPosts: 0,
    totalReviews: 0,
    userGrowth: [],
    productGrowth: [],
    topBrands: [],
    topCategories: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      // Fetch basic counts
      const [
        { count: usersCount },
        { count: productsCount },
        { count: storesCount },
        { count: shoppingListsCount },
        { count: postsCount },
        { count: reviewsCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('stores').select('*', { count: 'exact', head: true }),
        supabase.from('shopping_lists').select('*', { count: 'exact', head: true }),
        supabase.from('store_posts').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true })
      ])

      // Fetch recent users for activity
      const { data: recentUsers } = await supabase
        .from('users')
        .select('id, email, display_name, location, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch recent products
      const { data: recentProducts } = await supabase
        .from('products')
        .select('id, product_name, brand, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      // Generate mock growth data (in real app, this would come from actual analytics)
      const userGrowth = generateGrowthData(usersCount || 0, 7)
      const productGrowth = generateGrowthData(productsCount || 0, 7)

      // Generate top brands and categories
      const { data: products } = await supabase
        .from('products')
        .select('brand, category')

      const brandCounts = products?.reduce((acc: any, product) => {
        if (product.brand) {
          acc[product.brand] = (acc[product.brand] || 0) + 1
        }
        return acc
      }, {}) || {}

      const categoryCounts = products?.reduce((acc: any, product) => {
        if (product.category) {
          acc[product.category] = (acc[product.category] || 0) + 1
        }
        return acc
      }, {}) || {}

      const topBrands = Object.entries(brandCounts)
        .map(([brand, count]) => ({ brand, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Generate recent activity
      const recentActivity = [
        ...(recentUsers || []).map(user => ({
          type: 'user_registered',
          description: `${user.display_name || user.email || 'Guest'} registered`,
          timestamp: user.created_at
        })),
        ...(recentProducts || []).map(product => ({
          type: 'product_added',
          description: `Product "${product.product_name}" added`,
          timestamp: product.created_at
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)

      setAnalyticsData({
        totalUsers: usersCount || 0,
        totalProducts: productsCount || 0,
        totalStores: storesCount || 0,
        totalShoppingLists: shoppingListsCount || 0,
        totalPosts: postsCount || 0,
        totalReviews: reviewsCount || 0,
        userGrowth,
        productGrowth,
        topBrands,
        topCategories,
        recentActivity
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateGrowthData = (total: number, days: number) => {
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * (total / days) + total / days / 2)
      })
    }
    return data
  }

  const formatActivityDescription = (activity: any) => {
    switch (activity.type) {
      case 'user_registered':
        return activity.description
      case 'product_added':
        return activity.description
      default:
        return activity.description
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
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Track your app's performance and user activity</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stores</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalStores}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shopping Lists</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalShoppingLists}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analyticsData.userGrowth.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(data.count / Math.max(...analyticsData.userGrowth.map(d => d.count))) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{data.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Growth Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Growth</h3>
              <Package className="w-5 h-5 text-green-500" />
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analyticsData.productGrowth.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${(data.count / Math.max(...analyticsData.productGrowth.map(d => d.count))) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{data.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Brands */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Brands</h3>
            <div className="space-y-3">
              {analyticsData.topBrands.map((brand, index) => (
                <div key={brand.brand} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{brand.brand}</span>
                  </div>
                  <span className="text-sm text-gray-500">{brand.count} products</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
            <div className="space-y-3">
              {analyticsData.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{category.category}</span>
                  </div>
                  <span className="text-sm text-gray-500">{category.count} products</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'user_registered' ? (
                      <Users className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Package className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {formatActivityDescription(activity)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 