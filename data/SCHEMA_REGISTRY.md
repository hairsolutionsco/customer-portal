# Schema registry (Portal 2.0)

Fill this in **after** the **target HubSpot portal** is configured (sandbox recommended when available; otherwise production with care — see `docs/AGENT_PROMPT.md` *Portal orchestration* → *HubSpot CLI and portal choice*). **A5/A6 GraphQL** must match **your** portal’s GraphQL explorer (association aliases differ per account).

## Entitlements snapshot (verify in-product)

| Capability | Typical Professional stack | Notes |
|------------|---------------------------|--------|
| **Membership + private CMS pages** | Content Hub Professional | GraphQL reads scoped to logged-in **contact**. |
| **Private-page CRM types (per HubSpot CMS docs)** | contact, company, deal, ticket, quote, line_item | Official “CRM objects in CMS pages” table; **does not list `order` or `invoices`**. |
| **Custom objects in CMS** | Content Hub **Enterprise** (per docs) | **Do not rely on this** for Portal 2.0 go-live. |
| **Native Commerce `order` object** | Commerce / orders feature on account | CRM API: orders exist; **CMS GraphQL exposure** must be **introspected**. |
| **Native `invoices` object** | Commerce / invoicing on account | Native CRM object + API; **confirm** your SKU includes invoicing; **CMS GraphQL** same caveat as orders. |
| **Service Hub** | Service Professional | **Tickets** on private pages — useful for support + timeline patterns. |
| **CMS serverless functions** (`*.functions` under the theme root) | **CMS Hub Enterprise** (typical) — *not* granted on all accounts | Upload error *“does not have access to serverless functions”* means use **GraphQL + HubL + external APIs** (e.g. Hostinger Worker) until tier/sandbox allows it. Sample code: `customer-portal/docs/serverless-samples/portal-api.functions/` → copy into `customer-portal/theme/` when entitled. **Local:** HubSpot’s `@hubspot/serverless-dev-runtime` / CLI `hs function` tooling is **beta** and may require a compatible account. |
| **Sandbox vs production** | **Not strictly required** for serverless *in principle* — **subscription / test-account entitlements** matter more | A **CMS developer sandbox** or **Enterprise trial** can expose features your **production Professional** portal lacks. Use a sandbox when you want isolation; use **configurable test accounts** (HubSpot developer docs) to mimic tiers in automation. |

**Automation rule:** Anything not queryable on membership GraphQL → sync via workflow to **Contact** (preferred), **Deal**, or **Company** properties the portal *can* read.

**HubDB in this theme:** Membership GraphQL on portal **50966981** did not expose `HUBDB.table` (validator: `Field 'table' in type 'HUBDB' is undefined`). The live theme currently uses **`hubdb_table_rows(theme.hubdb.*_table_id)`** for the **shop** and **plan grid** surfaces; `affiliated_locations` remains a synced HubDB table, but the pruned customer-route set no longer renders a locations page from `theme/`.

---

## GitHub issue #7 alignment (native orders, not custom object)

Issue **[#7](https://github.com/hairsolutionsco/customer-portal/issues/7)** title/body still describe a **custom** Order object (`schemas/order.json` + `POST /crm/v3/schemas`). For Portal 2.0, **`AGENT_PROMPT.md` §1** and **`IMPLEMENTATION_PLAN_SUBAGENTS.md` north star supersede that:** orders are **native HubSpot Commerce `order`** records, associated to **contacts** in CRM — **no custom order object** is required for the theme or G1.

| Layer | What to do |
|-------|------------|
| **CRM (source of truth)** | Create/manage **native** orders (Commerce); ensure each order is **associated to the customer contact** (Commerce checkout, sync, import, or CRM associations). Use native order properties for status/shipping fields where available. |
| **CMS membership GraphQL** | HubSpot’s documented private-page CRM types include **contact, company, deal, ticket, quote, line_item** — **not** `order` / `invoices` (`AGENT_PROMPT.md` Context). **Do not assume** `order` appears in the explorer. |
| **Portal theme (today)** | Queries use **`deal_collection__contact_to_deal`** (contact → deals) with a GraphQL alias **`p_order_collection__primary`** so modules keep one stable “orders collection” name while the backing data is **deal-based mirror** for GraphQL. See `customer-portal/theme/data-queries/dashboard.graphql`, `orders_list.graphql`, `order_detail.graphql`. |
| **Future** | If introspection shows a native **`order`** association under `CRM.contact.associations`, A5 can point the same alias (or a new field) at that collection and map real order properties; until then, **deals-as-orders** remains the supported read path. |
| **Order detail (membership)** | `order_detail.graphql` loads `CRM.p_order` via `deal(uniqueIdentifier: "hs_object_id", …)` **and** `CRM.contact` with the same `p_order_collection__primary: deal_collection__contact_to_deal` alias as `dashboard.graphql` / `orders_list.graphql`. **Authorization** is not expressed in GraphQL alone: `theme/modules/order-detail.module/module.html` sets `allowed` only when `p_order.hs_object_id` matches an id in the contact’s mirrored deal list (see `theme/docs/03-templates-and-data-query.md`). |

**Wave 1 GraphQL alignment (deals-as-orders):** All three order-related queries use the same association alias pair: `p_order_collection__primary: deal_collection__contact_to_deal`. **Account-specific:** if explorer autocomplete shows a different contact→deals field name, replace `deal_collection__contact_to_deal` in all three files together.

**Explorer checklist for `order_detail.graphql` (no substitute for live validation):** Deal selection uses `dealname`, `dealstage`, `amount`, `deal_currency_code`, `createdate`, `closedate`, `description`, `hs_object_id`. These map to common HubSpot deal properties; membership GraphQL still rejects any field missing from **your** schema. **Semantic placeholders:** `shipped_at` and `delivered_at` both alias `closedate` today; `subtotal` aliases `amount` — UI shows duplicate values until mirrored custom deal properties or native order fields exist.

---

## GitHub issue #8 alignment (timeline / status — not custom `order_status_history`)

Issue **[#8](https://github.com/hairsolutionsco/customer-portal/issues/8)** title/body still describe a **custom** Order Status History object (`schemas/order_status_history.json`, POST to CRM schemas, association to a custom Order object). For Portal 2.0, **`AGENT_PROMPT.md` §1** and **`IMPLEMENTATION_PLAN_SUBAGENTS.md` north star supersede that**, in the same way as **[#7](https://github.com/hairsolutionsco/customer-portal/issues/7)** (see **GitHub issue #7 alignment** above): **no custom `order_status_history` object** is required for the theme, Wave 1, or **G1** timeline documentation.

### Chosen pattern — portal **50966981** (documented read model)

| Layer | What we use |
|-------|-------------|
| **Primary “order status / timeline” signal (today)** | **Deal pipeline** on the **deals-as-orders** mirror: contact → `p_order_collection__primary` → `deal_collection__contact_to_deal` (verify name in explorer). **Current** production/status = CRM **`dealstage`**, exposed in GraphQL as `status` and `production_stage` on the deal row (see `theme/data-queries/order_detail.graphql`). Timestamped **stage history** in CRM (deal stage properties, reports, workflows) is **standard HubSpot deal behavior**; the **portal UI** currently shows a **fixed ordered list** of stage internal IDs with the **current** stage highlighted — not a separate custom-object history table. |
| **Optional second lane** | **Tickets** (Service Hub) associated to the **contact** (and/or company) for support-style timelines. Membership GraphQL documents **ticket** among private-page CRM types; **introspect** `contact → associations → …` for the generated collection name on portal **50966981** and record it in **GraphQL association aliases** below when adopted. |
| **Native Commerce `order`** | **CRM** remains source of truth for real orders. If **membership GraphQL** later exposes **`order`** for this account, timeline/status fields can move to native order properties without introducing `order_status_history`. |

### Theme modules (where stages / status appear)

| Module | Path | Role |
|--------|------|------|
| Order detail + pipeline rail | `theme/modules/order-detail.module/module.html` | “Pipeline stage” / `order-detail__timeline`: compares `order.status` (mapped from `dealstage`) to a HubL list of stage internal names. **Human-required (HubSpot UI):** align **deal pipeline stages** and labels with what the business wants customers to see (**Settings → Objects → Deals → Pipelines**, or your account’s equivalent navigation). The module copy already states that deal stages reflect the account pipeline. |
| Open-order / production alert | `theme/modules/production-alert.module/module.html` | Surfaces an **open** mirrored deal (same `p_order_collection__primary` collection) when `estimated_completion` is empty — complements order detail for at-a-glance “in progress” messaging. |
| Supporting | `theme/modules/dashboard-stats.module/module.html`, `theme/modules/recent-orders.module/module.html`, `theme/modules/status-badge.module/module.html` | Counts, recency, and badge treatment on **deal-as-order** fields — not a separate history object. |

### Legacy #8 checklist — interpret as “done” when

- [x] **Timeline pattern documented** in this registry (deals-as-orders + optional tickets + native order when GraphQL allows) — **no** `order_status_history` custom object.
- [~] **Optional / explicitly deferred:** **Contact → Tickets** association field name — **not** explorer-verified in-repo; record under **GraphQL association aliases** when ticket-based timelines are adopted or when **Design Manager** A9a / membership GraphQL verification runs (autocomplete on `CRM.contact.associations`). *Typical generated pattern (verify, do not trust blindly):* `ticket_collection__contact_to_ticket`.
- [~] **Optional (human / deferred):** Rename/reorder deal pipeline stages so the static list in `order-detail.module` matches **your** pipeline’s internal stage IDs (or adjust the HubL `stages` array to match the mirror pipeline).

---

## System of record (authoritative)

| Domain | Where it lives | Portal read path |
|--------|----------------|------------------|
| Hair measurements + profile | **Contact property** `portal_hair_profile_json` (JSON object; keys per `schemas/hair_profile.json`) | `CRM.contact` GraphQL / HubL (parse JSON in modules if needed) |
| Saved customization templates | **Contact properties** (one preset per property set, or JSON in a long text field if needed) | `CRM.contact` |
| **Orders — CRM** | **Native Commerce `order`**, associated to **contact** | CRM / Orders API; ops workflows |
| **Orders — GraphQL (membership)** | **Deals** associated to contact (mirror for UI) | `associations { p_order_collection__primary: deal_collection__contact_to_deal { ... } }` — **confirm `deal_collection__contact_to_deal` in explorer** |
| Invoices (this theme) | **`portal_invoices_json`** on contact | Workflow/automation mirrors rows; native `invoices` in GraphQL when available |
| Order timeline / history | **Deal** `dealstage` on deals-as-orders mirror + optional **tickets**; native order fields when GraphQL exposes `order` | **Authoritative:** **GitHub issue #8 alignment** above — **not** custom `order_status_history`. Theme: `order-detail.module`, `production-alert.module`. |
| Catalog (plans + products; `affiliated_locations` retained for ops) | **HubDB** | Live theme reads HubDB via `hubdb_table_rows(...)`, not membership GraphQL |

---

## Registry table (fill with live IDs / names)

| Artifact | HubSpot ID / name | Notes |
|----------|-------------------|--------|
| Contact `portal_hair_profile_json` | Group **`portal`** (label: Portal) | **Issue #6 (supersedes custom-object AC in GitHub):** GitHub **[#6](https://github.com/hairsolutionsco/customer-portal/issues/6)** still describes a **custom object** + `schemas/hair_profile.json` + `POST /crm/v3/schemas`. **Portal 2.0** follows **`AGENT_PROMPT.md` §1** + **`IMPLEMENTATION_PLAN_SUBAGENTS.md` north star:** hair profile is **one Contact property** (textarea) **`portal_hair_profile_json`** holding a **JSON object** whose keys match the property names below (same names as the old custom-object plan / issue table). **Do not** create a HubSpot custom object for hair profile for go-live. **Create/update properties in HubSpot:** from this repo root run **`./scripts/op_env.sh npm run portal:hubspot-props`** (runs `scripts/hubspot_create_portal_contact_properties.py`; needs a token with **`crm.schemas.contacts.write`** — see `npm run portal:hubspot-props` in `package.json`). *Alternate monorepo paths:* `bash scripts/op_run.sh npm run portal:hubspot-props` from **`hubspot/`** root if your workspace uses that wrapper. |

### `portal_hair_profile_json` — JSON key contract (names align with issue #6 / master-plan; `schemas/hair_profile.json` optional)

**Source of truth for keys:** this table. A committed **`schemas/hair_profile.json`** file (issue #6 checkbox) is **optional** documentation only for the contact-property path — it is **not** POSTed to `crm/v3/schemas` for Portal 2.0. If you add the file later, keep `name` values identical to the keys below.

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
| `allergies` | string | Portal extension (not listed in GitHub #6 table; safe to omit in minimal payloads) |
| `onboarding_completed` | boolean | |

**Reference grouping in `schemas/hair_profile.json`:** properties use `groupName` `hair_profile_information` for documentation alignment with the old custom-object plan; on **Contact**, the live storage for the portal is the single field above in group **`portal`**.

**GraphQL:** `theme/data-queries/hair_profile.graphql` uses core contact fields only until **CMS GraphQL** introspection confirms **`portal_hair_profile_json`** (or the explorer’s exact field name) on `crm_contact`. **Do not** add that field to the query without verification — upload validation rejects undefined GraphQL fields even when the CRM property exists in Settings.

| Artifact | HubSpot ID / name | Notes |
|----------|-------------------|--------|
| Contact `portal_saved_templates_json` | `portal` group | JSON **array** of template objects |
| Contact `portal_invoices_json` | `portal` group | JSON **array** of `{ invoice_number, issue_date, total, currency, status, pdf_url }` |
| Contact `portal_billing_json` | `portal` group | **Optional until Private App has `crm.schemas.contacts.write`:** create in HubSpot or re-run `portal:hubspot-props` after rotating PAT in 1Password. |
| Native object **orders** | `order` (Commerce) — FQN / type ID via CRM schema API | **CRM:** associate order ↔ **contact** (Commerce + Associations API). **Not** a custom object. |
| Native object **invoices** | `invoices` | Associations to **contact** |
| **Deal** pipeline used for portal “order” list/detail | *(pipeline ID + stage labels)* | **GraphQL path** for orders UI; keep deal naming/stages aligned with production stages or sync from native orders via workflow |
| HubDB `subscription_plans` | **241666864** | Sync: `npm run portal:hubdb-sync` (from hubspot or design-manager root) or `python3 customer-portal/ops/scripts/hubspot_sync_hubdb.py` (uses HubSpot CLI OAuth from `~/.hscli/config.yml` when env token is stale). |
| HubDB `affiliated_locations` | **241636157** | same |
| HubDB `products` | **241666863** | Recreated when seed `category` type changes: `--recreate-table=products` |

### HubDB columns (repo seed = master-plan + `AGENT_PROMPT.md` §2)

Table **names** in HubSpot: `subscription_plans`, `affiliated_locations`, `products` (underscores). After a successful sync, replace the registry placeholders above with numeric **table IDs** from the script output or HubSpot → Marketing → Files & Tools → HubDB.

| Table | Columns (internal names) |
|-------|-------------------------|
| `subscription_plans` | `name`, `description`, `price`, `currency`, `interval`, `systems_per_year`, `features`, `is_active`, `display_order` |
| `affiliated_locations` | `name`, `country`, `state`, `city`, `address`, `postal_code`, `phone`, `email`, `website`, `services_offered`, `specialties`, `latitude`, `longitude`, `description`, `logo_url`, `is_featured`, `display_order` |
| `products` | `name`, `slug`, `description`, `short_description`, `price`, `compare_at_price`, `currency`, `category` (**SELECT**: Hair Systems, Adhesives, Maintenance, Accessories), `primary_image`, `in_stock`, `featured`, `display_order` |

**Gate G2 (HubDB):** **passing** for portal **50966981** — tables published with seed rows (2026-04-07). GitHub **#12–#14** closed when AC matched registry + `theme/fields.json` (2026-04-10, Agent A2). Re-run **`./scripts/op_env.sh npm run portal:hubdb-sync`** after seed edits; script reads **`data/hubdb/*.json`** first. Token resolution: `scripts/hubspot_resolve_token.py` (env first, then HubSpot CLI OAuth).

| Optional custom objects (`schemas/*.json`) | *(only if created)* | **Not required** for theme upload |

---

## GraphQL association aliases (verify in explorer)

Paste **real** names from your portal after introspection. Examples only — yours may differ (HubSpot-generated labels).

| Label / concept | Name to verify | Notes |
|-----------------|----------------|-------|
| **Contact → Deals** (portal “orders” today) | `deal_collection__contact_to_deal` | Used in theme `*.graphql`; if upload/validation errors, open explorer and match the **exact** deals association field on `contact`. |
| **GraphQL alias only** | `p_order_collection__primary` | Not a HubSpot association ID — a **query alias** mapping the deals collection to a stable key for HubL/modules. |
| Contact → Company | e.g. `company_collection__primary` | Pattern reference |
| Contact → Tickets | *(introspect when adopted)* | For support / timeline; **#8 optional** — see checklist above (typical pattern to verify: `ticket_collection__contact_to_ticket`) |
| Contact → **native Orders** | *(introspect)* | **Expected absent** on many portals per CMS docs; if present, document field name here and plan query swap |
| Contact → Invoices | *(introspect)* | Same caveat as orders |
| Order detail dynamic page | `request.contact.contact_vid` + slug | Today: detail query uses same deal association + filters by slug/`hs_object_id` — see `order_detail.graphql` |

### A9a verification log (portal **50966981**) — Wave 0 GraphQL gate

Run the checks in `docs/cms-customer-portal-plan.md` Wave 0 (**A9a**) using a **seeded test contact** with at least one deal on the orders mirror. Record **exact** association field names from autocomplete / introspection (they vary by portal).

**Column legend:** **Repo / orchestrator** = static review in git (query shape, variables, HubL guards). **Design Manager** = execute in HubSpot’s **GraphQL** tool on a membership-capable template (see **Verification steps** below) — required for **G3** and for trusting field names against the live schema.

| Check | Repo / orchestrator (2026-04-10) | Design Manager GraphQL |
|-------|-----------------------------------|-------------------------|
| `dashboard.graphql` runs | ☑ Query + `#` headers + `contact_id` variable; `p_order_collection__primary: deal_collection__contact_to_deal` block present | ☐ Run with test `contact_id` |
| `orders_list.graphql` runs | ☑ Same association alias + deal field selections as `dashboard.graphql` | ☐ Run with test `contact_id` |
| `order_detail.graphql` runs | ☑ `deal(uniqueIdentifier: "hs_object_id")` + contact association subset; HubL allow-list in `order-detail.module` | ☐ Run with test `contact_id` + `order_number` (slug) |
| Contact → deals: `deal_collection__contact_to_deal` (or actual name) | ☑ Used consistently in all three queries (replace portal-wide if explorer shows a different generated name) | ☐ Confirm autocomplete / introspection on `CRM.contact.associations` |
| Alias `p_order_collection__primary` still valid in queries | ☑ Present in `dashboard`, `orders_list`, `order_detail` (contact branch) | ☐ N/A (alias is client-side) |
| Contact → tickets collection name | ☐ **Deferred** (#8 optional lane — not blocking; record when adopted or A9a runs) | ☐ Introspect if ticket timeline is adopted |
| Contact → quotes collection name | ☐ Not recorded | ☐ Introspect if quotes are used in portal |
| Contact → documents / files (if any) | ☐ Not recorded | ☐ Introspect if needed |
| Contact → meetings / custom events (if used for “events”) | ☐ Not recorded | ☐ Introspect if needed |
| **G5b:** staff-only **membership** access group feasible on this tier | ☐ | ☐ Confirm in HubSpot **Memberships** / access groups UI |
| **`hair_profile.graphql`:** `portal_hair_profile_json` (or explorer name) on `CRM.contact` | ☑ Repo keeps name/email-only until explorer lists the property (**no** `portal_hair_profile_json` in query yet) | ☐ When field appears in explorer, extend query; then consider **A5/A6** work |

**Last updated:** 2026-04-10 — orchestrator repo pass; Design Manager cells remain **☐** until a human runs the GraphQL tool and updates this table (or opens a PR with pasted explorer results).

**A5 / A6 spawn rule:** Spawn **A5/A6** only after **Design Manager** confirms `portal_hair_profile_json` on `CRM.contact` (or another agreed read path). Until then, do **not** extend `hair_profile.graphql` with that field.

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
| **A0 (CLI):** `hs` on PATH has no `hs cms upload` (older/global install) | After `npm install` in this repo, use **`./node_modules/.bin/hs cms upload . customer-portal -m draft`** from **`theme/`**, or **`./scripts/portal_task_complete.sh`** (it prefers the local `hs`). Auth lives in **`~/.hscli/config.yml`**; use **`hs account auth`**, not **`hs init`**. |
| **A0 (upload):** HubSpot **`internal error`** after many successful file uploads | Retry upload; confirm **Design Manager → `customer-portal`**; if it persists, open a HubSpot support ticket with account **50966981** and timestamp. |
| `deal_collection__contact_to_deal` missing or renamed on your account | Copy exact field name from explorer into all three queries (`dashboard`, `orders_list`, `order_detail`). |
| No deals to mirror native orders | Create a workflow or integration that creates/updates a **deal per order** (or stage) for portal display, or wait for HubSpot to expose `order` on membership GraphQL. |
| Team expects issue #7 “custom object” deliverable | Close #7 with comment pointing to this registry + native Commerce direction; optional custom object is **out of scope** for Professional CMS GraphQL. |
| Team expects issue #8 **Order Status History** custom object | Close #8 with comment pointing to **GitHub issue #8 alignment** in this file; timeline uses **deal stages** (+ optional **tickets**), not `order_status_history`. |
| **`op run` / `op_env.sh` shows no output for many minutes** | **1Password Desktop** must be unlocked and the **hubspot** `.env` source must be actively injecting (Desktop **Environments** / developer integration). Until vars flow, `op run` blocks on the FIFO. Approve/inject in 1Password, then re-run **`./scripts/op_env.sh npm run portal:hubdb-sync`** and **`./scripts/op_env.sh npm run portal:hubspot-props`** from **`customer-portal/`** (delegates to **`customer-portal/ops/scripts/op_env.sh`** → **`design-manager`** + **`hubspot/scripts/op_run.sh`**). |

---

## Contact properties (billing, notifications, portal — issue #11)

Create via **Settings → Properties → Contact**, CRM Properties API, or:

`npm run portal:hubspot-props` (uses `HUBSPOT_PRIVATE_APP__CRM_SCHEMA__ACCESS_TOKEN` or `HUBSPOT_PRIVATE_APP__OPS__ACCESS_TOKEN` — scope **crm.schemas.contacts.write**).

**Group: subscription_plan** — `current_plan`, `plan_price`, `billing_interval`, `period_start`, `period_end`, `plan_status`

**Group: notification_preferences** — `notify_order_updates`, `notify_production_reminders`, `notify_marketing`

**Group: portal** — `is_portal_customer` (booleancheckbox)

**Templates (#9–#11):** `portal_saved_templates_json` and related — see issue bodies; keep **internal names** stable for GraphQL and forms.

**Optional later:** If membership GraphQL cannot expose `portal_hair_profile_json` or JSON-in-HubL is too heavy, add **flat** contact properties under a HubSpot group (mirroring `hair_profile_information`) — coordinate with A5 before duplicating data with the JSON field.

### G1 CRM slice (A1) — verification log

| Date | What ran | Result |
|------|----------|--------|
| 2026-04-10 | `npm run portal:hubspot-props` (CLI-resolved token; no `op_env` wait) | All groups + properties **exist** (idempotent `property ok (exists)` / `group ok (exists)`). **`portal_billing_json`:** skipped with **403** — create via UI or re-run with a Private App PAT that has **`crm.schemas.contacts.write`** (`HUBSPOT_PRIVATE_APP__CRM_SCHEMA__ACCESS_TOKEN` / `HUBSPOT_PRIVATE_APP__OPS__ACCESS_TOKEN` in 1Password). |
| 2026-04-10 | GitHub **#6, #7, #9, #10, #11** | **Closed** with comments pointing to this file + `docs/AGENT_PROMPT.md` §1 (custom-object AC superseded by contact properties + native Commerce + deals/invoice mirrors). |
