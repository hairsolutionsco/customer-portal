# Legacy Next.js app → CMS portal (reference only)

This folder captures **product and vocabulary context** from the old **Next.js** customer portal (`app/`, root `components/`, `lib/`, `prisma/`) so agents and humans building the **HubSpot CMS** theme do not need to open untracked source trees for basic alignment.

## Authority

| Source | Role |
|--------|------|
| `data/SCHEMA_REGISTRY.md` | **Authoritative** HubSpot storage, GraphQL paths, HubDB, contact JSON contracts. |
| `cms/` (theme, `data-queries/*.graphql`) | **Authoritative** for what ships in the portal theme. |
| **This folder** | **Non-authoritative** UX labels, nav order, Prisma-era enums, and API-route intent. If anything conflicts, fix the theme or registry—not these notes. |

## Files

| File | Contents |
|------|----------|
| [NAV_AND_TEMPLATE_MAP.md](./NAV_AND_TEMPLATE_MAP.md) | Sidebar labels and route paths mapped to `portal-*.html` templates and CMS modules. |
| [DASHBOARD_AND_WIDGETS.md](./DASHBOARD_AND_WIDGETS.md) | Dashboard copy, stats, quick actions, production alert behavior. |
| [PRISMA_DOMAIN_VOCABULARY.md](./PRISMA_DOMAIN_VOCABULARY.md) | Enums and model fields from `prisma/schema.prisma` → HubSpot / JSON / HubDB equivalents. |
| [INTEGRATIONS_REFERENCE.md](./INTEGRATIONS_REFERENCE.md) | Legacy API routes and webhooks; what the CMS portal should replace with GraphQL, HubSpot, or Workers. |

## Where the old code lives

The **App Router** tree under repo-root `app/` is **gitignored** (see root `.gitignore`). The files above are the durable extract; open legacy TSX only for edge-case detail.
