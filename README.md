# Customer Portal — one roof

Everything for this product lives under **`customer-portal/`** inside Design Manager.

| Folder | What it is |
|--------|------------|
| **`cms/`** | HubSpot **CMS theme** (HubL, GraphQL, modules, CSS). Upload target name stays **`hair-solutions-portal`** in HubSpot unless you rename it in CLI. |
| **`app/`** | **Next.js** companion app (Prisma, API routes, legacy / parallel hosting). |
| **`data/`** | **HubDB seeds**, optional **schema JSON**, **`SCHEMA_REGISTRY.md`** — synced via API/scripts, not uploaded as theme files. |
| **`docs/`** | Program specs, handoff, agent prompts; **`docs/app/`** = deploy/runbooks for **`app/`**. |
| **`ops/`** | Ship ritual, GitHub exports, HubSpot props/HubDB Python, `op_env`. |
| **`infra/`** | Docker (`Dockerfile`), Hostinger/Vercel/Railway shell helpers, env templates. Build context for Docker is **this** `customer-portal/` directory. |
| **`docker-compose.hostinger.yml`** | At this root; pairs with **`infra/Dockerfile`**. |

### Commands

- **Next.js:** `cd app && npm run dev` (or `npm run dev` from Design Manager root — it delegates here).
- **Theme validate / upload:** Design Manager root `npm run portal:build` / `portal_task_complete.sh` (see parent `README.md`).
- **Docker:** from **`customer-portal/`**:  
  `docker build -f infra/Dockerfile -t customer-portal .`  
  `docker compose -f docker-compose.hostinger.yml up -d`
