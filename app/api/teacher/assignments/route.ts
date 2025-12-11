import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { AssignmentType } from '@prisma/client'

const createAssignmentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(AssignmentType),
  dueDate: z.string().datetime(),
  points: z.number().positive(),
  classIds: z.array(z.string()).min(1),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createAssignmentSchema.parse(body)

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    // Verify teacher has access to all selected classes
    const teacherClasses = await prisma.classTeacher.findMany({
      where: {
        teacherId: teacher.id,
        classId: { in: data.classIds },
      },
    })

    if (teacherClasses.length !== data.classIds.length) {
      return NextResponse.json(
        { error: 'You do not have access to one or more selected classes' },
        { status: 403 }
      )
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        teacherId: teacher.id,
        title: data.title,
        description: data.description,
        type: data.type,
        dueDate: new Date(data.dueDate),
        points: data.points,
        isPublished: true,
        classLinks: {
          create: data.classIds.map((classId) => ({
            classId,
          })),
        },
      },
      include: {
        classLinks: {
          include: {
            class: true,
          },
        },
      },
    })

    // Create student assignments for all enrolled students
    for (const classId of data.classIds) {
      const enrollments = await prisma.classEnrollment.findMany({
        where: { classId },
      })

      await prisma.studentAssignment.createMany({
        data: enrollments.map((enrollment) => ({
          assignmentId: assignment.id,
          studentId: enrollment.studentId,
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({ assignment }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Create assignment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    const assignments = await prisma.assignment.findMany({
      where: { teacherId: teacher.id },
      include: {
        classLinks: {
          include: {
            class: true,
          },
        },
        grades: true,
      },
      orderBy: {
        dueDate: 'desc',
      },
    })

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error('Get assignments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

