import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"

// Rate limiting: simple in-memory store (replace with Redis in production)
const rateLimit = new Map<string, { count: number, reset: number }>()

function checkRateLimit(ip: string, max = 3, window = 15 * 60 * 1000) {
  const now = Date.now()
  const key = `forgot:${ip}`
  const entry = rateLimit.get(key)

  if (!entry || now > entry.reset) {
    rateLimit.set(key, { count: 1, reset: now + window })
    return true
  }

  if (entry.count >= max) {
    return false
  }

  entry.count++
  return true
}

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email là bắt buộc" }, { status: 400 })
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    if (!checkRateLimit(ip)) {
      return NextResponse.json({
        error: "Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút."
      }, { status: 429 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Return success to prevent email enumeration
      return NextResponse.json({
        message: "Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi."
      })
    }

    // Generate JWT token for password reset
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "15m" } // Short expiry for security
    )

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset?token=${resetToken}`

    try {
      await transporter.sendMail({
        from: `"Quản lý Chi Tiêu Gia Đình" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Đặt lại mật khẩu",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Đặt lại mật khẩu của bạn</h2>
            <p>Chào bạn,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
            <p>Nếu bạn muốn đặt lại mật khẩu, hãy nhấp vào liên kết dưới đây:</p>
            <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 4px;">Đặt lại mật khẩu</a>
            <p>Hoặc sao chép và dán liên kết vào trình duyệt:</p>
            <p>${resetUrl}</p>
            <p><strong>Lưu ý:</strong> Liên kết này sẽ hết hạn sau 15 phút.</p>
            <p>Nếu liên kết không hoạt động, hãy kiểm tra thư mục spam.</p>
          </div>
        `,
        text: `Đặt lại mật khẩu: ${resetUrl} (hết hạn sau 15 phút)`
      })

      return NextResponse.json({
        message: "Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi."
      })
    } catch (emailError) {
      console.error("Email send error:", emailError)
      return NextResponse.json({
        error: "Không thể gửi email. Vui lòng thử lại sau."
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({
      error: "Lỗi máy chủ. Vui lòng thử lại."
    }, { status: 500 })
  }
}
