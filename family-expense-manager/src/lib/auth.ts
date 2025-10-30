import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import { sendEmail } from "./email"
import crypto from "crypto"
// import { trackEvent } from "./analytics"

// Debug logging for environment variables
console.log('Auth configuration check:')
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET')
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET')
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET')
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

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
export async function createPendingLink(userId: string, googleIdCandidate: string) {
  const token = crypto.randomBytes(32).toString('hex')
  return { token, expires: new Date(Date.now() + 15 * 60 * 1000) }
}

// Simplified - removing pending link functionality
export async function verifyPendingLink(token: string) {
  return null
}

// Rate limiting for auth endpoints - simple in-memory (add Redis later if needed)
const rateLimit = new Map<string, { count: number, reset: number }>()

function checkRateLimit(key: string, max = 5, window = 15 * 60 * 1000) {
  const now = Date.now()
  const entry = rateLimit.get(key)

  if (!entry || now > entry.reset) {
    rateLimit.set(key, { count: 1, reset: now + window })
    return true
  }

  if (entry.count >= max) {
    return false
  }

  entry.count++
  return true
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  // Secret is required - without it NextAuth fails silently
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production',
  // Disable SSL verification for development
  ...(process.env.NODE_ENV === 'development' && {
    useSecureCookies: false,
  }),
  providers: [
    // Force include Google provider even if environment variables might be missing
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST || "smtp.resend.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        auth: {
          user: process.env.SMTP_USER || "resend",
          pass: process.env.SMTP_PASSWORD || ""
        }
      },
      from: process.env.SMTP_USER || process.env.RESEND_FROM || "onboarding@resend.dev",
      async sendVerificationRequest({
        identifier: email,
        url,
      }) {
        if (!checkRateLimit(`email:${email}`)) {
          throw new Error("Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.")
        }

        const result = await sendEmail({
          to: email,
          subject: "Liên kết đăng nhập",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Liên kết đăng nhập của bạn</h2>
              <p>Chào bạn,</p>
              <p>Nhấp vào liên kết dưới đây để đăng nhập vào tài khoản:</p>
              <a href="${url}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 4px;">Đăng nhập ngay</a>
              <p>Hoặc sao chép và dán liên kết vào trình duyệt:</p>
              <p>${url}</p>
              <p><strong>Quan trọng:</strong> Liên kết này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đăng nhập, hãy bỏ qua email này.</p>
              <p>Nếu liên kết không hoạt động, hãy kiểm tra thư mục spam.</p>
            </div>
          `,
          text: `
            Liên kết đăng nhập: ${url}
            Liên kết này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đăng nhập, hãy bỏ qua email này.
          `
        }).catch((error) => {
          console.error("Email send error:", error)
          throw new Error("Failed to send verification email")
        })

        if (process.env.NODE_ENV === 'development') {
          console.log("Verification email sent:", result.messageId)
        }
      }
    }),
    // Placeholder for Credentials (email/password) - uncomment when ready
    // CredentialsProvider({
    //   name: "credentials",
    //   credentials: {
    //     email: { label: "Email", type: "email" },
    //     password: { label: "Password", type: "password" }
    //   },
    //   async authorize(credentials) {
    //     if (!credentials?.email || !credentials?.password) {
    //       return null
    //     }

    //     const user = await prisma.user.findUnique({
    //       where: {
    //         email: credentials.email
    //       }
    //     })

    //     if (!user || !user.hashedPassword) {
    //       return null
    //     }

    //     const isPasswordValid = await bcrypt.compare(
    //       credentials.password,
    //       user.hashedPassword
    //     )

    //     if (!isPasswordValid) {
    //       return null
    //     }

    //     return {
    //       id: user.id,
    //       email: user.email,
    //       name: user.name,
    //       image: user.image,
    //       role: user.role,
    //       familyId: user.familyId
    //     }
    //   }
    // })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn attempt:", { provider: account?.provider, email: user.email })

      if (account?.provider === "google") {
        try {
          console.log("Google sign-in finding user:", user.email)
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          console.log("Existing user found:", !!existingUser)

          if (existingUser) {
            return true
          } else {
            console.log("Creating new user for:", user.email)
            await findOrCreateUserByEmail({
              email: user.email!,
              name: user.name,
              image: user.image,
              googleId: profile?.sub
            })
            console.log("New user created successfully")
            return true
          }
        } catch (error: any) {
          console.error("Google sign-in error details:", error)
          console.error("Error stack:", error.stack)
          console.error("Database connection check:", process.env.DATABASE_URL ? 'SET' : 'NOT SET')
          return `/auth/signin?error=AccessDenied`
        }
      }

      if (account?.provider === "email") {
        console.log("Email sign-in for:", user.email)
        return true
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id }
        })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.familyId = token.familyId as string | null
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signOut() {
      // Optional cleanup
    }
  }
}
