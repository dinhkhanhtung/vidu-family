import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createSubscription,
  createStripeCustomer,
  createStripeSubscription,
  getSubscriptionByWorkspace,
  PLANS
} from '@/lib/subscriptions'

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

    const { workspaceId, planName, priceId } = await req.json()

    if (!workspaceId || !planName) {
      return NextResponse.json(
        { error: 'Workspace ID and plan name are required' },
        { status: 400 }
      )
    }

    // Validate plan name
    if (!PLANS[planName as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan name' },
        { status: 400 }
      )
    }

    // Check if workspace already has a subscription
    const existingSubscription = await getSubscriptionByWorkspace(workspaceId)
    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Workspace already has a subscription' },
        { status: 400 }
      )
    }

    // Create Stripe customer if priceId is provided (paid plan)
    let stripeCustomerId: string | undefined
    if (priceId) {
      stripeCustomerId = await createStripeCustomer(
        session.user.email!,
        session.user.name || undefined
      )
    }

    // Create subscription in database
    const subscription = await createSubscription(
      userId,
      workspaceId,
      planName,
      stripeCustomerId
    )

    // Create Stripe subscription if priceId is provided
    if (priceId && stripeCustomerId) {
      try {
        const stripeSubscription = await createStripeSubscription(
          stripeCustomerId,
          priceId
        )

        // Update subscription with Stripe subscription ID
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            stripeSubscriptionId: stripeSubscription.id,
            status: stripeSubscription.status as any,
          },
        })
      } catch (stripeError) {
        console.error('Stripe subscription creation failed:', stripeError)
        // Don't fail the entire request if Stripe fails
        // The subscription is already created in the database
      }
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.planId,
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
