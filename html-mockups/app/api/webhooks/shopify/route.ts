import { NextRequest } from 'next/server'
import { shopify, syncShopifyOrder, OrderWebhookPayload } from '@/lib/shopify'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256')

    if (!hmacHeader) {
      return errorResponse('Missing HMAC header', 401)
    }

    // Verify webhook signature
    const isValid = shopify.verifyWebhook(body, hmacHeader)

    if (!isValid) {
      return errorResponse('Invalid webhook signature', 401)
    }

    const payload: OrderWebhookPayload = JSON.parse(body)
    const topic = request.headers.get('X-Shopify-Topic')

    console.log(`[Shopify Webhook] Received: ${topic}`)

    // Handle different webhook topics
    switch (topic) {
      case 'orders/create':
      case 'orders/updated':
        // Sync order to our database
        await syncShopifyOrder(payload as any)
        break

      case 'orders/paid':
        console.log(`[Shopify] Order paid: ${payload.id}`)
        // Additional handling for paid orders
        break

      case 'orders/cancelled':
        console.log(`[Shopify] Order cancelled: ${payload.id}`)
        // Mark order as cancelled in our database
        break

      default:
        console.log(`[Shopify] Unhandled webhook topic: ${topic}`)
    }

    return successResponse({ received: true })
  } catch (error) {
    console.error('[Shopify Webhook] Error:', error)
    return errorResponse('Webhook processing failed', 500)
  }
}
