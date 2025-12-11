import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AttendanceStatus } from '@prisma/client'
import { z } from 'zod'

const saveAttendanceSchema = z.object({
  classId: z.string(),
  date: z.string(),
  period: z.number().nullable().optional(),
  attendance: z.array(
    z.object({
      studentId: z.string(),
      status: z.nativeEnum(AttendanceStatus),
    })
  ),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const dateStr = searchParams.get('date')
    const periodStr = searchParams.get('period')

    if (!classId || !dateStr) {
      return NextResponse.json(
        { error: 'Class ID and date required' },
        { status: 400 }
      )
    }

    const date = new Date(dateStr)
    const period = periodStr ? parseInt(periodStr) : null

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    // Verify teacher has access
    const classTeacher = await prisma.classTeacher.findFirst({
      where: {
        teacherId: teacher.id,
        classId,
      },
    })

    if (!classTeacher) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get class enrollments
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                user: true,
                attendance: {
                  where: {
                    classId,
                    date: {
                      gte: new Date(date.setHours(0, 0, 0, 0)),
                      lt: new Date(date.setHours(23, 59, 59, 999)),
                    },
                    period: period || null,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    const students = classData.enrollments.map((enrollment) => {
      const student = enrollment.student
      const attendanceRecord = student.attendance[0] || null

      return {
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        studentId: student.studentId,
        currentStatus: attendanceRecord?.status || null,
      }
    })

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = saveAttendanceSchema.parse(body)

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    // Verify teacher has access
    const classTeacher = await prisma.classTeacher.findFirst({
      where: {
        teacherId: teacher.id,
        classId: data.classId,
      },
    })

    if (!classTeacher) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const date = new Date(data.date)
    date.setHours(0, 0, 0, 0)

    // Save or update attendance for each student
    const results = await Promise.all(
      data.attendance.map(async ({ studentId, status }) => {
        // Use upsert to handle both create and update
        const attendanceRecord = await prisma.attendance.upsert({
          where: {
            classId_studentId_date_period: {
              classId: data.classId,
              studentId,
              date,
              period: data.period || null,
            },
          },
          update: {
            status,
            markedBy: teacher.id,
            updatedAt: new Date(),
          },
          create: {
            classId: data.classId,
            studentId,
            date,
            period: data.period || null,
            status,
            markedBy: teacher.id,
          },
        })

        return attendanceRecord
      })
    )

    return NextResponse.json({
      success: true,
      count: results.length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Save attendance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

