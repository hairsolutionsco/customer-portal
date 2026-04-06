import { NextRequest } from 'next/server'
import { verifyStripeWebhook, handleSubscriptionWebhook, handleInvoicePaidWebhook } from '@/lib/stripe'
import { successResponse, errorResponse } from '@/lib/api-response'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return errorResponse('Missing Stripe signature', 401)
    }

    // Verify webhook signature
    const event = verifyStripeWebhook(body, signature)

    console.log(`[Stripe Webhook] Received: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionWebhook(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        console.log('[Stripe] Subscription deleted:', event.data.object.id)
        // Handle subscription cancellation
        break

      case 'invoice.paid':
        await handleInvoicePaidWebhook(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        console.log('[Stripe] Payment failed:', event.data.object.id)
        // Handle payment failure (send notification, etc.)
        break

      case 'checkout.session.completed':
        console.log('[Stripe] Checkout completed:', event.data.object.id)
        // Handle successful checkout
        break

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`)
    }

    return successResponse({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error)
    return errorResponse('Webhook processing failed', 500)
  }
}
