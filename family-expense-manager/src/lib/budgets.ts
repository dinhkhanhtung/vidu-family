export interface BudgetWithDetails {
  id: string
  name: string
  amount: number
  period: string
  category: string | {
    id: string
    name: string
    color?: string | null
  }
  userId: string
  startDate: Date
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
}

// Mock functions for compatibility
export async function createBudget(data: any) {
  return data
}

export async function getBudgetsByWorkspace(workspaceId: string): Promise<BudgetWithDetails[]> {
  return []
}

// Utility functions
export function calculateBudgetProgress(budget: BudgetWithDetails): {
  spent: number
  remaining: number
  percentage: number
  isOverBudget: boolean
} {
  const spent = 0 // Mock spent amount for now
  const remaining = budget.amount - spent
  const percentage = (spent / budget.amount) * 100
  const isOverBudget = spent > budget.amount

  return {
    spent,
    remaining: Math.max(0, remaining),
    percentage: Math.min(100, percentage),
    isOverBudget,
  }
}
