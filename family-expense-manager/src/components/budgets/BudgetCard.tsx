'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { BudgetWithDetails } from '@/lib/budgets'
import { calculateBudgetProgress } from '@/lib/budgets'

interface BudgetCardProps {
  budget: BudgetWithDetails
  onEdit?: (budget: BudgetWithDetails) => void
  onDelete?: (budget: BudgetWithDetails) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const progress = calculateBudgetProgress(budget)
  const { spent, remaining, percentage, isOverBudget } = progress

  const getStatusIcon = () => {
    if (isOverBudget) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-orange-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusColor = () => {
    if (isOverBudget) return 'text-red-600'
    if (percentage >= 90) return 'text-yellow-600'
    if (percentage >= 80) return 'text-orange-600'
    return 'text-green-600'
  }

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500'
    if (percentage >= 90) return 'bg-yellow-500'
    if (percentage >= 80) return 'bg-orange-500'
    return 'bg-green-500'
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">{budget.name}</CardTitle>
          </div>
          <Badge variant={budget.isActive ? 'default' : 'secondary'}>
            {budget.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
          </Badge>
        </div>

        {budget.category && (
          <CardDescription className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: budget.category.color || '#6b7280' }}
            />
            {budget.category.name}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Budget Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Ngân sách</span>
          </div>
          <span className="font-semibold">
            {budget.amount.toLocaleString('vi-VN')} ₫
          </span>
        </div>

        {/* Spent Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Đã chi</span>
          </div>
          <span className={`font-semibold ${getStatusColor()}`}>
            {spent.toLocaleString('vi-VN')} ₫
          </span>
        </div>

        {/* Remaining Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Còn lại</span>
          </div>
          <span className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {remaining.toLocaleString('vi-VN')} ₫
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tiến độ</span>
            <span className={getStatusColor()}>
              {percentage.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={Math.min(100, percentage)}
            className="h-2"
          />
        </div>

        {/* Alert Status */}
        {(budget.alert80 || budget.alert90 || budget.alert100) && (
          <div className="flex flex-wrap gap-1">
            {budget.alert80 && (
              <Badge variant="outline" className="text-xs text-orange-600">
                Cảnh báo 80%
              </Badge>
            )}
            {budget.alert90 && (
              <Badge variant="outline" className="text-xs text-yellow-600">
                Cảnh báo 90%
              </Badge>
            )}
            {budget.alert100 && (
              <Badge variant="outline" className="text-xs text-red-600">
                Vượt ngân sách
              </Badge>
            )}
          </div>
        )}

        {/* Period Info */}
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Từ: {new Date(budget.startDate).toLocaleDateString('vi-VN')}</span>
            <span>Đến: {new Date(budget.endDate).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="text-center mt-1">
            Kỳ: {budget.period === 'WEEKLY' ? 'Tuần' :
                 budget.period === 'MONTHLY' ? 'Tháng' :
                 budget.period === 'QUARTERLY' ? 'Quý' : 'Năm'}
          </div>
        </div>

        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(budget)}>
                Chỉnh sửa
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={() => onDelete(budget)}>
                Xóa
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
