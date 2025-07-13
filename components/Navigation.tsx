'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BarChart3, 
  Users, 
  Package, 
  Store, 
  Settings,
  Home
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Approve Products', href: '/products/pending', icon: Package },
  { name: 'Approve Images', href: '/images/pending', icon: Package },
  { name: 'Stores', href: '/stores', icon: Store },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                1Cent Dashboard
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Admin</span>
                <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 