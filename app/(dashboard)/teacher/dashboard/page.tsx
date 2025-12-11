import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import { 
  Users, 
  BookOpen, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'

async function getDashboardData(userId: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: {
      classes: {
        include: {
          class: {
            include: {
              enrollments: {
                include: {
                  student: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      assignments: {
        include: {
          classLinks: {
            include: {
              class: true,
            },
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
        take: 5,
      },
    },
  })

  if (!teacher) return null

  const totalStudents = new Set(
    teacher.classes.flatMap((ct) =>
      ct.class.enrollments.map((e) => e.studentId)
    )
  ).size

  const totalClasses = teacher.classes.length

  // Calculate missing assignments (simplified - would need more logic)
  const missingAssignments = 0 // TODO: Calculate based on due dates and submissions

  // Calculate struggling students (simplified)
  const strugglingStudents = 0 // TODO: Calculate based on grades

  return {
    totalStudents,
    totalClasses,
    missingAssignments,
    strugglingStudents,
    upcomingAssignments: teacher.assignments.map((a) => ({
      id: a.id,
      title: a.title,
      dueDate: a.dueDate,
      classes: a.classLinks.map((cl) => cl.class.name),
    })),
  }
}

export default async function TeacherDashboard() {
  // This would be replaced with actual auth check
  // For now, we'll use a mock user ID
  const mockUserId = 'mock-teacher-id'
  
  // In production, get from session:
  // const user = await getAuthUser(request)
  // if (!user || user.role !== 'TEACHER') redirect('/login')

  const data = await getDashboardData(mockUserId)

  if (!data) {
    return (
      <DashboardLayout userRole="TEACHER">
        <div>No data available</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="TEACHER">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Teacher Dashboard</h1>
        <p className="text-secondary-600 mt-1">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Total Students</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">
                {data.totalStudents}
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
              <p className="text-sm text-secondary-600">Classes</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">
                {data.totalClasses}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Missing Assignments</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">
                {data.missingAssignments}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Struggling Students</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">
                {data.strugglingStudents}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">
            Upcoming Assignments
          </h2>
          {data.upcomingAssignments.length === 0 ? (
            <p className="text-secondary-600">No upcoming assignments</p>
          ) : (
            <div className="space-y-4">
              {data.upcomingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border-l-4 border-primary-500 pl-4 py-2"
                >
                  <h3 className="font-medium text-secondary-900">
                    {assignment.title}
                  </h3>
                  <div className="flex items-center text-sm text-secondary-600 mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Due: {formatDate(assignment.dueDate)}</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600 mt-1">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{assignment.classes.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a
              href="/teacher/assignments/new"
              className="block w-full btn-primary text-center"
            >
              Create Assignment
            </a>
            <a
              href="/teacher/attendance"
              className="block w-full btn-secondary text-center"
            >
              Take Attendance
            </a>
            <a
              href="/teacher/gradebook"
              className="block w-full btn-secondary text-center"
            >
              View Gradebook
            </a>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

