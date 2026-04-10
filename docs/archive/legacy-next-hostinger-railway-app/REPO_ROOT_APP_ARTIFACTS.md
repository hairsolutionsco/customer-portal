# Legacy app code still at repo root (not CMS theme)

The **HubSpot CMS** upload target is **`hair-solutions-portal/`** (and related **`cms/`**). These paths are **not** uploaded as theme files; they exist for the old **Next.js** stack and shared Node tooling.

| Area | Paths (typical) | Notes |
|------|-----------------|--------|
| Next.js app | `app/`, `middleware.ts`, `next.config.js`, `public/` | Optional local dev. |
| UI / libs | `components/`, `lib/` | Used by Next routes. |
| Node / Prisma | `package.json`, `package-lock.json`, `prisma/`, `postcss.config.js`, `tailwind.config.ts`, `tsconfig.json` | `portal:*` scripts; Prisma postinstall. |

**Moved to archive:** Docker, Hostinger Compose, Railway, Vercel, `setup-local.sh`, and the old **`infra/`** tree → **`docs/archive/legacy-next-hostinger-railway-app/deploy-artifacts/`**.

**Still under `app/` (if present):** e.g. `app/railway.json` — legacy platform hints for the Next app, not used for CMS.

**CMS + automation:** `hair-solutions-portal/`, `data/`, `scripts/`, `ops/`.
