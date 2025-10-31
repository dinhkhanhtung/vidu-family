import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AuthError({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  const params = await searchParams
  const error = typeof params.error === "string" ? params.error : "UnknownError"

  console.log("Debug: Auth error page accessed", {
    error,
    url: typeof window !== 'undefined' ? window.location.href : 'server-side',
    searchParams: params,
    hasSession: !!session,
    allParams: Object.keys(params)
  })

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
    OAuthAccountNotLinked: "Để xác nhận tài khoản của bạn, vui lòng đăng nhập bằng cùng một tài khoản mà bạn đã sử dụng ban đầu.",
    SessionRequired: "Vui lòng đăng nhập để truy cập trang này.",
  }

  const message = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Lỗi đăng nhập
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {message}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <Link
              href="/auth/signin"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Thử lại đăng nhập
            </Link>
          </div>
          <div>
            <Link
              href="/"
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}