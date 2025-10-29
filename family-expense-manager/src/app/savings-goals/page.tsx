'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Target, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { SavingsGoalCard } from '@/components/savings-goals/SavingsGoalCard'
import { FeatureLocked } from '@/components/ui/feature-locked'
import { SavingsGoalWithDetails } from '@/lib/savings-goals'

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<SavingsGoalWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  // Mock data for demo
  useEffect(() => {
    const mockGoals: SavingsGoalWithDetails[] = [
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
          {
            id: 'c2',
            amount: 3000000,
            date: new Date('2024-02-15'),
            description: 'Tiết kiệm tháng 2',
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
            id: 'c3',
            amount: 10000000,
            date: new Date('2024-01-15'),
            description: 'Tiền tiết kiệm ban đầu',
            goalId: '2',
            createdAt: new Date(),
          },
        ],
      },
      {
        id: '3',
        name: 'Quỹ khẩn cấp',
        targetAmount: 100000000,
        currentAmount: 25000000,
        targetDate: new Date('2025-12-31'),
        description: 'Quỹ dự phòng cho trường hợp khẩn cấp',
        isActive: true,
        isCompleted: false,
        completedAt: null,
        workspaceId: 'ws1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        contributions: [
          {
            id: 'c4',
            amount: 10000000,
            date: new Date('2024-01-15'),
            description: 'Bắt đầu quỹ khẩn cấp',
            goalId: '3',
            createdAt: new Date(),
          },
        ],
      },
    ]

    // Simulate loading
    setTimeout(() => {
      setGoals(mockGoals)
      setLoading(false)
      setHasAccess(false) // Set to false to show premium lock
    }, 1000)
  }, [])

  const handleCreateGoal = () => {
    console.log('Create new savings goal')
  }

  const handleEditGoal = (goal: SavingsGoalWithDetails) => {
    console.log('Edit goal:', goal.id)
  }

  const handleDeleteGoal = (goal: SavingsGoalWithDetails) => {
    console.log('Delete goal:', goal.id)
  }

  const handleAddContribution = (goal: SavingsGoalWithDetails) => {
    console.log('Add contribution to goal:', goal.id)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Đang tải mục tiêu tiết kiệm...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mục tiêu tiết kiệm</h1>
          <p className="text-muted-foreground mt-2">
            Đặt mục tiêu và theo dõi tiến độ tiết kiệm của bạn
          </p>
        </div>

        {hasAccess && (
          <Button onClick={handleCreateGoal}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm mục tiêu mới
          </Button>
        )}
      </div>

      {!hasAccess ? (
        <FeatureLocked
          feature="goals"
          variant="card"
          size="lg"
          className="max-w-2xl mx-auto"
        />
      ) : (
        <>
          {/* Savings Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Tổng mục tiêu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {goals.reduce((sum, goal) => sum + goal.targetAmount, 0).toLocaleString('vi-VN')} ₫
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Đã hoàn thành
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {goals.filter(g => g.isCompleted).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Mục tiêu đã đạt
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Đang tiến hành
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {goals.filter(g => g.isActive && !g.isCompleted).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Mục tiêu đang thực hiện
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Goals List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onAddContribution={handleAddContribution}
              />
            ))}
          </div>

          {goals.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-muted-foreground mb-4">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có mục tiêu nào</h3>
                  <p>Bắt đầu đặt mục tiêu tiết kiệm đầu tiên để xây dựng tương lai tài chính</p>
                </div>
                <Button onClick={handleCreateGoal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Đặt mục tiêu đầu tiên
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
