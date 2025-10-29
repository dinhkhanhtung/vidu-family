import { prisma } from './prisma'
import Stripe from 'stripe'
import { Plan, Subscription, SubscriptionStatus, InvoiceStatus } from '@prisma/client'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Plan definitions
export const PLANS = {
  FREE: {
    name: 'FREE',
    maxMembers: 6,
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
    maxMembers: 12,
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
    maxMembers: 25,
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

export type PlanType = keyof typeof PLANS

// Plan management functions
export async function createPlans() {
  for (const [planKey, planData] of Object.entries(PLANS)) {
    const planType = planKey as PlanType

    await prisma.plan.upsert({
      where: { name: planData.name },
      update: {
        maxMembers: planData.maxMembers,
        features: planData.features,
        isActive: true,
      },
      create: {
        name: planData.name,
        price: planData.name === 'FREE' ? 0 : planData.name === 'GROWTH' ? 99000 : 299000,
        currency: 'VND',
        interval: 'month',
        maxMembers: planData.maxMembers,
        features: planData.features,
        isActive: true,
      },
    })
  }
}

export async function getPlanByName(name: string): Promise<Plan | null> {
  return prisma.plan.findUnique({
    where: { name },
  })
}

export async function getAllPlans(): Promise<Plan[]> {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  })
}

// Subscription management functions
export async function createSubscription(
  userId: string,
  workspaceId: string,
  planName: string,
  stripeCustomerId?: string
): Promise<any> {
  const plan = await getPlanByName(planName)
  if (!plan) {
    throw new Error(`Plan ${planName} not found`)
  }

  // Check if workspace already has a subscription
  const existingSubscription = await prisma.subscription.findFirst({
    where: { workspaceId },
  })

  if (existingSubscription) {
    throw new Error('Workspace already has a subscription')
  }

  return prisma.subscription.create({
    data: {
      userId,
      workspaceId,
      planId: plan.id,
      stripeCustomerId,
      status: SubscriptionStatus.TRIALING,
    },
    include: {
      plan: true,
      user: true,
      workspace: true,
      invoices: {
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
          invoicePdf: true,
        },
      },
    },
  })
}

export async function getSubscriptionByWorkspace(workspaceId: string): Promise<any> {
  return prisma.subscription.findFirst({
    where: { workspaceId },
    include: {
      plan: true,
      user: true,
      workspace: true,
      invoices: {
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
          invoicePdf: true,
        },
      },
    },
  })
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus,
  stripeSubscriptionId?: string
): Promise<any> {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status,
      stripeSubscriptionId,
    },
    include: {
      plan: true,
      user: true,
      workspace: true,
      invoices: {
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
          invoicePdf: true,
        },
      },
    },
  })
}

export async function cancelSubscription(subscriptionId: string): Promise<any> {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: SubscriptionStatus.CANCELED,
      cancelledAt: new Date(),
      cancelAtPeriodEnd: true,
    },
    include: {
      plan: true,
      user: true,
      workspace: true,
      invoices: {
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
          invoicePdf: true,
        },
      },
    },
  })
}

// Feature flag functions
export function hasFeature(subscription: any, feature: keyof typeof PLANS.FREE.features): boolean {
  if (!subscription || !subscription.plan?.features) {
    return PLANS.FREE.features[feature]
  }

  return (subscription.plan?.features as any)?.[feature] || false
}

export function getMaxMembers(subscription: any): number {
  if (!subscription) {
    return PLANS.FREE.maxMembers
  }

  return subscription.plan?.maxMembers || PLANS.FREE.maxMembers
}

export function canAddMember(subscription: any, currentMemberCount: number): boolean {
  const maxMembers = getMaxMembers(subscription)
  return currentMemberCount < maxMembers
}

// Stripe integration functions
export async function createStripeCustomer(email: string, name?: string): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    name,
  })

  return customer.id
}

export async function createStripeSubscription(
  customerId: string,
  priceId: string,
  trialDays: number = 14
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: trialDays,
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  })
}

export async function cancelStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

export async function getStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(subscriptionId)
}

// Invoice functions
export async function createInvoice(
  subscriptionId: string,
  amount: number,
  currency: string = 'USD',
  stripeInvoiceId?: string
): Promise<any> {
  return prisma.invoice.create({
    data: {
      subscriptionId,
      amount,
      currency,
      stripeInvoiceId,
      status: stripeInvoiceId ? InvoiceStatus.OPEN : InvoiceStatus.DRAFT,
    },
    include: {
      subscription: {
        include: {
          plan: true,
          user: true,
          workspace: true,
        },
      },
    },
  })
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus,
  paidAt?: Date
): Promise<any> {
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status,
      paidAt: status === InvoiceStatus.PAID ? paidAt || new Date() : null,
    },
    include: {
      subscription: {
        include: {
          plan: true,
          user: true,
          workspace: true,
        },
      },
    },
  })
}

// Webhook helper functions
export function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
  return stripe.webhooks.constructEvent(payload, signature, endpointSecret)
}

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionWebhook(event)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event)
      break
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event)
      break
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event)
      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}

async function handleSubscriptionWebhook(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as any

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status as SubscriptionStatus,
      currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
      currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    },
  })
}

async function handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: SubscriptionStatus.CANCELED,
      cancelledAt: new Date(),
      cancelAtPeriodEnd: false,
    },
  })
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as any

  if (invoice.subscription) {
    // Update invoice status
    await prisma.invoice.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: {
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
      },
    })

    // Update subscription status if it was past due
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: {
        status: SubscriptionStatus.ACTIVE,
      },
    })
  }
}

async function handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as any

  if (invoice.subscription) {
    // Update invoice status
    await prisma.invoice.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: {
        status: InvoiceStatus.OPEN,
      },
    })

    // Update subscription status
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: {
        status: SubscriptionStatus.PAST_DUE,
      },
    })
  }
}
