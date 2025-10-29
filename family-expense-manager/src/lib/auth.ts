import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import crypto from "crypto"
// import { trackEvent } from "./analytics"

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
    if (googleId && !user.googleId) {
      // Link Google account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId }
      })
    }
    return user
  }

  // Create new user
  user = await prisma.user.create({
    data: {
      email,
      name,
      image,
      googleId,
      emailVerified: googleId ? new Date() : null
    }
  })

  return user
}

export async function createPendingLink(userId: string, googleIdCandidate: string) {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  return await prisma.pendingLink.create({
    data: {
      userId,
      googleIdCandidate,
      token,
      expires
    }
  })
}

export async function verifyPendingLink(token: string) {
  const pending = await prisma.pendingLink.findUnique({
    where: { token }
  })

  if (!pending || pending.expires < new Date()) {
    return null
  }

  // Link the accounts
  const user = await prisma.user.update({
    where: { id: pending.userId },
    data: { googleId: pending.googleIdCandidate }
  })

  // Delete pending link
  await prisma.pendingLink.delete({
    where: { id: pending.id }
  })

  return user
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
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      },
      from: process.env.SMTP_USER,
      async sendVerificationRequest({
        identifier: email,
        url,
      }) {
        if (!checkRateLimit(`email:${email}`)) {
          throw new Error("Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.")
        }

        const result = await transporter.sendMail({
          from: `"Quản lý Chi Tiêu Gia Đình" <${process.env.SMTP_USER}>`,
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
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (existingUser) {
            if (existingUser.googleId) {
              // Already linked, proceed
              return true
            } else {
              // Collision: user exists but no googleId
              const pendingLink = await createPendingLink(existingUser.id, profile?.sub!)
              // Send confirmation email
              const confirmUrl = `${process.env.NEXTAUTH_URL}/auth/link/confirm?token=${pendingLink.token}`
              await transporter.sendMail({
                from: `"Quản lý Chi Tiêu Gia Đình" <${process.env.SMTP_USER}>`,
                to: user.email!,
                subject: "Xác nhận liên kết tài khoản Google",
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Tìm thấy tài khoản với email này</h2>
                    <p>Chào ${existingUser.name || user.email},</p>
                    <p>Bạn muốn liên kết tài khoản Google với tài khoản đã tồn tại không?</p>
                    <p>Nếu đồng ý, hãy nhấp vào liên kết dưới đây để xác nhận:</p>
                    <a href="${confirmUrl}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 4px;">Liên kết tài khoản</a>
                    <p>Hoặc sao chép và dán liên kết vào trình duyệt:</p>
                    <p>${confirmUrl}</p>
                    <p><strong>Lưu ý:</strong> Liên kết này sẽ hết hạn sau 15 phút. Nếu bạn không yêu cầu liên kết, hãy bỏ qua email này.</p>
                  </div>
                `,
                text: `Xác nhận liên kết tài khoản Google: ${confirmUrl} (hết hạn sau 15 phút)`
              })

              // Prevent auto sign-in, show message to check email
              throw new Error("Đã gửi liên kết xác nhận tới email. Vui lòng kiểm tra và nhấp vào liên kết để liên kết tài khoản.")
            }
          } else {
            // New user, proceed
            await findOrCreateUserByEmail({
              email: user.email!,
              name: user.name,
              image: user.image,
              googleId: profile?.sub
            })
            // Analytics: user signup via Google
            return true
          }
        } catch (error: any) {
          console.error("Google sign-in error:", error)
          throw error
        }
      }

      if (account?.provider === "email") {
        // For magic link, just proceed - NextAuth handles user creation
        // Analytics: user signin via magic link
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
          token.familyId = dbUser.familyId
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
  },
  events: {
    async signOut() {
      // Optional cleanup
    }
  }
}
