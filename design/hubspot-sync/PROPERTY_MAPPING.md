# HubSpot Fetched Properties Strategy

> Portal ID: **50966981** | Custom App: **integrations** (App ID: 30675447)

## Architecture

A HubSpot **workflow** copies key fields from Contact, Deal, and Ticket objects
onto the native **Order** object. The portal reads Order properties only, so the
agent needs **one API call** per customer instead of querying 4–5 separate objects.

```
┌──────────┐    workflow     ┌─────────────────────┐
│ Contact   │───────────────▸│                     │
├──────────┤    workflow     │   Order Object       │
│ Deal      │───────────────▸│   (native HubSpot)   │
├──────────┤    workflow     │                     │
│ Ticket    │───────────────▸│  existing + portal_*  │
└──────────┘                 └─────────────────────┘
                                      │
                                      ▼
                             ┌─────────────────────┐
                             │  Customer Portal     │
                             │  (reads Order only)  │
                             └─────────────────────┘
```

## Processing Time

| Trigger | Latency | Notes |
|---------|---------|-------|
| Contact property change | ~1–5 min | Workflow enrollment + execution |
| Deal stage change | ~1–5 min | Same |
| Ticket created/updated | ~1–5 min | Same |
| Order created (Shopify sync) | Instant | Native fields populated on import |

---

## 1. Properties That ALREADY EXIST on the Order Object

These are already in HubSpot and populated from Shopify or manual entry. **No creation needed.**

### Core Order Fields (native)

| Property | Type | Label | Sample Value |
|----------|------|-------|--------------|
| `hs_order_name` | string | Name | OH-1233, #1156 |
| `hs_external_order_id` | string | Order ID | 5121992261793 (Shopify ID) |
| `hs_total_price` | number | Total Price | 530 |
| `hs_subtotal_price` | number | Subtotal Price | 495 |
| `hs_tax` | number | Tax Price | 0 |
| `hs_shipping_cost` | number | Shipping Cost | 35 |
| `hs_currency_code` | enum | Currency Code | USD |
| `hs_fulfillment_status` | string | Fulfillment Status | Fulfilled |
| `hs_payment_status` | string | Payment Status | Paid |
| `hs_order_note` | string | Notes | |
| `hs_pipeline_stage` | enum | Stage | |

### Shipping Address (native)

| Property | Type | Label |
|----------|------|-------|
| `hs_shipping_address_name` | string | Shipping Address Customer Name |
| `hs_shipping_address_street` | string | Shipping Street |
| `hs_shipping_address_city` | string | Shipping City |
| `hs_shipping_address_state` | string | Shipping State |
| `hs_shipping_address_postal_code` | string | Shipping ZIP/Postal Code |
| `hs_shipping_address_country` | string | Shipping Country |
| `hs_shipping_tracking_number` | string | Shipping Tracking Number |

### Billing Address (native)

| Property | Type | Label |
|----------|------|-------|
| `hs_billing_address_name` | string | Billing Address Customer Name |
| `hs_billing_address_email` | string | Billing Email |
| `hs_billing_address_phone` | string | Billing Phone Number |

### Hair System Config (custom, already created)

| Property | Type | Label | Options |
|----------|------|-------|---------|
| `order_hair_color` | string | Hair Color | free text |
| `order_hair_density` | enum/select | Hair Density | 80, 90, 100, 110, 120 |
| `order_hair_length` | string | Hair Length | free text |
| `order_hair_system_type` | enum/select | Hair System Type | lace, skin, mono, hybrid, silk |
| `order_base_size` | string | Base Size | free text |

### Production & Delivery Dates (custom, already created)

| Property | Type | Label |
|----------|------|-------|
| `est_production_start` | date | Est. Production Start |
| `est_completion_date` | date | Est. Completion Date |
| `est_ship_date` | date | Est. Ship Date |
| `est_delivery_date` | date | Est. Delivery Date |
| `actual_ship_date` | date | Actual Ship Date |
| `actual_delivery_date` | date | Actual Delivery Date |

### Order Status & Payment (custom, already created)

| Property | Type | Label | Options |
|----------|------|-------|---------|
| `order_status` | string | Order Status | free text (internal) |
| `order_status_client` | enum/select | Order Status (Client) | confirmed, in_production, quality_check, shipping, delivered |
| `order_date` | date | Order Date | |
| `order_date_custom` | string | Order Date | text fallback |
| `payment_date` | date | Payment Date | |
| `payment_date_custom` | string | Payment Date | text fallback |
| `payment_due` | string | Payment Due | |
| `order_number_custom` | string | Order Number | |
| `order_profile` | string | Order Profile | e.g. "Plan", "Shipment" |
| `order_unit_count` | number | Unit Count | |

### PO Linkage (custom, already created)

| Property | Type | Label |
|----------|------|-------|
| `paired_po_id` | string | Paired PO Record ID |
| `paired_po_number` | string | Paired PO Number |
| `po_number` | string | PO Number |
| `tracking_number_client` | string | Tracking Number (Client) |

### Internal (custom, already created)

| Property | Type | Label |
|----------|------|-------|
| `order_margin` | number | Order Margin |
| `order_margin_pct` | number | Order Margin % |

---

## 2. Properties That NEED TO BE CREATED on the Order Object

These are **new** `portal_*` properties that will be populated by workflows copying
data from Contact, Deal, and Ticket. Group: **"Customer Portal"**.

### From Contact → Order (workflow-synced)

| Property to Create | Type | Field Type | Source (Contact property) | Why |
|--------------------|------|------------|--------------------------|-----|
| `portal_contact_email` | string | text | `email` | Match order to portal login |
| `portal_contact_phone` | string | text | `phone` | Display on order |
| `portal_contact_plan` | string | text | `contact_profile` or manual | Subscription plan name |
| `portal_contact_hair_system_type` | string | text | `hair_system_type` | Default system preference |
| `portal_contact_hair_color` | string | text | `hair_color` | Default color preference |
| `portal_contact_hair_density` | string | text | `hair_density` | Default density preference |
| `portal_contact_hair_length` | string | text | `hair_length` | Default length preference |
| `portal_contact_base_size` | string | text | `hair_base_size` | Default base size |

### From Deal → Order (workflow-synced)

| Property to Create | Type | Field Type | Source (Deal property) | Why |
|--------------------|------|------------|------------------------|-----|
| `portal_deal_name` | string | text | `dealname` | Show deal context on order |
| `portal_deal_stage` | string | text | `dealstage` (label) | Pipeline progress |
| `portal_deal_amount` | number | number | `amount` | Total deal value |
| `portal_deal_type` | string | text | `order_type` | single_unit, plan, repair, etc. |
| `portal_deal_plan_units` | string | text | `plan_units` | 3, 4, or 6 |
| `portal_deal_units_delivered` | number | number | `units_delivered` | Track fulfillment |
| `portal_deal_next_unit_date` | date | date | `next_unit_date` | Next delivery ETA |

### From Ticket → Order (workflow-synced)

| Property to Create | Type | Field Type | Source (Ticket property) | Why |
|--------------------|------|------------|--------------------------|-----|
| `portal_ticket_id` | string | text | `hs_ticket_id` | Link to ticket |
| `portal_ticket_subject` | string | text | `subject` | Show in support section |
| `portal_ticket_status` | string | text | `hs_pipeline_stage` (label) | OPEN/IN_PROGRESS/CLOSED |
| `portal_ticket_priority` | string | text | `hs_ticket_priority` | LOW/MEDIUM/HIGH/URGENT |
| `portal_ticket_category` | string | text | `hs_ticket_category` | Product issue, Billing, etc. |
| `portal_ticket_description` | string | textarea | `content` | Ticket body preview |

### Production Tracking (new, set by internal ops)

| Property to Create | Type | Field Type | Options | Why |
|--------------------|------|------------|---------|-----|
| `portal_production_stage` | enum | select | AWAITING_CONFIRMATION, MATERIALS_PREP, BASE_CONSTRUCTION, HAIR_VENTILATION, STYLING, QUALITY_INSPECTION, PACKAGING, COMPLETED | Detailed production progress |
| `portal_production_confirmed` | bool | booleancheckbox | true/false | Customer confirmed customization |

### Invoice (new, set by Stripe webhook or manual)

| Property to Create | Type | Field Type | Why |
|--------------------|------|------------|-----|
| `portal_invoice_number` | string | text | e.g. "INV-2024-0001" |
| `portal_invoice_status` | enum | select | PENDING, PAID, OVERDUE, CANCELLED |
| `portal_invoice_amount` | number | number | Total billed |
| `portal_invoice_paid_date` | date | date | When paid |

---

## 3. Properties on Contact That ALREADY EXIST

These are already on the Contact object and need no creation.

| Property | Type | Label | Notes |
|----------|------|-------|-------|
| `hair_system_type` | enum | Hair System Type | lace, skin, mono, hybrid, silk |
| `hair_color` | string | Hair Color | |
| `hair_density` | enum | Hair Density | 80–120+ |
| `hair_length` | string | Hair Length | |
| `hair_base_size` | string | Base Size | |
| `hair_curl_pattern` | enum | Curl / Wave Pattern | |
| `hair_grey_percentage` | string | Grey Hair Percentage | |
| `hair_origin` | enum | Hair Origin | |
| `portal_access_enabled` | enum | Portal Access Enabled | |
| `portal_password_hash` | string | Portal Password Hash | |
| `portal_role` | enum | Portal Role | |
| `contact_profile` | enum | Contact Profile | |
| `customer_profile` | enum | customer_profile | |

---

## 4. Workflow Definitions

### Workflow 1: Contact → Order Sync

**Name:** `Portal: Sync Contact → Order`
**Object:** Contact-based
**Trigger:** Contact property changes on: `email`, `phone`, `hair_system_type`, `hair_color`, `hair_density`, `hair_length`, `hair_base_size`, `contact_profile`
**Actions:**
1. For each associated Order (via Contact → Order association):
   - Copy `email` → `portal_contact_email`
   - Copy `phone` → `portal_contact_phone`
   - Copy `contact_profile` label → `portal_contact_plan`
   - Copy `hair_system_type` label → `portal_contact_hair_system_type`
   - Copy `hair_color` → `portal_contact_hair_color`
   - Copy `hair_density` label → `portal_contact_hair_density`
   - Copy `hair_length` → `portal_contact_hair_length`
   - Copy `hair_base_size` → `portal_contact_base_size`

### Workflow 2: Deal → Order Sync

**Name:** `Portal: Sync Deal → Order`
**Object:** Deal-based
**Trigger:** Deal property changes on: `dealstage`, `amount`, `order_type`, `plan_units`, `units_delivered`, `next_unit_date`
**Actions:**
1. For each associated Order (via Deal → Order association):
   - Copy `dealname` → `portal_deal_name`
   - Copy `dealstage` label → `portal_deal_stage`
   - Copy `amount` → `portal_deal_amount`
   - Copy `order_type` label → `portal_deal_type`
   - Copy `plan_units` → `portal_deal_plan_units`
   - Copy `units_delivered` → `portal_deal_units_delivered`
   - Copy `next_unit_date` → `portal_deal_next_unit_date`

### Workflow 3: Ticket → Order Sync

**Name:** `Portal: Sync Ticket → Order`
**Object:** Ticket-based
**Trigger:** Ticket created OR ticket property changes on: `hs_pipeline_stage`, `hs_ticket_priority`, `hs_ticket_category`
**Actions:**
1. For each associated Order (via Ticket → Order association):
   - Copy `hs_ticket_id` → `portal_ticket_id`
   - Copy `subject` → `portal_ticket_subject`
   - Copy `hs_pipeline_stage` label → `portal_ticket_status`
   - Copy `hs_ticket_priority` label → `portal_ticket_priority`
   - Copy `hs_ticket_category` label → `portal_ticket_category`
   - Copy `content` (truncated to 500 chars) → `portal_ticket_description`

### Workflow 4: Order Status Notification

**Name:** `Portal: Order Status Change Notification`
**Object:** Order-based
**Trigger:** Order property `order_status_client` changes
**Actions:**
1. If value is `shipping`:
   - Send "Your order is shipping!" email to associated Contact
2. If value is `delivered`:
   - Send "Your order has been delivered" email to associated Contact
3. (Optional) Create internal task for ops team if `quality_check`

---

## 5. What the Customer Sees (Portal Page → Data Source)

| Portal Page | Data Source | Fields Displayed |
|-------------|------------|-----------------|
| **Dashboard** | Order (most recent 5) | Order name, total, status, production dates |
| **Orders** | Order | Name, status (`order_status_client`), total, dates, tracking |
| **Order Detail** | Single Order | All: hair config, production stage, shipping, invoice, PO |
| **Invoices** | Order (`portal_invoice_*`) | Number, status, amount, paid date |
| **Billing** | Contact + Order | Plan from `portal_contact_plan`, deal info |
| **Support** | Order (`portal_ticket_*`) | Ticket ID, subject, status, priority, description |
| **Profile** | Contact (CMS tokens) | Name, email, phone, address |
| **Hair Profile** | Contact | `hair_*` properties (system type, color, density, etc.) |
| **Customization** | Order (hair config fields) | Templates from past order configs |
| **Settings** | Contact | Portal access, role |

---

## 6. Total Properties to Create

| Object | Count | Group |
|--------|-------|-------|
| Order (new `portal_*`) | **25** | Customer Portal |
| Contact | **0** (all exist) | — |
| Deal | **0** (all exist) | — |
