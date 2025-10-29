'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Wallet, TrendingUp, Users, Shield, Smartphone } from 'lucide-react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wallet className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Vidu Family</span>
          </div>
          <div className="flex gap-4">
            {session ? (
              <div className="flex gap-4">
                <Button asChild variant="outline">
                  <Link href="/transactions">Quản lý giao dịch</Link>
                </Button>
                <Button asChild>
                  <Link href="/budgets">Ngân sách</Link>
                </Button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button asChild variant="outline">
                  <Link href="/auth/signin">Đăng nhập</Link>
                </Button>
                <Button asChild>
                  <Link href="/pricing">Bắt đầu miễn phí</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-4">
            🎉 App quản lý chi tiêu gia đình #1 Việt Nam
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Quản Lý Chi Tiêu<br />
            <span className="text-blue-600">Gia Đình Thống Minh</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Theo dõi thu chi, đặt mục tiêu tiết kiệm và quản lý ngân sách gia đình hiệu quả.
            Dùng thử miễn phí với 6 thành viên, không giới hạn giao dịch.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/auth/signin">
                Dùng thử miễn phí
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link href="/pricing">Xem giá gói</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tất Cả Trong Một App
            </h2>
            <p className="text-xl text-gray-600">
              Quản lý tài chính gia đình dễ dàng hơn bao giờ hết
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Theo dõi Thu Chi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ghi nhận mọi giao dịch với voice input, báo cáo chi tiết theo danh mục và thời gian
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Ngân Sách Thông Minh</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Đặt hạn mức chi tiêu theo danh mục, nhận cảnh báo tự động khi vượt ngân sách
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Quản Lý Nhiều Người</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Chia sẻ dữ liệu với tối đa 25 thành viên, phân quyền truy cập linh hoạt
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Ứng Dụng Di Động</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  PWA install trên điện thoại, sử dụng như app native với offline capability
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Wallet className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <CardTitle>Mục Tiêu Tiết Kiệm</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Tạo và theo dõi tiến độ các mục tiêu tài chính, từ mua nhà đến du lịch
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>An Toàn & Bảo Mật</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Mã hóa dữ liệu, GDPR compliance, sao lưu tự động
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Giá Phải Chăng Cho Mọi Gia Đình
            </h2>
            <p className="text-xl text-gray-600">
              Bắt đầu miễn phí với tính năng đầy đủ
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-green-200">
              <CardHeader className="text-center">
                <CardTitle className="text-green-600">FREE</CardTitle>
                <div className="text-3xl font-bold">0 VNĐ</div>
                <p className="text-gray-600">Mãi mãi</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✅ 6 thành viên</li>
                  <li>✅ Unlimited giao dịch</li>
                  <li>✅ Ghi âm voice input</li>
                  <li>❌ Ngân sách thông minh</li>
                  <li>❌ Mục tiêu tiết kiệm</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500">
              <CardHeader className="text-center">
                <CardTitle>GROWTH</CardTitle>
                <div className="text-3xl font-bold"><span className="text-red-500">199k</span>/tháng</div>
                <p className="text-gray-600">12 tháng thu phí</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✅ 12 thành viên</li>
                  <li>✅ Unlimited giao dịch</li>
                  <li>✅ Ngân sách thông minh</li>
                  <li>✅ Mục tiêu tiết kiệm</li>
                  <li>✅ Báo cáo chi tiết</li>
                  <li>❌ Tích hợp ngân hàng</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500">
              <CardHeader className="text-center">
                <CardTitle className="text-purple-600">BUSINESS</CardTitle>
                <div className="text-3xl font-bold">499k/tháng</div>
                <p className="text-gray-600">12 tháng thu phí</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✅ 25 thành viên</li>
                  <li>✅ Tất cả tính năng</li>
                  <li>✅ Tích hợp ngân hàng</li>
                  <li>✅ API access</li>
                  <li>✅ Hỗ trợ doanh nghiệp</li>
                  <li>✅ Custom reports</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/pricing">
                Xem Chi Tiết Giá
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="h-6 w-6" />
                <span className="text-xl font-bold">Vidu Family</span>
              </div>
              <p className="text-gray-400">
                Giúp hàng trăm nghìn gia đình Việt Nam quản lý tài chính thông minh và tiết kiệm hiệu quả.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features">Tính năng</Link></li>
                <li><Link href="/pricing">Bảng giá</Link></li>
                <li><Link href="/security">Bảo mật</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help">Trợ giúp</Link></li>
                <li><Link href="/contact">Liên hệ</Link></li>
                <li><Link href="/blog">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Công ty</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about">Về chúng tôi</Link></li>
                <li><Link href="/careers">Tuyển dụng</Link></li>
                <li><Link href="/press">Báo chí</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Vidu Family. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
