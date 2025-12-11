'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Eye, User, TrendingUp } from 'lucide-react'

interface Student {
  id: string
  name: string
  studentId: string
  average: number
  grades: Array<{
    assignmentId: string
    assignmentTitle: string
    score: number
    maxPoints: number
    percentage: number
  }>
}

interface Assignment {
  id: string
  title: string
  dueDate: string
  points: number
}

export default function GradebookPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const classId = searchParams.get('classId')
  
  const [selectedClass, setSelectedClass] = useState<string>(classId || '')
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([])
  const [students, setStudents] = useState<Student[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/teacher/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) {
          setClasses(data.classes)
          if (data.classes.length > 0 && !selectedClass) {
            setSelectedClass(data.classes[0].id)
          }
        }
      })
  }, [])

  useEffect(() => {
    if (selectedClass) {
      loadGradebook()
    }
  }, [selectedClass])

  const loadGradebook = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/gradebook?classId=${selectedClass}`)
      const data = await res.json()
      if (data.students && data.assignments) {
        setStudents(data.students)
        setAssignments(data.assignments)
      }
    } catch (error) {
      console.error('Failed to load gradebook:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student)
  }

  const closeStudentView = () => {
    setSelectedStudent(null)
  }

  return (
    <DashboardLayout userRole="TEACHER">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Gradebook</h1>
        <p className="text-secondary-600 mt-1">
          View and manage grades. Click on a student for a private view.
        </p>
      </div>

      <div className="mb-4">
        <label className="label">Select Class</label>
        <select
          className="input max-w-xs"
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

      {loading ? (
        <Card>
          <p className="text-secondary-600">Loading gradebook...</p>
        </Card>
      ) : selectedClass && students.length > 0 ? (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700">
                    Student
                  </th>
                  {assignments.map((assignment) => (
                    <th
                      key={assignment.id}
                      className="px-4 py-3 text-left text-sm font-semibold text-secondary-700 min-w-[120px]"
                    >
                      <div className="flex flex-col">
                        <span className="truncate">{assignment.title}</span>
                        <span className="text-xs text-secondary-500 font-normal">
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-700">
                    Average
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-secondary-50 cursor-pointer transition-colors"
                    onClick={() => handleStudentClick(student)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-secondary-400" />
                        <span className="font-medium text-secondary-900">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    {assignments.map((assignment) => {
                      const grade = student.grades.find(
                        (g) => g.assignmentId === assignment.id
                      )
                      return (
                        <td key={assignment.id} className="px-4 py-3">
                          {grade ? (
                            <span className="text-secondary-900">
                              {grade.score} / {grade.maxPoints} ({grade.percentage}%)
                            </span>
                          ) : (
                            <span className="text-secondary-400">—</span>
                          )}
                        </td>
                      )
                    })}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-secondary-900">
                        {student.average.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-secondary-600">
            {selectedClass ? 'No students found' : 'Please select a class'}
          </p>
        </Card>
      )}

      {/* Private Student View Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  {selectedStudent.name}
                </h2>
                <p className="text-secondary-600">Student ID: {selectedStudent.studentId}</p>
              </div>
              <Button variant="ghost" onClick={closeStudentView}>
                Close
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-3 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Overall Performance
                </h3>
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-primary-700">
                    {selectedStudent.average.toFixed(1)}%
                  </p>
                  <p className="text-sm text-secondary-600 mt-1">Current Average</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                  Recent Grades
                </h3>
                <div className="space-y-2">
                  {selectedStudent.grades.map((grade) => (
                    <div
                      key={grade.assignmentId}
                      className="flex justify-between items-center p-3 bg-secondary-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-secondary-900">
                          {grade.assignmentTitle}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-secondary-900">
                          {grade.score} / {grade.maxPoints}
                        </p>
                        <p className="text-sm text-secondary-600">
                          {grade.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-secondary-200">
                <Button
                  variant="primary"
                  onClick={() => {
                    router.push(`/teacher/students/${selectedStudent.id}`)
                    closeStudentView()
                  }}
                >
                  View Full Profile
                </Button>
                <Button variant="secondary" onClick={closeStudentView}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}

