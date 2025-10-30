import { NextRequest } from 'next/server'
import NextAuth from "next-auth"
import { authOptions } from "../../../../lib/auth"

const handler = NextAuth(authOptions)

// Let NextAuth handle all methods
export { handler as GET, handler as POST }