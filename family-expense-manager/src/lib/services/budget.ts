import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BudgetFormData } from "@/lib/validations/budget"
import { sendEmail } from "@/lib/email"

// List budgets
export async function getBudgets({
  workspaceId,
  period,
  isActive = true,
  page = 1,
  limit = 10
}: {
  workspaceId: string
  period?: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
  isActive?: boolean
  page?: number
  limit?: number
}) {
  const skip = (page - 1) * limit
  const where = {
    workspaceId,
    isActive,
    ...(period && { period })
  }

  const [budgets, total] = await Promise.all([
    prisma.budget.findMany({
      where,
      include: {
        category: true,
        alerts: true
      },
      orderBy: {
        endDate: "desc"
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
    where: { id },
    include: {
      category: true,
      alerts: true
    }
  })

  if (!budget) {
    return null
  }

  // Verify user has access to this budget's workspace
  const hasAccess = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: budget.workspaceId
      }
    }
  })

  if (!hasAccess) {
    throw new Error("Not authorized")
  }

  return budget
}

// Create new budget
export async function createBudget(data: BudgetFormData & { workspaceId: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  return await prisma.budget.create({
    data: {
      ...data,
      alerts: {
        create: [
          {
            type: "PERCENTAGE_80",
            threshold: 80,
            triggered: false
          },
          {
            type: "PERCENTAGE_90",
            threshold: 90,
            triggered: false
          },
          {
            type: "PERCENTAGE_100",
            threshold: 100,
            triggered: false
          }
        ]
      }
    },
    include: {
      category: true,
      alerts: true
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
    data,
    include: {
      category: true,
      alerts: true
    }
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

// Update budget spending
export async function updateBudgetSpending(budgetId: string, newSpending: number) {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: {
      alerts: true,
      workspace: {
        include: {
          members: {
            where: { role: "OWNER" },
            include: { user: true }
          }
        }
      }
    }
  })

  if (!budget) {
    throw new Error("Budget not found")
  }

  const spendingPercentage = (newSpending / budget.amount) * 100

  // Check if any alerts should be triggered
  for (const alert of budget.alerts) {
    if (spendingPercentage >= alert.threshold && !alert.triggered) {
      // Update alert status
      await prisma.budgetAlert.update({
        where: { id: alert.id },
        data: { triggered: true }
      })

      // Send notification email
      const owner = budget.workspace.members[0].user
      await sendEmail({
        to: owner.email,
        subject: `Budget Alert: ${budget.name} reached ${alert.threshold}% threshold`,
        html: `
          <div>
            <h2>Budget Alert</h2>
            <p>Your budget "${budget.name}" has reached ${alert.threshold}% of its allocated amount.</p>
            <ul>
              <li>Budget: ${budget.name}</li>
              <li>Allocated: ${budget.amount}</li>
              <li>Spent: ${newSpending}</li>
              <li>Remaining: ${budget.amount - newSpending}</li>
              <li>Period: ${budget.period}</li>
            </ul>
            <p>Please review your spending to stay within budget.</p>
          </div>
        `
      })
    }
  }

  return await prisma.budget.update({
    where: { id: budgetId },
    data: { spent: newSpending },
    include: {
      category: true,
      alerts: true
    }
  })
}

// Get budget summary and analysis
export async function getBudgetSummary({
  workspaceId,
  period = "MONTHLY",
  startDate,
  endDate
}: {
  workspaceId: string
  period?: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
  startDate: Date
  endDate: Date
}) {
  const budgets = await prisma.budget.findMany({
    where: {
      workspaceId,
      period,
      startDate: {
        lte: endDate
      },
      endDate: {
        gte: startDate
      }
    },
    include: {
      category: true
    }
  })

  const categorySpending = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      workspaceId,
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
    const spending = categorySpending.find(s => s.categoryId === budget.categoryId)
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