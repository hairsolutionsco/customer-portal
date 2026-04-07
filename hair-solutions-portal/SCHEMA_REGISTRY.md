# Schema registry (Portal 2.0)

Fill this in **after** objects and HubDB tables exist in your **target HubSpot portal** (sandbox recommended when available; otherwise production with care — see `HANDOFF_PROMPT.md`). A5/A6 GraphQL must match generated association names from the HubSpot GraphQL explorer.

| Artifact | HubSpot ID / name | Notes |
|----------|-------------------|--------|
| Custom object `hair_profile` | *(object type ID)* | |
| Custom object `order` | *(object type ID)* | Required before patching `order_status_history` + invoice→order association |
| Custom object `order_status_history` | *(object type ID)* | Commit `schemas/order_status_history.json` uses `associatedObjects: []` until Order exists; then recreate association to Order via API/UI and update this row |
| Custom object `customization_template` | *(object type ID)* | |
| Custom object `invoice` | *(object type ID)* | `schemas/invoice.json` ships with `CONTACT` only; add Order association after Order type ID is known |
| HubDB `subscription_plans` | *(table ID)* | |
| HubDB `affiliated_locations` | *(table ID)* | |
| HubDB `products` | *(table ID)* | |

## GraphQL association aliases (verify in explorer)

Expected patterns (names **will** differ by portal; introspect and paste real names here):

| Relationship | Placeholder name from spec |
|--------------|----------------------------|
| Contact → Hair Profile | `p_hair_profile_collection__hair_profile_to_contact` |
| Contact → Orders | `p_order_collection__order_to_contact` |
| Contact → Templates | `p_customization_template_collection__customization_template_to_contact` |
| Contact → Invoices | `p_invoice_collection__invoice_to_contact` |
| Order → Status history | `p_order_status_history_collection__order_status_history_to_order` (verify) |
| Order detail → Contact filter | `contact_collection__primary` or `contact_collection__order_to_contact` |

## Contact properties (issue #11)

Create in HubSpot via **Settings → Properties → Contact** or CRM Properties API. Names should match GraphQL:

**Group: subscription_plan** — `current_plan`, `plan_price`, `billing_interval`, `period_start`, `period_end`, `plan_status`

**Group: notification_preferences** — `notify_order_updates`, `notify_production_reminders`, `notify_marketing`

**Group: portal** — `is_portal_customer` (booleancheckbox)
