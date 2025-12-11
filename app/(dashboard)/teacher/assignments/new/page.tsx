'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { AssignmentType } from '@prisma/client'

interface Class {
  id: string
  name: string
  subject: string
  section: string | null
}

export default function NewAssignmentPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<AssignmentType>('HOMEWORK')
  const [dueDate, setDueDate] = useState('')
  const [points, setPoints] = useState('100')
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch teacher's classes
    fetch('/api/teacher/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) {
          setClasses(data.classes)
        }
      })
      .catch((err) => console.error('Failed to load classes:', err))
  }, [])

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedClasses.length === 0) {
      setError('Please select at least one class')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          type,
          dueDate: new Date(dueDate).toISOString(),
          points: parseFloat(points),
          classIds: selectedClasses,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create assignment')
        return
      }

      router.push('/teacher/assignments')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout userRole="TEACHER">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Create Assignment</h1>
        <p className="text-secondary-600 mt-1">
          Create an assignment and assign it to multiple classes at once
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Assignment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Chapter 5 Reading Comprehension"
          />

          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Assignment instructions and details..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value as AssignmentType)}
                required
              >
                <option value="HOMEWORK">Homework</option>
                <option value="TEST">Test</option>
                <option value="QUIZ">Quiz</option>
                <option value="PROJECT">Project</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="label">Due Date</label>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Points</label>
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="label mb-3 block">
              Select Classes (Bulk Assignment)
            </label>
            <div className="border border-secondary-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              {classes.length === 0 ? (
                <p className="text-secondary-600">No classes available</p>
              ) : (
                <div className="space-y-2">
                  {classes.map((cls) => (
                    <label
                      key={cls.id}
                      className="flex items-center space-x-3 p-2 hover:bg-secondary-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(cls.id)}
                        onChange={() => handleClassToggle(cls.id)}
                        className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-secondary-900">
                        {cls.name} - {cls.subject}
                        {cls.section && ` (${cls.section})`}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedClasses.length > 0 && (
              <p className="mt-2 text-sm text-primary-600">
                ✓ This assignment will be assigned to {selectedClasses.length} class
                {selectedClasses.length !== 1 ? 'es' : ''}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Assignment'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  )
}

