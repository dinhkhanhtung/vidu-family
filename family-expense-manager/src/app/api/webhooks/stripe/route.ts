import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent, handleWebhookEvent } from '@/lib/subscriptions'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature') as string

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Construct the webhook event
    const event = constructWebhookEvent(body, signature)

    // Handle the webhook event
    await handleWebhookEvent(event)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
