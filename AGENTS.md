# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Hair Solutions Customer Portal — a Next.js 14 (App Router) + TypeScript + Prisma + PostgreSQL full-stack web app. Single service, no monorepo.

### Services

| Service | How to run | Notes |
|---------|-----------|-------|
| PostgreSQL | `sudo pg_ctlcluster 16 main start` | Must be running before the app starts. DB: `hair_solutions_portal`, user: `devuser`/`devpass` |
| Next.js dev server | `npm run dev` (port 3000) | Login page at `/login`, dashboard at `/app`. No root page — `/` returns 404. |

### Key commands

See `package.json` scripts. Most useful:

- `npm run dev` — start dev server
- `npm run lint` — ESLint (uses ESLint 8 + `next/core-web-vitals`)
- `npm run build` — production build (will fail on pre-existing unescaped-entity lint errors; compilation itself succeeds)
- `npm run db:push` — push Prisma schema to database
- `npm run db:seed` — seed database with test data (idempotent for users via upsert, but creates new orders/products on repeat runs)
- `npm run db:studio` — Prisma Studio GUI on port 5555

### Gotchas

- **nodemailer version**: The original `package.json` specifies `nodemailer@^7.1.0` which does not exist in the npm registry (max 7.x is 7.0.13). It has been corrected to `^7.0.13`.
- **`@next-auth/prisma-adapter`**: Required at runtime but was not listed in `package.json`. It has been added as a dependency.
- **ESLint**: Was not listed in `devDependencies`. `eslint@8` and `eslint-config-next@14.1.0` have been added, along with `.eslintrc.json` (`next/core-web-vitals`). ESLint 9 is **not** compatible with Next.js 14.1.0.
- **`npm install` requires `--legacy-peer-deps`** due to a peer dependency conflict between `nodemailer` and `next-auth`.
- **Build lint errors**: `npm run build` fails at the linting stage due to pre-existing `react/no-unescaped-entities` errors in several pages. The TypeScript compilation itself succeeds. `npm run dev` is unaffected.
- **No lockfile**: The repo has no `package-lock.json` committed. One is generated on `npm install`.

### Seeded test accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@hairsolutions.co` | `admin123` |
| Support | `support@hairsolutions.co` | `support123` |
| Customer | `demo@example.com` | `demo123` |

### HubSpot sync architecture

The portal is designed to work with HubSpot's native **Order** object as the single data source per customer. A HubSpot workflow denormalizes fields from Contact, Deal, Ticket, and Line Item objects onto Order properties prefixed with `portal_*`. This means the agent only needs one API call (fetch orders for a contact) instead of querying 4-5 separate objects.

Key files:
- `lib/hubspot.ts` — HubSpot API client and TypeScript types for all portal order properties
- `design/hubspot-sync/PROPERTY_MAPPING.md` — full source→target mapping, workflow definitions, and what the customer sees
- `design/hubspot-sync/hubspot-properties.json` — property definitions for creating custom properties in HubSpot

The local dev database (Prisma/PostgreSQL) works independently and does not require HubSpot. Set `HUBSPOT_ACCESS_TOKEN` in `.env` to enable live HubSpot API calls.

### External integrations (all optional for local dev)

Stripe, Shopify, Notion, HubSpot, and SMTP are optional. Their clients degrade gracefully (return `null` or empty arrays) when credentials are missing. Only `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` are required in `.env`.
