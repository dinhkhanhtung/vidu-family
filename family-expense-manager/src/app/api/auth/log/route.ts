import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("NextAuth Log:", {
      body,
      path: request.nextUrl.pathname,
      method: request.method,
      headers: Object.fromEntries(request.headers)
    })
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error in /api/auth/log:", error)
    return NextResponse.json({ 
      error: "Failed to process log request",
      details: process.env.NODE_ENV === "development" ? String(error) : undefined
    }, { 
      status: 400  // Use 400 for client errors (bad JSON), not 500
    })
  }
}

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
