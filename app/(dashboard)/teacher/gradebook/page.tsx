'use client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { BookOpen, Users } from 'lucide-react'

type TeacherClass = {
  id: string
  name: string
  subject: string
  section: string | null
}

type Assignment = {
  id: string
  title: string
  dueDate: string
  points: number
}

type StudentGrade = {
  assignmentId: string
  assignmentTitle: string
  score: number
  maxPoints: number
  percentage: number
}

type Student = {
  id: string
  name: string
  studentId: string
  average: number
  grades: StudentGrade[]
}

export default function GradebookPage() {
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loadingGradebook, setLoadingGradebook] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load the teacher's classes once
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoadingClasses(true)
        setError(null)

        const res = await fetch('/api/teacher/classes')
        if (!res.ok) {
          throw new Error('Failed to load classes')
        }
        const data = await res.json()
        const cls: TeacherClass[] = data.classes ?? data.data ?? []

        setClasses(cls)

        // Auto-select first class if exists
        if (cls.length > 0) {
          setSelectedClassId(cls[0].id)
        }
      } catch (err: any) {
        console.error('Failed to load classes:', err)
        setError('Could not load classes.')
      } finally {
        setLoadingClasses(false)
      }
    }

    loadClasses()
  }, [])

  // Load gradebook whenever selectedClassId changes
  useEffect(() => {
    if (!selectedClassId) return

    const loadGradebook = async () => {
      try {
        setLoadingGradebook(true)
        setError(null)

        const res = await fetch(
          `/api/teacher/gradebook?classId=${encodeURIComponent(selectedClassId)}`
        )
        if (!res.ok) {
          throw new Error('Failed to load gradebook')
        }

        const data = await res.json()
        setAssignments(data.assignments ?? [])
        setStudents(data.students ?? [])
      } catch (err: any) {
        console.error('Failed to load gradebook:', err)
        setError('Could not load gradebook.')
      } finally {
        setLoadingGradebook(false)
      }
    }

    loadGradebook()
  }, [selectedClassId])

  return (
    <DashboardLayout userRole="TEACHER">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Gradebook</h1>
          <p className="text-secondary-600 mt-1">
            View student grades by class
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-secondary-700">Class:</label>
          <select
            className="border border-secondary-300 rounded-md px-2 py-1 text-sm"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={loadingClasses || classes.length === 0}
          >
            {loadingClasses && <option>Loading...</option>}
            {!loadingClasses && classes.length === 0 && (
              <option>No classes</option>
            )}
            {!loadingClasses &&
              classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <Card>
        {error && (
          <div className="mb-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loadingGradebook ? (
          <p className="text-secondary-600">Loading gradebook...</p>
        ) : !selectedClassId ? (
          <p className="text-secondary-600">Select a class to see grades.</p>
        ) : students.length === 0 ? (
          <div className="py-8 text-center text-secondary-600">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-secondary-400" />
            <p>No students or grades found for this class.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-2 pr-4">Student</th>
                  <th className="text-left py-2 pr-4">Student ID</th>
                  <th className="text-left py-2 pr-4">Average</th>
                  {assignments.map((a) => (
                    <th key={a.id} className="text-left py-2 pr-4">
                      {a.title}
                      <div className="text-xs text-secondary-500">
                        {a.points} pts
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-secondary-100">
                    <td className="py-2 pr-4 flex items-center gap-2">
                      <Users className="h-4 w-4 text-secondary-400" />
                      {s.name}
                    </td>
                    <td className="py-2 pr-4">{s.studentId}</td>
                    <td className="py-2 pr-4 font-semibold">
                      {s.average.toFixed(1)}%
                    </td>
                    {assignments.map((a) => {
                      const g = s.grades.find(
                        (grade) => grade.assignmentId === a.id
                      )
                      if (!g) {
                        return (
                          <td
                            key={a.id}
                            className="py-2 pr-4 text-secondary-400"
                          >
                            –
                          </td>
                        )
                      }
                      return (
                        <td key={a.id} className="py-2 pr-4">
                          {g.score}/{g.maxPoints} ({g.percentage.toFixed(1)}%)
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}