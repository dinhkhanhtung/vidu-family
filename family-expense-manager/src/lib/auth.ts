import type { NextAuthOptions } from "next-auth"import { NextAuthOptions } from "next-auth"

import { PrismaAdapter } from "@auth/prisma-adapter"import { PrismaAdapter } from "@auth/prisma-adapter"

import GoogleProvider from "next-auth/providers/google"import GoogleProvider from "next-auth/providers/google"

import { prisma } from "./prisma"import { prisma } from "./prisma"

// import { trackEvent } from "./analytics"

export const authOptions: NextAuthOptions = {

  debug: true,async function createUser(email: string, name?: string | null, image?: string | null) {

  adapter: PrismaAdapter(prisma),  try {

  providers: [    const user = await prisma.user.create({

    GoogleProvider({      data: {

      clientId: process.env.GOOGLE_CLIENT_ID!,        email,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,        name,

      authorization: {        image,

        params: {        emailVerified: new Date()

          access_type: "offline",      }

          response_type: "code"    })

        }    return user

      }  } catch (error) {

    })    console.error('Error creating user:', error)

  ],    return null

  pages: {  }

    signIn: '/auth/signin',}

    error: '/auth/error'

  },export const authOptions: NextAuthOptions = {

  callbacks: {  providers: [

    async signIn({ user, account, profile }) {    GoogleProvider({

      try {      clientId: process.env.GOOGLE_CLIENT_ID!,

        const existingUser = await prisma.user.findUnique({      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

          where: { email: user.email! }      authorization: {

        })        params: {

          prompt: "select_account",

        if (!existingUser) {          access_type: "offline",

          await prisma.user.create({          response_type: "code"

            data: {        }

              email: user.email!,      }

              name: user.name,    })

              image: user.image,  ],

              emailVerified: new Date()  adapter: PrismaAdapter(prisma),

            }  secret: process.env.NEXTAUTH_SECRET,

          })  session: {

        }    strategy: "jwt"

        return true  },

      } catch (error) {    EmailProvider({

        console.error('Sign in error:', error)      server: {

        return false        host: process.env.SMTP_HOST || "smtp.resend.com",

      }        port: parseInt(process.env.SMTP_PORT || "587"),

    },        auth: {

    async jwt({ token, account }) {          user: process.env.SMTP_USER || "resend",

      if (account) {          pass: process.env.SMTP_PASSWORD || ""

        token.accessToken = account.access_token        }

      }      },

      return token      from: process.env.SMTP_USER || process.env.RESEND_FROM || "onboarding@resend.dev",

    },      async sendVerificationRequest({

    async session({ session, token }) {        identifier: email,

      if (session.user) {        url,

        session.user.id = token.sub!      }) {

      }        if (!checkRateLimit(`email:${email}`)) {

      return session          throw new Error("Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.")

    }        }

  },

  session: {        const result = await sendEmail({

    strategy: "jwt",          to: email,

    maxAge: 30 * 24 * 60 * 60 // 30 days          subject: "Liên kết đăng nhập",

  },          html: `

  secret: process.env.NEXTAUTH_SECRET            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

}              <h2>Liên kết đăng nhập của bạn</h2>
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
            return true
          } else {
            const newUser = await findOrCreateUserByEmail({
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: profile?.sub
            })
            
            if (!newUser) {
              console.error("Failed to create new user")
              return "/auth/error?error=OAuthCreateAccount"
            }
            
            return true
          }
        } catch (error: any) {
          console.error("Google sign-in error:", error.message)
          return "/auth/error?error=OAuthSignin"
        }
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
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        if (token.familyId) {
          session.user.familyId = token.familyId as string
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/api/auth/error',
    signOut: '/auth/signout',
    newUser: '/auth/new-user'
  },
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signOut() {
      // Optional cleanup
    }
  }
}
