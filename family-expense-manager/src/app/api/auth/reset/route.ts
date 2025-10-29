import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({
        error: "Token và mật khẩu mới là bắt buộc"
      }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({
        error: "Mật khẩu phải có ít nhất 8 ký tự"
      }, { status: 400 })
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!)
    } catch (err) {
      return NextResponse.json({
        error: "Token không hợp lệ hoặc đã hết hạn"
      }, { status: 400 })
    }

    const { userId } = decoded

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({
        error: "Người dùng không tồn tại"
      }, { status: 404 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: {
        hashedPassword,
        emailVerified: new Date() // Mark as verified since they reset password
      }
    })

    return NextResponse.json({
      message: "Mật khẩu đã được đặt lại thành công"
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({
      error: "Lỗi máy chủ. Vui lòng thử lại."
    }, { status: 500 })
  }
}
