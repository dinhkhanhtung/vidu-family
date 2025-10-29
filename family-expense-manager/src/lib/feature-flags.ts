import { Subscription } from '@prisma/client'
import { FEATURES } from './subscriptions'

export type FeatureFlag =
  | 'unlimitedTransactions'
  | 'basicFeatures'
  | 'budgeting'
  | 'goals'
  | 'alerts'
  | 'export'
  | 'bankConnect'
  | 'taxReports'
  | 'api'
  | 'advancedBudgeting'
  | 'savingsGoals'

export class FeatureFlags {
  private subscription: any

  constructor(subscription: any) {
    this.subscription = subscription
  }

  /**
   * Check if a specific feature is available for the current subscription
   */
  hasFeature(feature: FeatureFlag): boolean {
    if (!this.subscription || !this.subscription.plan?.features) {
      // Free plan features
      return FEATURES.FREE.features[feature]
    }

    return (this.subscription.plan?.features as any)?.[feature] || false
  }

  /**
   * Get the maximum number of members allowed for the current subscription
   */
  getMaxMembers(): number {
    if (!this.subscription) {
      return 1 // Free plan max members
    }

    return this.subscription.plan?.maxMembers || 1
  }

  /**
   * Check if the user can add more members to their workspace
   */
  canAddMember(currentMemberCount: number): boolean {
    const maxMembers = this.getMaxMembers()
    return currentMemberCount < maxMembers
  }

  /**
   * Get all available features for the current subscription
   */
  getAvailableFeatures(): Record<FeatureFlag, boolean> {
    const features: Record<FeatureFlag, boolean> = {
      unlimitedTransactions: this.hasFeature('unlimitedTransactions'),
      basicFeatures: this.hasFeature('basicFeatures'),
      budgeting: this.hasFeature('budgeting'),
      goals: this.hasFeature('goals'),
      alerts: this.hasFeature('alerts'),
      export: this.hasFeature('export'),
      bankConnect: this.hasFeature('bankConnect'),
      taxReports: this.hasFeature('taxReports'),
      api: this.hasFeature('api'),
      advancedBudgeting: this.hasFeature('advancedBudgeting'),
      savingsGoals: this.hasFeature('savingsGoals'),
    }

    return features
  }

  /**
   * Check if the subscription is active and paid
   */
  isActive(): boolean {
    if (!this.subscription) {
      return false // Free plan is always "active"
    }

    return ['ACTIVE', 'TRIALING'].includes(this.subscription.status)
  }

  /**
   * Check if the subscription is in trial period
   */
  isTrial(): boolean {
    if (!this.subscription) {
      return false
    }

    return this.subscription.status === 'TRIALING'
  }

  /**
   * Get the subscription status
   */
  getStatus(): string {
    if (!this.subscription) {
      return 'FREE'
    }

    return this.subscription.status
  }

  /**
   * Get the plan name
   */
  getPlanName(): string {
    if (!this.subscription) {
      return 'FREE'
    }

    return this.subscription.plan?.name || 'FREE'
  }

  /**
   * Check if the user needs to upgrade for a specific feature
   */
  needsUpgrade(feature: FeatureFlag): boolean {
    return !this.hasFeature(feature)
  }

  /**
   * Get upgrade message for a specific feature
   */
  getUpgradeMessage(feature: FeatureFlag): string {
    const featureNames: Record<FeatureFlag, string> = {
      unlimitedTransactions: 'unlimited transactions',
      basicFeatures: 'basic features',
      budgeting: 'budgeting tools',
      goals: 'financial goals',
      alerts: 'spending alerts',
      export: 'data export',
      bankConnect: 'bank account connection',
      taxReports: 'tax reports',
      api: 'API access',
      advancedBudgeting: 'advanced budgeting',
      savingsGoals: 'savings goals',
    }

    return `Upgrade to access ${featureNames[feature]}`
  }
}

// Helper function to create feature flags instance
export function createFeatureFlags(subscription: any): FeatureFlags {
  return new FeatureFlags(subscription)
}

// React hook for using feature flags (if using React)
export function useFeatureFlags(subscription: any) {
  return new FeatureFlags(subscription)
}
