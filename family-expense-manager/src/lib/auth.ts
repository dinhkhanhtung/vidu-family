import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import crypto from "crypto"
import { prisma } from "./prisma"

// Helper functions
export async function findOrCreateUserByEmail({
  email,
  name,
  image,
  googleId
}: {
  email: string
  name?: string | null
  image?: string | null
  googleId?: string
}) {
  let user = await prisma.user.findUnique({
    where: { email }
  })

  if (user) {
    return user
  }

  // Create new user
  user = await prisma.user.create({
    data: {
      email,
      name,
      image,
      emailVerified: googleId ? new Date() : null
    }
  })

  return user
}

// Simplified - removing pending link functionality for now
export async function createPendingLink(_userId: string, _googleIdCandidate: string) {
  const token = crypto.randomBytes(32).toString('hex')
  return { token, expires: new Date(Date.now() + 15 * 60 * 1000) }
}

// Simplified - removing pending link functionality
export async function verifyPendingLink(_token: string) {
  // For now, return null to indicate no pending link
  return null
}

export const authOptions: NextAuthOptions = {
  debug: true, // Enable debug logging temporarily
  adapter: PrismaAdapter(prisma),
  logger: {
    error: (code, ...message) => {
      console.error(code, message)
    },
    warn: (code, ...message) => {
      console.warn(code, message)
    },
    debug: (code, ...message) => {
      console.debug(code, message)
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signout',
    newUser: '/auth/new-user'
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("Debug: signIn callback triggered", {
        provider: account?.provider,
        email: user?.email,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV
      })
      if (account?.provider === "google") {
        try {
          if (!user.email) {
            console.error("No email provided by Google")
            return "/auth/error?error=Configuration"
          }

          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (existingUser) {
            console.log("Debug: Existing user found", { email: user.email })
            return true
          }

          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              emailVerified: new Date()
            }
          })
          console.log("Debug: New user created", { email: user.email })

          return true
        } catch (error) {
          console.error('Sign in error:', error)
          return "/auth/error?error=OAuthSignin"
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              id: true,
              role: true,
              email: true,
              name: true,
              image: true
            }
          })
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role || 'user'
            token.email = dbUser.email
            token.name = dbUser.name
            token.picture = dbUser.image
          }
        } catch (error) {
          console.error('JWT callback error:', error)
          token.role = 'user'
        }
      }
      // Ensure required fields exist
      token.role = token.role || 'user'
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        if (token.familyId) {
          session.user.familyId = token.familyId as string
        }
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log("Debug: signIn event", { user, account, profile })
    },
    async signOut({ session, token }) {
      console.log("Debug: signOut event", { session, token })
    },
    async createUser({ user }) {
      console.log("Debug: createUser event", { user })
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}
