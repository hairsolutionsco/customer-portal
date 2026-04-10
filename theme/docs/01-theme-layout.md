# Theme layout (`theme/`)

All paths below are relative to **`customer-portal/theme/`** (uploaded to Design Manager as **`customer-portal`** unless `HUBSPOT_THEME_DEST` overrides).

| Path | Role |
|------|------|
| `theme.json` | Theme label, preview template, breakpoints. |
| `fields.json` | Theme settings groups (`portal`, `portal_layout`, `hubdb`, …). High-contention file — follow group ownership in [`cms-customer-portal-plan.md`](../../docs/cms-customer-portal-plan.md). |
| `data-queries/*.graphql` | Membership-scoped GraphQL. File **name** (no extension) is referenced from templates as `dataQueryPath: ../data-queries/<name>`. |
| `templates/layouts/base.html` | HTML shell, global CSS/JS includes, optional serverless ping hook. |
| `templates/layouts/portal.html` | Customer portal chrome; extends `portal-shell.html` (or legacy equivalent). |
| `templates/layouts/portal-shell.html` | Shared shell with `shell_mode` **customer** \| **admin** (admin nav in `modules/navigation/`). |
| `templates/portal-*.html` | Private portal pages; each declares `dataQueryPath` when GraphQL is required. |
| `templates/system/*.html` | Membership auth + error pages (`membership-login`, `membership-register`, …). |
| `templates/partials/` | Reusable fragments (breadcrumbs, empty states, pagination). |
| `modules/**/*.module/` | HubSpot modules (`module.html`, `meta.json`, `fields.json`, `module.css`). |
| `sections/` | DND sections if used. |
| `css/`, `js/` | Global styles and `main.js` (sidebar, mobile). |
| `images/` | Logos, template preview screenshots. |
| `docs/` | This reference set (ignored for upload). |

## Current GraphQL query files

As implemented under `data-queries/` (trimmed over time; **no** `locations.graphql`):

- `dashboard.graphql` — contact + **deals-as-orders** collection.
- `orders_list.graphql`, `order_detail.graphql` — same mirror pattern for list + detail.
- `hair_profile.graphql` — contact fields for profile (JSON / core fields per registry).
- `customization_templates.graphql`, `invoices.graphql`, `billing.graphql`, `settings.graphql` — contact-scoped or stubbed per property availability.
- `products.graphql` — **minimal** contact query; **catalog rows come from HubDB via HubL** (see [04-hubdb-and-catalog.md](./04-hubdb-and-catalog.md)).

## Do not treat as canonical

- `../../hair-solutions-portal/src/` — older scaffold; **`theme/`** is the superset for this program.
- Duplicate `SCHEMA_REGISTRY.md` under `hair-solutions-portal/` — use **`../../data/SCHEMA_REGISTRY.md`**.
