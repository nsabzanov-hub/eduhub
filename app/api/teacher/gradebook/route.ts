import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    if (!classId) {
      return NextResponse.json({ error: 'Class ID required' }, { status: 400 })
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      )
    }

    // Verify teacher has access to this class
    const classTeacher = await prisma.classTeacher.findFirst({
      where: {
        teacherId: teacher.id,
        classId,
      },
    })

    if (!classTeacher) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get class with enrollments and assignments
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                user: true,
                grades: {
                  include: {
                    assignment: {
                      include: {
                        class: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        assignments: {
          orderBy: {
            dueDate: 'desc',
          },
        },
      },
    })

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // All assignments on this class already belong to this class
    const assignments = classData.assignments.map((a) => ({
      id: a.id,
      title: a.title,
      dueDate: a.dueDate.toISOString(),
      points: a.points,
    }))

    // Format students with grades for this class
    const students = classData.enrollments.map((enrollment) => {
      const student = enrollment.student
      const studentGrades = student.grades.filter(
        (grade) => grade.assignment.classId === classId
      )

      const totalPoints = studentGrades.reduce((sum, g) => sum + g.score, 0)
      const maxPoints = studentGrades.reduce((sum, g) => sum + g.maxPoints, 0)
      const average = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0

      return {
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        studentId: student.studentId,
        average,
        grades: studentGrades.map((g) => ({
          assignmentId: g.assignmentId,
          assignmentTitle: g.assignment.title,
          score: g.score,
          maxPoints: g.maxPoints,
          percentage: g.percentage,
        })),
      }
    })

    return NextResponse.json({ students, assignments })
  } catch (error) {
    console.error('Get gradebook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
