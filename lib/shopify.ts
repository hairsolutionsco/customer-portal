/**
 * Shopify Integration Module
 *
 * This module handles all interactions with the Shopify Admin API
 * for order management and product synchronization.
 *
 * TODO: Add real Shopify API credentials to .env:
 * - SHOPIFY_STORE_DOMAIN
 * - SHOPIFY_ADMIN_API_TOKEN
 */

interface ShopifyOrder {
  id: string
  order_number: string
  email: string
  created_at: string
  updated_at: string
  total_price: string
  subtotal_price: string
  total_tax: string
  financial_status: string
  fulfillment_status: string | null
  line_items: Array<{
    id: string
    title: string
    quantity: number
    price: string
  }>
  customer: {
    id: string
    email: string
    first_name: string
    last_name: string
  }
}

interface ShopifyProduct {
  id: string
  title: string
  handle: string
  body_html: string
  vendor: string
  product_type: string
  created_at: string
  updated_at: string
  published_at: string
  variants: Array<{
    id: string
    title: string
    price: string
    sku: string
    inventory_quantity: number
  }>
  images: Array<{
    id: string
    src: string
    alt: string | null
  }>
}

class ShopifyClient {
  private storeDomain: string
  private accessToken: string
  private apiVersion = '2024-01'

  constructor() {
    this.storeDomain = process.env.SHOPIFY_STORE_DOMAIN || ''
    this.accessToken = process.env.SHOPIFY_ADMIN_API_TOKEN || ''

    if (!this.storeDomain || !this.accessToken) {
      console.warn('⚠️ Shopify credentials not configured. Add to .env file.')
    }
  }

  private get baseUrl() {
    return `https://${this.storeDomain}/admin/api/${this.apiVersion}`
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.storeDomain || !this.accessToken) {
      throw new Error('Shopify is not configured. Please add credentials to .env')
    }

    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Shopify API error: ${response.status} ${error}`)
    }

    return response.json()
  }

  /**
   * Get all orders for a specific customer by email
   */
  async getCustomerOrdersByEmail(email: string): Promise<ShopifyOrder[]> {
    // TODO: Implement actual Shopify API call
    // const data = await this.fetch<{ orders: ShopifyOrder[] }>(
    //   `/orders.json?email=${encodeURIComponent(email)}&status=any`
    // )
    // return data.orders

    console.log(`[Shopify] Fetching orders for ${email} (mock)`)
    return []
  }

  /**
   * Get a specific order by ID
   */
  async getOrder(orderId: string): Promise<ShopifyOrder | null> {
    try {
      const data = await this.fetch<{ order: ShopifyOrder }>(
        `/orders/${orderId}.json`
      )
      return data.order
    } catch (error) {
      console.error('[Shopify] Error fetching order:', error)
      return null
    }
  }

  /**
   * Get products for the maintenance shop
   * Filter by product type or collection
   */
  async getMaintenanceProducts(): Promise<ShopifyProduct[]> {
    // TODO: Implement actual Shopify API call
    // const data = await this.fetch<{ products: ShopifyProduct[] }>(
    //   `/products.json?product_type=Maintenance`
    // )
    // return data.products

    console.log('[Shopify] Fetching maintenance products (mock)')
    return []
  }

  /**
   * Get all products
   */
  async getProducts(limit = 50): Promise<ShopifyProduct[]> {
    try {
      const data = await this.fetch<{ products: ShopifyProduct[] }>(
        `/products.json?limit=${limit}`
      )
      return data.products
    } catch (error) {
      console.error('[Shopify] Error fetching products:', error)
      return []
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(body: string, hmacHeader: string): boolean {
    const crypto = require('crypto')
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET || ''

    if (!secret) {
      console.warn('⚠️ SHOPIFY_WEBHOOK_SECRET not configured')
      return false
    }

    const hash = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('base64')

    return hash === hmacHeader
  }
}

export const shopify = new ShopifyClient()

/**
 * Webhook payload types
 */
export interface OrderWebhookPayload {
  id: string
  order_number: string
  email: string
  total_price: string
  created_at: string
  updated_at: string
  financial_status: string
  fulfillment_status: string | null
}

/**
 * Sync a Shopify order to our database
 */
export async function syncShopifyOrder(shopifyOrder: ShopifyOrder) {
  const { prisma } = await import('./prisma')

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: shopifyOrder.email },
  })

  if (!user) {
    console.log(`[Shopify] User not found for email: ${shopifyOrder.email}`)
    return null
  }

  // Upsert order
  const order = await prisma.order.upsert({
    where: { shopifyOrderId: shopifyOrder.id },
    update: {
      shopifyOrderNumber: shopifyOrder.order_number,
      total: parseFloat(shopifyOrder.total_price),
      subtotal: parseFloat(shopifyOrder.subtotal_price),
      tax: parseFloat(shopifyOrder.total_tax),
      // Map Shopify status to our status
      status: mapShopifyStatus(shopifyOrder.financial_status, shopifyOrder.fulfillment_status),
      updatedAt: new Date(shopifyOrder.updated_at),
    },
    create: {
      orderNumber: `HS-${shopifyOrder.order_number}`,
      shopifyOrderId: shopifyOrder.id,
      shopifyOrderNumber: shopifyOrder.order_number,
      userId: user.id,
      productName: shopifyOrder.line_items[0]?.title || 'Hair System',
      configurationSnapshot: {
        items: shopifyOrder.line_items,
      },
      total: parseFloat(shopifyOrder.total_price),
      subtotal: parseFloat(shopifyOrder.subtotal_price),
      tax: parseFloat(shopifyOrder.total_tax),
      status: mapShopifyStatus(shopifyOrder.financial_status, shopifyOrder.fulfillment_status),
    },
  })

  console.log(`[Shopify] Synced order: ${order.orderNumber}`)
  return order
}

/**
 * Map Shopify status to our order status
 */
function mapShopifyStatus(
  financialStatus: string,
  fulfillmentStatus: string | null
): 'PENDING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'SHIPPED' | 'DELIVERED' {
  if (fulfillmentStatus === 'fulfilled') return 'DELIVERED'
  if (fulfillmentStatus === 'partial') return 'SHIPPED'
  if (financialStatus === 'paid') return 'CONFIRMED'
  return 'PENDING'
}
