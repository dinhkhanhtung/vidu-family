import { NextRequest } from 'next/server'
import { handler } from '../[...nextauth]/route'

export const GET = async (req: NextRequest) => {
  console.log('[NextAuth] GET /api/auth/signin')
  return handler(req)
}

export const POST = async (req: NextRequest) => {
  console.log('[NextAuth] POST /api/auth/signin')
  return handler(req)
}