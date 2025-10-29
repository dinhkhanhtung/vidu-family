import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BudgetFormData } from "@/lib/validations/budget"
import { sendEmail } from "@/lib/email"

// List budgets - simplified for current schema
export async function getBudgets({
  userId,
  period,
  page = 1,
  limit = 10
}: {
  userId: string
  period?: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
  page?: number
  limit?: number
}) {
  const skip = (page - 1) * limit
  const where = {
    userId,
    ...(period && { period })
  }

  const [budgets, total] = await Promise.all([
    prisma.budget.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    }),
    prisma.budget.count({ where })
  ])

  return {
    budgets,
    total,
    pages: Math.ceil(total / limit)
  }
}

// Get budget by ID
export async function getBudget(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const budget = await prisma.budget.findUnique({
    where: { id }
  })

  if (!budget || budget.userId !== session.user.id) {
    return null
  }

  return budget
}

// Create new budget
export async function createBudget(data: BudgetFormData & { userId: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  return await prisma.budget.create({
    data: {
      ...data
    }
  })
}

// Update budget
export async function updateBudget(id: string, data: Partial<BudgetFormData>) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  return await prisma.budget.update({
    where: { id },
    data
  })
}

// Delete budget
export async function deleteBudget(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  return await prisma.budget.delete({
    where: { id }
  })
}

// Update budget spending - simplified for current schema
export async function updateBudgetSpending(budgetId: string, newSpending: number) {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId }
  })

  if (!budget) {
    throw new Error("Budget not found")
  }

  // Note: Current schema doesn't track spent amounts
  // This is just a placeholder for future implementation
  return budget
}

// Get budget summary and analysis
export async function getBudgetSummary({
  userId,
  period = "MONTHLY",
  startDate,
  endDate
}: {
  userId: string
  period?: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
  startDate: Date
  endDate: Date
}) {
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      period,
      startDate: {
        lte: endDate
      },
      endDate: {
        gte: startDate
      }
    }
  })

  const categorySpending = await prisma.transaction.groupBy({
    by: ["category"],
    where: {
      userId,
      type: "EXPENSE",
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      amount: true
    }
  })

  const analysis = budgets.map(budget => {
    const spending = categorySpending.find(s => s.category === budget.category)
    const spentAmount = spending?._sum.amount || 0
    const remainingAmount = budget.amount - spentAmount
    const percentageUsed = (spentAmount / budget.amount) * 100

    return {
      budget,
      spent: spentAmount,
      remaining: remainingAmount,
      percentageUsed,
      status: percentageUsed > 100 ? "EXCEEDED" : "WITHIN_LIMIT"
    }
  })

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = categorySpending.reduce((sum, cat) => sum + (cat._sum.amount || 0), 0)

  return {
    period,
    totalBudgeted,
    totalSpent,
    remaining: totalBudgeted - totalSpent,
    percentageUsed: (totalSpent / totalBudgeted) * 100,
    budgets: analysis
  }
}
