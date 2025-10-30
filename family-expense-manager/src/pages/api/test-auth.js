const { getServerSession } = require("next-auth/next")
const { authOptions } = require("../lib/auth")

export default async function handler(req, res) {
  try {
    // Test environment variables
    const envVars = {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT_SET",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT_SET",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT_SET",
      DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT_SET",
    }

    const session = await getServerSession(req, res, authOptions)

    res.status(200).json({
      message: "Auth config test",
      envVars,
      hasSession: !!session,
      session
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    })
  }
}
