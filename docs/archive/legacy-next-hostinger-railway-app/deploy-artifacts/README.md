# Legacy deploy artifacts (Next.js app)

Docker, Hostinger Compose, Railway, and Vercel configs for the **old custom app**. Run all paths from the **customer-portal repo root**.

## Docker (Hostinger)

```bash
docker build -f docs/archive/legacy-next-hostinger-railway-app/deploy-artifacts/Dockerfile -t customer-portal .
docker compose -f docs/archive/legacy-next-hostinger-railway-app/deploy-artifacts/docker-compose.hostinger.yml up -d
```

## Railway / Vercel / local bootstrap

- **`railway.json`**, **`railway.toml`**, **`railway-deploy.sh`** — Railway.
- **`vercel.json`**, **`deploy-to-vercel.sh`** — Vercel.
- **`setup-local.sh`** — root-level legacy local Next/Prisma bootstrap (see also **`infra/setup-local.sh`** if you need the copy that lived under `infra/`).

## `infra/` subfolder

The former repo-root **`infra/`** directory is preserved here as **`infra/`** (scripts + alternate Dockerfile + `.env.railway.template` + `hostinger.env.example`).
