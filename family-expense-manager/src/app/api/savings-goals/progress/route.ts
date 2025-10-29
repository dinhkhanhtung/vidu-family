import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSavingsProgress } from "@/lib/services/savings"

// Get savings progress and analysis
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : new Date(new Date().getFullYear(), 0, 1) // Start of current year
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : new Date(new Date().getFullYear(), 11, 31) // End of current year

    const result = await getSavingsProgress({
      workspaceId: session.user.familyId,
      startDate,
      endDate
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[Savings Progress]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}