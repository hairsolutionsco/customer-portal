# Membership GraphQL (this theme)

## Purpose

On **private (membership) pages**, HubSpot runs GraphQL queries **as the logged-in contact**. Queries under `theme/data-queries/` load CRM-backed data for dashboard, orders, profile, billing, etc.

This doc adapts the legacy **`docs/AGENT_PROMPT.md` §6** pattern to **this** tree: **contact-first**, **deals-as-orders mirror**, and **no dependency** on custom objects in CMS GraphQL.

## Non-negotiable: scope every per-customer query

Every query that returns **this member’s** CRM graph must filter through the membership contact:

1. Declare a variable, typically `$contact_id: String!`.
2. In the query file header (HubSpot convention), bind it to the visitor:

```graphql
# $contact_id: {{ request.contact.contact_vid || '' }}
```

3. Resolve the contact once:

```graphql
CRM {
  contact(uniqueIdentifier: "id", uniqueIdentifierValue: $contact_id) {
    # fields + associations
  }
}
```

If `contact_vid` is empty (edge cases), HubSpot still validates the query shape; pages should remain **membership-gated** so production traffic is logged-in.

## Deals as “orders” (Professional GraphQL)

Native Commerce **`order`** may exist in **CRM** but is **often absent** from **membership GraphQL** on Content Hub Professional. This theme uses **deals** associated to the contact as the **read model** for orders UI.

In `dashboard.graphql` / `orders_list.graphql` / `order_detail.graphql` the collection is exposed under a **stable GraphQL alias** so HubL stays readable:

```graphql
associations {
  p_order_collection__primary: deal_collection__contact_to_deal {
    items { ... }
    total
  }
}
```

**Important:** `deal_collection__contact_to_deal` is the typical auto-generated association field name — it can differ per portal. **Verify** in the Design Manager GraphQL explorer for portal **50966981** and update all three queries consistently. Record results in [`../../data/SCHEMA_REGISTRY.md`](../../data/SCHEMA_REGISTRY.md) (A9a checklist).

Mapping in queries uses GraphQL **aliases** to present deal fields as order-like columns (e.g. `product_name: dealname`, `status: dealstage`).

## What to verify in the GraphQL explorer (before shipping query changes)

1. Open a **membership** template context (or HubSpot’s GraphQL tool for the theme).
2. Use a **test contact VID** with at least one associated **deal**.
3. Confirm:
   - `contact → associations →` **deals** field name matches the query.
   - Optional: `ticket`, `quote`, and other collections **you plan to add** (per canonical plan waves).
4. If a field is **FieldUndefined** on upload, either the property is not exposed to CMS GraphQL yet or the spelling is wrong — fix in HubSpot (properties) or in the query.

## HubDB in GraphQL vs HubL

Legacy docs sometimes show `HUBDB { table(...) { rows } }` in `.graphql` files. On many portals (including **50966981** per registry notes), **HubDB is not exposed** on membership GraphQL that way.

**This theme’s rule:**

- **Per-contact CRM** → `data-queries/*.graphql` + `dataQueryPath` on templates.
- **Shared catalog / plans** → `hubdb_table_rows(theme.hubdb.*_table_id)` in modules, plus table IDs in `fields.json` → see [04-hubdb-and-catalog.md](./04-hubdb-and-catalog.md).

`products.graphql` may still carry a **light** contact selection for consistency; the **product grid** does not rely on `data_query.data.HUBDB` for rows.

## Official pattern reference

HubSpot’s **[recruiting-agency-graphql-theme](https://github.com/HubSpot/recruiting-agency-graphql-theme)** remains the best **structural** reference (membership + associations + forms). **Replace** its custom-object names with **your** portal’s verified association labels and with **contact properties** where this program stores hair profile / JSON mirrors.

## Further reading

- HubSpot: [Query HubSpot data using GraphQL](https://developers.hubspot.com/docs/theme/start-building/features/data-driven-content/graphql/query-hubspot-data-using-graphql)
- HubSpot: [Use GraphQL data in website pages](https://developers.hubspot.com/docs/theme/start-building/features/data-driven-content/graphql/use-graphql-data-in-your-website-pages)
