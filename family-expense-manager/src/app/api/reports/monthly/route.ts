import { NextRequest, NextResponse } from "next/server"
import { generateMonthlyReports } from "@/lib/services/reports"

// Generate monthly reports - protected by cron secret
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await generateMonthlyReports()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Monthly Reports]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}