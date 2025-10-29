import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SavingsGoalFormData } from "@/lib/validations/savings"

// List savings goals
export async function getSavingsGoals({
  userId,
  page = 1,
  limit = 10
}: {
  userId: string
  page?: number
  limit?: number
}) {
  const skip = (page - 1) * limit
  const where = { userId }

  const [goals, total] = await Promise.all([
    prisma.savingsGoal.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    }),
    prisma.savingsGoal.count({ where })
  ])

  return {
    goals,
    total,
    pages: Math.ceil(total / limit)
  }
}

// Get savings goal by ID
export async function getSavingsGoal(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const goal = await prisma.savingsGoal.findUnique({
    where: { id }
  })

  if (!goal) {
    return null
  }

  // TODO: Check if user has access to the workspace
  // For now, just return the goal if found

  return goal
}

// Create new savings goal
export async function createSavingsGoal(data: SavingsGoalFormData & { userId: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  return await prisma.savingsGoal.create({
    data: {
      ...data,
      currentAmount: 0
    }
  })
}

// Update savings goal
export async function updateSavingsGoal(id: string, data: Partial<SavingsGoalFormData>) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  // TODO: Check workspace access
  return await prisma.savingsGoal.update({
    where: { id },
    data
  })
}

// Delete savings goal
export async function deleteSavingsGoal(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  // TODO: Check workspace access
  return await prisma.savingsGoal.delete({
    where: { id }
  })
}

// Add contribution to savings goal - simplified for single-user app
export async function addContribution({
  goalId,
  amount,
  description
}: {
  goalId: string
  amount: number
  description?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  // TODO: Check workspace access
  // Simple implementation - just update the current amount
  // In a real app, you might want a separate contributions table
  return await prisma.savingsGoal.update({
    where: { id: goalId },
    data: {
      currentAmount: {
        increment: amount
      }
    }
  })
}

// Get savings goal progress summary
export async function getSavingsProgress({
  userId,
  startDate,
  endDate
}: {
  userId: string
  startDate: Date
  endDate: Date
}) {
  const goals = await prisma.savingsGoal.findMany({
    where: {
      userId,
      ...(startDate && endDate && {
        deadline: {
          gte: startDate,
          lte: endDate
        }
      })
    }
  })

  const totalSaved = goals.reduce((sum, goal) => {
    return sum + goal.currentAmount
  }, 0)

  const totalTarget = goals.reduce((sum, goal) => {
    return sum + goal.targetAmount
  }, 0)

  const analysis = goals.map(goal => {
    const percentageComplete = totalTarget > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
    const daysUntilTarget = goal.deadline
      ? Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0

    const dailyRequired = daysUntilTarget > 0
      ? (goal.targetAmount - goal.currentAmount) / daysUntilTarget
      : 0

    return {
      goal,
      percentageComplete,
      daysUntilTarget,
      dailyRequired,
      isOnTrack: percentageComplete >= (100 - (daysUntilTarget / 365) * 100)
    }
  })

  return {
    totalSaved,
    totalTarget,
    remainingToSave: totalTarget - totalSaved,
    overallProgress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
    goals: analysis
  }
}
