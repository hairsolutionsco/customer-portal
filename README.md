# Customer Portal 2.0 — HubSpot CMS (membership)

This repository’s **product** is a **HubSpot CMS–hosted** customer portal: theme (HubL + GraphQL), membership pages, HubDB-backed catalog/locations, and CRM data on **contacts** (hair profile, templates) plus **native commerce** orders/invoices where available. Work is orchestrated from **`HANDOFF_PROMPT.md`** and built to the spec in **`AGENT_PROMPT.md`** / **`docs/AGENT_PROMPT.md`**.

## History — app first, CMS portal now

This project **began as a custom customer portal application** (Next.js, Prisma/PostgreSQL, auth, Stripe/Shopify integrations) with deployment experiments on **Railway**, **Vercel**, and a **Hostinger VPS** (Docker). That stack is **no longer the direction of the product**.

The program **pivoted to Portal 2.0**: a **full HubSpot CMS** membership experience (uploadable theme, native CRM/HubDB alignment, ship ritual and API scripts). You should treat **`hair-solutions-portal/`** + **`data/`** + **`scripts/`** / **`ops/`** as the **source of truth** for what we ship. Remaining **Next.js** layout at the repo root (`app/`, `package.json`, `prisma/`, etc.) is **legacy scaffolding** kept mainly for shared `npm run portal:*` tooling and optional local experiments — not for production CMS delivery.

## Where to work

| Path | Purpose |
|------|---------|
| **`hair-solutions-portal/`** | Uploadable CMS theme (modules, templates, `src/data-queries`, CSS, JS). |
| **`cms/`** | Additional CMS theme tree if used alongside or instead of legacy layout. |
| **`data/`** | `SCHEMA_REGISTRY.md`, HubDB seed JSON, optional schema reference — synced via API, not theme upload. |
| **`scripts/`** · **`ops/`** | Ship ritual, GitHub issue export, HubSpot props/HubDB Python, `op_env.sh`. |
| **`.hubspot-theme-fetch/`** | Optional mirror of fetched theme assets (if used in your workflow). |
| **`docs/`** | Agent prompts, plans, skills, layout references, **`docs/cms-legacy-context/`** (IA/copy from the old app). |

### Commands (CMS + automation)

- **Theme build / verify:** `npm run portal:build`, `npm run portal:verify` (see `package.json` — may still typecheck legacy Next code).
- **Ship / upload:** `./scripts/op_env.sh ./scripts/portal_task_complete.sh "type(scope): summary"` when secrets are required; otherwise `./scripts/portal_task_complete.sh` (see **`HANDOFF_PROMPT.md`**).
- **CRM properties / HubDB:** `./scripts/op_env.sh npm run portal:hubspot-props`, `portal:hubdb-sync`.

## Legacy custom app (archived docs + deploy configs)

Deploy runbooks, Docker Compose, Railway/Vercel configs, and the former **`infra/`** tree are under **`docs/archive/legacy-next-hostinger-railway-app/`** (`README.md`, **`runbooks/`**, **`deploy-artifacts/`**, **`REPO_ROOT_APP_ARTIFACTS.md`**) so they do not compete with the CMS program.

If you only care about CMS: ignore `app/` and root Node/Prisma unless you are explicitly reviving the old Next stack.

## Operations log

**`KNOWN_ISSUES.md`** — recurring HubSpot CLI, GraphQL, HubDB, and `op_env` fixes (current program).
