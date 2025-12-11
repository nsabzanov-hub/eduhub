import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import { Users, BookOpen, TrendingUp, AlertCircle } from 'lucide-react'

export default function AdminDashboard() {
  // This would fetch real data from the API
  const stats = {
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    chronicAbsences: 0,
  }

  return (
    <DashboardLayout userRole="ADMIN">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Admin Dashboard</h1>
        <p className="text-secondary-600 mt-1">School-wide overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Total Students</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">
                {stats.totalStudents}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Total Teachers</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">
                {stats.totalTeachers}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Total Classes</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">
                {stats.totalClasses}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Chronic Absences</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">
                {stats.chronicAbsences}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a href="/admin/users" className="block w-full btn-primary text-center">
              Manage Users
            </a>
            <a href="/admin/classes" className="block w-full btn-secondary text-center">
              Manage Classes
            </a>
            <a href="/admin/reports" className="block w-full btn-secondary text-center">
              View Reports
            </a>
            <a href="/admin/analytics" className="block w-full btn-secondary text-center">
              Analytics Dashboard
            </a>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">
            Recent Activity
          </h2>
          <p className="text-secondary-600">Activity feed coming soon...</p>
        </Card>
      </div>
    </DashboardLayout>
  )
}

