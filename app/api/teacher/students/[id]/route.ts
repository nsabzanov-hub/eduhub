import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studentId = params.id

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        attendance: {
          include: {
            class: true,
          },
          orderBy: {
            date: 'desc',
          },
          take: 20,
        },
        grades: {
          include: {
            assignment: {
              include: {
                classLinks: {
                  include: {
                    class: true,
                  },
                },
              },
            },
          },
          orderBy: {
            gradedAt: 'desc',
          },
        },
        parentLinks: {
          include: {
            parent: {
              include: {
                user: true,
              },
            },
          },
        },
        behaviorNotes: {
          orderBy: {
            date: 'desc',
          },
          take: 10,
        },
        enrollments: {
          include: {
            class: true,
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Calculate attendance stats
    const attendanceStats = {
      totalPresent: student.attendance.filter((a) => a.status === 'PRESENT').length,
      totalAbsent: student.attendance.filter((a) => a.status === 'ABSENT').length,
      totalLate: student.attendance.filter((a) => a.status === 'LATE').length,
      longestStreak: 0, // TODO: Calculate longest absence streak
      recentAbsences: student.attendance
        .filter((a) => a.status === 'ABSENT' || a.status === 'LATE')
        .slice(0, 10)
        .map((a) => ({
          date: a.date.toISOString(),
          status: a.status,
          class: a.class.name,
        })),
    }

    // Calculate grade stats
    const allGrades = student.grades
    const currentAverage =
      allGrades.length > 0
        ? allGrades.reduce((sum, g) => sum + g.percentage, 0) / allGrades.length
        : 0

    // Group grades by subject
    const gradesBySubject = student.enrollments.map((enrollment) => {
      const classGrades = allGrades.filter((g) =>
        g.assignment.classLinks.some((cl) => cl.classId === enrollment.classId)
      )
      const average =
        classGrades.length > 0
          ? classGrades.reduce((sum, g) => sum + g.percentage, 0) / classGrades.length
          : 0
      return {
        subject: enrollment.class.subject,
        average,
      }
    })

    // Grade trend (simplified - would need time-based grouping)
    const gradeTrend = allGrades.slice(0, 10).map((g) => ({
      date: g.gradedAt.toISOString(),
      average: g.percentage,
    }))

    const profile = {
      id: student.id,
      name: `${student.user.firstName} ${student.user.lastName}`,
      studentId: student.studentId,
      gradeLevel: student.gradeLevel,
      homeroom: student.homeroom,
      avatar: student.user.avatar,
      attendance: attendanceStats,
      grades: {
        currentAverage,
        trend: gradeTrend,
        bySubject: gradesBySubject,
      },
      behavior: student.behaviorNotes.map((note) => ({
        id: note.id,
        type: note.type,
        title: note.title,
        date: note.date.toISOString(),
      })),
      parents: student.parentLinks.map((link) => ({
        id: link.parent.id,
        name: `${link.parent.user.firstName} ${link.parent.user.lastName}`,
        email: link.parent.user.email,
        phone: link.parent.user.phone,
        relationship: link.relationship,
      })),
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Get student profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

