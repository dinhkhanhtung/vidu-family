import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json(session ?? null)
  } catch (error: any) {
    console.error('Error in /api/auth/session:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
