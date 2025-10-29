import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

enum AdminRole {
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN"
}

interface SystemError {
  id: string
  type: string
  message: string
  stack?: string
  timestamp: Date
}

interface ErrorLog {
  id: string
  code: string
  message: string
  details?: Record<string, any>
  createdAt: Date
}

const errorLogs: ErrorLog[] = []
let currentErrors: SystemError[] = []

// Get system monitoring data - Admin only
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const period = searchParams.get("period") || "24h"
    const type = searchParams.get("type") || "all"

    const now = new Date()
    let startDate: Date

    switch (period) {
      case "1h":
        startDate = new Date(now.setHours(now.getHours() - 1))
        break
      case "24h":
        startDate = new Date(now.setHours(now.getHours() - 24))
        break
      case "7d":
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      default:
        startDate = new Date(now.setHours(now.getHours() - 24))
    }

    // Get failed payments
    const failedPayments = await prisma.invoice.findMany({
      where: {
        status: "UNCOLLECTIBLE",
        createdAt: {
          gte: startDate
        }
      },
      include: {
        subscription: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    })

    // Get system errors (from memory store - in production, use proper error tracking)
    const filteredErrors = type === "all" 
      ? currentErrors 
      : currentErrors.filter(error => error.type === type)

    // Get API health metrics (mock data - implement real metrics in production)
    const apiHealth = {
      uptime: process.uptime(),
      responseTime: Math.random() * 100 + 50, // Mock average response time
      successRate: 99.9, // Mock success rate
      requestsPerMinute: Math.floor(Math.random() * 1000 + 500), // Mock RPM
      errors: filteredErrors.length
    }

    // Get latest error logs
    const latestErrors = errorLogs
      .filter(log => new Date(log.createdAt) >= startDate)
      .slice(0, 50)

    return NextResponse.json({
      failedPayments,
      systemErrors: filteredErrors,
      apiHealth,
      errorLogs: latestErrors
    })
  } catch (error) {
    console.error("[Admin Monitoring GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}, AdminRole.ADMIN)

// Log new system error - Admin only
export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const { error } = await req.json()

    if (!error) {
      return NextResponse.json(
        { error: "Error details required" },
        { status: 400 }
      )
    }

    const newError: SystemError = {
      id: crypto.randomUUID(),
      type: error.type || "UNKNOWN",
      message: error.message,
      stack: error.stack,
      timestamp: new Date()
    }

    // Add to current errors (in production, use proper error tracking)
    currentErrors.push(newError)

    // Maintain only last 100 errors
    if (currentErrors.length > 100) {
      currentErrors = currentErrors.slice(-100)
    }

    return NextResponse.json(newError)
  } catch (error) {
    console.error("[Admin Monitoring POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}, AdminRole.ADMIN)

// Clear system errors - Admin only
export const DELETE = withAdminAuth(async (req: NextRequest) => {
  try {
    const type = req.nextUrl.searchParams.get("type")

    if (type) {
      currentErrors = currentErrors.filter(error => error.type !== type)
    } else {
      currentErrors = []
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Admin Monitoring DELETE]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}, AdminRole.ADMIN)