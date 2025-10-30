import { NextRequest } from 'next/server'
import { GET as NextAuthGET, POST as NextAuthPOST } from '../[...nextauth]/route'

export const GET = async (req: NextRequest) => {
  console.log('[NextAuth] GET /api/auth/signin')
  return NextAuthGET(req)
}

export const POST = async (req: NextRequest) => {
  console.log('[NextAuth] POST /api/auth/signin')
  return NextAuthPOST(req)
}