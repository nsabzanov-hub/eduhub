import { UserRole, AttendanceStatus, AssignmentType } from '@prisma/client'

export type { UserRole, AttendanceStatus, AssignmentType }

export interface DashboardStats {
  totalStudents: number
  totalClasses: number
  missingAssignments: number
  strugglingStudents: number
  upcomingAssignments: Array<{
    id: string
    title: string
    dueDate: Date
    classes: string[]
  }>
  classPerformance: Array<{
    classId: string
    className: string
    averageGrade: number
  }>
}

export interface StudentProfileData {
  id: string
  name: string
  gradeLevel: number
  homeroom: string | null
  avatar: string | null
  attendance: {
    totalPresent: number
    totalAbsent: number
    totalLate: number
    longestStreak: number
    recentAbsences: Array<{
      date: Date
      status: AttendanceStatus
      class: string
    }>
  }
  grades: {
    currentAverage: number
    trend: Array<{
      date: Date
      average: number
    }>
    bySubject: Array<{
      subject: string
      average: number
    }>
  }
  behavior: Array<{
    id: string
    type: string
    title: string
    date: Date
  }>
  parents: Array<{
    id: string
    name: string
    email: string
    phone: string | null
    relationship: string | null
  }>
}

export interface AssignmentStats {
  classAverage: number
  median: number
  distribution: {
    below65: number
    between65_79: number
    between80_89: number
    above90: number
  }
  totalGraded: number
  totalStudents: number
}

