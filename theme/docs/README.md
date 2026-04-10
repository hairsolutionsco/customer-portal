# Hair Solutions portal theme — CMS reference (`theme/docs/`)

Authoritative **orchestration** and gates: [`../../docs/cms-customer-portal-plan.md`](../../docs/cms-customer-portal-plan.md).

Authoritative **IDs, HubDB table IDs, GraphQL verification checklist**: [`../../data/SCHEMA_REGISTRY.md`](../../data/SCHEMA_REGISTRY.md).

This folder is **repo-only** documentation for developers and agents. It is **not** uploaded to HubSpot (see [`../.hsignore`](../.hsignore)).

## Contents

| Doc | Purpose |
|-----|---------|
| [01-theme-layout.md](./01-theme-layout.md) | What lives where under `theme/` (queries, modules, layouts, fields). |
| [02-membership-graphql.md](./02-membership-graphql.md) | How membership GraphQL works in this theme: `contact_vid`, deals-as-orders, explorer verification, limits. |
| [03-templates-and-data-query.md](./03-templates-and-data-query.md) | `dataQueryPath`, `data_query` in modules, layouts (`portal.html` / `portal-shell.html`), dynamic pages. |
| [04-hubdb-and-catalog.md](./04-hubdb-and-catalog.md) | Why catalog data uses HubL + `hubdb_table_rows` and theme `hubdb` fields (vs GraphQL `HUBDB`). |
| [05-forms-and-writes.md](./05-forms-and-writes.md) | Writes: HubSpot Forms only; no bespoke POST from HubL. |

## Legacy sources this set replaces (for `theme/` work)

- [`../../docs/AGENT_PROMPT.md`](../../docs/AGENT_PROMPT.md) §6–§8 — adapted here for **`theme/`** paths, **deals-as-orders**, and **no locations** route.
- [`../../data/SCHEMA_REGISTRY.md`](../../data/SCHEMA_REGISTRY.md) — still the live registry; these docs explain how the theme implements it.
- HubSpot reference: [recruiting-agency-graphql-theme](https://github.com/HubSpot/recruiting-agency-graphql-theme) — pattern library for membership + GraphQL + forms.

## Quick facts (portal **50966981**, Content Hub Professional)

- Membership GraphQL exposes standard CRM slices on private pages (e.g. **contact**, **deal**, **ticket**, **quote**, **line_item**) — **not** a guarantee for native **`order`** / **`invoices`**.
- **Orders in the UI** today use **deals** associated to the contact, with a GraphQL alias **`p_order_collection__primary`** → verify the real association name in the explorer (see §A9a in the canonical plan).
- **HubDB** is often **not** available on membership GraphQL as `HUBDB.table`; this theme reads product/plan tables with **`hubdb_table_rows(theme.hubdb.*_table_id)`** in modules.
