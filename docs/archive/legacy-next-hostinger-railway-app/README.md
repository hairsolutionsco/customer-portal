# Archive: legacy custom Next.js customer portal (Hostinger / Railway / Vercel)

This folder holds **historical documentation** for the pre–Portal 2.0 stack: a **custom Next.js app** with Prisma/PostgreSQL, deployed on **Railway**, **Vercel**, or a **Hostinger VPS** (Docker). That path is **not** the current product direction.

## Current direction (source of truth)

The live program is a **HubSpot CMS–hosted** membership portal: theme and GraphQL under **`hair-solutions-portal/`** (and related **`cms/`**), CRM contact properties + HubDB via API scripts, ship ritual under **`ops/`** and **`scripts/`**. Start from the repo root **`README.md`**, **`HANDOFF_PROMPT.md`**, and **`docs/AGENT_PROMPT.md`**.

## What is here

| Path | Contents |
|------|----------|
| **`runbooks/`** | Former `docs/app/`: Vercel/Railway/local Postgres setup, testing, deployment checklists. |
| **`deploy-artifacts/`** | `Dockerfile`, `docker-compose.hostinger.yml`, Railway/Vercel configs, `setup-local.sh`, and the former **`infra/`** tree (see `deploy-artifacts/README.md`). |

Duplicate copies of those runbooks that used to sit at the **repository root** were removed; this archive is the single location for that material.

## Secrets hygiene

Archived markdown previously contained example Railway token values. Those lines are replaced with **`<YOUR_RAILWAY_TOKEN>`**. If an old token was ever committed, **rotate it in Railway** regardless.

## Legacy code and config still at repo root

The repository still contains **Next.js app code** at the root (`app/`, `package.json`, `prisma/`, etc.) so existing `npm run portal:*` automation and optional local Next dev keep working. **Docker / Railway / Vercel / Hostinger compose** files now live under **`deploy-artifacts/`** above — not at repo root. See **`REPO_ROOT_APP_ARTIFACTS.md`** for what remains at the root.

## Related context (not deploy runbooks)

- **`docs/cms-legacy-context/`** — IA, copy, and vocabulary extracted from the old app to inform the CMS build (still useful for agents).
