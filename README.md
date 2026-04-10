# Customer Portal 2.0 — HubSpot CMS (membership)

This repository’s **product** is a **HubSpot CMS–hosted** customer portal: theme (HubL + GraphQL), membership pages, HubDB-backed catalog/locations, and CRM data on **contacts** (hair profile, templates) plus **native commerce** orders/invoices where available. Work is orchestrated from **`HANDOFF_PROMPT.md`** and built to the spec in **`AGENT_PROMPT.md`** / **`docs/AGENT_PROMPT.md`**.

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

## Legacy custom app (archived docs only)

The repo previously centered on a **custom Next.js** app deployed via **Railway / Vercel / Hostinger**. That **deployment and local Postgres** documentation is **archived** so it does not compete with the CMS program:

**`docs/archive/legacy-next-hostinger-railway-app/`** — `README.md`, `runbooks/` (old `docs/app/`), and **`REPO_ROOT_APP_ARTIFACTS.md`** listing Next/Docker/Railway files still at repo root for tooling or optional local dev.

If you only care about CMS: ignore `app/`, root `Dockerfile`, `railway*.toml/json`, and `vercel.json` unless you are explicitly reviving the old stack.

## Operations log

**`KNOWN_ISSUES.md`** — recurring HubSpot CLI, GraphQL, HubDB, and `op_env` fixes (current program).
