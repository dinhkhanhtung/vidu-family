import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { prisma } from "./prisma"

// Define AdminRole enum locally since Prisma client hasn't been regenerated yet
enum AdminRole {
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN"
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, adminRole: true, isActive: true }
  })

  if (!user || !user.isActive) {
    return null
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      adminRole: user.adminRole as AdminRole,
    }
  }
}

export async function requireAdmin(requiredRole: AdminRole = AdminRole.MODERATOR) {
  const session = await getAdminSession()

  if (session === null) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Check if user has required admin role
  const roleHierarchy = {
    [AdminRole.MODERATOR]: 1,
    [AdminRole.ADMIN]: 2,
    [AdminRole.SUPER_ADMIN]: 3,
  }

  if (roleHierarchy[session.user.adminRole] < roleHierarchy[requiredRole]) {
    return NextResponse.json(
      { error: "Insufficient admin privileges" },
      { status: 403 }
    )
  }

  return session
}

export function withAdminAuth(handler: Function, requiredRole: AdminRole = AdminRole.MODERATOR) {
  return async (req: NextRequest, context?: any) => {
    const adminCheck = await requireAdmin(requiredRole)

    if (adminCheck instanceof NextResponse) {
      return adminCheck
    }

    return handler(req, { ...context, admin: adminCheck })
  }
}
