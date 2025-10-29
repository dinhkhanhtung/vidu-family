import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { addContribution } from "@/lib/services/savings"
import { savingsContributionSchema } from "@/lib/validations/savings"
import { z } from "zod"

// Add contribution to savings goal
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.familyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = savingsContributionSchema.parse(body)

    const { contribution, goal } = await addContribution(validatedData)

    return NextResponse.json({ contribution, goal })
  } catch (error) {
    console.error("[Savings Contribution Create]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}