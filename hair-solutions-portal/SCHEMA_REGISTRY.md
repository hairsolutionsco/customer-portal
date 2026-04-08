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
| **CMS serverless functions** (`*.functions` under theme `src/`) | **CMS Hub Enterprise** (typical) — *not* granted on all accounts | Upload error *“does not have access to serverless functions”* means use **GraphQL + HubL + external APIs** (e.g. Hostinger Worker) until tier/sandbox allows it. Sample code: `serverless-samples/portal-api.functions/` → copy into `src/` when entitled. **Local:** HubSpot’s `@hubspot/serverless-dev-runtime` / CLI `hs function` tooling is **beta** and may require a compatible account. |
| **Sandbox vs production** | **Not strictly required** for serverless *in principle* — **subscription / test-account entitlements** matter more | A **CMS developer sandbox** or **Enterprise trial** can expose features your **production Professional** portal lacks. Use a sandbox when you want isolation; use **configurable test accounts** (HubSpot developer docs) to mimic tiers in automation. |

**Automation rule:** Anything not queryable on membership GraphQL → sync via workflow to **Contact** (preferred), **Deal**, or **Company** properties the portal *can* read.

**HubDB in this theme:** Membership GraphQL on portal **50966981** did not expose `HUBDB.table` (validator: `Field 'table' in type 'HUBDB' is undefined`). Shop / locations / plan grid use **`hubdb_table_rows(theme.hubdb.*_table_id)`** in modules; defaults are set in `src/fields.json` (update after re-sync if table IDs change).

---

## GitHub issue #7 alignment (native orders, not custom object)

Issue **[#7](https://github.com/hairsolutionsco/customer-portal/issues/7)** title/body still describe a **custom** Order object (`schemas/order.json` + `POST /crm/v3/schemas`). For Portal 2.0, **`AGENT_PROMPT.md` §1** and **`IMPLEMENTATION_PLAN_SUBAGENTS.md` north star supersede that:** orders are **native HubSpot Commerce `order`** records, associated to **contacts** in CRM — **no custom order object** is required for the theme or G1.

| Layer | What to do |
|-------|------------|
| **CRM (source of truth)** | Create/manage **native** orders (Commerce); ensure each order is **associated to the customer contact** (Commerce checkout, sync, import, or CRM associations). Use native order properties for status/shipping fields where available. |
| **CMS membership GraphQL** | HubSpot’s documented private-page CRM types include **contact, company, deal, ticket, quote, line_item** — **not** `order` / `invoices` (`AGENT_PROMPT.md` Context). **Do not assume** `order` appears in the explorer. |
| **Portal theme (today)** | Queries use **`deal_collection__contact_to_deal`** (contact → deals) with a GraphQL alias **`p_order_collection__primary`** so modules keep one stable “orders collection” name while the backing data is **deal-based mirror** for GraphQL. See `src/data-queries/dashboard.graphql`, `orders_list.graphql`, `order_detail.graphql`. |
| **Future** | If introspection shows a native **`order`** association under `CRM.contact.associations`, A5 can point the same alias (or a new field) at that collection and map real order properties; until then, **deals-as-orders** remains the supported read path. |

---

## System of record (authoritative)

| Domain | Where it lives | Portal read path |
|--------|----------------|------------------|
| Hair measurements + profile | **Contact property** `portal_hair_profile_json` (JSON object; keys per `schemas/hair_profile.json`) | `CRM.contact` GraphQL / HubL (parse JSON in modules if needed) |
| Saved customization templates | **Contact properties** (one preset per property set, or JSON in a long text field if needed) | `CRM.contact` |
| **Orders — CRM** | **Native Commerce `order`**, associated to **contact** | CRM / Orders API; ops workflows |
| **Orders — GraphQL (membership)** | **Deals** associated to contact (mirror for UI) | `associations { p_order_collection__primary: deal_collection__contact_to_deal { ... } }` — **confirm `deal_collection__contact_to_deal` in explorer** |
| Invoices (this theme) | **`portal_invoices_json`** on contact | Workflow/automation mirrors rows; native `invoices` in GraphQL when available |
| Order timeline / history | Native order fields, **deal** stage history, **tickets**, or **notes** | Prefer objects exposed on private pages |
| Catalog (plans, locations, products) | **HubDB** | HubDB GraphQL |

---

## Registry table (fill with live IDs / names)

| Artifact | HubSpot ID / name | Notes |
|----------|-------------------|--------|
| Contact `portal_hair_profile_json` | Group **`portal`** (label: Portal) | **Issue #6 (contact-property interpretation):** Hair profile is stored as one **string** property (textarea) containing a **JSON object**. **Do not** POST `hair_profile` as a CMS custom object for Portal 2.0 go-live. Create via `./scripts/op_env.sh npm run portal:hubspot-props` (or `npm run portal:hubspot-props` with token in env). |

### `portal_hair_profile_json` — JSON key contract (must match `schemas/hair_profile.json`)

| Key | JSON type | Values / notes |
|-----|-----------|----------------|
| `head_circumference` | number | |
| `front_to_nape` | number | |
| `ear_to_ear` | number | |
| `temple_to_temple` | number | |
| `preferred_style` | string | |
| `density` | string | `light` \| `medium` \| `heavy` |
| `hair_color` | string | |
| `base_type` | string | `lace` \| `skin` \| `mono` |
| `attachment_method` | string | `tape` \| `glue` \| `clips` |
| `activity_level` | string | |
| `sweating_level` | string | `low` \| `moderate` \| `high` |
| `work_environment` | string | |
| `sports_activities` | string | |
| `photo_front` | string | File URL or file id string (same for side/back/top) |
| `photo_side` | string | |
| `photo_back` | string | |
| `photo_top` | string | |
| `notes` | string | |
| `allergies` | string | |
| `onboarding_completed` | boolean | |

**Reference grouping in `schemas/hair_profile.json`:** properties use `groupName` `hair_profile_information` for documentation alignment with the old custom-object plan; on **Contact**, the live storage for the portal is the single field above in group **`portal`**.

**GraphQL:** `hair_profile.graphql` uses core contact fields until the explorer shows **`portal_hair_profile_json`** on `crm_contact` (upload validation rejects undefined fields even when the CRM property exists).

| Artifact | HubSpot ID / name | Notes |
|----------|-------------------|--------|
| Contact `portal_saved_templates_json` | `portal` group | JSON **array** of template objects |
| Contact `portal_invoices_json` | `portal` group | JSON **array** of `{ invoice_number, issue_date, total, currency, status, pdf_url }` |
| Contact `portal_billing_json` | `portal` group | **Optional until Private App has `crm.schemas.contacts.write`:** create in HubSpot or re-run `portal:hubspot-props` after rotating PAT in 1Password. |
| Native object **orders** | `order` (Commerce) — FQN / type ID via CRM schema API | **CRM:** associate order ↔ **contact** (Commerce + Associations API). **Not** a custom object. |
| Native object **invoices** | `invoices` | Associations to **contact** |
| **Deal** pipeline used for portal “order” list/detail | *(pipeline ID + stage labels)* | **GraphQL path** for orders UI; keep deal naming/stages aligned with production stages or sync from native orders via workflow |
| HubDB `subscription_plans` | **241666864** | Sync: `python3 scripts/hubspot_sync_hubdb.py` (uses HubSpot CLI OAuth from `~/.hscli/config.yml` when env token is stale). |
| HubDB `affiliated_locations` | **241636157** | same |
| HubDB `products` | **241666863** | Recreated when seed `category` type changes: `--recreate-table=products` |

### HubDB columns (repo seed = master-plan + `AGENT_PROMPT.md` §2)

Table **names** in HubSpot: `subscription_plans`, `affiliated_locations`, `products` (underscores). After a successful sync, replace the registry placeholders above with numeric **table IDs** from the script output or HubSpot → Marketing → Files & Tools → HubDB.

| Table | Columns (internal names) |
|-------|-------------------------|
| `subscription_plans` | `name`, `description`, `price`, `currency`, `interval`, `systems_per_year`, `features`, `is_active`, `display_order` |
| `affiliated_locations` | `name`, `country`, `state`, `city`, `address`, `postal_code`, `phone`, `email`, `website`, `services_offered`, `specialties`, `latitude`, `longitude`, `description`, `logo_url`, `is_featured`, `display_order` |
| `products` | `category` = **SELECT** (options: Hair Systems, Adhesives, Maintenance, Accessories); other columns as listed in `hubdb/products.json` |

**Gate G2 (HubDB):** **passing** for portal **50966981** — tables published with seed rows (2026-04-07). Token resolution: `scripts/hubspot_resolve_token.py` (env first, then HubSpot CLI OAuth).

| Optional custom objects (`schemas/*.json`) | *(only if created)* | **Not required** for theme upload |

---

## GraphQL association aliases (verify in explorer)

Paste **real** names from your portal after introspection. Examples only — yours may differ (HubSpot-generated labels).

| Label / concept | Name to verify | Notes |
|-----------------|----------------|-------|
| **Contact → Deals** (portal “orders” today) | `deal_collection__contact_to_deal` | Used in theme `*.graphql`; if upload/validation errors, open explorer and match the **exact** deals association field on `contact`. |
| **GraphQL alias only** | `p_order_collection__primary` | Not a HubSpot association ID — a **query alias** mapping the deals collection to a stable key for HubL/modules. |
| Contact → Company | e.g. `company_collection__primary` | Pattern reference |
| Contact → Tickets | *(introspect)* | For support / timeline |
| Contact → **native Orders** | *(introspect)* | **Expected absent** on many portals per CMS docs; if present, document field name here and plan query swap |
| Contact → Invoices | *(introspect)* | Same caveat as orders |
| Order detail dynamic page | `request.contact.contact_vid` + slug | Today: detail query uses same deal association + filters by slug/`hs_object_id` — see `order_detail.graphql` |

### Verification steps (GraphQL explorer)

1. In **Design Manager**, open or create a **membership (private)** page template that has access to `request.contact.contact_vid`.
2. Open the **GraphQL** tool for that theme; use a **test contact** that has (a) native **orders** linked in CRM and (b) **deals** linked for the mirror pipeline.
3. Under `CRM { contact(uniqueIdentifier: "id", uniqueIdentifierValue: "<vid>") { associations {` use autocomplete / introspection:
   - Confirm **`deal_collection__contact_to_deal`** exists and returns the mirror deals.
   - Search for any **`order`**-related collection (e.g. patterns like `*_order_*` / `*order*contact*`). If none, **membership GraphQL does not expose native orders** — keep deals-as-orders.
4. Run `dashboard` / `orders_list` queries; fix association spelling before merge if the explorer shows a different deals field name.
5. **Optional:** CRM **Associations API** (private app) — list association types between object type **order** and **contact** to document CRM-side type IDs (not printed in repo); helps automations that attach orders to contacts.

### Blockers

| Blocker | Mitigation |
|---------|------------|
| `deal_collection__contact_to_deal` missing or renamed on your account | Copy exact field name from explorer into all three queries (`dashboard`, `orders_list`, `order_detail`). |
| No deals to mirror native orders | Create a workflow or integration that creates/updates a **deal per order** (or stage) for portal display, or wait for HubSpot to expose `order` on membership GraphQL. |
| Team expects issue #7 “custom object” deliverable | Close #7 with comment pointing to this registry + native Commerce direction; optional custom object is **out of scope** for Professional CMS GraphQL. |

---

## Contact properties (billing, notifications, portal — issue #11)

Create via **Settings → Properties → Contact**, CRM Properties API, or:

`npm run portal:hubspot-props` (uses `HUBSPOT_PRIVATE_APP__CRM_SCHEMA__ACCESS_TOKEN` or `HUBSPOT_PRIVATE_APP__OPS__ACCESS_TOKEN` — scope **crm.schemas.contacts.write**).

**Group: subscription_plan** — `current_plan`, `plan_price`, `billing_interval`, `period_start`, `period_end`, `plan_status`

**Group: notification_preferences** — `notify_order_updates`, `notify_production_reminders`, `notify_marketing`

**Group: portal** — `is_portal_customer` (booleancheckbox)

**Templates (#9–#11):** `portal_saved_templates_json` and related — see issue bodies; keep **internal names** stable for GraphQL and forms.

**Optional later:** If membership GraphQL cannot expose `portal_hair_profile_json` or JSON-in-HubL is too heavy, add **flat** contact properties under a HubSpot group (mirroring `hair_profile_information`) — coordinate with A5 before duplicating data with the JSON field.
