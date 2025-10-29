"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn("google")
    } catch (error: unknown) {
      setMessage((error as { message: string } | undefined)?.message || "Đăng nhập thất bại")
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setMessage("")

    try {
      const result = await signIn("email", { email, redirect: false })

      if (result?.ok) {
        setMessage("Đã gửi liên kết đăng nhập — kiểm tra email của bạn (có thể trong spam).")
      } else {
        setMessage("Gửi liên kết thất bại. Vui lòng thử lại.")
      }
    } catch (error: unknown) {
      setMessage((error as { message: string } | undefined)?.message || "Gửi liên kết thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Chào mừng trở lại với Quản lý Chi Tiêu Gia Đình
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Tiếp tục với Google
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">hoặc</span>
            </div>
          </div>

          {/* Magic Link Form */}
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nhập email của bạn"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi liên kết đăng nhập"}
            </button>
          </form>

          {/* Signup Link (placeholder) */}
          <div className="text-center">
            <Link
              href="/auth/signup"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Chưa có tài khoản? Đăng ký bằng mật khẩu
            </Link>
          </div>

          {/* Message */}
          {message && (
            <div className="rounded-md bg-indigo-50 p-4">
              <div className="text-sm text-indigo-700">
                {message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
