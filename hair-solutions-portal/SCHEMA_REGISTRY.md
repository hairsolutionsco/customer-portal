# Schema registry (Portal 2.0)

Fill this in **after** the **target HubSpot portal** is configured (sandbox recommended when available; otherwise production with care — see `HANDOFF_PROMPT.md`). **A5/A6 GraphQL** must match **your** portal’s GraphQL explorer (association aliases differ per account).

## Entitlements snapshot (verify in-product)

| Capability | Typical Professional stack | Notes |
|------------|---------------------------|--------|
| **Membership + private CMS pages** | Content Hub Professional | GraphQL reads scoped to logged-in **contact**. |
| **Private-page CRM types (per HubSpot CMS docs)** | contact, company, deal, ticket, quote, line_item | Official “CRM objects in CMS pages” table; **does not list `order` or `invoices`**. |
| **Custom objects in CMS** | Content Hub **Enterprise** (per docs) | **Do not rely on this** for Portal 2.0 go-live. |
| **Native Commerce `order` object** | Commerce / orders feature on account | CRM API: orders exist; **CMS GraphQL exposure** must be **introspected**. |
| **Native `invoices` object** | Commerce / invoicing on account | Native CRM object + API; **confirm** your SKU includes invoicing; **CMS GraphQL** same caveat as orders. |
| **Service Hub** | Service Professional | **Tickets** on private pages — useful for support + timeline patterns. |

**Automation rule:** Anything not queryable on membership GraphQL → sync via workflow to **Contact** (preferred), **Deal**, or **Company** properties the portal *can* read.

---

## System of record (authoritative)

| Domain | Where it lives | Portal read path |
|--------|----------------|------------------|
| Hair measurements + profile | **Contact properties** | `CRM.contact` GraphQL / HubL |
| Saved customization templates | **Contact properties** (one preset per property set, or JSON in a long text field if needed) | `CRM.contact` |
| Orders (this theme) | **Deals** associated to contact | GraphQL: `deal_collection__contact_to_deal` aliased as `p_order_collection__primary` in `*.graphql` — **confirm name in explorer** |
| Invoices (this theme) | **`portal_invoices_json`** on contact | Workflow/automation mirrors rows; native `invoices` in GraphQL when available |
| Order timeline / history | Order properties, **Deal** stage history, **Tickets**, or **Notes** | Prefer objects listed for private pages |
| Catalog (plans, locations, products) | **HubDB** | HubDB GraphQL |

---

## Registry table (fill with live IDs / names)

| Artifact | HubSpot ID / name | Notes |
|----------|-------------------|--------|
| Contact `portal_hair_profile_json` | `portal` group | JSON object; same keys as `schemas/hair_profile.json` · create via `npm run portal:hubspot-props` |
| Contact `portal_saved_templates_json` | `portal` group | JSON **array** of template objects |
| Contact `portal_invoices_json` | `portal` group | JSON **array** of `{ invoice_number, issue_date, total, currency, status, pdf_url }` |
| Native object **orders** | `order` / FQN from schema API | Associations to **contact** |
| Native object **invoices** | `invoices` | Associations to **contact** |
| Optional **Deal** pipeline for portal order mirror | *(pipeline ID)* | If GraphQL cannot read `order` directly |
| HubDB `subscription_plans` | *(table ID)* | Create + seed via API: `npm run portal:hubdb-sync` (private app needs **hubdb** scope) |
| HubDB `affiliated_locations` | *(table ID)* | same |
| HubDB `products` | *(table ID)* | same |
| Optional custom objects (`schemas/*.json`) | *(only if created)* | **Not required** for theme upload |

---

## GraphQL association aliases (verify in explorer)

Paste **real** names from your portal after introspection. Examples only — yours will differ:

| Relationship | Example pattern (verify) |
|--------------|--------------------------|
| Contact → Company | `company_collection__primary` |
| Contact → Deals | `deal_collection__contact_to_deal` (verify) |
| Contact → Tickets | ticket association collection name |
| Contact → Orders | **only if** `order` appears in membership GraphQL schema |
| Contact → Invoices | **only if** invoice type appears in membership GraphQL |
| Order detail page variables | `request.contact` + slug / deal id / mirrored property |

---

## Contact properties (billing, notifications, portal — issue #11)

Create via **Settings → Properties → Contact**, CRM Properties API, or:

`npm run portal:hubspot-props` (requires `HUBSPOT_SERVICE_KEY` or `HUBSPOT_PRIVATE_APP_ACCESS_TOKEN` — scope **crm.schemas.contacts.write**).

**Group: subscription_plan** — `current_plan`, `plan_price`, `billing_interval`, `period_start`, `period_end`, `plan_status`

**Group: notification_preferences** — `notify_order_updates`, `notify_production_reminders`, `notify_marketing`

**Group: portal** — `is_portal_customer` (booleancheckbox)

Add additional groups/properties for **hair profile** and **template** fields per `AGENT_PROMPT.md` §1 field lists; keep **internal names** stable for GraphQL and forms.
