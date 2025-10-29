'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { BudgetCard } from '@/components/budgets/BudgetCard'
import { FeatureLocked } from '@/components/ui/feature-locked'
import { BudgetWithDetails } from '@/lib/budgets'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  // Mock data for demo
  useEffect(() => {
    const mockBudgets: BudgetWithDetails[] = [
      {
        id: '1',
        name: 'Ăn uống tháng 10',
        amount: 5000000,
        spent: 4200000,
        categoryId: 'cat1',
        workspaceId: 'ws1',
        period: 'MONTHLY',
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
        period: 'MONTHLY',
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
      {
        id: '3',
        name: 'Mua sắm tháng 10',
        amount: 3000000,
        spent: 3500000,
        categoryId: 'cat3',
        workspaceId: 'ws1',
        period: 'MONTHLY',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-10-31'),
        isActive: true,
        alert80: true,
        alert90: true,
        alert100: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'cat3',
          name: 'Mua sắm',
          color: '#10b981',
        },
        alerts: [],
      },
    ]

    // Simulate loading
    setTimeout(() => {
      setBudgets(mockBudgets)
      setLoading(false)
      setHasAccess(false) // Set to false to show premium lock
    }, 1000)
  }, [])

  const handleCreateBudget = () => {
    console.log('Create new budget')
  }

  const handleEditBudget = (budget: BudgetWithDetails) => {
    console.log('Edit budget:', budget.id)
  }

  const handleDeleteBudget = (budget: BudgetWithDetails) => {
    console.log('Delete budget:', budget.id)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Đang tải ngân sách...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quản lý ngân sách</h1>
          <p className="text-muted-foreground mt-2">
            Theo dõi và kiểm soát chi tiêu với ngân sách thông minh
          </p>
        </div>

        {hasAccess && (
          <Button onClick={handleCreateBudget}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo ngân sách mới
          </Button>
        )}
      </div>

      {!hasAccess ? (
        <FeatureLocked
          feature="budgeting"
          variant="card"
          size="lg"
          className="max-w-2xl mx-auto"
        />
      ) : (
        <>
          {/* Budget Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Tổng ngân sách
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {budgets.reduce((sum, budget) => sum + budget.amount, 0).toLocaleString('vi-VN')} ₫
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Cảnh báo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {budgets.filter(b => b.alert80 || b.alert90).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ngân sách cần chú ý
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Tốt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {budgets.filter(b => !b.alert80 && !b.alert90 && !b.alert100).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ngân sách ổn định
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={handleEditBudget}
                onDelete={handleDeleteBudget}
              />
            ))}
          </div>

          {budgets.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-muted-foreground mb-4">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có ngân sách nào</h3>
                  <p>Bắt đầu tạo ngân sách đầu tiên để kiểm soát chi tiêu tốt hơn</p>
                </div>
                <Button onClick={handleCreateBudget}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo ngân sách đầu tiên
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
