import { NextRequest, NextResponse } from "next/server"

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Auth test endpoint working",
    timestamp: new Date().toISOString()
  })
}

export const dynamic = 'force-dynamic'
