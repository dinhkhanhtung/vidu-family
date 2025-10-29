import { prisma } from './prisma'
import { Budget, BudgetAlert, BudgetAlertType, Transaction, TransactionType } from '@prisma/client'
import { BudgetPeriod } from '@prisma/client'

export interface CreateBudgetData {
  name: string
  amount: number
  categoryId?: string
  workspaceId: string
  period: BudgetPeriod
  startDate: Date
  endDate: Date
}

export interface UpdateBudgetData {
  name?: string
  amount?: number
  categoryId?: string
  isActive?: boolean
}

export interface BudgetWithDetails extends Budget {
  category?: {
    id: string
    name: string
    color?: string | null
  } | null
  alerts?: BudgetAlert[]
  _count?: {
    alerts: number
  }
}

// Budget management functions
export async function createBudget(data: CreateBudgetData): Promise<Budget> {
  return prisma.budget.create({
    data,
  })
}

export async function getBudgetById(id: string): Promise<BudgetWithDetails | null> {
  return prisma.budget.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      alerts: true,
    },
  })
}

export async function getBudgetsByWorkspace(workspaceId: string): Promise<BudgetWithDetails[]> {
  return prisma.budget.findMany({
    where: { workspaceId },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      alerts: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateBudget(id: string, data: UpdateBudgetData): Promise<Budget> {
  return prisma.budget.update({
    where: { id },
    data,
  })
}

export async function deleteBudget(id: string): Promise<Budget> {
  // Delete associated alerts first
  await prisma.budgetAlert.deleteMany({
    where: { budgetId: id },
  })

  return prisma.budget.delete({
    where: { id },
  })
}

// Budget calculation functions
export async function calculateBudgetSpent(budgetId: string): Promise<number> {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: {
      category: true,
    },
  })

  if (!budget) {
    throw new Error('Budget not found')
  }

  let spent = 0

  if (budget.categoryId) {
    // Category-specific budget
    spent = await getSpentByCategoryAndDateRange(
      budget.categoryId,
      budget.startDate,
      budget.endDate
    )
  } else {
    // Overall budget for workspace
    spent = await getSpentByWorkspaceAndDateRange(
      budget.workspaceId,
      budget.startDate,
      budget.endDate
    )
  }

  // Update the budget with calculated spent amount
  await prisma.budget.update({
    where: { id: budgetId },
    data: { spent },
  })

  return spent
}

export async function getSpentByCategoryAndDateRange(
  categoryId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: {
      categoryId,
      type: TransactionType.EXPENSE,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  })

  return result._sum.amount || 0
}

export async function getSpentByWorkspaceAndDateRange(
  workspaceId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: {
      workspaceId,
      type: TransactionType.EXPENSE,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  })

  return result._sum.amount || 0
}

// Budget alert functions
export async function createBudgetAlert(
  budgetId: string,
  type: BudgetAlertType,
  threshold: number
): Promise<BudgetAlert> {
  return prisma.budgetAlert.create({
    data: {
      budgetId,
      type,
      threshold,
    },
  })
}

export async function checkBudgetAlerts(budgetId: string): Promise<void> {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: { alerts: true },
  })

  if (!budget || !budget.isActive) {
    return
  }

  const spentPercentage = (budget.spent / budget.amount) * 100

  for (const alert of budget.alerts) {
    if (alert.triggered) continue

    let shouldTrigger = false

    switch (alert.type) {
      case BudgetAlertType.PERCENTAGE_80:
        shouldTrigger = spentPercentage >= 80
        break
      case BudgetAlertType.PERCENTAGE_90:
        shouldTrigger = spentPercentage >= 90
        break
      case BudgetAlertType.PERCENTAGE_100:
        shouldTrigger = spentPercentage >= 100
        break
    }

    if (shouldTrigger) {
      await prisma.budgetAlert.update({
        where: { id: alert.id },
        data: { triggered: true },
      })

      // Update budget alert flags
      if (alert.type === BudgetAlertType.PERCENTAGE_80) {
        await prisma.budget.update({
          where: { id: budgetId },
          data: { alert80: true },
        })
      } else if (alert.type === BudgetAlertType.PERCENTAGE_90) {
        await prisma.budget.update({
          where: { id: budgetId },
          data: { alert90: true },
        })
      } else if (alert.type === BudgetAlertType.PERCENTAGE_100) {
        await prisma.budget.update({
          where: { id: budgetId },
          data: { alert100: true },
        })
      }
    }
  }
}

// Utility functions
export function calculateBudgetProgress(budget: Budget): {
  spent: number
  remaining: number
  percentage: number
  isOverBudget: boolean
} {
  const spent = budget.spent
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

export function getBudgetPeriodDates(period: BudgetPeriod, startDate: Date): {
  startDate: Date
  endDate: Date
} {
  const start = new Date(startDate)

  switch (period) {
    case BudgetPeriod.WEEKLY:
      return {
        startDate: start,
        endDate: new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1),
      }
    case BudgetPeriod.MONTHLY:
      const endOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999)
      return {
        startDate: start,
        endDate: endOfMonth,
      }
    case BudgetPeriod.QUARTERLY:
      const quarter = Math.floor(start.getMonth() / 3)
      const quarterStart = new Date(start.getFullYear(), quarter * 3, 1)
      const quarterEnd = new Date(start.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59, 999)
      return {
        startDate: quarterStart,
        endDate: quarterEnd,
      }
    case BudgetPeriod.YEARLY:
      return {
        startDate: new Date(start.getFullYear(), 0, 1),
        endDate: new Date(start.getFullYear(), 11, 31, 23, 59, 59, 999),
      }
    default:
      return {
        startDate: start,
        endDate: start,
      }
  }
}
