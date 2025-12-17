'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Plus, BookOpen, Calendar, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Assignment {
  id: string
  title: string
  description: string | null
  type: string
  dueDate: string
  points: number
  isPublished: boolean
  class: {
    id: string
    name: string
  } | null
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      const res = await fetch('/api/teacher/assignments')
      const data = await res.json()
      if (data.assignments) {
        setAssignments(data.assignments)
      }
    } catch (error) {
      console.error('Failed to load assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout userRole="TEACHER">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Assignments</h1>
          <p className="text-secondary-600 mt-1">Manage your assignments</p>
        </div>
        <Link href="/teacher/assignments/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card>
          <p className="text-secondary-600">Loading assignments...</p>
        </Card>
      ) : assignments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              No assignments yet
            </h3>
            <p className="text-secondary-600 mb-4">
              Create your first assignment to get started
            </p>
            <Link href="/teacher/assignments/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-secondary-900">
                      {assignment.title}
                    </h3>
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                      {assignment.type}
                    </span>
                    {!assignment.isPublished && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                        Draft
                      </span>
                    )}
                  </div>

                  {assignment.description && (
                    <p className="text-secondary-600 mb-3">
                      {assignment.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Due: {formatDate(assignment.dueDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{assignment.points} points</span>
                    </div>
                    {assignment.class && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{assignment.class.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Link href={`/teacher/assignments/${assignment.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
