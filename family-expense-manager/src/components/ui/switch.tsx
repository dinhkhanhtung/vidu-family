'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function Switch({ className, checked, onCheckedChange, onChange, ...props }: SwitchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked)
    onChange?.(e)
  }

  return (
    <label className={cn(
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      checked ? 'bg-primary' : 'bg-muted',
      className
    )}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={handleChange}
        {...props}
      />
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-background shadow-lg ring-0 transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </label>
  )
}
