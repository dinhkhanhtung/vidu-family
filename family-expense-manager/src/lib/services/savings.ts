import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SavingsGoalFormData } from "@/lib/validations/savings"
import { emailTemplates, notifyWorkspaceMembers } from "@/lib/email"

// List savings goals
export async function getSavingsGoals({
  workspaceId,
  isActive = true,
  includeCompleted = false,
  page = 1,
  limit = 10
}: {
  workspaceId: string
  isActive?: boolean
  includeCompleted?: boolean
  page?: number
  limit?: number
}) {
  const skip = (page - 1) * limit
  const where = {
    workspaceId,
    isActive,
    ...(!includeCompleted && { isCompleted: false })
  }

  const [goals, total] = await Promise.all([
    prisma.savingsGoal.findMany({
      where,
      include: {
        contributions: {
          orderBy: {
            date: "desc"
          }
        }
      },
      orderBy: {
        targetDate: "asc"
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
    where: { id },
    include: {
      contributions: {
        orderBy: {
          date: "desc"
        }
      }
    }
  })

  if (!goal) {
    return null
  }

  // Verify user has access to this goal's workspace
  const hasAccess = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: goal.workspaceId
      }
    }
  })

  if (!hasAccess) {
    throw new Error("Not authorized")
  }

  return goal
}

// Create new savings goal
export async function createSavingsGoal(data: SavingsGoalFormData & { workspaceId: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  return await prisma.savingsGoal.create({
    data: {
      ...data,
      isActive: true,
      isCompleted: false,
      currentAmount: 0
    },
    include: {
      contributions: true
    }
  })
}

// Update savings goal
export async function updateSavingsGoal(id: string, data: Partial<SavingsGoalFormData>) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  return await prisma.savingsGoal.update({
    where: { id },
    data,
    include: {
      contributions: true
    }
  })
}

// Delete savings goal
export async function deleteSavingsGoal(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  return await prisma.savingsGoal.delete({
    where: { id }
  })
}

// Add contribution to savings goal
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

  return await prisma.$transaction(async (prisma) => {
    // Create contribution
    const contribution = await prisma.savingsContribution.create({
      data: {
        goalId,
        amount,
        description
      }
    })

    // Update goal's current amount
    const goal = await prisma.savingsGoal.update({
      where: { id: goalId },
      data: {
        currentAmount: {
          increment: amount
        }
      },
      include: {
        contributions: {
          orderBy: {
            date: "desc"
          }
        }
      }
    })

    // Check if goal is completed
    if (!goal.isCompleted && goal.currentAmount >= goal.targetAmount) {
      await prisma.savingsGoal.update({
        where: { id: goalId },
        data: {
          isCompleted: true,
          completedAt: new Date()
        }
      })

      // Send notification
      const template = emailTemplates.savingsGoalReached({
        goalName: goal.name,
        targetAmount: goal.targetAmount,
        completedDate: new Date()
      })

      await notifyWorkspaceMembers({
        workspaceId: goal.workspaceId,
        ...template,
        roles: ["OWNER", "ADMIN"]
      })
    }

    return {
      contribution,
      goal
    }
  })
}

// Get savings goal progress summary
export async function getSavingsProgress({
  workspaceId,
  startDate,
  endDate
}: {
  workspaceId: string
  startDate: Date
  endDate: Date
}) {
  const goals = await prisma.savingsGoal.findMany({
    where: {
      workspaceId,
      isActive: true,
      targetDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      contributions: {
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    }
  })

  const totalSaved = goals.reduce((sum, goal) => {
    return sum + goal.currentAmount
  }, 0)

  const totalTarget = goals.reduce((sum, goal) => {
    return sum + goal.targetAmount
  }, 0)

  const analysis = goals.map(goal => {
    const percentageComplete = (goal.currentAmount / goal.targetAmount) * 100
    const daysUntilTarget = Math.ceil(
      (goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    
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
    overallProgress: (totalSaved / totalTarget) * 100,
    goals: analysis
  }
}