'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Mail, Send, User, Users, BookOpen } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Class {
  id: string
  name: string
}

export default function MessagesPage() {
  const [recipientType, setRecipientType] = useState<'user' | 'class' | 'grade'>('user')
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isEmergency, setIsEmergency] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Load users and classes
    Promise.all([
      fetch('/api/users').then((res) => res.json()),
      fetch('/api/teacher/classes').then((res) => res.json()),
    ])
      .then(([usersData, classesData]) => {
        if (usersData.users) setUsers(usersData.users)
        if (classesData.classes) setClasses(classesData.classes)
      })
      .catch((error) => console.error('Failed to load data:', error))
  }, [])

  const handleRecipientToggle = (id: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (selectedRecipients.length === 0) {
      setError('Please select at least one recipient')
      return
    }

    if (!subject || !body) {
      setError('Subject and message body are required')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientType,
          recipientIds: selectedRecipients,
          subject,
          body,
          isEmergency,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send message')
        return
      }

      setSuccess(true)
      setSubject('')
      setBody('')
      setSelectedRecipients([])
      setIsEmergency(false)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getAvailableRecipients = () => {
    switch (recipientType) {
      case 'user':
        return users
      case 'class':
        return classes
      default:
        return []
    }
  }

  return (
    <DashboardLayout userRole="TEACHER">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Send Message</h1>
        <p className="text-secondary-600 mt-1">
          Send emails to students, parents, or entire classes
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Recipient Type</label>
            <div className="flex space-x-4 mt-2">
              <button
                type="button"
                onClick={() => {
                  setRecipientType('user')
                  setSelectedRecipients([])
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  recipientType === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Individual
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecipientType('class')
                  setSelectedRecipients([])
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  recipientType === 'class'
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Class
              </button>
            </div>
          </div>

          <div>
            <label className="label">
              Select Recipients ({selectedRecipients.length} selected)
            </label>
            <div className="border border-secondary-200 rounded-lg p-4 max-h-64 overflow-y-auto mt-2">
              {getAvailableRecipients().length === 0 ? (
                <p className="text-secondary-600">No recipients available</p>
              ) : (
                <div className="space-y-2">
                  {getAvailableRecipients().map((recipient) => (
                    <label
                      key={recipient.id}
                      className="flex items-center space-x-3 p-2 hover:bg-secondary-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(recipient.id)}
                        onChange={() => handleRecipientToggle(recipient.id)}
                        className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-secondary-900">
                        {recipientType === 'user' ? (
                          <>
                            {(recipient as User).name} ({(recipient as User).email})
                          </>
                        ) : (
                          (recipient as Class).name
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="Message subject"
          />

          <div>
            <label className="label">Message Body</label>
            <textarea
              className="input min-h-[200px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              placeholder="Type your message here..."
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-secondary-700">
                Mark as emergency alert (high priority)
              </span>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Message sent successfully!
            </div>
          )}

          <div className="flex space-x-4">
            <Button type="submit" disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSubject('')
                setBody('')
                setSelectedRecipients([])
                setIsEmergency(false)
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-6">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Quick Actions
        </h2>
        <div className="space-y-3">
          <p className="text-sm text-secondary-600">
            <strong>Tip:</strong> You can also email individual users by clicking on their
            profile and using the email button. This allows for more personalized
            communication.
          </p>
        </div>
      </Card>
    </DashboardLayout>
  )
}

