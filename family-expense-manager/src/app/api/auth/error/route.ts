import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const error = searchParams.get("error")

  const errorMessages: Record<string, string> = {
    Configuration: "Có vấn đề với cấu hình đăng nhập.",
    AccessDenied: "Truy cập bị từ chối. Vui lòng kiểm tra thông tin đăng nhập.",
    Verification: "Liên kết xác minh không hợp lệ hoặc đã hết hạn.",
    Default: "Đã xảy ra lỗi trong quá trình đăng nhập.",
    CredentialsSignin: "Thông tin đăng nhập không chính xác.",
    EmailSignin: "Không thể gửi email đăng nhập.",
    OAuthSignin: "Lỗi đăng nhập bằng tài khoản bên thứ ba.",
    OAuthCallback: "Lỗi callback từ nhà cung cấp OAuth.",
    OAuthCreateAccount: "Không thể tạo tài khoản với nhà cung cấp OAuth.",
    EmailCreateAccount: "Không thể tạo tài khoản với email.",
    Callback: "Lỗi callback từ nhà cung cấp.",
    OAuthAccountNotLinked: "Email này đã được sử dụng với một phương thức đăng nhập khác.",
    SessionRequired: "Vui lòng đăng nhập để truy cập trang này.",
  }

  const message = errorMessages[error as string] || errorMessages.Default

  return NextResponse.json({ error, message }, { status: 400 })
}