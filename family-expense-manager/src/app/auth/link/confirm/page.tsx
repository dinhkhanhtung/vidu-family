"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function ConfirmLinkPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Không tìm thấy token xác nhận.")
      return
    }

    const confirm = async () => {
      try {
        const response = await fetch('/api/auth/link/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setStatus("success")
          setMessage("Tài khoản đã được liên kết thành công! Bạn có thể đăng nhập bằng tài khoản Google.")
        } else {
          setStatus("expired")
          setMessage(data.error || "Liên kết đã hết hạn hoặc không hợp lệ.")
        }
      } catch (error) {
        console.error("Confirmation error:", error)
        setStatus("error")
        setMessage("Có lỗi xảy ra khi xác nhận. Vui lòng thử lại.")
      }
    }

    confirm()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Xác nhận liên kết tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Xử lý xác nhận liên kết tài khoản Google của bạn
          </p>
        </div>

        <div className="mt-8">
          {status === "loading" && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang xử lý...</p>
            </div>
          )}

          {status === "success" && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Thành công!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{message}</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/auth/signin"
                      className="text-sm font-medium text-green-800 hover:text-green-700"
                    >
                      Quay lại đăng nhập →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(status === "error" || status === "expired") && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {status === "expired" ? "Liên kết hết hạn" : "Lỗi"}
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{message}</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/auth/signin"
                      className="text-sm font-medium text-red-800 hover:text-red-700"
                    >
                      Thử lại đăng nhập →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
