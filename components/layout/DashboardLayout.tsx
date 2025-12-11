'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  FileText, 
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  User
} from 'lucide-react'
import Button from '@/components/ui/Button'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: 'TEACHER' | 'STUDENT' | 'PARENT' | 'ADMIN'
}

const roleRoutes = {
  TEACHER: [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Assignments', href: '/teacher/assignments', icon: BookOpen },
    { name: 'Gradebook', href: '/teacher/gradebook', icon: FileText },
    { name: 'Students', href: '/teacher/students', icon: Users },
    { name: 'Attendance', href: '/teacher/attendance', icon: Calendar },
    { name: 'Messages', href: '/teacher/messages', icon: MessageSquare },
    { name: 'Reports', href: '/teacher/reports', icon: BarChart3 },
  ],
  PARENT: [
    { name: 'Dashboard', href: '/parent/dashboard', icon: LayoutDashboard },
    { name: 'Children', href: '/parent/children', icon: Users },
    { name: 'Assignments', href: '/parent/assignments', icon: BookOpen },
    { name: 'Grades', href: '/parent/grades', icon: FileText },
    { name: 'Calendar', href: '/parent/calendar', icon: Calendar },
    { name: 'Messages', href: '/parent/messages', icon: MessageSquare },
    { name: 'Payments', href: '/parent/payments', icon: FileText },
  ],
  STUDENT: [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Assignments', href: '/student/assignments', icon: BookOpen },
    { name: 'Grades', href: '/student/grades', icon: FileText },
    { name: 'Schedule', href: '/student/schedule', icon: Calendar },
  ],
  ADMIN: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Classes', href: '/admin/classes', icon: BookOpen },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ],
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login')
        } else {
          setUser(data.user)
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-secondary-600">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  const routes = roleRoutes[userRole] || []

  return (
    <div className="min-h-screen bg-secondary-50">
      <nav className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-700">EduHub</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {routes.map((route) => {
                  const Icon = route.icon
                  const isActive = pathname === route.href
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-primary-500 text-primary-700'
                          : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                      }`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {route.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-secondary-700">
                <User className="h-4 w-4" />
                <span>{user.firstName} {user.lastName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

