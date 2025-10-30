import { NextRequest, NextResponse } from 'next/server'

// Simple logging endpoint for NextAuth
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('NextAuth Log:', body)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error in auth log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}