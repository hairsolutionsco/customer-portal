/**
 * HubSpot Integration Module
 *
 * Connects to the Hair Solutions HubSpot portal (ID: 50966981) via the
 * custom app "integrations" private access token.
 *
 * Architecture: The native HubSpot Order object is the single data source
 * per customer. Orders already contain shipping, billing, fulfillment,
 * payment, and hair system properties. A HubSpot workflow copies additional
 * fields from Contact, Deal, and Ticket objects onto Order custom properties
 * so the portal agent only needs one API call per customer.
 *
 * Existing Order properties (already in HubSpot):
 *   - Core: hs_order_name, hs_total_price, hs_fulfillment_status, etc.
 *   - Hair system: order_hair_color, order_hair_density, order_hair_system_type, etc.
 *   - Production: est_production_start, est_completion_date, order_status_client
 *   - Shipping: hs_shipping_address_*, tracking_number_client
 *   - Payment: hs_payment_status, payment_date, payment_due
 *   - Internal: paired_po_number, order_margin, order_profile
 */

// ---------------------------------------------------------------------------
// Types matching actual HubSpot Order properties
// ---------------------------------------------------------------------------

export interface HubSpotContact {
  id: string
  firstname: string | null
  lastname: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  lifecyclestage: string | null
  company: string | null
  jobtitle: string | null
}

export interface HubSpotOrder {
  // Core
  hs_object_id: string
  hs_order_name: string | null
  hs_external_order_id: string | null
  hs_createdate: string | null
  hs_fulfillment_status: string | null
  hs_payment_status: string | null
  hs_total_price: string | null
  hs_subtotal_price: string | null
  hs_tax: string | null
  hs_shipping_cost: string | null
  hs_currency_code: string | null

  // Custom order fields
  order_number_custom: string | null
  order_date: string | null
  order_date_custom: string | null
  order_status: string | null
  order_status_client: string | null
  order_profile: string | null
  order_unit_count: string | null

  // Hair system configuration
  order_hair_color: string | null
  order_hair_density: string | null
  order_hair_length: string | null
  order_hair_system_type: string | null
  order_base_size: string | null

  // Production & shipping dates
  est_production_start: string | null
  est_completion_date: string | null
  est_ship_date: string | null
  est_delivery_date: string | null
  actual_ship_date: string | null
  actual_delivery_date: string | null

  // Shipping address
  hs_shipping_address_name: string | null
  hs_shipping_address_street: string | null
  hs_shipping_address_city: string | null
  hs_shipping_address_state: string | null
  hs_shipping_address_postal_code: string | null
  hs_shipping_address_country: string | null
  hs_shipping_tracking_number: string | null
  tracking_number_client: string | null

  // Billing
  hs_billing_address_name: string | null
  hs_billing_address_email: string | null
  hs_billing_address_phone: string | null

  // Payment
  payment_date: string | null
  payment_date_custom: string | null
  payment_due: string | null

  // PO linkage
  paired_po_number: string | null
  po_number: string | null

  // Internal
  order_margin: string | null
  order_margin_pct: string | null
  hs_order_note: string | null
  hs_pipeline_stage: string | null
}

export interface HubSpotDeal {
  id: string
  dealname: string | null
  dealstage: string | null
  amount: string | null
  pipeline: string | null
  closedate: string | null
}

// ---------------------------------------------------------------------------
// Property lists for API calls
// ---------------------------------------------------------------------------

export const CONTACT_PROPERTIES = [
  'firstname', 'lastname', 'email', 'phone',
  'address', 'city', 'state', 'zip', 'country',
  'lifecyclestage', 'company', 'jobtitle',
  'hs_lead_status',
]

export const ORDER_PROPERTIES = [
  'hs_order_name', 'hs_external_order_id', 'hs_createdate',
  'hs_fulfillment_status', 'hs_payment_status',
  'hs_total_price', 'hs_subtotal_price', 'hs_tax', 'hs_shipping_cost', 'hs_currency_code',
  'order_number_custom', 'order_date', 'order_date_custom',
  'order_status', 'order_status_client', 'order_profile', 'order_unit_count',
  'order_hair_color', 'order_hair_density', 'order_hair_length',
  'order_hair_system_type', 'order_base_size',
  'est_production_start', 'est_completion_date', 'est_ship_date', 'est_delivery_date',
  'actual_ship_date', 'actual_delivery_date',
  'hs_shipping_address_name', 'hs_shipping_address_street',
  'hs_shipping_address_city', 'hs_shipping_address_state',
  'hs_shipping_address_postal_code', 'hs_shipping_address_country',
  'hs_shipping_tracking_number', 'tracking_number_client',
  'hs_billing_address_name', 'hs_billing_address_email', 'hs_billing_address_phone',
  'payment_date', 'payment_date_custom', 'payment_due',
  'paired_po_number', 'po_number',
  'order_margin', 'order_margin_pct', 'hs_order_note', 'hs_pipeline_stage',
]

// ---------------------------------------------------------------------------
// HubSpot API client
// ---------------------------------------------------------------------------

const HUBSPOT_API_BASE = 'https://api.hubapi.com'

class HubSpotClient {
  private accessToken: string
  readonly portalId: string

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
   * Find a contact by email.
   */
  async getContactByEmail(email: string): Promise<(HubSpotContact & { id: string }) | null> {
    if (!this.isConfigured) return null

    try {
      const result = await this.fetch<{
        results: Array<{ id: string; properties: Record<string, string | null> }>
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
          properties: CONTACT_PROPERTIES,
          limit: 1,
        }),
      })

      if (!result.results.length) return null

      const c = result.results[0]
      return { id: c.id, ...c.properties } as HubSpotContact & { id: string }
    } catch (error) {
      console.error('[HubSpot] Error finding contact:', error)
      return null
    }
  }

  /**
   * Get all orders associated with a contact.
   */
  async getOrdersForContact(contactId: string): Promise<HubSpotOrder[]> {
    if (!this.isConfigured) return []

    try {
      const associations = await this.fetch<{
        results: Array<{ toObjectId: number }>
      }>(`/crm/v4/objects/contacts/${contactId}/associations/orders`)

      if (!associations.results.length) return []

      const orderIds = associations.results.map((a) => String(a.toObjectId))

      const ordersResult = await this.fetch<{
        results: Array<{ id: string; properties: Record<string, string | null> }>
      }>('/crm/v3/objects/orders/batch/read', {
        method: 'POST',
        body: JSON.stringify({
          inputs: orderIds.map((id) => ({ id })),
          properties: ORDER_PROPERTIES,
        }),
      })

      return ordersResult.results.map((r) => ({
        ...r.properties,
        hs_object_id: r.id,
      })) as unknown as HubSpotOrder[]
    } catch (error) {
      console.error('[HubSpot] Error fetching orders:', error)
      return []
    }
  }

  /**
   * Get all orders for a contact by email (convenience).
   */
  async getOrdersByContactEmail(email: string): Promise<HubSpotOrder[]> {
    const contact = await this.getContactByEmail(email)
    if (!contact) return []
    return this.getOrdersForContact(contact.id)
  }

  /**
   * Get a single order by ID with all properties.
   */
  async getOrder(orderId: string): Promise<HubSpotOrder | null> {
    if (!this.isConfigured) return null

    try {
      const result = await this.fetch<{
        id: string
        properties: Record<string, string | null>
      }>(`/crm/v3/objects/orders/${orderId}?properties=${ORDER_PROPERTIES.join(',')}`)

      return {
        ...result.properties,
        hs_object_id: result.id,
      } as unknown as HubSpotOrder
    } catch (error) {
      console.error('[HubSpot] Error fetching order:', error)
      return null
    }
  }

  /**
   * Get deals for a contact.
   */
  async getDealsForContact(contactId: string): Promise<HubSpotDeal[]> {
    if (!this.isConfigured) return []

    try {
      const associations = await this.fetch<{
        results: Array<{ toObjectId: number }>
      }>(`/crm/v4/objects/contacts/${contactId}/associations/deals`)

      if (!associations.results.length) return []

      const dealIds = associations.results.map((a) => String(a.toObjectId))

      const result = await this.fetch<{
        results: Array<{ id: string; properties: Record<string, string | null> }>
      }>('/crm/v3/objects/deals/batch/read', {
        method: 'POST',
        body: JSON.stringify({
          inputs: dealIds.map((id) => ({ id })),
          properties: ['dealname', 'dealstage', 'amount', 'pipeline', 'closedate'],
        }),
      })

      return result.results.map((r) => ({
        id: r.id,
        ...r.properties,
      })) as unknown as HubSpotDeal[]
    } catch (error) {
      console.error('[HubSpot] Error fetching deals:', error)
      return []
    }
  }
}

export const hubspot = new HubSpotClient()
