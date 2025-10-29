'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Lock, Crown, Zap, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureLockedProps {
  feature: string
  title?: string
  description?: string
  preview?: React.ReactNode
  className?: string
  variant?: 'card' | 'inline' | 'overlay'
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

const featureIcons: Record<string, React.ReactNode> = {
  budgeting: <Zap className="h-4 w-4" />,
  goals: <Star className="h-4 w-4" />,
  alerts: <Crown className="h-4 w-4" />,
  default: <Lock className="h-4 w-4" />,
}

const featureTitles: Record<string, string> = {
  budgeting: 'Ngân sách thông minh',
  goals: 'Mục tiêu tiết kiệm',
  alerts: 'Cảnh báo chi tiêu',
  export: 'Xuất dữ liệu',
  bankConnect: 'Kết nối ngân hàng',
  taxReports: 'Báo cáo thuế',
  api: 'API truy cập',
}

const featureDescriptions: Record<string, string> = {
  budgeting: 'Theo dõi và quản lý ngân sách theo danh mục với cảnh báo khi vượt hạn mức',
  goals: 'Đặt mục tiêu tiết kiệm và theo dõi tiến độ với tính toán tự động',
  alerts: 'Nhận thông báo khi chi tiêu vượt quá ngân sách đã đặt',
  export: 'Xuất dữ liệu giao dịch và báo cáo tài chính',
  bankConnect: 'Kết nối trực tiếp với tài khoản ngân hàng',
  taxReports: 'Tạo báo cáo thuế tự động từ dữ liệu giao dịch',
  api: 'Truy cập API để tích hợp với ứng dụng khác',
}

export function FeatureLocked({
  feature,
  title,
  description,
  preview,
  className,
  variant = 'card',
  size = 'md',
  children,
}: FeatureLockedProps) {
  const icon = featureIcons[feature] || featureIcons.default
  const defaultTitle = featureTitles[feature] || `${feature} (Premium)`
  const defaultDescription = featureDescriptions[feature] || `Tính năng ${feature} chỉ dành cho gói Premium`

  const displayTitle = title || defaultTitle
  const displayDescription = description || defaultDescription

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 p-2 bg-muted/50 rounded-md', className)}>
        {icon}
        <div className="flex-1">
          <p className="text-sm font-medium">{displayTitle}</p>
          <p className="text-xs text-muted-foreground">{displayDescription}</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          Premium
        </Badge>
      </div>
    )
  }

  if (variant === 'overlay') {
    return (
      <div className={cn('relative', className)}>
        {children}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Card className="w-full max-w-sm mx-4">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                {icon}
              </div>
              <CardTitle className="text-lg">{displayTitle}</CardTitle>
              <CardDescription>{displayDescription}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full">
                Nâng cấp Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Default card variant
  const sizeClasses = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
  }

  return (
    <Card className={cn(sizeClasses[size], className)}>
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          {displayTitle}
          <Badge variant="secondary">Premium</Badge>
        </CardTitle>
        <CardDescription>{displayDescription}</CardDescription>
      </CardHeader>

      {preview && (
        <CardContent className="mb-4">
          <div className="opacity-60 pointer-events-none">
            {preview}
          </div>
        </CardContent>
      )}

      <CardContent className="text-center">
        <Button className="w-full" size={size === 'sm' ? 'sm' : 'default'}>
          <Crown className="w-4 h-4 mr-2" />
          Nâng cấp Premium
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Mở khóa tất cả tính năng cao cấp
        </p>
      </CardContent>
    </Card>
  )
}

// Hook for checking feature availability
export function useFeatureAccess(feature: string): {
  hasAccess: boolean
  isLoading: boolean
  upgradeUrl: string
} {
  // This would typically use your subscription context/hook
  // For now, we'll return a simple implementation
  const hasAccess = false // Replace with actual feature flag check
  const isLoading = false
  const upgradeUrl = '/pricing'

  return {
    hasAccess,
    isLoading,
    upgradeUrl,
  }
}

// Higher-order component for wrapping premium features
export function withFeatureGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: string,
  fallback?: React.ReactNode
) {
  return function FeatureGatedComponent(props: P) {
    const { hasAccess } = useFeatureAccess(feature)

    if (hasAccess) {
      return <WrappedComponent {...props} />
    }

    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <FeatureLocked
        feature={feature}
        variant="card"
        className="w-full"
      />
    )
  }
}
