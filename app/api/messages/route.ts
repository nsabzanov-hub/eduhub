import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const sendMessageSchema = z.object({
  recipientType: z.enum(['user', 'class', 'grade']),
  recipientIds: z.array(z.string()).min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  isEmergency: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = sendMessageSchema.parse(body)

    // Get recipient emails based on type
    const recipientEmails: string[] = []

    if (data.recipientType === 'user') {
      const users = await prisma.user.findMany({
        where: { id: { in: data.recipientIds } },
      })
      recipientEmails.push(...users.map((u) => u.email))
    } else if (data.recipientType === 'class') {
      // Get all students and parents in the selected classes
      const classes = await prisma.class.findMany({
        where: { id: { in: data.recipientIds } },
        include: {
          enrollments: {
            include: {
              student: {
                include: {
                  user: true,
                  parentLinks: {
                    include: {
                      parent: {
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
        },
      })

      for (const classData of classes) {
        for (const enrollment of classData.enrollments) {
          // Add student email
          recipientEmails.push(enrollment.student.user.email)
          // Add parent emails
          for (const parentLink of enrollment.student.parentLinks) {
            recipientEmails.push(parentLink.parent.user.email)
          }
        }
      }
    }

    // Remove duplicates
    const uniqueEmails = [...new Set(recipientEmails)]

    // Create message record
    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        subject: data.subject,
        body: data.body,
        isEmail: true,
        isEmergency: data.isEmergency || false,
      },
    })

    // Send emails
    const emailResults = await Promise.all(
      uniqueEmails.map((email) =>
        sendEmail({
          to: email,
          subject: data.isEmergency ? `[URGENT] ${data.subject}` : data.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0284c7;">${data.subject}</h2>
              <div style="margin: 20px 0; line-height: 1.6;">
                ${data.body.replace(/\n/g, '<br>')}
              </div>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="color: #64748b; font-size: 12px;">
                This message was sent from EduHub by ${user.firstName} ${user.lastName}
              </p>
            </div>
          `,
        })
      )
    )

    // Create message recipients
    await prisma.messageRecipient.createMany({
      data: data.recipientIds.map((recipientId) => ({
        messageId: message.id,
        recipientType: data.recipientType,
        recipientId: recipientId,
      })),
    })

    return NextResponse.json({
      success: true,
      messageId: message.id,
      emailsSent: emailResults.filter((r) => r.success).length,
      totalRecipients: uniqueEmails.length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

