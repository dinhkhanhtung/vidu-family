import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserSubscription, FEATURES } from '@/lib/subscriptions'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user subscription status (mock for now)
    const subscription = await getUserSubscription(userId)
    const planType = subscription.planType as keyof typeof FEATURES

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planType: planType,
        features: FEATURES[planType].features
      }
    })
  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { planName } = await req.json()

    if (!planName) {
      return NextResponse.json(
        { error: 'Plan name is required' },
        { status: 400 }
      )
    }

    // Validate plan name
    if (!FEATURES[planName as keyof typeof FEATURES]) {
      return NextResponse.json(
        { error: 'Invalid plan name' },
        { status: 400 }
      )
    }

    // For now, just return success (in a real app, this would create a subscription)
    const subscription = await getUserSubscription(userId)
    const validPlanName = planName as keyof typeof FEATURES

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: 'active',
        planType: validPlanName,
        features: FEATURES[validPlanName].features
      }
    })
  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
