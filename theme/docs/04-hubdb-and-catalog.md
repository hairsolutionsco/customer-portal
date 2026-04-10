# HubDB and catalog data (HubL-first)

## Why not only GraphQL?

Legacy planning docs often assumed **`HUBDB { ... }`** blocks inside `.graphql` files. On **Content Hub Professional** membership pages, **HubDB is frequently not exposed** on the same GraphQL surface as CRM objects (see [`../../data/SCHEMA_REGISTRY.md`](../../data/SCHEMA_REGISTRY.md)).

**Automation rule (still valid):** anything membership GraphQL cannot read should be mirrored to **Contact** properties **or** read with **HubL HubDB functions** at render time.

## Pattern used in `theme/`

1. **Table IDs** are theme fields in `fields.json` under the **`hubdb`** group, e.g.:

   - `products_table_id`
   - `subscription_plans_table_id`

2. **Modules** load rows with **`hubdb_table_rows(table_id)`**:

```hubl
{% set hubdb_tid = theme.hubdb.products_table_id %}
{% set items = hubdb_table_rows(hubdb_tid) if hubdb_tid else [] %}
{% for p in items %}
  {# row fields as columns on the HubDB row object #}
{% endfor %}
```

3. **`products.graphql`** exists mainly to satisfy the template **`dataQueryPath`** and can return minimal **contact** fields; the **grid** does not depend on `data_query` for product rows.

## Subscription / billing grids

Billing modules may combine:

- **Contact** fields (plan name, dates) from GraphQL / `data_query`, and
- **HubDB** `subscription_plans` rows for comparison tables via `hubdb_table_rows(theme.hubdb.subscription_plans_table_id)`.

Keep table IDs in sync with HubSpot after `portal:hubdb-sync`; document numeric IDs in **`../../data/SCHEMA_REGISTRY.md`**.

## Locations table

The **affiliated locations** HubDB table may still exist for other channels, but the **Locations** portal route and `locations.graphql` were **removed** from this theme per [`../../docs/cms-customer-portal-plan.md`](../../docs/cms-customer-portal-plan.md). Do not reintroduce without an IA decision.

## HubDB dynamic pages (optional)

If you later expose public or private **HubDB dynamic routes**, HubSpot’s pattern uses `dynamic_page_hubdb_row` — see HubSpot docs for dynamic pages. This theme’s current shop is **not** HubDB-dynamic-page-based.
