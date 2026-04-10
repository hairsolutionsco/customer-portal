# Legacy API routes and integrations (reference)

The old Next app exposed **Route Handlers** under `app/**/api/`. The **CMS membership portal** should not depend on these paths; use **HubSpot GraphQL**, **HubL**, **workflows**, and optional **Workers** (`docs/serverless-samples/`) instead.

## Auth and account

| Legacy route area | Purpose | CMS / HubSpot direction |
|-------------------|---------|-------------------------|
| `api/auth/[...nextauth]` | Session provider (credentials, JWT) | **HubSpot membership** (system templates). |
| `api/auth/signup`, `forgot-password`, `change-password` | Account lifecycle | Membership registration + HubSpot password reset flows; or CRM workflows. |

## Profile

| Legacy route | Purpose | CMS direction |
|--------------|---------|---------------|
| `api/profile` | Generic profile CRUD | Contact property updates via **forms** or **private app** (serverless/Worker), not theme-only if writes needed. |
| `api/profile/hair-profile` | Hair profile payload | **Single** `portal_hair_profile_json` on contact; validate against `data/schemas/hair_profile.json`. |

## Webhooks (server-side)

| Route | Source | Purpose | CMS-era note |
|-------|--------|---------|--------------|
| `api/webhooks/shopify` | Shopify | Order/product sync into Postgres | Sync targets become **HubSpot orders/contacts/deals** via integration or Worker; **verify signatures**. |
| `api/webhooks/stripe` | Stripe | Subscriptions, invoices | Use Stripe + HubSpot **data sync** or custom Worker; portal reads **billing** from CRM/JSON. |

## Client libraries (`lib/`)

| Module | Role | CMS direction |
|--------|------|---------------|
| `lib/prisma.ts` | DB client | **Not used** in theme. |
| `lib/auth.ts` / `auth-utils.ts` | NextAuth, RBAC | **Membership + HubSpot roles** (groups, permissions). |
| `lib/shopify.ts` | Admin API | Background jobs / Workers; catalog in **HubDB** for portal display. |
| `lib/stripe.ts` | Billing | Links, Customer Portal; amounts on **invoice** / deal / JSON mirror. |
| `lib/notion.ts` | Help / personal pages | Optional; replace with KB or CMS content. |

## Security practices to preserve

- **Webhook signature verification** (Stripe, Shopify) on any Worker that replaces the old routes.
- **No secrets in theme**; tokens stay in **private apps** / **1Password** / **Worker** env (see `ops/scripts/op_env.sh` and workspace rules).
