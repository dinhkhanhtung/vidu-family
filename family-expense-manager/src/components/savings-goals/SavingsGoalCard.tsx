'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Target, TrendingUp, Calendar, Plus } from 'lucide-react'
import { SavingsGoal } from '@prisma/client'
import { calculateSavingsProgress, getGoalStatus } from '@/lib/savings-goals'

interface SavingsGoalCardProps {
  goal: SavingsGoal
  onEdit?: (goal: SavingsGoal) => void
  onDelete?: (goal: SavingsGoal) => void
  onAddContribution?: (goal: SavingsGoal) => void
}

export function SavingsGoalCard({ goal, onEdit, onDelete, onAddContribution }: SavingsGoalCardProps) {
  const progress = calculateSavingsProgress(goal)
  const status = getGoalStatus(goal)
  const isCompleted = progress.currentAmount >= progress.targetAmount

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'behind':
        return <Clock className="h-4 w-4 text-red-500" />
      case 'on-track':
        return <Target className="h-4 w-4 text-blue-500" />
      default:
        return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'behind':
        return 'text-red-600'
      case 'on-track':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
      case 'behind':
        return <Badge className="bg-red-100 text-red-800">Chậm tiến độ</Badge>
      case 'on-track':
        return <Badge className="bg-blue-100 text-blue-800">Đúng tiến độ</Badge>
      default:
        return <Badge variant="secondary">Không có hạn</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">{goal.name}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>

        <CardDescription>{goal.category}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Target Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Mục tiêu</span>
          </div>
          <span className="font-semibold">
            {goal.targetAmount.toLocaleString('vi-VN')} ₫
          </span>
        </div>

        {/* Current Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Đã tiết kiệm</span>
          </div>
          <span className={`font-semibold ${getStatusColor()}`}>
            {progress.currentAmount.toLocaleString('vi-VN')} ₫
          </span>
        </div>

        {/* Remaining Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Còn thiếu</span>
          </div>
          <span className={`font-semibold ${progress.remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {progress.remainingAmount.toLocaleString('vi-VN')} ₫
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tiến độ</span>
            <span className={getStatusColor()}>
              {progress.percentage.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={progress.percentage}
            className="h-2"
          />
        </div>

        {/* Monthly Required */}
        {!isCompleted && progress.monthlyRequired > 0 && (
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
            <span className="text-sm text-muted-foreground">Cần tiết kiệm/tháng</span>
            <span className="font-medium">
              {progress.monthlyRequired.toLocaleString('vi-VN')} ₫
            </span>
          </div>
        )}

        {/* Time Info */}
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Từ: {new Date(goal.createdAt).toLocaleDateString('vi-VN')}</span>
            <span>Đến: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('vi-VN') : 'Không có'}</span>
          </div>
          {!isCompleted && progress.daysRemaining > 0 && (
            <div className="text-center mt-1">
              Còn {progress.daysRemaining} ngày
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onAddContribution && !isCompleted && (
            <Button size="sm" onClick={() => onAddContribution(goal)}>
              <Plus className="w-4 h-4 mr-1" />
              Đóng góp
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(goal)}>
              Chỉnh sửa
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(goal)}>
              Xóa
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
