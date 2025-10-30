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

// Allow preflight checks from browsers or other clients
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}