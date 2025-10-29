import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

enum AdminRole {
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN"
}

// Get all users (paginated) - Admin only
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || undefined
    const subscription = searchParams.get("subscription") || undefined

    const skip = (page - 1) * limit

    const where = {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } }
      ],
      ...(subscription && {
        subscriptions: {
          some: { status: subscription as any }
        }
      })
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          subscriptions: {
            where: { status: "ACTIVE" },
            select: {
              status: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error("[Admin Users GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}, AdminRole.ADMIN)

// Update user - Admin only
export const PATCH = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Validate changes allowed based on admin role
    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Prevent modifying users with higher admin roles
    if (
      user.role === "ADMIN" &&
      data.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Cannot modify admin role" },
        { status: 403 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[Admin Users PATCH]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}, AdminRole.ADMIN)

// Delete user - Super Admin only
export const DELETE = withAdminAuth(async (req: NextRequest) => {
  try {
    const id = req.nextUrl.searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Check user to be deleted
    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Prevent deleting admins
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot delete admin users" },
        { status: 403 }
      )
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Admin Users DELETE]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}, AdminRole.SUPER_ADMIN)