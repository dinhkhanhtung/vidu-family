import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

enum AdminRole {
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN"
}

// Get analytics data - Admin only
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const period = searchParams.get("period") || "30days"
    const now = new Date()
    let startDate: Date

    // Calculate date range
    switch (period) {
      case "7days":
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case "30days":
        startDate = new Date(now.setDate(now.getDate() - 30))
        break
      case "90days":
        startDate = new Date(now.setDate(now.getDate() - 90))
        break
      default:
        startDate = new Date(now.setDate(now.getDate() - 30))
    }

    // Get user statistics
    const [totalUsers, newUsers, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.user.count({
        where: {
          sessions: {
            some: {
              expires: {
                gte: new Date(now.setDate(now.getDate() - 7))
              }
            }
          }
        }
      })
    ])

    // Get subscription statistics
    const subscriptionStats = await prisma.subscription.groupBy({
      by: ["status"],
      _count: {
        _all: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    // Get revenue data (using subscription data as proxy since Invoice model doesn't exist)
    const subscriptionRevenue = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        createdAt: {
          gte: startDate
        }
      },
      select: {
        // Mock revenue calculation - in real implementation this would come from invoices
        createdAt: true
      }
    })

    // For now, return a calculated revenue based on active subscriptions
    const estimatedRevenue = subscriptionRevenue.length * 10.99 // $10.99 per active subscription

    // Get daily active users over time
    const activeUsersOverTime = await prisma.session.groupBy({
      by: ["expires"],
      _count: {
        userId: true
      },
      where: {
        expires: {
          gte: startDate
        }
      },
      orderBy: {
        expires: "asc"
      }
    })

    // Get plan distribution
    const planDistribution = await prisma.subscription.groupBy({
      by: ["planId"],
      _count: {
        _all: true
      },
      where: {
        status: "ACTIVE"
      }
    })

    return NextResponse.json({
      userStats: {
        total: totalUsers,
        new: newUsers,
        active: activeUsers
      },
      subscriptionStats,
      revenue: estimatedRevenue,
      activeUsersOverTime: activeUsersOverTime.map(day => ({
        date: day.expires,
        count: day._count.userId
      })),
      planDistribution
    })
  } catch (error) {
    console.error("[Admin Analytics GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}, AdminRole.ADMIN)