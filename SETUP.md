# EduHub Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE eduhub;
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your database connection:
```
DATABASE_URL="postgresql://username:password@localhost:5432/eduhub"
JWT_SECRET="your-secret-key-here"
```

4. Generate Prisma client and push schema:
```bash
npx prisma generate
npx prisma db push
```

## Step 3: Email Configuration (Optional but Recommended)

Update `.env` with your email settings:
```
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use that password in `EMAIL_PASS`

## Step 4: Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Step 5: Create Initial Users

You'll need to create users through the database or create a seed script. Here's a sample SQL to create a test teacher:

```sql
-- Note: This is a simplified example. In production, use proper password hashing.
-- Password hash for "password123" (use bcrypt in your seed script)
INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, "createdAt", "updatedAt")
VALUES ('teacher-1', 'teacher@school.com', '$2a$10$...', 'John', 'Doe', 'TEACHER', NOW(), NOW());

INSERT INTO "TeacherProfile" (id, "userId", "createdAt", "updatedAt")
VALUES ('tp-1', 'teacher-1', NOW(), NOW());
```

## Key Features Implemented

### ✅ Teacher Features
- Dashboard with stats and quick actions
- Bulk assignment creation (assign to multiple classes)
- Privacy-safe gradebook with private student view
- Per-period attendance (fixes "stuck absent" issue)
- Student profiles with analytics
- Email/messaging system

### ✅ Core Infrastructure
- Authentication system (JWT-based)
- Role-based access control
- Database schema with Prisma
- Email integration
- Responsive UI components

### 🚧 To Be Implemented
- Admin dashboard and reports
- Google Classroom integration
- Video conferencing (Zoom/Meet)
- Parent and Student views
- Financial/payment system
- Advanced analytics

## Project Structure

```
eduhub/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Protected dashboard routes
│   │   └── teacher/     # Teacher-specific pages
│   └── api/             # API routes
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   └── shared/          # Shared components
├── lib/                 # Utilities and helpers
├── prisma/              # Database schema
└── types/               # TypeScript types
```

## Development Tips

1. **Database Changes**: After modifying `prisma/schema.prisma`, run:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Type Checking**: Run TypeScript type checking:
   ```bash
   npm run type-check
   ```

3. **Linting**: Check code quality:
   ```bash
   npm run lint
   ```

## Next Steps

1. Set up your database and run migrations
2. Create initial users (admin, teachers, students, parents)
3. Create classes and enrollments
4. Test the bulk assignment feature
5. Test the privacy-safe gradebook
6. Test per-period attendance

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Email Not Sending
- Verify email credentials
- Check firewall/network settings
- For Gmail, ensure app password is used (not regular password)

### Authentication Issues
- Clear browser cookies
- Verify JWT_SECRET is set
- Check session expiration

## Support

For issues or questions, refer to the README.md or create an issue in the repository.

