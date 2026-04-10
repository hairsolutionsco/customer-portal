# Portal — known issues and fixes

Living log of problems that tend to recur. Update when a new failure mode appears.

## Orchestration (canonical CMS portal plan)

- **Single build plan:** **`docs/cms-customer-portal-plan.md`** is the **only** orchestration plan for the CMS theme. Cursor agents: **portal-cms-orchestrator** (lead) and **portal-cms-build-subagent** (per-row implementer) in `.cursor/agents/`.
- **Roster vocabulary:** Theme work uses **A0a–A11** (+ splits A5a/A5b, A7a/A7b, A9a/A9b, A10a/A10b) as in `docs/cms-customer-portal-plan.md` and `docs/PORTAL_THEME_MULTI_AGENT_BUILD_PROMPT.md`. Root **`IMPLEMENTATION_PLAN_SUBAGENTS.md`** **A0–A15** is a **different** roster (CRM/HubDB/forms/ops); do not merge the two numbering schemes.
- **Nested `customer-portal/` directory (A0a):** If a duplicate portal checkout exists inside `design-manager/`, keep it **untracked** and **gitignored** via root `.gitignore` entry `customer-portal/`. Do not archive into this repo unless product asks for a `reference-themes/` snapshot.
- **Tracked `.DS_Store`:** If macOS re-introduces tracked `.DS_Store` under `theme/`, run `git rm --cached -r -- '**/.DS_Store'` and commit. (Wave 0 baseline: none were tracked in git at hygiene time.)
- **HubSpot CLI (`hs cms upload`):** v8+ namespaces CMS under `hs cms upload` (see [CMS CLI commands](https://developers.hubspot.com/docs/developer-tooling/local-development/hubspot-cli/commands/cms-commands)). This repo pins **`@hubspot/cli@^8`** as a **devDependency**; `portal_task_complete.sh` uses **`customer-portal/node_modules/.bin/hs`** when present so uploads use `hs cms upload … -m draft|publish` without relying on an outdated global v7. Global upgrade: `npm install -g @hubspot/cli@8` (Node 20+). If only legacy v7 is available, the script falls back to **`hs upload`**.
- **`op_env.sh` + `portal_task_complete`:** If the wrapper appears to hang, 1Password CLI may be waiting for approval — complete the prompt, or run upload with a working `hs` default account (`hs accounts list`) and `SKIP_GIT=1` / `SKIP_ISSUES=1` as needed.
- **A9a (GraphQL + G5b):** Complete the checklist table in `data/SCHEMA_REGISTRY.md` (“A9a verification log”) in the HubSpot GraphQL explorer for portal **50966981** before treating **G3a** / **G5b** as passed.

| Symptom | Cause | Fix |
|--------|--------|-----|
| `error: no working HubSpot token found` when running props/HubDB | `op run` did not inject a scoped private-app token | Ensure 1Password Environment exposes `HUBSPOT_PRIVATE_APP__CRM_SCHEMA__ACCESS_TOKEN` for props, `HUBSPOT_PRIVATE_APP__HUBDB__ACCESS_TOKEN` for HubDB, or `HUBSPOT_PRIVATE_APP__OPS__ACCESS_TOKEN` for shared ops. From **hubspot** repo root: `bash scripts/op_run.sh npm run portal:hubspot-props`. From **design-manager** root: `bash customer-portal/ops/scripts/op_env.sh npm run portal:hubspot-props`. |
| `list groups HTTP 401` / `EXPIRED_AUTHENTICATION` / expire time `1970-01-01` | Placeholder, revoked, or expired private app token in env | HubSpot → Settings → Integrations → Private Apps → create/rotate token. Required scopes: `crm.schemas.contacts.write` (props); add **`hubdb`** for `portal:hubdb-sync`. Update 1Password; never paste tokens into shell history. |
| `hs upload` / theme upload: GraphQL `FieldUndefined` on `crm_contact` (e.g. `portal_hair_profile_json`) | Custom contact property not created yet or not exposed to CMS GraphQL for that portal | Run portal contact props with a valid token (see row 1). Confirm field appears in HubSpot GraphQL explorer. Until then, theme may use **stub** queries (core `firstname`/`lastname`/`email` only) — see comments in `customer-portal/theme/data-queries/*.graphql`. |
| Upload fails: `FieldUndefined` on `HUBDB.products_collection` (or other `*_collection`) | HubDB table not created/published in that account | Run `portal:hubdb-sync` (needs **hubdb** scope). Restore full HUBDB blocks in `.graphql` after tables exist. |
| `npm ci` → `ENOTEMPTY` / `rmdir node_modules/...` | Parallel installs or interrupted `npm` left `node_modules` inconsistent | `rm -rf node_modules && npm ci` from `customer-portal/`. |
| `portal_automation_full` stops after verify | `SKIP_CONTACT_PROPS` / `SKIP_HUBDB_SYNC` set, or earlier step failed | Unset skip vars; fix failing step (usually token). Use `PORTAL_AUTOMATION_CONTINUE=1` or `--continue-on-error` only for diagnosis. |
| `op_env: missing .../.env` | 1Password Desktop Environment not linked at `hubspot/.env` | Per `AGENTS.md`: use 1Password Developer Environments; do not commit secrets. |
| HubSpot CLI upload works but API scripts fail | CLI uses `hs account auth`; API uses PAT from env — different credentials | Align: use a private app PAT with correct scopes in `op` env; CLI account must target the same portal if you expect one account. |
| Deal association label errors in GraphQL (`p_order_collection__primary` etc.) | Association type name differs per portal | Use CMS GraphQL explorer; update `dashboard.graphql`, `orders_list.graphql`, `order_detail.graphql` to match your portal’s contact↔deal association. |

## Quick commands

From **`hubspot/`** (monorepo root for this workspace):

```bash
bash scripts/op_run.sh npm run portal:hubspot-props
bash scripts/op_run.sh npm run portal:hubdb-sync
bash scripts/op_run.sh npm run portal:verify       # CMS theme validation only
SKIP_GIT=1 bash scripts/op_run.sh bash 99-development/design-manager/customer-portal/ops/scripts/portal_task_complete.sh --skip-git
```

From **`99-development/design-manager/`** (Design Manager project root):

```bash
bash customer-portal/ops/scripts/op_env.sh npm run portal:hubspot-props
bash customer-portal/ops/scripts/op_env.sh npm run portal:hubdb-sync
npm run portal:verify                              # CMS theme validation only
SKIP_GIT=1 bash customer-portal/ops/scripts/portal_task_complete.sh --skip-git
```

Archived Next.js tasks stay behind `legacy:*` commands such as `npm run legacy:typecheck`.

## Restoring “full” GraphQL after props + HubDB

Once properties exist in GraphQL and HubDB tables are published, re-add to queries:

- `portal_hair_profile_json`, `portal_invoices_json`, `portal_saved_templates_json`, `portal_billing_json`
- `notify_order_updates`, `notify_production_reminders`, `notify_marketing`
- HUBDB blocks in `billing.graphql`, `products.graphql` as in git history or `SCHEMA_REGISTRY.md` (locations HubDB page removed per `docs/cms-customer-portal-plan.md` A0b)

Then upload again via `portal_task_complete.sh` or `hs cms upload`.
