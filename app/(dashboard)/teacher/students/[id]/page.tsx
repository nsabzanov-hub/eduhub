'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import { 
  User, 
  Calendar, 
  TrendingUp, 
  Mail, 
  Phone,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface StudentProfile {
  id: string
  name: string
  studentId: string
  gradeLevel: number
  homeroom: string | null
  avatar: string | null
  attendance: {
    totalPresent: number
    totalAbsent: number
    totalLate: number
    longestStreak: number
    recentAbsences: Array<{
      date: string
      status: string
      class: string
    }>
  }
  grades: {
    currentAverage: number
    trend: Array<{
      date: string
      average: number
    }>
    bySubject: Array<{
      subject: string
      average: number
    }>
  }
  behavior: Array<{
    id: string
    type: string
    title: string
    date: string
  }>
  parents: Array<{
    id: string
    name: string
    email: string
    phone: string | null
    relationship: string | null
  }>
}

export default function StudentProfilePage() {
  const params = useParams()
  const studentId = params.id as string
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (studentId) {
      fetch(`/api/teacher/students/${studentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) {
            setProfile(data.profile)
          }
        })
        .catch((error) => console.error('Failed to load profile:', error))
        .finally(() => setLoading(false))
    }
  }, [studentId])

  if (loading) {
    return (
      <DashboardLayout userRole="TEACHER">
        <Card>
          <p className="text-secondary-600">Loading student profile...</p>
        </Card>
      </DashboardLayout>
    )
  }

  if (!profile) {
    return (
      <DashboardLayout userRole="TEACHER">
        <Card>
          <p className="text-secondary-600">Student not found</p>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="TEACHER">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Student Profile</h1>
        <p className="text-secondary-600 mt-1">{profile.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <User className="h-8 w-8 text-primary-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-secondary-900">{profile.name}</h2>
              <p className="text-secondary-600">Grade {profile.gradeLevel}</p>
              {profile.homeroom && (
                <p className="text-sm text-secondary-500">Homeroom: {profile.homeroom}</p>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Attendance Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-secondary-600">Present:</span>
              <span className="font-semibold text-green-600">{profile.attendance.totalPresent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Absent:</span>
              <span className="font-semibold text-red-600">{profile.attendance.totalAbsent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Late:</span>
              <span className="font-semibold text-yellow-600">{profile.attendance.totalLate}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-secondary-200">
              <span className="text-secondary-600">Longest Absence Streak:</span>
              <span className="font-semibold text-secondary-900">
                {profile.attendance.longestStreak} days
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Current Average
          </h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary-600">
              {profile.grades.currentAverage.toFixed(1)}%
            </p>
            <p className="text-sm text-secondary-600 mt-2">Overall Grade</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Grade Trend
          </h3>
          {profile.grades.trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={profile.grades.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Average']}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-secondary-600">No grade data available</p>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Grades by Subject
          </h3>
          {profile.grades.bySubject.length > 0 ? (
            <div className="space-y-3">
              {profile.grades.bySubject.map((subject) => (
                <div key={subject.subject} className="flex justify-between items-center">
                  <span className="text-secondary-700">{subject.subject}</span>
                  <span className="font-semibold text-secondary-900">
                    {subject.average.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-600">No subject data available</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Behavior Notes
          </h3>
          {profile.behavior.length > 0 ? (
            <div className="space-y-3">
              {profile.behavior.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    note.type === 'positive'
                      ? 'bg-green-50 border-green-500'
                      : note.type === 'concern'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-secondary-900">{note.title}</h4>
                      <p className="text-sm text-secondary-600 mt-1">
                        {new Date(note.date).toLocaleDateString()}
                      </p>
                    </div>
                    {note.type === 'positive' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-600">No behavior notes</p>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Parent Contacts
          </h3>
          {profile.parents.length > 0 ? (
            <div className="space-y-4">
              {profile.parents.map((parent) => (
                <div key={parent.id} className="p-4 bg-secondary-50 rounded-lg">
                  <h4 className="font-medium text-secondary-900">{parent.name}</h4>
                  {parent.relationship && (
                    <p className="text-sm text-secondary-600">{parent.relationship}</p>
                  )}
                  <div className="mt-2 space-y-1">
                    <a
                      href={`mailto:${parent.email}`}
                      className="flex items-center text-sm text-primary-600 hover:underline"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {parent.email}
                    </a>
                    {parent.phone && (
                      <a
                        href={`tel:${parent.phone}`}
                        className="flex items-center text-sm text-primary-600 hover:underline"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {parent.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-600">No parent contacts</p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}

