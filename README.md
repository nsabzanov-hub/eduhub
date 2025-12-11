# EduHub

Modern K-12 school communication platform - A smoother, futuristic version of ParentLocker.

## Features

### Core Capabilities
- **Multi-role system**: Teacher, Student, Parent, and Admin views
- **Bulk homework assignment**: Assign to multiple sections at once
- **Privacy-safe gradebook**: Private student view for desk-side conversations
- **Per-period attendance**: Fix the "stuck absent" issue
- **Student analytics**: Rich profiles with trends and insights
- **Communication hub**: Email integration and messaging
- **Reports & analytics**: Custom report builder with as-of-date support
- **Google Classroom integration**: View and sync assignments
- **Video conferencing**: Parent-teacher conference scheduling

### Key Differentiators
- Clean, modern UI that's intuitive for tired teachers at 10 PM
- No clutter - focused screens with 2-3 main actions
- Professional but friendly design
- Mobile-responsive from day one

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based sessions
- **Email**: Nodemailer
- **Charts**: Recharts

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database URL and other configuration:
```
DATABASE_URL="postgresql://user:password@localhost:5432/eduhub"
JWT_SECRET="your-secret-key"
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
eduhub/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── teacher/       # Teacher-specific views
│   │   ├── parent/        # Parent-specific views
│   │   ├── student/       # Student-specific views
│   │   └── admin/         # Admin-specific views
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── teacher/          # Teacher-specific components
│   ├── parent/           # Parent-specific components
│   └── shared/           # Shared components
├── lib/                  # Utilities and helpers
│   ├── db.ts            # Prisma client
│   ├── auth.ts          # Authentication utilities
│   └── utils.ts         # General utilities
├── prisma/              # Database schema
└── types/               # TypeScript type definitions
```

## Key Features Implementation

### Bulk Homework Assignment
Teachers can create one assignment and assign it to multiple sections (e.g., ELA 6A, ELA 6B, ELA 6C) with a single action.

### Privacy-Safe Gradebook
Click on any student row to open a private view showing only that student's grades, perfect for desk-side conversations.

### Per-Period Attendance
Mark attendance per period, and update status later (e.g., change from "absent" to "late" if student arrives).

### Student Analytics
Rich student profiles showing:
- Attendance streaks and trends
- Grade trends over time
- Growth indicators
- Behavior notes

### Custom Reports
Admin can build custom reports with:
- Field selection
- Filters
- As-of-date support for financial reports
- Save and share with colleagues

## Development

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Database Migrations
```bash
npx prisma migrate dev
```

## License

Private - All rights reserved

