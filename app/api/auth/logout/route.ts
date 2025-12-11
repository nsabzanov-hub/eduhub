import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  
  if (token) {
    await deleteSession(token)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth-token')
  
  return response
}

