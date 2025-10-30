import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được sử dụng' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        emailVerified: null
      }
    })

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Chào mừng đến với Vidu Family!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Chào mừng ${name}!</h2>
            <p>Tài khoản của bạn đã được tạo thành công. Bạn có thể bắt đầu sử dụng Vidu Family để quản lý chi tiêu gia đình.</p>
            <p><a href="${process.env.NEXTAUTH_URL || 'https://vidu-family.vercel.app'}/auth/signin" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 4px;">Đăng nhập ngay</a></p>
            <p>Nếu bạn gặp bất kỳ vấn đề nào, hãy liên hệ với chúng tôi.</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the signup if email fails
    }

    return NextResponse.json({
      message: 'Tài khoản đã được tạo thành công',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Signup error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo tài khoản' },
      { status: 500 }
    )
  }
}