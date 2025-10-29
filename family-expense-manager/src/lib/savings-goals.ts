import { prisma } from './prisma'
import { SavingsGoal, SavingsContribution, TransactionType } from '@prisma/client'

export interface CreateSavingsGoalData {
  name: string
  targetAmount: number
  targetDate: Date
  description?: string
  workspaceId: string
}

export interface UpdateSavingsGoalData {
  name?: string
  targetAmount?: number
  targetDate?: Date
  description?: string
  isActive?: boolean
}

export interface SavingsGoalWithDetails extends SavingsGoal {
  contributions: SavingsContribution[]
  _count?: {
    contributions: number
  }
}

export interface ContributionData {
  amount: number
  description?: string
  date?: Date
}

// Savings Goal management functions
export async function createSavingsGoal(data: CreateSavingsGoalData): Promise<SavingsGoal> {
  return prisma.savingsGoal.create({
    data,
  })
}

export async function getSavingsGoalById(id: string): Promise<SavingsGoalWithDetails | null> {
  return prisma.savingsGoal.findUnique({
    where: { id },
    include: {
      contributions: {
        orderBy: { date: 'desc' },
      },
    },
  })
}

export async function getSavingsGoalsByWorkspace(workspaceId: string): Promise<SavingsGoalWithDetails[]> {
  return prisma.savingsGoal.findMany({
    where: { workspaceId },
    include: {
      contributions: {
        orderBy: { date: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateSavingsGoal(id: string, data: UpdateSavingsGoalData): Promise<SavingsGoal> {
  return prisma.savingsGoal.update({
    where: { id },
    data,
  })
}

export async function deleteSavingsGoal(id: string): Promise<SavingsGoal> {
  // Delete associated contributions first
  await prisma.savingsContribution.deleteMany({
    where: { goalId: id },
  })

  return prisma.savingsGoal.delete({
    where: { id },
  })
}

export async function markSavingsGoalAsCompleted(id: string): Promise<SavingsGoal> {
  return prisma.savingsGoal.update({
    where: { id },
    data: {
      isCompleted: true,
      completedAt: new Date(),
    },
  })
}

// Contribution management functions
export async function addContribution(
  goalId: string,
  data: ContributionData
): Promise<SavingsContribution> {
  // Get current goal to update currentAmount
  const goal = await prisma.savingsGoal.findUnique({
    where: { id: goalId },
  })

  if (!goal) {
    throw new Error('Savings goal not found')
  }

  if (!goal.isActive) {
    throw new Error('Cannot add contribution to inactive savings goal')
  }

  // Create the contribution
  const contribution = await prisma.savingsContribution.create({
    data: {
      ...data,
      goalId,
      date: data.date || new Date(),
    },
  })

  // Update the goal's current amount
  const newCurrentAmount = goal.currentAmount + data.amount
  const isCompleted = newCurrentAmount >= goal.targetAmount

  await prisma.savingsGoal.update({
    where: { id: goalId },
    data: {
      currentAmount: newCurrentAmount,
      isCompleted,
      completedAt: isCompleted ? new Date() : undefined,
    },
  })

  return contribution
}

export async function getContributionsByGoal(goalId: string): Promise<SavingsContribution[]> {
  return prisma.savingsContribution.findMany({
    where: { goalId },
    orderBy: { date: 'desc' },
  })
}

export async function updateContribution(
  id: string,
  data: Partial<ContributionData>
): Promise<SavingsContribution> {
  const contribution = await prisma.savingsContribution.findUnique({
    where: { id },
    include: { goal: true },
  })

  if (!contribution) {
    throw new Error('Contribution not found')
  }

  // Calculate the difference in amount to update the goal
  const amountDifference = (data.amount || contribution.amount) - contribution.amount

  const updatedContribution = await prisma.savingsContribution.update({
    where: { id },
    data,
  })

  // Update the goal's current amount
  if (amountDifference !== 0) {
    const goal = contribution.goal
    const newCurrentAmount = goal.currentAmount + amountDifference
    const isCompleted = newCurrentAmount >= goal.targetAmount

    await prisma.savingsGoal.update({
      where: { id: goal.id },
      data: {
        currentAmount: newCurrentAmount,
        isCompleted,
        completedAt: isCompleted ? new Date() : goal.completedAt,
      },
    })
  }

  return updatedContribution
}

export async function deleteContribution(id: string): Promise<SavingsContribution> {
  const contribution = await prisma.savingsContribution.findUnique({
    where: { id },
    include: { goal: true },
  })

  if (!contribution) {
    throw new Error('Contribution not found')
  }

  // Update the goal's current amount by subtracting the contribution amount
  const goal = contribution.goal
  const newCurrentAmount = Math.max(0, goal.currentAmount - contribution.amount)
  const isCompleted = newCurrentAmount >= goal.targetAmount

  await prisma.savingsGoal.update({
    where: { id: goal.id },
    data: {
      currentAmount: newCurrentAmount,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  })

  return prisma.savingsContribution.delete({
    where: { id },
  })
}

// Calculation and utility functions
export function calculateSavingsProgress(goal: SavingsGoal): {
  currentAmount: number
  targetAmount: number
  remainingAmount: number
  percentage: number
  isCompleted: boolean
  daysRemaining: number
  monthlyRequired: number
} {
  const currentAmount = goal.currentAmount
  const targetAmount = goal.targetAmount
  const remainingAmount = Math.max(0, targetAmount - currentAmount)
  const percentage = Math.min(100, (currentAmount / targetAmount) * 100)
  const isCompleted = goal.isCompleted || currentAmount >= targetAmount

  // Calculate days remaining
  const today = new Date()
  const targetDate = new Date(goal.targetDate)
  const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

  // Calculate monthly required amount
  const monthsRemaining = Math.max(1, daysRemaining / 30)
  const monthlyRequired = remainingAmount / monthsRemaining

  return {
    currentAmount,
    targetAmount,
    remainingAmount,
    percentage,
    isCompleted,
    daysRemaining,
    monthlyRequired,
  }
}

export function getGoalStatus(goal: SavingsGoal): 'completed' | 'on-track' | 'behind' | 'inactive' {
  if (!goal.isActive) return 'inactive'
  if (goal.isCompleted) return 'completed'

  const progress = calculateSavingsProgress(goal)
  const today = new Date()
  const targetDate = new Date(goal.targetDate)

  if (today > targetDate && !progress.isCompleted) {
    return 'behind'
  }

  // Simple heuristic: if we're past 50% of the time but haven't reached 50% of the goal
  const totalDays = Math.ceil((targetDate.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  const daysElapsed = Math.ceil((today.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  const timeProgress = daysElapsed / totalDays

  if (timeProgress > 0.5 && progress.percentage < 50) {
    return 'behind'
  }

  return 'on-track'
}

export async function getTotalSavingsByWorkspace(workspaceId: string): Promise<number> {
  const result = await prisma.savingsGoal.aggregate({
    where: {
      workspaceId,
      isActive: true,
    },
    _sum: {
      currentAmount: true,
    },
  })

  return result._sum.currentAmount || 0
}

export async function getCompletedGoalsByWorkspace(workspaceId: string): Promise<SavingsGoal[]> {
  return prisma.savingsGoal.findMany({
    where: {
      workspaceId,
      isCompleted: true,
    },
    orderBy: { completedAt: 'desc' },
  })
}
