import { NextResponse } from "next/server"
import { verifyPendingLink } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      )
    }

    const user = await verifyPendingLink(token)

    if (user) {
      return NextResponse.json({
        success: true,
        message: "Account linked successfully"
      })
    } else {
      return NextResponse.json(
        { error: "Token expired or invalid" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Confirmation error:", error)
    return NextResponse.json(
      { error: "An error occurred during confirmation" },
      { status: 500 }
    )
  }
}
