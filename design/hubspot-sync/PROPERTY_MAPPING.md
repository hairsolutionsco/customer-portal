# HubSpot Property Sync — Source → Target Mapping

## Architecture

A HubSpot **workflow** copies key fields from Contact, Deal, Ticket, and Line Item
objects onto the native **Order** object as custom `portal_*` properties. This
denormalization means the customer portal agent only needs **one API call** (fetch
orders for a contact) instead of querying 4–5 separate objects.

```
┌──────────┐    workflow     ┌─────────────────────┐
│ Contact   │───────────────▸│                     │
├──────────┤    workflow     │   Order Object       │
│ Deal      │───────────────▸│   (native HubSpot)   │
├──────────┤    workflow     │                     │
│ Ticket    │───────────────▸│   portal_* properties │
├──────────┤    workflow     │                     │
│ Line Item │───────────────▸│                     │
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
| Contact property change | ~1–5 min | HubSpot workflow enrollment + execution |
| Deal stage change | ~1–5 min | Same workflow latency |
| Ticket created/updated | ~1–5 min | Same workflow latency |
| Line item change | ~1–5 min | Triggered by associated deal update |
| Order created (e-commerce) | Instant | Native order fields are already there |

**For real-time needs:** Use HubSpot webhook subscriptions to push updates to
the Workers API, which can invalidate a cache or push to the portal DB.

---

## Property Mapping Tables

### 1. Contact → Order (prefix: `portal_contact_`)

These are copied whenever the associated contact is updated.

| Source (Contact) | Target (Order) | Type | Why |
|-----------------|----------------|------|-----|
| `firstname` + ` ` + `lastname` | `portal_contact_name` | Text | Display customer name on order |
| `email` | `portal_contact_email` | Text | Match order to portal login |
| `phone` | `portal_contact_phone` | Text | Show on order/shipping details |
| `address` | `portal_contact_shipping_address` | Text | Shipping display |
| `city` | `portal_contact_shipping_city` | Text | Shipping display |
| `state` | `portal_contact_shipping_state` | Text | Shipping display |
| `zip` | `portal_contact_shipping_zip` | Text | Shipping display |
| `portal_subscription_plan` *(custom)* | `portal_contact_plan_name` | Text | Show plan on dashboard |

### 2. Deal → Order (prefix: `portal_deal_`)

Copied when the associated deal changes stage or amount.

| Source (Deal) | Target (Order) | Type | Why |
|--------------|----------------|------|-----|
| `dealstage` (label) | `portal_deal_stage` | Text | Map to production status |
| `closedate` | `portal_deal_close_date` | Date | Estimated completion |
| `amount` | `portal_deal_amount` | Number | Deal value for billing |
| `pipeline` (label) | `portal_deal_pipeline` | Text | Distinguish hair system vs maintenance |

### 3. Hair System Config → Order (prefix: `portal_system_`)

Custom properties on the Deal or Line Item, copied to Order.

| Source (Deal custom) | Target (Order) | Type | Why |
|---------------------|----------------|------|-----|
| `hair_system_base_type` | `portal_system_base_type` | Text | e.g. "Swiss Lace", "Mono" |
| `hair_system_color` | `portal_system_hair_color` | Text | e.g. "Dark Brown (#3)" |
| `hair_system_density` | `portal_system_density` | Text | e.g. "Medium", "Heavy" |
| `hair_system_length` | `portal_system_hair_length` | Text | e.g. "6 inches" |
| `hair_system_style` | `portal_system_style` | Text | e.g. "Natural Wave" |
| `hair_system_attachment` | `portal_system_attachment_method` | Text | e.g. "Tape", "Glue" |

### 4. Ticket → Order (prefix: `portal_ticket_`)

Copied when a ticket associated with the order is created or updated.

| Source (Ticket) | Target (Order) | Type | Why |
|----------------|----------------|------|-----|
| `hs_object_id` | `portal_ticket_id` | Text | Link to ticket |
| `subject` | `portal_ticket_subject` | Text | Show in support section |
| `hs_pipeline_stage` (label) | `portal_ticket_status` | Text | OPEN / IN_PROGRESS / CLOSED |
| `hs_ticket_priority` | `portal_ticket_priority` | Text | LOW / MEDIUM / HIGH / URGENT |
| *(latest note body)* | `portal_ticket_last_message` | Text | Preview in portal |

### 5. Production Tracking → Order (prefix: `portal_production_`)

Custom properties on the Order itself (set by internal ops or automation).

| Property | Type | Values | Why |
|----------|------|--------|-----|
| `portal_production_stage` | Dropdown | AWAITING_CONFIRMATION, MATERIALS_PREPARATION, BASE_CONSTRUCTION, HAIR_VENTILATION, STYLING, QUALITY_INSPECTION, PACKAGING, COMPLETED | Production progress |
| `portal_production_scheduled_date` | Date | | When production starts |
| `portal_production_estimated_completion` | Date | | ETA for customer |
| `portal_production_confirmed` | Boolean | true/false | Customer confirmed config |

### 6. Invoice → Order (prefix: `portal_invoice_`)

Synced from Stripe or manual invoicing, written to Order.

| Property | Type | Why |
|----------|------|-----|
| `portal_invoice_number` | Text | e.g. "INV-2024-0001" |
| `portal_invoice_status` | Dropdown | PENDING, PAID, OVERDUE, CANCELLED |
| `portal_invoice_amount` | Number | Total billed |
| `portal_invoice_paid_date` | Date | When payment was received |

---

## What the Customer Sees (Portal Pages)

| Portal Page | Data Source | Fields Displayed |
|-------------|------------|-----------------|
| **Dashboard** | Orders + Contact | Welcome name, order count, active orders, plan name, next production date |
| **Orders** | Orders | Order number, product name (from system config), status, date, total |
| **Order Detail** | Single Order | Full system config, production stage, status history, shipping info, invoice |
| **Invoices** | Orders | Invoice number, linked order, date, status, amount |
| **Billing** | Contact + Plans | Current plan, plan options, payment methods |
| **Support** | Orders (ticket fields) | Ticket number, subject, status, priority, last message |
| **Profile** | Contact (via PORTAL_CONFIG) | Name, email, phone, address, plan |
| **Hair Profile** | Contact custom fields | Measurements, preferences, lifestyle |
| **Customization** | Orders (system fields) | Templates derived from past order configs |
| **Settings** | Contact | Name, email, sessions |

---

## HubSpot Custom Properties to Create

### On the Order object:

All `portal_*` properties listed above need to be created as custom properties
on the HubSpot Order object. Group them under a property group called
**"Customer Portal"**.

### On the Contact object:

| Property | Type | Notes |
|----------|------|-------|
| `portal_subscription_plan` | Text | Current plan name (set by Stripe webhook or manual) |
| `portal_profile_completed` | Boolean | Hair profile onboarding status |

### On the Deal object:

| Property | Type | Notes |
|----------|------|-------|
| `hair_system_base_type` | Text | Base material |
| `hair_system_color` | Text | Hair color |
| `hair_system_density` | Dropdown | Light / Medium / Heavy |
| `hair_system_length` | Text | Length in inches |
| `hair_system_style` | Text | Style name |
| `hair_system_attachment` | Text | Attachment method |

---

## Workflow Definitions

### Workflow 1: Contact → Order Sync
- **Trigger:** Contact property change on any of: firstname, lastname, email, phone, address, city, state, zip, portal_subscription_plan
- **Action:** For each associated Order, copy mapped properties

### Workflow 2: Deal → Order Sync
- **Trigger:** Deal property change on: dealstage, closedate, amount, pipeline, or any hair_system_* field
- **Action:** For each associated Order, copy mapped properties

### Workflow 3: Ticket → Order Sync
- **Trigger:** Ticket created or updated (stage, priority change)
- **Action:** On the associated Order, copy ticket fields

### Workflow 4: Production Stage Update
- **Trigger:** Order property `portal_production_stage` changes
- **Action:** (Optional) Send notification email to customer, update dashboard alert
