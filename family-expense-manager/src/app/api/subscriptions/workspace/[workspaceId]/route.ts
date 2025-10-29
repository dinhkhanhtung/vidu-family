import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscriptions'

export async function GET(
  req: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { workspaceId } = params

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      )
    }

    // Get subscription for the user (mock implementation)
    const subscription = await getUserSubscription(session.user.id as string)

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found for this workspace' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: {
          name: subscription.planType,
          features: {
            unlimitedTransactions: true,
            basicFeatures: true,
            budgeting: subscription.planType === 'GROWTH' || subscription.planType === 'BUSINESS',
            goals: subscription.planType === 'GROWTH' || subscription.planType === 'BUSINESS',
            alerts: subscription.planType === 'GROWTH' || subscription.planType === 'BUSINESS',
            export: subscription.planType === 'GROWTH' || subscription.planType === 'BUSINESS',
            bankConnect: subscription.planType === 'BUSINESS',
            taxReports: subscription.planType === 'BUSINESS',
            api: subscription.planType === 'BUSINESS',
            advancedBudgeting: subscription.planType === 'GROWTH' || subscription.planType === 'BUSINESS',
            savingsGoals: subscription.planType === 'GROWTH' || subscription.planType === 'BUSINESS',
          },
        },
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        invoices: [],
      }
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}
