# Portal — known issues and fixes

Living log of problems that tend to recur. Update when a new failure mode appears.

| Symptom | Cause | Fix |
|--------|--------|-----|
| `error: set HUBSPOT_SERVICE_KEY...` when running props/HubDB | `op run` did not inject a token (missing `00-engineering/.env` mapping or wrong var name) | Ensure 1Password Environment exposes `HUBSPOT_SERVICE_KEY` or `HUBSPOT_PERSONAL_ACCESS_KEY` or `HUBSPOT_PRIVATE_APP_ACCESS_TOKEN`. Run: `./scripts/op_env.sh npm run portal:hubspot-props`. |
| `list groups HTTP 401` / `EXPIRED_AUTHENTICATION` / expire time `1970-01-01` | Placeholder, revoked, or expired private app token in env | HubSpot → Settings → Integrations → Private Apps → create/rotate token. Required scopes: `crm.schemas.contacts.write` (props); add **`hubdb`** for `portal:hubdb-sync`. Update 1Password; never paste tokens into shell history. |
| `hs upload` / theme upload: GraphQL `FieldUndefined` on `crm_contact` (e.g. `portal_hair_profile_json`) | Custom contact property not created yet or not exposed to CMS GraphQL for that portal | Run `./scripts/op_env.sh npm run portal:hubspot-props` with a valid token. Confirm field appears in HubSpot GraphQL explorer. Until then, theme may use **stub** queries (core `firstname`/`lastname`/`email` only) — see comments in `hair-solutions-portal/src/data-queries/*.graphql`. |
| Upload fails: `FieldUndefined` on `HUBDB.products_collection` (or other `*_collection`) | HubDB table not created/published in that account | Run `./scripts/op_env.sh npm run portal:hubdb-sync` (needs **hubdb** scope). Restore full HUBDB blocks in `.graphql` after tables exist. |
| `npm ci` → `ENOTEMPTY` / `rmdir node_modules/...` | Parallel installs or interrupted `npm` left `node_modules` inconsistent | `rm -rf node_modules && npm ci` from `apps/customer-portal`. |
| `portal_automation_full` stops after verify | `SKIP_CONTACT_PROPS` / `SKIP_HUBDB_SYNC` set, or earlier step failed | Unset skip vars; fix failing step (usually token). Use `PORTAL_AUTOMATION_CONTINUE=1` or `--continue-on-error` only for diagnosis. |
| `op_env: missing .../.env` | 1Password Desktop Environment not linked at `00-engineering/.env` | Per `AGENTS.md`: use 1Password Developer Environments; do not commit secrets. |
| HubSpot CLI upload works but API scripts fail | CLI uses `hs account auth`; API uses PAT from env — different credentials | Align: use a private app PAT with correct scopes in `op` env; CLI account must target the same portal if you expect one account. |
| Deal association label errors in GraphQL (`p_order_collection__primary` etc.) | Association type name differs per portal | Use CMS GraphQL explorer; update `dashboard.graphql`, `orders_list.graphql`, `order_detail.graphql` to match your portal’s contact↔deal association. |

## Quick commands

```bash
cd apps/customer-portal
./scripts/op_env.sh npm run portal:hubspot-props    # contact groups + properties
./scripts/op_env.sh npm run portal:hubdb-sync       # HubDB tables + seed JSON
npm run portal:verify                               # theme build + lint + tsc (no secrets)
SKIP_GIT=1 ./scripts/portal_task_complete.sh --skip-git   # refresh issue exports + HubSpot upload
```

## Restoring “full” GraphQL after props + HubDB

Once properties exist in GraphQL and HubDB tables are published, re-add to queries:

- `portal_hair_profile_json`, `portal_invoices_json`, `portal_saved_templates_json`, `portal_billing_json`
- `notify_order_updates`, `notify_production_reminders`, `notify_marketing`
- HUBDB blocks in `billing.graphql`, `products.graphql`, `locations.graphql` as in git history or `SCHEMA_REGISTRY.md`

Then upload again via `portal_task_complete.sh` or `hs cms upload`.
