/**
 * HubSpot Integration Module
 *
 * Architecture: HubSpot workflows denormalize data from Contact, Deal, Ticket,
 * and Purchase Order objects onto the native Order object. The portal reads
 * from Order properties only, so the agent needs a single API call per customer
 * instead of querying multiple objects.
 *
 * Data flow:
 *   [Contact] ──workflow──▸ [Order] .portal_contact_*
 *   [Deal]    ──workflow──▸ [Order] .portal_deal_*
 *   [Ticket]  ──workflow──▸ [Order] .portal_ticket_*
 *   [Line Item / Purchase Order] ──workflow──▸ [Order] .portal_system_*
 *
 * The portal reads PORTAL_CONFIG.contact from HubSpot CMS personalization
 * for the logged-in member, then fetches their orders (with denormalized
 * fields) from the Workers API or HubSpot API.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HubSpotPortalContact {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  jobTitle: string
  city: string
  state: string
  address: string
  zip: string
  profileUrl: string
}

export interface HubSpotPortalOrder {
  // Core order fields (native HubSpot Order object)
  hs_order_id: string
  hs_order_name: string
  hs_external_order_id: string | null
  hs_order_date: string
  hs_fulfillment_status: string
  hs_total_price: string
  hs_currency_code: string
  hs_shipping_cost: string | null
  hs_tax: string | null

  // Denormalized from Contact → Order (via workflow)
  portal_contact_name: string
  portal_contact_email: string
  portal_contact_phone: string | null
  portal_contact_shipping_address: string | null
  portal_contact_shipping_city: string | null
  portal_contact_shipping_state: string | null
  portal_contact_shipping_zip: string | null
  portal_contact_plan_name: string | null

  // Denormalized from Deal → Order (via workflow)
  portal_deal_stage: string | null
  portal_deal_close_date: string | null
  portal_deal_amount: string | null
  portal_deal_pipeline: string | null

  // Denormalized from hair system config (custom properties on Deal or Line Item)
  portal_system_base_type: string | null
  portal_system_hair_color: string | null
  portal_system_density: string | null
  portal_system_hair_length: string | null
  portal_system_style: string | null
  portal_system_attachment_method: string | null

  // Denormalized from Ticket → Order (via workflow)
  portal_ticket_id: string | null
  portal_ticket_subject: string | null
  portal_ticket_status: string | null
  portal_ticket_priority: string | null
  portal_ticket_last_message: string | null

  // Production tracking (custom properties on Order)
  portal_production_stage: string | null
  portal_production_scheduled_date: string | null
  portal_production_estimated_completion: string | null
  portal_production_confirmed: string | null

  // Invoice (denormalized from Line Item or custom)
  portal_invoice_number: string | null
  portal_invoice_status: string | null
  portal_invoice_amount: string | null
  portal_invoice_paid_date: string | null
}

// ---------------------------------------------------------------------------
// HubSpot API client
// ---------------------------------------------------------------------------

const HUBSPOT_API_BASE = 'https://api.hubapi.com'

class HubSpotClient {
  private accessToken: string
  private portalId: string

  constructor() {
    this.accessToken = process.env.HUBSPOT_ACCESS_TOKEN || ''
    this.portalId = process.env.HUBSPOT_PORTAL_ID || '50966981'

    if (!this.accessToken) {
      console.warn('⚠️ HUBSPOT_ACCESS_TOKEN not configured. HubSpot API calls will fail.')
    }
  }

  get isConfigured(): boolean {
    return !!this.accessToken
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.accessToken) {
      throw new Error('HubSpot is not configured. Set HUBSPOT_ACCESS_TOKEN in .env')
    }

    const response = await fetch(`${HUBSPOT_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HubSpot API error: ${response.status} ${error}`)
    }

    return response.json()
  }

  /**
   * Get orders for a contact by email.
   * Orders have denormalized portal_* properties from workflows.
   */
  async getOrdersByContactEmail(email: string): Promise<HubSpotPortalOrder[]> {
    if (!this.isConfigured) return []

    try {
      const contactResult = await this.fetch<{
        results: Array<{ id: string }>
      }>('/crm/v3/objects/contacts/search', {
        method: 'POST',
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: email,
            }],
          }],
          limit: 1,
        }),
      })

      if (!contactResult.results.length) return []

      const contactId = contactResult.results[0].id

      const associations = await this.fetch<{
        results: Array<{ toObjectId: number }>
      }>(`/crm/v4/objects/contacts/${contactId}/associations/orders`)

      if (!associations.results.length) return []

      const orderIds = associations.results.map((a) => String(a.toObjectId))

      const ordersResult = await this.fetch<{
        results: Array<{ id: string; properties: Record<string, string> }>
      }>('/crm/v3/objects/orders/batch/read', {
        method: 'POST',
        body: JSON.stringify({
          inputs: orderIds.map((id) => ({ id })),
          properties: PORTAL_ORDER_PROPERTIES,
        }),
      })

      return ordersResult.results.map((r) => r.properties as unknown as HubSpotPortalOrder)
    } catch (error) {
      console.error('[HubSpot] Error fetching orders:', error)
      return []
    }
  }

  /**
   * Get a single order by ID with all portal properties.
   */
  async getOrder(orderId: string): Promise<HubSpotPortalOrder | null> {
    if (!this.isConfigured) return null

    try {
      const result = await this.fetch<{
        id: string
        properties: Record<string, string>
      }>(`/crm/v3/objects/orders/${orderId}?properties=${PORTAL_ORDER_PROPERTIES.join(',')}`)

      return result.properties as unknown as HubSpotPortalOrder
    } catch (error) {
      console.error('[HubSpot] Error fetching order:', error)
      return null
    }
  }
}

export const hubspot = new HubSpotClient()

// ---------------------------------------------------------------------------
// Property list (what we read from the Order object)
// ---------------------------------------------------------------------------

export const PORTAL_ORDER_PROPERTIES = [
  // Native order fields
  'hs_order_id',
  'hs_order_name',
  'hs_external_order_id',
  'hs_order_date',
  'hs_fulfillment_status',
  'hs_total_price',
  'hs_currency_code',
  'hs_shipping_cost',
  'hs_tax',

  // Denormalized contact fields
  'portal_contact_name',
  'portal_contact_email',
  'portal_contact_phone',
  'portal_contact_shipping_address',
  'portal_contact_shipping_city',
  'portal_contact_shipping_state',
  'portal_contact_shipping_zip',
  'portal_contact_plan_name',

  // Denormalized deal fields
  'portal_deal_stage',
  'portal_deal_close_date',
  'portal_deal_amount',
  'portal_deal_pipeline',

  // Hair system configuration
  'portal_system_base_type',
  'portal_system_hair_color',
  'portal_system_density',
  'portal_system_hair_length',
  'portal_system_style',
  'portal_system_attachment_method',

  // Denormalized ticket fields
  'portal_ticket_id',
  'portal_ticket_subject',
  'portal_ticket_status',
  'portal_ticket_priority',
  'portal_ticket_last_message',

  // Production tracking
  'portal_production_stage',
  'portal_production_scheduled_date',
  'portal_production_estimated_completion',
  'portal_production_confirmed',

  // Invoice
  'portal_invoice_number',
  'portal_invoice_status',
  'portal_invoice_amount',
  'portal_invoice_paid_date',
]
