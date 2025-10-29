'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Crown,
  Zap,
  Star,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import { FeatureLocked } from '@/components/ui/feature-locked'
import { BudgetCard } from '@/components/budgets/BudgetCard'
import { SavingsGoalCard } from '@/components/savings-goals/SavingsGoalCard'

export default function PremiumDemoPage() {
  const [showPreview, setShowPreview] = useState(false)
  const [hasPremium, setHasPremium] = useState(false)

  // Mock budget data
  const mockBudgets = [
    {
      id: '1',
      name: 'Ăn uống tháng 10',
      amount: 5000000,
      spent: 4200000,
      categoryId: 'cat1',
      workspaceId: 'ws1',
      period: 'MONTHLY' as const,
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-10-31'),
      isActive: true,
      alert80: true,
      alert90: false,
      alert100: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: {
        id: 'cat1',
        name: 'Ăn uống',
        color: '#ef4444',
      },
      alerts: [],
    },
    {
      id: '2',
      name: 'Đi lại tháng 10',
      amount: 2000000,
      spent: 1800000,
      categoryId: 'cat2',
      workspaceId: 'ws1',
      period: 'MONTHLY' as const,
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-10-31'),
      isActive: true,
      alert80: false,
      alert90: true,
      alert100: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: {
        id: 'cat2',
        name: 'Đi lại',
        color: '#3b82f6',
      },
      alerts: [],
    },
  ]

  // Mock savings goals data
  const mockGoals = [
    {
      id: '1',
      name: 'Mua xe máy mới',
      targetAmount: 50000000,
      currentAmount: 35000000,
      targetDate: new Date('2024-12-31'),
      description: 'Tiết kiệm để mua xe máy Honda Vision',
      isActive: true,
      isCompleted: false,
      completedAt: null,
      workspaceId: 'ws1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      contributions: [
        {
          id: 'c1',
          amount: 5000000,
          date: new Date('2024-01-15'),
          description: 'Tiền thưởng tháng 1',
          goalId: '1',
          createdAt: new Date(),
        },
      ],
    },
    {
      id: '2',
      name: 'Du lịch hè 2025',
      targetAmount: 20000000,
      currentAmount: 20000000,
      targetDate: new Date('2024-06-01'),
      description: 'Du lịch gia đình hè 2025',
      isActive: true,
      isCompleted: true,
      completedAt: new Date('2024-05-15'),
      workspaceId: 'ws1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      contributions: [
        {
          id: 'c2',
          amount: 10000000,
          date: new Date('2024-01-15'),
          description: 'Tiền tiết kiệm ban đầu',
          goalId: '2',
          createdAt: new Date(),
        },
      ],
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Demo Tính năng Premium</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Khám phá các tính năng cao cấp dành cho người dùng Premium
        </p>

        {/* Premium Toggle */}
        <Card className="inline-block p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Crown className={`w-5 h-5 ${hasPremium ? 'text-yellow-500' : 'text-gray-400'}`} />
              <Label htmlFor="premium-toggle">Gói Premium</Label>
            </div>
            <Switch
              id="premium-toggle"
              checked={hasPremium}
              onCheckedChange={setHasPremium}
            />
            <Badge variant={hasPremium ? 'default' : 'secondary'}>
              {hasPremium ? 'Đã kích hoạt' : 'Miễn phí'}
            </Badge>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="budgets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="budgets" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Ngân sách thông minh
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Mục tiêu tiết kiệm
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview Mode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Hệ thống ngân sách thông minh
              </CardTitle>
              <CardDescription>
                Theo dõi chi tiêu với ngân sách được đặt trước, cảnh báo tự động khi vượt ngưỡng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!hasPremium ? (
                <FeatureLocked
                  feature="budgeting"
                  variant="card"
                  size="lg"
                  className="max-w-md mx-auto"
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm font-medium">Tổng ngân sách</span>
                        </div>
                        <div className="text-2xl font-bold">
                          {(mockBudgets.reduce((sum, b) => sum + b.amount, 0)).toLocaleString('vi-VN')} ₫
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">Cảnh báo</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {mockBudgets.filter(b => b.alert80 || b.alert90).length}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Ổn định</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {mockBudgets.filter(b => !b.alert80 && !b.alert90 && !b.alert100).length}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockBudgets.map((budget) => (
                      <BudgetCard
                        key={budget.id}
                        budget={budget}
                        onEdit={(b) => console.log('Edit budget:', b.id)}
                        onDelete={(b) => console.log('Delete budget:', b.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-500" />
                Mục tiêu tiết kiệm
              </CardTitle>
              <CardDescription>
                Đặt mục tiêu tiết kiệm dài hạn và theo dõi tiến độ với tính toán tự động
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!hasPremium ? (
                <FeatureLocked
                  feature="goals"
                  variant="card"
                  size="lg"
                  className="max-w-md mx-auto"
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4" />
                          <span className="text-sm font-medium">Tổng mục tiêu</span>
                        </div>
                        <div className="text-2xl font-bold">
                          {(mockGoals.reduce((sum, g) => sum + g.targetAmount, 0)).toLocaleString('vi-VN')} ₫
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Đã hoàn thành</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {mockGoals.filter(g => g.isCompleted).length}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">Đang thực hiện</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {mockGoals.filter(g => g.isActive && !g.isCompleted).length}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockGoals.map((goal) => (
                      <SavingsGoalCard
                        key={goal.id}
                        goal={goal}
                        onEdit={(g) => console.log('Edit goal:', g.id)}
                        onDelete={(g) => console.log('Delete goal:', g.id)}
                        onAddContribution={(g) => console.log('Add contribution:', g.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview Mode
              </CardTitle>
              <CardDescription>
                Xem trước giao diện các tính năng premium dành cho người dùng miễn phí
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Label htmlFor="preview-mode">Hiển thị preview</Label>
                <Switch
                  id="preview-mode"
                  checked={showPreview}
                  onCheckedChange={setShowPreview}
                />
              </div>

              {showPreview && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Ngân sách (Preview)</h3>
                    <FeatureLocked
                      feature="budgeting"
                      variant="overlay"
                      className="h-48"
                    >
                      <Card className="h-full">
                        <CardContent className="p-4 h-full flex items-center justify-center">
                          <div className="text-center">
                            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Budget Dashboard Preview</p>
                          </div>
                        </CardContent>
                      </Card>
                    </FeatureLocked>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Mục tiêu tiết kiệm (Preview)</h3>
                    <FeatureLocked
                      feature="goals"
                      variant="overlay"
                      className="h-48"
                    >
                      <Card className="h-full">
                        <CardContent className="p-4 h-full flex items-center justify-center">
                          <div className="text-center">
                            <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Savings Goals Preview</p>
                          </div>
                        </CardContent>
                      </Card>
                    </FeatureLocked>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureLocked
                  feature="budgeting"
                  variant="inline"
                  className="p-4"
                />
                <FeatureLocked
                  feature="goals"
                  variant="inline"
                  className="p-4"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Comparison */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            So sánh gói dịch vụ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Miễn phí</CardTitle>
                <CardDescription>Giao dịch cơ bản</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Giao dịch không giới hạn
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Danh mục cơ bản
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    Ngân sách thông minh
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    Mục tiêu tiết kiệm
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Phổ biến
              </Badge>
              <CardHeader>
                <CardTitle className="text-lg">Growth</CardTitle>
                <CardDescription>₫199,000/tháng</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Tất cả tính năng miễn phí
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Ngân sách thông minh
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Mục tiêu tiết kiệm
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Cảnh báo chi tiêu
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Xuất dữ liệu
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-lg">Business</CardTitle>
                <CardDescription>₫499,000/tháng</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Tất cả tính năng Growth
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Kết nối ngân hàng
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Báo cáo thuế
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    API truy cập
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Hỗ trợ ưu tiên
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
