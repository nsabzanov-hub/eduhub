'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface EmailButtonProps {
  recipientEmail: string
  recipientName: string
  defaultSubject?: string
}

export default function EmailButton({
  recipientEmail,
  recipientName,
  defaultSubject,
}: EmailButtonProps) {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [subject, setSubject] = useState(defaultSubject || '')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!subject || !body) {
      setError('Subject and message are required')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientType: 'user',
          recipientIds: [recipientEmail], // This would be user ID in production
          subject,
          body,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send email')
        return
      }

      setSuccess(true)
      setBody('')
      setTimeout(() => {
        setShowEmailForm(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (showEmailForm) {
    return (
      <Card className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">
            Send Email to {recipientName}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setShowEmailForm(false)}>
            Close
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">To</label>
            <input
              type="email"
              className="input"
              value={recipientEmail}
              disabled
            />
          </div>

          <div>
            <label className="label">Subject</label>
            <input
              type="text"
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Message</label>
            <textarea
              className="input min-h-[150px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              Email sent successfully!
            </div>
          )}

          <div className="flex space-x-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Email'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEmailForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowEmailForm(true)}
      className="w-full sm:w-auto"
    >
      <Mail className="h-4 w-4 mr-2" />
      Send Email
    </Button>
  )
}

