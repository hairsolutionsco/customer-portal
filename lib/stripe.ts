/**
 * Stripe Integration Module
 *
 * Handles payments, subscriptions, and customer management with Stripe.
 *
 * TODO: Add Stripe credentials to .env:
 * - STRIPE_SECRET_KEY
 * - STRIPE_PUBLISHABLE_KEY
 * - STRIPE_WEBHOOK_SECRET
 */

import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_SECRET_KEY is required in production')
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
      typescript: true,
    })
  : null

/**
 * Create or get Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: string, email: string, name?: string) {
  if (!stripe) throw new Error('Stripe not configured')

  const { prisma } = await import('./prisma')

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) throw new Error('User not found')

  // If user already has a Stripe customer ID, return it
  if (user.stripeCustomerId) {
    return user.stripeCustomerId
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  })

  // Save customer ID to user
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}

/**
 * Create a checkout session for a subscription
 */
export async function createSubscriptionCheckout(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) throw new Error('Stripe not configured')

  const { prisma } = await import('./prisma')

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) throw new Error('User not found')

  const customerId = await getOrCreateStripeCustomer(userId, user.email, user.name || undefined)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  })

  return session
}

/**
 * Create a checkout session for a one-time payment
 */
export async function createPaymentCheckout(
  userId: string,
  amount: number,
  currency: string,
  description: string,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) throw new Error('Stripe not configured')

  const { prisma } = await import('./prisma')

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) throw new Error('User not found')

  const customerId = await getOrCreateStripeCustomer(userId, user.email, user.name || undefined)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: description,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  })

  return session
}

/**
 * Create a portal session for managing subscriptions and payment methods
 */
export async function createPortalSession(userId: string, returnUrl: string) {
  if (!stripe) throw new Error('Stripe not configured')

  const { prisma } = await import('./prisma')

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user?.stripeCustomerId) {
    throw new Error('No Stripe customer found')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  })

  return session
}

/**
 * Get customer's payment methods
 */
export async function getCustomerPaymentMethods(userId: string) {
  if (!stripe) throw new Error('Stripe not configured')

  const { prisma } = await import('./prisma')

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user?.stripeCustomerId) {
    return []
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: user.stripeCustomerId,
    type: 'card',
  })

  return paymentMethods.data
}

/**
 * Get customer's active subscriptions
 */
export async function getCustomerSubscriptions(userId: string) {
  if (!stripe) throw new Error('Stripe not configured')

  const { prisma } = await import('./prisma')

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user?.stripeCustomerId) {
    return []
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: 'all',
  })

  return subscriptions.data
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) throw new Error('Stripe not configured')

  return stripe.subscriptions.cancel(subscriptionId)
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
) {
  if (!stripe) throw new Error('Stripe not configured')

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
  })
}

/**
 * Verify webhook signature
 */
export function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!stripe) throw new Error('Stripe not configured')

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured')
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

/**
 * Handle subscription created/updated webhook
 */
export async function handleSubscriptionWebhook(subscription: Stripe.Subscription) {
  const { prisma } = await import('./prisma')

  const userId = subscription.metadata.userId

  if (!userId) {
    console.error('[Stripe] Subscription webhook missing userId in metadata')
    return
  }

  // Get the plan from our database
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { stripePriceId: subscription.items.data[0].price.id },
  })

  if (!plan) {
    console.error('[Stripe] Plan not found for price:', subscription.items.data[0].price.id)
    return
  }

  // Upsert customer plan
  await prisma.customerPlan.upsert({
    where: { userId },
    update: {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
    },
    create: {
      userId,
      planId: plan.id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })

  console.log(`[Stripe] Subscription ${subscription.id} synced for user ${userId}`)
}

/**
 * Handle invoice paid webhook
 */
export async function handleInvoicePaidWebhook(invoice: Stripe.Invoice) {
  const { prisma } = await import('./prisma')

  const userId = invoice.metadata?.userId

  if (!userId) {
    console.log('[Stripe] Invoice webhook missing userId')
    return
  }

  // Create or update invoice in our database
  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    update: {
      status: 'PAID',
      paidAt: invoice.status_transitions.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : new Date(),
    },
    create: {
      invoiceNumber: `INV-${invoice.number || Date.now()}`,
      userId,
      stripeInvoiceId: invoice.id,
      amount: (invoice.subtotal || 0) / 100,
      tax: (invoice.tax || 0) / 100,
      total: (invoice.total || 0) / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'PAID',
      paidAt: invoice.status_transitions.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : new Date(),
      pdfUrl: invoice.invoice_pdf || undefined,
    },
  })

  console.log(`[Stripe] Invoice ${invoice.id} recorded for user ${userId}`)
}
