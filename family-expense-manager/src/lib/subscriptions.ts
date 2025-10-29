import { prisma } from './prisma'

// Mock subscription types for feature flags
export type PlanType = 'FREE' | 'GROWTH' | 'BUSINESS'

// Feature definitions
export const FEATURES = {
  FREE: {
    name: 'FREE',
    features: {
      unlimitedTransactions: true,
      basicFeatures: true,
      budgeting: false,
      goals: false,
      alerts: false,
      export: false,
      bankConnect: false,
      taxReports: false,
      api: false,
      advancedBudgeting: false,
      savingsGoals: false,
    },
  },
  GROWTH: {
    name: 'GROWTH',
    features: {
      unlimitedTransactions: true,
      basicFeatures: true,
      budgeting: true,
      goals: true,
      alerts: true,
      export: true,
      bankConnect: false,
      taxReports: false,
      api: false,
      advancedBudgeting: true,
      savingsGoals: true,
    },
  },
  BUSINESS: {
    name: 'BUSINESS',
    features: {
      unlimitedTransactions: true,
      basicFeatures: true,
      budgeting: true,
      goals: true,
      alerts: true,
      export: true,
      bankConnect: true,
      taxReports: true,
      api: true,
      advancedBudgeting: true,
      savingsGoals: true,
    },
  },
} as const

export function hasFeature(planType: PlanType | undefined, feature: keyof typeof FEATURES.FREE.features): boolean {
  if (!planType || planType === 'FREE') {
    return FEATURES.FREE.features[feature]
  }

  const plan = FEATURES[planType]
  return plan?.features[feature] || false
}

// Mock functions for subscription-like behavior
export async function getUserPlanType(userId: string): Promise<PlanType> {
  // For now, return FREE for all users
  // In a real app, this would check the actual subscription status
  return 'FREE'
}

export async function getUserSubscription(userId: string) {
  // Mock subscription object
  return {
    id: 'mock-sub-id',
    userId,
    planType: 'FREE',
    status: 'active',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  }
}
