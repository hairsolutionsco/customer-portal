# Legacy app artifacts still present at repo root

These paths support the **old custom Next.js portal** and/or shared **npm tooling** (e.g. `portal:verify` may still typecheck app code). They are **not** part of the HubSpot CMS upload surface.

| Area | Paths (typical) | Notes |
|------|-----------------|--------|
| Next.js app | `app/`, `middleware.ts`, `next.config.js`, `public/` | Optional local dev; may be trimmed later if you go CMS-only in this repo. |
| UI shared with old app | `components/`, `lib/` | Used by Next routes; not uploaded as HubSpot theme. |
| Node / Prisma | `package.json`, `package-lock.json`, `prisma/`, `postcss.config.js`, `tailwind.config.ts`, `tsconfig.json` | `portal:*` scripts and Prisma hooks. |
| VPS / PaaS deploy | `Dockerfile`, `docker-compose.hostinger.yml`, `infra/`, `hostinger.env.example` | Hostinger / container experiments. |
| Railway | `railway.json`, `railway.toml`, `railway-deploy.sh` | Legacy Railway deploy. |
| Vercel | `vercel.json`, `deploy-to-vercel.sh` | Legacy Vercel deploy. |
| Local bootstrap | `setup-local.sh` | Old app local setup. |

**CMS upload target:** `hair-solutions-portal/` (and `cms/` if used). **Data:** `data/`. **Automation:** `scripts/`, `ops/`.
