# Customer Portal 2.0 — HubSpot CMS (membership)

This repository’s **product** is a **HubSpot CMS–hosted** customer portal: theme (HubL + GraphQL), membership pages, HubDB-backed catalog/locations, and CRM data on **contacts** (hair profile, templates) plus **native commerce** orders/invoices where available. **Lead-agent orchestration** (subagent grid, next-session snapshot, paste template) lives in **`docs/AGENT_PROMPT.md`** → *Portal orchestration (lead agent)*; **technical spec** in **`AGENT_PROMPT.md`** / **`docs/AGENT_PROMPT.md`**; **canonical product plan** in **`docs/cms-customer-portal-plan.md`**.

## History — app first, CMS portal now

This project **began as a custom customer portal application** (Next.js, Prisma/PostgreSQL, auth, Stripe/Shopify integrations) with deployment experiments on **Railway**, **Vercel**, and a **Hostinger VPS** (Docker). That stack is **no longer the direction of the product**.

The program **pivoted to Portal 2.0**: a **full HubSpot CMS** membership experience (uploadable theme, native CRM/HubDB alignment, ship ritual and API scripts). You should treat **`theme/`** + **`data/`** + **`scripts/`** / **`ops/`** as the **source of truth** for what we ship. Remaining **Next.js** layout at the repo root (`app/`, `package.json`, `prisma/`, etc.) is **legacy scaffolding** kept mainly for shared `npm run portal:*` tooling and optional local experiments — not for production CMS delivery.

## Where to work

| Path | Purpose |
|------|---------|
| **`theme/`** | **Canonical** HubSpot CMS theme (modules, templates, `data-queries/`, CSS, JS). Upload via `portal_task_complete.sh` → Design Manager folder **`customer-portal`** (default; override with `HUBSPOT_THEME_DEST`). |
| **`hair-solutions-portal/`** | Older theme scaffold; do **not** treat as the primary upload surface. |
| **`data/`** | `SCHEMA_REGISTRY.md`, HubDB seed JSON, optional schema reference — synced via API, not theme upload. |
| **`scripts/`** · **`ops/`** | Ship ritual, GitHub issue export, HubSpot props/HubDB Python, `op_env.sh`. |
| **`.hubspot-theme-fetch/`** | Optional mirror of fetched theme assets (if used in your workflow). |
| **`docs/`** | Agent prompts, plans, skills, layout references, **`docs/cms-legacy-context/`** (IA/copy from the old app). |

### Why these markdown files stay at repo root

We **archived** the old **app deploy / Postgres / Railway–Vercel–Hostinger** guides under **`docs/archive/…`** because they belong to the **pre-pivot** stack and confuse the CMS story.

These **root `.md` files are different**: they describe the **current Portal 2.0 program** (how agents and humans build and ship the **CMS** portal). They were left at the repository root on purpose:

| File | Why it stays here |
|------|-------------------|
| **`IMPLEMENTATION_PLAN_SUBAGENTS.md`** | Waves, gates, and agent roles for the live build — not legacy app ops. |
| **`AGENT_PROMPT.md`** | File-level technical spec at a **short path**; Cursor rules still point here. **`docs/AGENT_PROMPT.md`** adds mandatory session start, *Portal orchestration*, and monorepo path notes — treat that file as the **full** agent entry when in doubt. |
| **`KNOWN_ISSUES.md`** | Running log of HubSpot CLI, GraphQL, HubDB, and `op_env` fixes for **today’s** automation. |
| **`master-plan`** | Program-level requirements / north star (no extension by convention in this repo). |

**Practical reasons:** agents and contributors open the repo and need **stable, shallow paths** for plans and specs. **`.cursor/rules/portal-2-orchestrator.mdc`** loads orchestration from **`docs/AGENT_PROMPT.md`** so a separate root handoff file is not required.

### Commands (CMS + automation)

- **Theme build / verify:** `npm run portal:build`, `npm run portal:verify` (see `package.json` — may still typecheck legacy Next code).
- **Ship / upload:** `./scripts/op_env.sh ./scripts/portal_task_complete.sh "type(scope): summary"` when secrets are required; otherwise `./scripts/portal_task_complete.sh` (see **`docs/AGENT_PROMPT.md`** *Portal orchestration* and **`IMPLEMENTATION_PLAN_SUBAGENTS.md`** §6a).
- **CRM properties / HubDB:** `./scripts/op_env.sh npm run portal:hubspot-props`, `portal:hubdb-sync`.

## Legacy custom app (archived docs + deploy configs)

Deploy runbooks, Docker Compose, Railway/Vercel configs, and the former **`infra/`** tree are under **`docs/archive/legacy-next-hostinger-railway-app/`** (`README.md`, **`runbooks/`**, **`deploy-artifacts/`**, **`REPO_ROOT_APP_ARTIFACTS.md`**) so they do not compete with the CMS program.

If you only care about CMS: ignore `app/` and root Node/Prisma unless you are explicitly reviving the old Next stack.

## Operations log

**`KNOWN_ISSUES.md`** — recurring HubSpot CLI, GraphQL, HubDB, and `op_env` fixes (current program).
