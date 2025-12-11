'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { AttendanceStatus } from '@prisma/client'

interface Student {
  id: string
  name: string
  studentId: string
  currentStatus: AttendanceStatus | null
}

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null)
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([])
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/teacher/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) {
          setClasses(data.classes)
          if (data.classes.length > 0) {
            setSelectedClass(data.classes[0].id)
          }
        }
      })
  }, [])

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadAttendance()
    }
  }, [selectedClass, selectedDate, selectedPeriod])

  const loadAttendance = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/teacher/attendance?classId=${selectedClass}&date=${selectedDate}${selectedPeriod ? `&period=${selectedPeriod}` : ''}`
      )
      const data = await res.json()
      if (data.students) {
        setStudents(data.students)
        const attendanceMap: Record<string, AttendanceStatus> = {}
        data.students.forEach((s: Student) => {
          if (s.currentStatus) {
            attendanceMap[s.id] = s.currentStatus
          }
        })
        setAttendance(attendanceMap)
      }
    } catch (error) {
      console.error('Failed to load attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const handleSave = async () => {
    if (!selectedClass || !selectedDate) return

    setLoading(true)
    try {
      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          date: selectedDate,
          period: selectedPeriod,
          attendance: Object.entries(attendance).map(([studentId, status]) => ({
            studentId,
            status,
          })),
        }),
      })

      if (res.ok) {
        alert('Attendance saved successfully!')
        loadAttendance()
      } else {
        alert('Failed to save attendance')
      }
    } catch (error) {
      console.error('Failed to save attendance:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'ABSENT':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'LATE':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'PARTIAL_DAY':
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      default:
        return null
    }
  }

  return (
    <DashboardLayout userRole="TEACHER">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Take Attendance</h1>
        <p className="text-secondary-600 mt-1">
          Per-period attendance. Update status if a student arrives later.
        </p>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Class</label>
            <select
              className="input"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select a class...</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Period (Optional)</label>
            <select
              className="input"
              value={selectedPeriod || ''}
              onChange={(e) =>
                setSelectedPeriod(e.target.value ? parseInt(e.target.value) : null)
              }
            >
              <option value="">All Day</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                <option key={p} value={p}>
                  Period {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {selectedClass && students.length > 0 && (
        <Card>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-secondary-900">
              Students ({students.length})
            </h2>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>

          <div className="space-y-2">
            {students.map((student) => {
              const currentStatus = attendance[student.id] || student.currentStatus
              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(currentStatus || 'PRESENT')}
                    <div>
                      <p className="font-medium text-secondary-900">{student.name}</p>
                      <p className="text-sm text-secondary-600">ID: {student.studentId}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusChange(student.id, 'PRESENT')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        currentStatus === 'PRESENT'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-secondary-100 text-secondary-700 hover:bg-green-50'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'LATE')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        currentStatus === 'LATE'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-secondary-100 text-secondary-700 hover:bg-yellow-50'
                      }`}
                    >
                      Late
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'ABSENT')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        currentStatus === 'ABSENT'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-secondary-100 text-secondary-700 hover:bg-red-50'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'PARTIAL_DAY')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        currentStatus === 'PARTIAL_DAY'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-secondary-100 text-secondary-700 hover:bg-orange-50'
                      }`}
                    >
                      Partial
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You can update a student's status later if they arrive
              after being marked absent. Per-period attendance allows you to track attendance
              for each class period separately.
            </p>
          </div>
        </Card>
      )}
    </DashboardLayout>
  )
}

