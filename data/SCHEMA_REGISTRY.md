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

## GitHub issues #27 / #28 alignment (products + locations HubDB vs membership GraphQL)

Issues **[#27](https://github.com/hairsolutionsco/customer-portal/issues/27)** and **[#28](https://github.com/hairsolutionsco/customer-portal/issues/28)** describe **`HUBDB { … }`** queries under legacy **`src/data-queries/`**. On portal **50966981** that shape **does not validate** for membership GraphQL (same `HUBDB.table` limitation as above). **Do not** commit the issue-body `products_collection` / `affiliated_locations_collection` fragments as-uploadable GraphQL for this portal.

| Issue | Accepted read model | Implementation |
|-------|-------------------|----------------|
| **#27** Products | **HubL:** **`hubdb_table_rows(theme.hubdb.products_table_id)`** in **`theme/modules/product-grid.module/module.html`**. **GraphQL:** **`theme/data-queries/products.graphql`** returns **`CRM.contact`** only (with `$contact_id` / `dataQueryPath` on **`portal-shop.html`**) so the shop template stays membership-scoped; product **rows** are not read from `data_query.data.HUBDB`. | See **`theme/docs/04-hubdb-and-catalog.md`**. |
| **#28** Locations | **HubL:** when **A11** (#38–#39) adds a locations UI, read **`affiliated_locations`** with **`hubdb_table_rows(theme.hubdb.affiliated_locations_table_id)`** (table ID **241636157** in **`theme/fields.json`** defaults). **GraphQL:** **`theme/data-queries/locations.graphql`** mirrors **`products.graphql`** (CRM contact only + header comment). There is **no** `portal-locations` template in this slice yet, so **`locations.graphql` is not wired to `dataQueryPath`** until a page needs it — avoids orphan upload validation noise while keeping one file path for #28. | Same doc + plan IA note below. |

**GraphiQL / Design Manager:** The **upload-valid** queries to exercise for #27 are **`products`** with a test `contact_id` (CRM branch only). For #28, **`locations`** uses the same CRM shape once referenced by a template; **HubDB row reads** are verified by publishing the HubDB table (**#13**) and rendering a module that calls **`hubdb_table_rows`**, not by a `HUBDB` block in GraphQL.

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

**GraphQL:** **`portal_hair_profile_json`** is **present on `crm_contact`** for portal **50966981** — validated by **`hs cms upload`** (draft) **2026-04-10** (`hair_profile.graphql`, `dashboard.graphql`). **`portal_billing_json`** is **not** exposed on **`crm_contact`** in membership GraphQL for this portal (upload error: `FieldUndefined`); dashboard **does not** select it — use **`billing.graphql`** subscription_plan fields (`current_plan`, etc.) for plan row; JSON billing snapshot remains a future path if HubSpot exposes the property on GraphQL.

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

## § GraphQL association aliases (portal **50966981**)

Paste **verified** snake_case field names from the HubSpot **CMS GraphQL** explorer after you run the queries below. HubSpot generates association collection names per account; **`deal_collection__contact_to_deal`** matches theme `theme/data-queries/dashboard.graphql`, `orders_list.graphql`, and `order_detail.graphql` today — **confirm or replace in A9b**, not here (A9a records truth only).

### Quick reference — record verified names here

| Label / concept | Name to verify / verified value | Notes |
|-----------------|----------------------------------|-------|
| **Contact → Deals** (portal “orders” mirror) | `deal_collection__contact_to_deal` *(pending live confirm)* | Theme uses this inside `associations { … }`. If explorer autocomplete shows a different **contact → deal** collection, write the exact name here and hand off to **A9b**. |
| **GraphQL alias only** | `p_order_collection__primary` | Client-side alias in queries — **not** introspected on the server. |
| Contact → Company | e.g. `company_collection__primary` | Pattern reference for admin/list work later. |
| Contact → Tickets | *(introspect — typical pattern `ticket_collection__contact_to_ticket`)* | **#8** optional lane; required before **`tickets.graphql`** (A9b). |
| Contact → Quotes | *(introspect — typical pattern `quote_collection__contact_to_quote`)* | Required before **`quotes.graphql`** (A9b). |
| Contact → **native Orders** | *(introspect)* | **Expected absent** on Content Hub Professional per plan; if present, document and plan native `order` read path. |
| Contact → Invoices | *(introspect)* | Often absent on membership GraphQL; theme uses **`portal_invoices_json`** on contact today. |
| Contact → **Documents / files** | **`___________________________`** *(placeholder)* | Naming varies by product + associations; use **G3a-Q5** steps; fill when CRM associations exist for the object you surface as “documents.” |
| Contact → **Meetings / marketing events / custom “events”** | **`___________________________`** *(placeholder)* | Use **G3a-Q6** steps; pick the CRM object you will treat as “events” and record its collection field. |
| Order detail dynamic page | `request.contact.contact_vid` + `dynamic_slug` | `order_detail.graphql` loads `deal(hs_object_id)` plus contact’s deal list for authorization in HubL — see `theme/docs/03-templates-and-data-query.md`. |

### Explorer setup — membership context (≈2 minutes)

Do this in **portal 50966981** (cannot be completed from this repo alone — closes **G3a** in HubSpot UI):

1. **Design Manager** → website → open theme **`customer-portal`** → open **GraphQL** (or **Developer → GraphQL**, depending on your HubSpot nav) **in the context of a private/membership template** so variables like `request.contact.contact_vid` are meaningful.
2. **Pick a test `contact_id`:** numeric **Contact record ID** (VID) for a contact that has at least one **Deal** on the orders-mirror pipeline **and** (optional) linked **Ticket** / **Quote** rows for ticket/quote probes.
3. In the GraphQL editor, set **Query variables** (example): `{ "contact_id": "123456", "order_number": "789012345" }` — use a real deal `hs_object_id` for `order_number` when testing `order_detail`.
4. **Prefer autocomplete** inside `associations { }` on `CRM.contact` — it is faster than raw introspection when enabled.
5. If **`__type`** introspection returns null or errors, rely on **Docs** panel + autocomplete only (some HubSpot surfaces limit introspection).

### Copy-paste: explorer queries & introspection snippets

#### G3a-Q1 — Contact → Deal (confirm `deal_collection__contact_to_deal` or replacement)

```graphql
# Variables: { "contact_id": "<VID>" }
query G3a_ContactToDeal($contact_id: String!) {
  CRM {
    contact(uniqueIdentifier: "id", uniqueIdentifierValue: $contact_id) {
      _metadata { id }
      associations {
        p_order_collection__primary: deal_collection__contact_to_deal {
          items {
            hs_object_id
            dealname
            dealstage
            amount
            deal_currency_code
            createdate
            closedate
          }
          total
        }
      }
    }
  }
}
```

- **Pass:** Data returns with no `FieldUndefined` / unknown field errors.
- **Fail:** Replace `deal_collection__contact_to_deal` with the autocomplete field that represents **deals associated to this contact**, paste the working name into **Quick reference** above, and note **A9b** must update the three order-related `.graphql` files together.

#### G3a-Q2 — Introspection: list fields on `crm_contact` (find `associations` target type)

```graphql
query G3a_IntrospectContactFields {
  __type(name: "crm_contact") {
    name
    fields {
      name
      type {
        kind
        name
        ofType {
          kind
          name
        }
      }
    }
  }
}
```

- In the result, find the field **`associations`**. Note the **`ofType.name`** (inner named type) — call it **`$ASSOC_TYPE`**.
- Then run **G3a-Q2b** (replace `crm_contact_associations` below if your `$ASSOC_TYPE` differs):

```graphql
query G3a_IntrospectContactAssociations {
  __type(name: "crm_contact_associations") {
    name
    fields {
      name
    }
  }
}
```

- **Human action:** In the `fields` list, locate entries containing **`deal`**, **`ticket`**, **`quote`**, and any **document / file / meeting / event** collections; copy exact names into **Quick reference** and the **G3a verification log**.

#### G3a-Q3 — Contact → Ticket (probe template)

```graphql
# Variables: { "contact_id": "<VID>" }
# Replace ticket_collection__contact_to_ticket with the exact name from G3a-Q2 / autocomplete if different.
query G3a_ContactToTicket($contact_id: String!) {
  CRM {
    contact(uniqueIdentifier: "id", uniqueIdentifierValue: $contact_id) {
      associations {
        tickets: ticket_collection__contact_to_ticket {
          items {
            hs_object_id
            subject
          }
          total
        }
      }
    }
  }
}
```

- Adjust **`subject`** / item fields to valid ticket fields for your schema if the explorer errors (use autocomplete on `items { }`).

#### G3a-Q4 — Contact → Quote (probe template)

```graphql
# Variables: { "contact_id": "<VID>" }
# Replace quote_collection__contact_to_quote with the exact name from G3a-Q2 / autocomplete if different.
query G3a_ContactToQuote($contact_id: String!) {
  CRM {
    contact(uniqueIdentifier: "id", uniqueIdentifierValue: $contact_id) {
      associations {
        quotes: quote_collection__contact_to_quote {
          items {
            hs_object_id
          }
          total
        }
      }
    }
  }
}
```

- Expand **`items { }`** using autocomplete for quote properties your portal exposes.

#### G3a-Q5 — Documents / files (placeholder procedure)

1. In the **G3a-Q2** association-type field list (or autocomplete under `associations`), search for candidates such as **`document`**, **`file`**, **`attachment`**, or company-specific custom object collections linked to **contact**.
2. If nothing appears, **Verified absence** is a valid outcome — document “no contact-scoped document collection in membership GraphQL” in the log and plan **HubL / workflow mirror** (same automation rule as orders).
3. When you identify the correct collection, add a **G3a-Q5** row to the log and paste a minimal `items { hs_object_id }` query here in internal notes or the **Notes** column.

#### G3a-Q6 — Meetings / events (placeholder procedure)

1. Decide which CRM surface the portal will treat as **“Events”** (e.g. **Meetings**, **Marketing events**, or a **custom object**).
2. In the **G3a-Q2** field list / autocomplete, find the **contact → that object** collection name; if only **company**-scoped associations exist, record that gap (admin queries may differ from membership).
3. Fill **Quick reference** “Meetings / marketing events / custom events” row with the exact collection field name or with **“not exposed on membership GraphQL.”**

#### G3a-Q7 — Native `order` collection sanity check (expected negative on Pro)

Inside `associations { }`, search autocomplete for **`order`** / **`commerce`**. If **no** contact→order collection exists, note **“native order not on membership GraphQL”** in the log — aligns with `docs/cms-customer-portal-plan.md` locked decision.

### G3a verification log (portal **50966981**)

**How to use:** After each HubSpot run, set **Status** to **Verified** and add **Date** (ISO). **Gate** is always **G3a** unless noted.

| Gate | Check | Status (Pending / Verified) | Notes | Date |
|------|-------|-----------------------------|-------|------|
| G3a | **G3a-Q1** `deal_collection__contact_to_deal` resolves (or replacement name recorded) | Pending | Record exact field name in **Quick reference** | |
| G3a | **`dashboard.graphql`** executes in explorer with test `contact_id` | Pending | Upload-validated draft **2026-04-10** in repo — explorer still required for **G3a** | |
| G3a | **`orders_list.graphql`** executes in explorer | Pending | | |
| G3a | **`order_detail.graphql`** executes with `contact_id` + `order_number` = deal `hs_object_id` | Pending | | |
| G3a | **`p_order_collection__primary`** alias present in all three order queries (repo review) | Pending | N/A in explorer — tick **Verified** when git review done | |
| G3a | **G3a-Q3** Contact → ticket collection name recorded (or “deferred / not used”) | Pending | | |
| G3a | **G3a-Q4** Contact → quote collection name recorded (or “deferred / not used”) | Pending | | |
| G3a | **G3a-Q5** Documents / files association recorded or absence documented | Pending | | |
| G3a | **G3a-Q6** Events / meetings association recorded or absence documented | Pending | | |
| G3a | **G3a-Q7** Native **order** collection absent (or name recorded if present) | Pending | | |
| G3a | **`hair_profile.graphql`** — `portal_hair_profile_json` resolves | Pending | | |
| G3a | **`customization_templates.graphql`** — `portal_saved_templates_json` resolves | Pending | | |
| G3a | **`invoices.graphql`** — `portal_invoices_json` resolves | Pending | | |
| G3a | **`settings.graphql`** — notification + address fields resolve | Pending | Fields per registry **Contact properties** section | |
| G3a | **`billing.graphql`** (if used on live pages) — subscription fields resolve | Pending | Omit if no template binds it yet | |

**Repo preflight (already done, does not replace explorer):** CRM GraphQL for **50966981** was **upload-validated** **2026-04-10** (`hs cms upload`); **`portal_billing_json`** is not on `crm_contact` GraphQL — dashboard query omits it. **A5 / A6:** A6 owns HubDB **#27–#28**.

**Last updated (doc):** 2026-04-10 — Wave 0 **A9a** documentation pass; human must flip **Pending → Verified** in HubSpot.

### G5b — Admin access path (staff membership group vs HubL guard)

**Gate:** **G5b** in `docs/cms-customer-portal-plan.md` — blocks **A7a** and downstream admin waves until resolved.

| Option | What it is | When to choose |
|--------|------------|----------------|
| **A — Staff membership access group** | Create a **second** private membership access group (e.g. **Portal Staff** / **Portal Admins**) and assign **only** staff contacts. Gate **`/portal/admin/*`** (and any staff-only customer pages) at the **page / membership** layer so non-members never receive HTML for those routes. | Choose when HubSpot UI confirms you can maintain **distinct customer vs staff** groups on this portal **without** entitlement blockers. |
| **B — HubL `contact.is_staff` guard fallback** | Do **not** rely on a separate staff access group for admin templates. Every admin template wraps CRM output in `{% if contact.is_staff %}…{% else %}…{% endif %}` per plan (`docs/cms-customer-portal-plan.md` §Guiding principles) — **no** CRM data outside the guard. | Choose when a **dedicated staff membership group is unproven** on **Content Hub Professional** (limits, ops complexity, or UI uncertainty). This is the **recommended default** until **Option A** is explicitly verified. |

**Recommendation (Content Hub Professional, staff group unproven):** Proceed with **Option B** as the **approved path** for **A7a** until the orchestrator verifies **Option A** in-product. Option A remains the **hardening upgrade** once staff group behavior is confirmed.

**Orchestrator sign-off (G5b):** **Chosen path:** _Option A — staff membership access group_ **or** _Option B — HubL `contact.is_staff` guard only (fallback)_ — **Signed:** _________________________ **Date:** __________

*(After sign-off, copy a one-line summary into the **Notes** column of any G5b row if you add staff-feasibility checks to the table below.)*

| Gate | Check | Status (Pending / Verified) | Notes | Date |
|------|-------|-----------------------------|-------|------|
| G5b | Staff-only **membership** access group technically feasible (create group + assign test staff contact + confirm gated page behavior) | Pending | If **Verified**, Option A available; if **Blocked**, default to Option B with orchestrator sign-off above | |
| G5b | Orchestrator recorded **Chosen path** for A7a | Pending | Paste sign-off line above | |

### Verification checklist (GraphQL explorer — narrative)

1. Complete **G3a verification log** rows using the **G3a-Q*** queries (variables from a seeded contact + deal).
2. Under `CRM { contact(…) { associations {` confirm the **deal** collection; search autocomplete for any **`order`**-related collection — expect **none** on Pro; keep **deals-as-orders** until native `order` appears.
3. **Optional (CRM API):** Private app **Associations API** — list association type IDs between **order** and **contact** for automation only (not required for G3a).

### Theme `fields.json` (native portal / KB URLs)

HubSpot **theme** `fields.json` does not support **`text`**, **`link`**, or **`url`** for marketer-editable paths. Any such fields were **removed**; **`portal-sidebar.module`** uses **module** URL fields (see `theme/modules/portal-sidebar.module/fields.json`) or HubL fallbacks **`/customer-portal`** and **`/knowledge-base`**. Full ops checklist, KB categories, and email alignment: **Phase 7** below.

**Phase 7 detail:** native KB + Service customer portal + email alignment — see **Phase 7 — Native Knowledge Base, Service customer portal, email (#51–#53)** below (categories, pipeline, notification mapping, repo vs HubSpot-admin split).

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

---

## Phase 6 — Membership access & workflows (GitHub **#49–#50**, Agent **A3**)

**Quality gate:** **G5** in `IMPLEMENTATION_PLAN_SUBAGENTS.md` — logged-out user cannot read gated portal content; member in **Portal Customers** can. **G5** in `docs/cms-customer-portal-plan.md` — same intent for `/portal/*` after system templates + gates exist.

### Target portals (UI work)

| Portal | Role |
|--------|------|
| **50966981** | Primary build / verification account (see *Portal orchestration* in `docs/AGENT_PROMPT.md`). |
| **51315176** | Optional second CLI account — use only if configured and entitlements (private content / memberships) match; do **not** assume sandbox features. |

### Already specified in repo (avoid duplicate work)

| Item | Where |
|------|--------|
| **Contact property** `is_portal_customer` (group **`portal`**, booleancheckbox) | `scripts/hubspot_create_portal_contact_properties.py` → **`./scripts/op_env.sh npm run portal:hubspot-props`** (CRM Properties API — **hubspot-api-first**). |
| **Onboarding completion** | **`onboarding_completed`** is documented as a **key inside** `portal_hair_profile_json` (see table above). Prefer **form #43** + workflows that set **contact properties**, not custom objects. |
| **Customer page templates** to gate | `theme/templates/portal-*.html` (dashboard, orders, order detail, profile, customization, shop, billing, invoices, settings). **Canonical IA** (`docs/cms-customer-portal-plan.md`, `docs/AGENT_PROMPT.md`) **removed** custom CMS **Help / Support / Locations** pages — do **not** recreate `/portal/help`, `/portal/support`, `/portal/locations` for gating; use native **Knowledge Base** + **Customer Portal** links from nav. |
| **System / membership templates** | `theme/templates/system/membership-login.html`, `membership-register.html`, `membership-reset-password-request.html`, `membership-reset-password.html`, plus `404.html` / `500.html`. Issue **#49** text that says `password-reset.html` is **obsolete** — HubSpot UI should point at the **theme filenames above**. |

### HubSpot **UI** steps (no stable automation in repo — exception to API-first)

Perform in **Design Manager / CMS** for the **same portal** you upload the theme to (**50966981** unless you intentionally use **51315176**):

1. **Enable private (membership) content** for the website — HubSpot: **Settings → Website → Private content** (wording may vary by product bundle).
2. Create membership **access group** named **Portal Customers** (match issue **#49**).
3. **Gate pages:** For every **published** website page that uses a portal template (routes under your chosen URL structure, typically `/portal/...`), set access so only **Portal Customers** (and staff as needed) can view. Re-check after new pages are created.
4. **Assign system templates** for login, registration, and password reset flows to the **`customer-portal`** theme files listed above (login → `membership-login.html`, registration → `membership-register.html`, password reset request → `membership-reset-password-request.html`, password reset → `membership-reset-password.html`).
5. **Test:** logged-out visitor → redirected to login; contact **in** group → can load gated pages; contact **not** in group → denied or redirected per HubSpot behavior.

Optional: **active lists** + workflows to **add contacts to the access group** when `is_portal_customer` is true (or when a registration form is submitted), so CRM and membership stay aligned.

### Dev-testable now vs production-only (**#5**, release **#54–#57**)

| Topic | Dev / test now (no custom domain) | Production-only / deferred |
|--------|-----------------------------------|----------------------------|
| Access groups, page-level gates, system template assignment | **Yes** on **50966981** using HubSpot’s **default / connected** CMS hostname (and theme **`customer-portal`** upload). | Same mechanics; cutover checklist in **#54–#57**. |
| **Custom membership domain + DNS + SSL** | **Not required** to validate G5-style behavior on the HubSpot-provisioned host. | **#5** — vanity domain, DNS, SSL for **brand** URL; coordinate with A0 / A15. |
| End-to-end “customer bookmarks **brand** portal URL” | **Partial** until **#5** (and release issues) complete. | Full production URL + monitoring per **#54–#57**. |

### GitHub **#50** — workflow content (supersede custom-object AC)

Issue **#50** still mentions **HairProfile** and **CustomerPlan** **custom objects**. For Portal 2.0 go-live, **`IMPLEMENTATION_PLAN_SUBAGENTS.md`** and **`AGENT_PROMPT.md` §1** **supersede** that: **no** custom objects for hair profile or “customer plan” — use **`portal_hair_profile_json`**, **`portal_saved_templates_json`**, subscription/billing contact fields, and **native** commerce where applicable.

**Recommended workflows (high level):**

1. **Registration:** Trigger on membership registration / agreed form submit → **add to Portal Customers** access group → set **`is_portal_customer`** = true → welcome email → internal notification (optional).
2. **Profile completed:** Trigger on hair profile form submit (**#43**) → ensure **`onboarding_completed`** is true inside **`portal_hair_profile_json`** (via form mapping or a workflow step that updates the property — avoid maintaining duplicate boolean fields unless ops require it).

Close **#49 / #50** when UI checklists above are done **or** tick “dev complete on 50966981” and leave “production domain” explicitly tracked on **#5** / **#54–#57**.

---

## Phase 7 — Native Knowledge Base, Service customer portal, and email (GitHub **#51–#53**, Agent **A14**)

**Plan refs:** **`IMPLEMENTATION_PLAN_SUBAGENTS.md`** §3 (**A14**), §4 **Wave 5**, §5 (P7). **`AGENT_PROMPT.md`** *Live-theme note*: do **not** restore CMS templates **`portal-support`**, **`portal-help`**, or custom `/portal/help` / `/portal/support` pages; help and ticketing use **HubSpot-native** Knowledge Base + Service Hub **customer portal**.

### Theme integration (repo)

| Artifact | Role |
|----------|------|
| `theme/modules/portal-sidebar.module/fields.json` | **`customer_portal_url`**, **`knowledge_base_url`** (`text`: relative path or full URL), **`support_label`**, **`knowledge_base_label`**, **`brand_title`**. |
| `theme/modules/portal-sidebar.module/module.html` | Defaults when empty: **`/customer-portal`**, **`/knowledge-base`**. |
| `theme/templates/partials/portal-primary-nav.html` | Sidebar links for Support + Knowledge base (**#51** “Add KB link to portal sidebar” / **#30** chrome). |

**Design Manager:** On layouts using **`portal-sidebar`**, set module fields to the **live** Service Hub customer portal URL and KB home URL HubSpot provides for the site (paths often match defaults — **verify** per account).

### Knowledge Base — canonical categories (**#51**)

Use these **category labels** when creating the native KB (migration from Notion / legacy DB should map into this structure):

| Order | Category |
|-------|----------|
| 1 | Getting Started |
| 2 | Hair Systems |
| 3 | Ordering |
| 4 | Billing & Payments |
| 5 | Customization |
| 6 | Account Settings |
| 7 | Troubleshooting |

**HubSpot admin (human):** Enable Knowledge Base in Service Hub, create categories above, migrate articles, configure KB domain/host, branding, search, and article feedback (**#51** checklists). No API automation in this repo for KB content.

### Service Hub customer portal + tickets (**#52**)

**HubSpot admin (human):**

- Enable **Customer Portal** in Service Hub; align hostname with membership / production plan (**#5**, **#54–#57**).
- **Ticket pipeline (ops name):** **Customer Support** with stages **New → In Progress → Waiting on Customer → Resolved → Closed** (internal stage IDs may differ — match these **labels** in UI for staff and reporting).
- Style the Service portal to match brand (HubSpot Service portal theming).
- Link portal access to contacts / membership expectations per HubSpot docs and **#49** (**Portal Customers**).
- **Depends:** support ticket form **#45**; membership **#49**.
- **Test:** customer submits ticket → agent responds → customer sees update in Service portal.

### Email and notifications (**#53**)

**Preference properties (Contact, group `notification_preferences`):** `notify_order_updates`, `notify_production_reminders`, `notify_marketing` — see **Contact properties (billing, notifications, portal — issue #11)** above. Settings surface: **`settings.graphql`** + form **#48**; workflows should **branch on these booleans** where the issue lists a preference-sensitive email.

**Suggested workflow inventory** (create and name clearly in HubSpot for handoff; exact enrollment triggers depend on objects and **#43–#48** forms):

| # | Event (conceptual) | Customer email / action | Respect preference |
|---|---------------------|---------------------------|--------------------|
| 1 | Registration / portal access | Welcome | — |
| 2 | Hair profile submitted | Profile complete | — |
| 3 | Order created | Order confirmation | `notify_order_updates` |
| 4 | Order / deal status change | Order status update | `notify_order_updates` |
| 5 | Production milestone | Production milestone | `notify_production_reminders` |
| 6 | Invoice available | Invoice ready | *(define vs billing emails)* |
| 7 | Ticket created | Support ticket created | — |
| 8 | Ticket updated (agent reply) | Support ticket updated | — |
| 9 | Subscription / plan change | Plan change confirmation | — |

**HubSpot admin (human):** Email templates, workflow enrollments, sender domain + DKIM, test sends. Marketing vs transactional tooling follows HubSpot product boundaries — document the chosen approach for ops.

### A14 “done” split — repo vs HubSpot (**IMPLEMENTATION_PLAN_SUBAGENTS.md** §3, §7)

| Owner | Criteria |
|-------|----------|
| **Repo (this batch)** | Registry + theme pattern documented; KB category names frozen here; notification matrix + preference gates documented; **no** deprecated CMS help/support routes added under `theme/templates/`. |
| **HubSpot admin** | **#51–#53** UI checklists (KB, Service portal, pipeline, emails, workflows); Design Manager **`portal-sidebar`** URL fields set to live KB + customer portal paths; GitHub issues closed when AC met. |

**Gate note:** **G6** (forms **#43–#48**) and **#45** / **#49** precede many **#53** end-to-end tests; **G7** is **A15** release. A14 delivers **documentation + theme link wiring**; full closure of **#51–#53** may require prior form and membership work per issue bodies.
