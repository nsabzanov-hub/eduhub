import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-4xl font-bold text-primary-700 mb-2">EduHub</h1>
        <p className="text-secondary-600 mb-8">Modern K-12 School Communication Platform</p>
        
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full btn-primary text-center"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="block w-full btn-secondary text-center"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}

