import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create a school
  const school = await prisma.school.create({
    data: {
      name: 'Example School',
      email: 'info@exampleschool.com',
      phone: '(555) 123-4567',
      address: '123 School Street, City, State 12345',
    },
  })

  console.log('✅ Created school:', school.name)

  // Create academic year
  const academicYear = await prisma.academicYear.create({
    data: {
      schoolId: school.id,
      name: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      isActive: true,
    },
  })

  console.log('✅ Created academic year:', academicYear.name)

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      adminProfile: {
        create: {
          title: 'School Administrator',
        },
      },
    },
  })

  console.log('✅ Created admin user:', admin.email, '(password: admin123)')

  // Create teacher user
  const teacherPassword = await bcrypt.hash('teacher123', 10)
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@school.com',
      passwordHash: teacherPassword,
      firstName: 'John',
      lastName: 'Teacher',
      role: 'TEACHER',
      teacherProfile: {
        create: {
          employeeId: 'T001',
          department: 'Mathematics',
        },
      },
    },
  })

  console.log('✅ Created teacher user:', teacher.email, '(password: teacher123)')

  // Create student user
  const studentPassword = await bcrypt.hash('student123', 10)
  const student = await prisma.user.create({
    data: {
      email: 'student@school.com',
      passwordHash: studentPassword,
      firstName: 'Jane',
      lastName: 'Student',
      role: 'STUDENT',
      studentProfile: {
        create: {
          studentId: 'S001',
          gradeLevel: 6,
          homeroom: '6A',
        },
      },
    },
  })

  console.log('✅ Created student user:', student.email, '(password: student123)')

  // Create parent user
  const parentPassword = await bcrypt.hash('parent123', 10)
  const parent = await prisma.user.create({
    data: {
      email: 'parent@school.com',
      passwordHash: parentPassword,
      firstName: 'Parent',
      lastName: 'User',
      role: 'PARENT',
      parentProfile: {
        create: {},
      },
    },
  })

  console.log('✅ Created parent user:', parent.email, '(password: parent123)')

  // Link parent to student
  await prisma.studentParent.create({
    data: {
      studentId: student.studentProfile!.id,
      parentId: parent.parentProfile!.id,
      relationship: 'Mother',
      isPrimary: true,
    },
  })

  console.log('✅ Linked parent to student')

  // Create a class
  const classData = await prisma.class.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      name: 'Mathematics 6A',
      subject: 'Mathematics',
      gradeLevel: 6,
      section: 'A',
      room: 'Room 101',
    },
  })

  console.log('✅ Created class:', classData.name)

  // Assign teacher to class
  await prisma.classTeacher.create({
    data: {
      classId: classData.id,
      teacherId: teacher.teacherProfile!.id,
      isPrimary: true,
    },
  })

  console.log('✅ Assigned teacher to class')

  // Enroll student in class
  await prisma.classEnrollment.create({
    data: {
      classId: classData.id,
      studentId: student.studentProfile!.id,
    },
  })

  console.log('✅ Enrolled student in class')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📝 Login Credentials:')
  console.log('   Admin:  admin@school.com / admin123')
  console.log('   Teacher: teacher@school.com / teacher123')
  console.log('   Student: student@school.com / student123')
  console.log('   Parent:  parent@school.com / parent123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

