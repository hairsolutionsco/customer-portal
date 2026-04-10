# Special Agent Report: CMS / Legacy Decoupling Debug Intervention

To: Portal Orchestrator
From: Special Debug Agent
Date: 2026-04-10

## Mission

I was brought in as a special debugging agent to do two things:

1. Determine whether the project was suffering from an active file-reversion problem before edits.
2. Isolate the HubSpot CMS build / verify / ship path from the archived Next.js + next-auth app, while preserving the legacy app behind explicit legacy-only commands.

The requested objective was not feature work. It was operational debugging, path isolation, and verification discipline.

## Initial Blocker Investigation

Before making any edits, I treated the file-reversion symptom as the primary incident.

Target files under investigation included:
- `customer-portal/package.json`
- `customer-portal/tsconfig.json`
- `customer-portal/next.config.js`
- `customer-portal/scripts/portal_build.sh`
- `customer-portal/scripts/portal_automation_full.sh`
- `customer-portal/scripts/portal_task_complete.sh`
- `customer-portal/ops/scripts/portal_automation_full.sh`
- `customer-portal/ops/scripts/portal_task_complete.sh`
- `design-manager/package.json`
- `design-manager/README.md`

### What I checked

- Confirmed the target files were regular files, not symlinks or generated artifacts.
- Searched the repo for references suggesting regeneration, fallback uploads, or wrapper indirection.
- Inspected active processes and found editor/runtime activity, including Cursor/VS Code helpers, TypeScript servers, ESLint servers, and a live `next-server`.
- Identified one `tsserver` process reading `customer-portal/tsconfig.json` and the parent wrapper package.
- Performed a controlled revert probe:
  - inserted temporary valid markers into `package.json` and `tsconfig.json`
  - watched both files with `fswatch`
  - verified hashes before and after the watch window
  - removed the probe markers cleanly afterward

### Root-cause conclusion on the blocker

I did not observe an active external reverter during the intervention window.

The temporary probe edits persisted.
`fswatch` reported no external write events.
The hashes remained stable before and after the probe.
The later verification runs also left the files unchanged.

Operationally, that means the reported revert behavior was either:
- intermittent and inactive during this intervention
- tied to a separate editor/session action not triggered here
- or already cleared before I started the actual edits

I therefore proceeded only after establishing a stable edit window.

## Changes Implemented

### 1. Default workflow converted to CMS-only

I changed the root `customer-portal` workflow so the default entrypoints no longer boot or validate the archived Next app.

Implemented:
- `dev` now prints CMS guidance instead of starting Next
- `build` now runs `portal:build`
- `start` now prints CMS guidance instead of `next start`
- `lint` now runs CMS validation
- `postinstall` is now a guidance no-op instead of `prisma generate`
- `portal:verify` now runs only `portal:build`
- `portal:fetch` now points to the HubSpot theme fetch helper

### 2. Legacy app moved behind explicit legacy commands

I added explicit legacy-only commands so the archived Next app remains available without contaminating the CMS path.

Implemented:
- `legacy:dev`
- `legacy:build`
- `legacy:start`
- `legacy:lint`
- `legacy:typecheck`
- `legacy:prisma:generate`

### 3. TypeScript split into CMS-safe root config vs legacy Next config

I separated the TypeScript concerns.

Implemented:
- root `tsconfig.json` is now CMS-safe and does not include:
  - `app/`
  - `components/`
  - `lib/`
  - `prisma/`
  - `middleware.ts`
  - `next-env.d.ts`
- added `tsconfig.legacy.json` containing the old Next-oriented include set
- updated `next.config.js` so legacy commands can select `tsconfig.legacy.json` via `NEXT_TYPESCRIPT_TSCONFIG`

This is the key decoupling that prevents CMS verification from depending on next-auth, app routing, Prisma, or legacy app type surfaces.

### 4. Canonical theme source enforced as `theme/`

I removed legacy fallback behavior from the build/ship scripts.

Implemented:
- `scripts/portal_build.sh` now hardcodes canonical source to `theme/`
- it fails clearly if `theme/theme.json` is missing
- `scripts/portal_task_complete.sh` now uploads only from `theme/`
- it fails clearly if `theme/theme.json` is missing
- upload path handling now assumes canonical `.` from the theme root instead of legacy fallback logic

### 5. CMS-only automation path fixed in both local and ops scripts

I updated both automation entrypoints so their language and behavior reflect the CMS-only path.

Implemented:
- `scripts/portal_automation_full.sh`
  - comments now describe `portal:verify` correctly as CMS theme validation only
- `ops/scripts/portal_automation_full.sh`
  - no longer `cd`s into `customer-portal/app`
  - now computes `PORTAL_ROOT` as `customer-portal`
  - runs install and verify from `PORTAL_ROOT`
  - runs property sync / HubDB sync from `PORTAL_ROOT`
  - comments updated to CMS-only wording
- `ops/scripts/portal_task_complete.sh`
  - now treats `PORTAL_ROOT` as the git working root for this flow
  - sets `THEME_DIR` to `PORTAL_ROOT/theme`
  - fails clearly if `theme/theme.json` is missing
  - comments updated so the git target is the `customer-portal` repo surface, not the old ancestor wording

### 6. CI/watch path updated

Implemented:
- `.github/workflows/portal-theme-build.yml` now watches `theme/**` instead of `hair-solutions-portal/**`

### 7. Docs and wrapper layer updated

I updated the docs and the design-manager wrapper so they describe the correct operational model:

Canonical now:
- `theme/`
- `data/`
- `scripts/`
- `ops/`

Archived legacy only:
- `app/`
- `components/`
- `lib/`
- `prisma/`
- `middleware.ts`
- `next-env.d.ts`

I also updated the design-manager wrapper so default commands proxy into `customer-portal` root, not `customer-portal/app`.

## Files Updated in Scope

Customer portal:
- `package.json`
- `tsconfig.json`
- `tsconfig.legacy.json` (new)
- `next.config.js`
- `scripts/portal_automation_full.sh`
- `scripts/portal_task_complete.sh`
- `ops/scripts/portal_automation_full.sh`
- `ops/scripts/portal_task_complete.sh`
- `.github/workflows/portal-theme-build.yml`
- `README.md`
- `KNOWN_ISSUES.md`
- `docs/KNOWN_ISSUES.md`
- `docs/AGENT_PROMPT.md`
- `AGENT_PROMPT.md`

Design-manager wrapper:
- `design-manager/package.json`
- `design-manager/README.md`

## Verification Performed

All required verification passed.

From `customer-portal` root:
- `npm run portal:verify` -> PASS
- `npm run legacy:typecheck` -> PASS
- `bash -n scripts/portal_build.sh scripts/portal_task_complete.sh scripts/portal_automation_full.sh ops/scripts/portal_automation_full.sh ops/scripts/portal_task_complete.sh` -> PASS

From `design-manager` root:
- `npm run portal:verify` -> PASS
- `npm run legacy:typecheck` -> PASS

## File Stability Verification

I also verified that the critical config files did not revert after the required commands.

Confirmed stable across verification runs:
- `customer-portal/package.json`
- `customer-portal/tsconfig.json`
- `customer-portal/tsconfig.legacy.json`
- `customer-portal/next.config.js`
- `design-manager/package.json`
- `design-manager/README.md`

Method:
- captured hashes before verification
- ran all required commands
- captured hashes again
- hashes matched exactly

Conclusion:
No reversion occurred during the validated execution path.

## Scope Control / Preservation

I deliberately did not modify the already-dirty user/theme files that were flagged to preserve.

That includes preserving existing dirty theme work such as:
- `theme/fields.json`
- `theme/modules/billing-plans.module/module.html`
- `theme/modules/portal-sidebar.module/module.html`
- `theme/modules/product-grid.module/module.html`
- `theme/modules/quick-actions.module/module.html`
- `theme/templates/layouts/portal-shell.html`

There are other unrelated dirty theme files currently present in the worktree. I did not treat them as part of this debugging intervention and did not use them to satisfy the CMS/legacy split.

## Outcome

The requested success condition has been achieved.

Operationally, the project now behaves as follows:
- CMS verification no longer depends on `next lint`, root `tsc`, Prisma generation, or next-auth type surfaces
- the design-manager wrapper defaults to the CMS path
- the archived Next app remains available behind explicit `legacy:*` commands
- build/verify/ship scripts now enforce `theme/` as the canonical theme root
- the active file-reversion symptom was not reproducible during this intervention and did not occur during verification

## Recommended Orchestrator Next Steps

1. Review and commit the config/script/doc split as a dedicated operational change.
2. Keep unrelated theme/content work out of the same commit if possible.
3. If file reversion is reported again, reproduce it under observation:
   - identify which editor/session triggers it
   - capture `fswatch` events on the affected files
   - correlate with active tsserver/editor extension activity
4. Treat future CMS work as default-path work and require explicit `legacy:*` intent for anything involving the archived app.
