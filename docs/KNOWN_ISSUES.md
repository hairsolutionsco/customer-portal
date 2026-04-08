# Portal — known issues and fixes

Living log of problems that tend to recur. Update when a new failure mode appears.

| Symptom | Cause | Fix |
|--------|--------|-----|
| `error: no working HubSpot token found` when running props/HubDB | `op run` did not inject a scoped private-app token | Ensure 1Password Environment exposes `HUBSPOT_PRIVATE_APP__CRM_SCHEMA__ACCESS_TOKEN` for props, `HUBSPOT_PRIVATE_APP__HUBDB__ACCESS_TOKEN` for HubDB, or `HUBSPOT_PRIVATE_APP__OPS__ACCESS_TOKEN` for shared ops. From **hubspot** repo root: `bash scripts/op_run.sh npm run portal:hubspot-props`. From **design-manager** root: `bash customer-portal/ops/scripts/op_env.sh npm run portal:hubspot-props`. |
| `list groups HTTP 401` / `EXPIRED_AUTHENTICATION` / expire time `1970-01-01` | Placeholder, revoked, or expired private app token in env | HubSpot → Settings → Integrations → Private Apps → create/rotate token. Required scopes: `crm.schemas.contacts.write` (props); add **`hubdb`** for `portal:hubdb-sync`. Update 1Password; never paste tokens into shell history. |
| `hs upload` / theme upload: GraphQL `FieldUndefined` on `crm_contact` (e.g. `portal_hair_profile_json`) | Custom contact property not created yet or not exposed to CMS GraphQL for that portal | Run portal contact props with a valid token (see row 1). Confirm field appears in HubSpot GraphQL explorer. Until then, theme may use **stub** queries (core `firstname`/`lastname`/`email` only) — see comments in `customer-portal/cms/data-queries/*.graphql`. |
| Upload fails: `FieldUndefined` on `HUBDB.products_collection` (or other `*_collection`) | HubDB table not created/published in that account | Run `portal:hubdb-sync` (needs **hubdb** scope). Restore full HUBDB blocks in `.graphql` after tables exist. |
| `npm ci` → `ENOTEMPTY` / `rmdir node_modules/...` | Parallel installs or interrupted `npm` left `node_modules` inconsistent | `rm -rf node_modules && npm ci` from `customer-portal/app`. |
| `portal_automation_full` stops after verify | `SKIP_CONTACT_PROPS` / `SKIP_HUBDB_SYNC` set, or earlier step failed | Unset skip vars; fix failing step (usually token). Use `PORTAL_AUTOMATION_CONTINUE=1` or `--continue-on-error` only for diagnosis. |
| `op_env: missing .../.env` | 1Password Desktop Environment not linked at `hubspot/.env` | Per `AGENTS.md`: use 1Password Developer Environments; do not commit secrets. |
| HubSpot CLI upload works but API scripts fail | CLI uses `hs account auth`; API uses PAT from env — different credentials | Align: use a private app PAT with correct scopes in `op` env; CLI account must target the same portal if you expect one account. |
| Deal association label errors in GraphQL (`p_order_collection__primary` etc.) | Association type name differs per portal | Use CMS GraphQL explorer; update `dashboard.graphql`, `orders_list.graphql`, `order_detail.graphql` to match your portal’s contact↔deal association. |

## Quick commands

From **`hubspot/`** (monorepo root for this workspace):

```bash
bash scripts/op_run.sh npm run portal:hubspot-props
bash scripts/op_run.sh npm run portal:hubdb-sync
bash scripts/op_run.sh npm run portal:verify
SKIP_GIT=1 bash scripts/op_run.sh bash 99-development/design-manager/customer-portal/ops/scripts/portal_task_complete.sh --skip-git
```

From **`99-development/design-manager/`** (Design Manager project root):

```bash
bash customer-portal/ops/scripts/op_env.sh npm run portal:hubspot-props
bash customer-portal/ops/scripts/op_env.sh npm run portal:hubdb-sync
npm run portal:verify
SKIP_GIT=1 bash customer-portal/ops/scripts/portal_task_complete.sh --skip-git
```

## Restoring “full” GraphQL after props + HubDB

Once properties exist in GraphQL and HubDB tables are published, re-add to queries:

- `portal_hair_profile_json`, `portal_invoices_json`, `portal_saved_templates_json`, `portal_billing_json`
- `notify_order_updates`, `notify_production_reminders`, `notify_marketing`
- HUBDB blocks in `billing.graphql`, `products.graphql`, `locations.graphql` as in git history or `SCHEMA_REGISTRY.md`

Then upload again via `portal_task_complete.sh` or `hs cms upload` (see `AGENT_PROMPT.md` — theme may use `.` or `src` as upload path; `portal_task_complete.sh` picks the correct one).
