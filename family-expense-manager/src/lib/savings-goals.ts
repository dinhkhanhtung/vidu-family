import { prisma } from './prisma'
import { SavingsGoal } from '@prisma/client'

export interface CreateSavingsGoalData {
  name: string
  targetAmount: number
  deadline?: Date
  category: string
  userId: string
}

export interface UpdateSavingsGoalData {
  name?: string
  targetAmount?: number
  currentAmount?: number
  deadline?: Date
  category?: string
  userId?: string
}

// Savings Goal management functions
export async function createSavingsGoal(data: CreateSavingsGoalData): Promise<SavingsGoal> {
  return prisma.savingsGoal.create({
    data: {
      ...data,
      deadline: data.deadline || null,
    },
  })
}

export async function getSavingsGoalById(id: string): Promise<SavingsGoal | null> {
  return prisma.savingsGoal.findUnique({
    where: { id },
  })
}

export async function getSavingsGoalsByUser(userId: string): Promise<SavingsGoal[]> {
  return prisma.savingsGoal.findMany({
    where: { userId },
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
  return prisma.savingsGoal.delete({
    where: { id },
  })
}

// Calculation and utility functions
export function calculateSavingsProgress(goal: SavingsGoal): {
  currentAmount: number
  targetAmount: number
  remainingAmount: number
  percentage: number
  daysRemaining: number
  monthlyRequired: number
} {
  const currentAmount = goal.currentAmount
  const targetAmount = goal.targetAmount
  const remainingAmount = Math.max(0, targetAmount - currentAmount)
  const percentage = Math.min(100, (currentAmount / targetAmount) * 100)

  // Calculate days remaining
  const today = new Date()
  const deadline = goal.deadline ? new Date(goal.deadline) : null
  const daysRemaining = deadline ? Math.max(0, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : 0

  // Calculate monthly required amount
  const monthsRemaining = Math.max(1, daysRemaining / 30)
  const monthlyRequired = remainingAmount / monthsRemaining

  return {
    currentAmount,
    targetAmount,
    remainingAmount,
    percentage,
    daysRemaining,
    monthlyRequired,
  }
}

export function getGoalStatus(goal: SavingsGoal): 'completed' | 'on-track' | 'behind' | 'no-deadline' {
  if (!goal.deadline) return 'no-deadline'
  
  const progress = calculateSavingsProgress(goal)
  const today = new Date()
  const deadline = new Date(goal.deadline)

  if (progress.percentage >= 100) return 'completed'

  // Simple heuristic: if we're past 50% of the time but haven't reached 50% of the goal
  const totalDays = Math.ceil((deadline.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  const daysElapsed = Math.ceil((today.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  const timeProgress = daysElapsed / totalDays

  if (timeProgress > 0.5 && progress.percentage < 50) {
    return 'behind'
  }

  return 'on-track'
}

export async function getTotalSavingsByUser(userId: string): Promise<number> {
  const result = await prisma.savingsGoal.aggregate({
    where: {
      userId,
    },
    _sum: {
      currentAmount: true,
    },
  })

  return result._sum.currentAmount || 0
}

export async function getCompletedGoalsByUser(userId: string): Promise<SavingsGoal[]> {
  const goals = await prisma.savingsGoal.findMany({
    where: {
      userId,
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Filter goals where currentAmount >= targetAmount
  return goals.filter(goal => goal.currentAmount >= goal.targetAmount)
}
