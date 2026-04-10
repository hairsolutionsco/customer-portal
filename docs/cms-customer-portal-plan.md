# CMS customer portal plan (canonical)

**This document is the only orchestration plan that matters.** Treat `IMPLEMENTATION_PLAN_SUBAGENTS.md`, `docs/AGENT_PROMPT.md` (*Portal orchestration* for agent grid only), other roadmaps, Claude plan files, and ad-hoc instructions as **secondary** unless they align with this file. Cherry-pick from prior builds (`hair-solutions-portal/`, legacy Next.js, older theme trees) **only when necessary** to unblock work defined here — never by default.

## Context

**What:** Full orchestration blueprint for building out the Hair Solutions customer + admin portal theme under `theme/` of this repo, using parallel sub-agents in git worktrees, to ship on HubSpot Content Hub Professional (portal 50966981).

**Why:** A previous agent built a commerce-oriented portal that partially overlaps with the desired CorePortal-inspired service portal (reference screenshots under `docs/desired-layout-screenshots/`). Two parallel theme trees exist on disk, an unrelated legacy Next.js app is sitting untracked inside the repo, and the desired information architecture (tickets/quotes/documents/events/KB + a full admin shell + two self-profile pages) is only partially built. The operating principle is **modify what's already built and complete it with what's missing** — not a rebuild.

**Desired outcome:** One cohesive theme uploaded to Design Manager as **`customer-portal`** (CLI destination; override with `HUBSPOT_THEME_DEST`), matching the BASE + Inter visual language, covering 14 customer routes + 6 auth/system routes + 24 admin routes, with both a customer "My Profile" and an admin "My Profile" as separate self-edit pages.

### Locked-in decisions

| Decision                  | Answer                                                                                                                                                                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme tree reconciliation | **Merge into `./theme/`** — but merge is actually pure pruning because `theme/` is already the newer superset                                                                                                                                                       |
| IA strategy               | **Hybrid**: keep Dashboard, Orders, Shop (Shopify web component embed), Billing (Stripe portal link), Invoices, Customization, Profile; **delete** Locations plus custom CMS Help/Support pages; **integrate** the account’s native HubSpot **Customer Portal** and **Knowledge Base** through shared navigation/branding; **add** Quotes, Documents, and Events where the CMS theme still owns the experience |
| Two profile pages         | **Customer "My Profile" + Admin "My Profile"** — both self-edit, distinct templates, served under different shells                                                                                                                                              |
| Design system             | BASE-aligned tokens + Inter (self-hosted) as the single UI font family                                                                                                                                                                                          |
| Data model for orders     | **Native `order` is not on Pro GraphQL.** Keep the existing **deals-as-orders mirror** via `deal_collection__contact_to_deal` aliased to `p_order_collection__primary` — verification is a gate before any template work                                        |

## Critical facts discovered during exploration (do NOT get these wrong)

1. **`theme/` is the authoritative, newer theme tree.** The nested `customer-portal/hair-solutions-portal/src/` is an older, stub-heavy scaffold. Every file where they differ, `theme/` is the superset (has the deals alias, HubDB fields, serverless ping hook, DND areas). **Do not cherry-pick from the nested scaffold** — framing it as "take newer content" would silently downgrade the canonical tree.

2. **The nested `./customer-portal/` directory contains four different things**:
   - (a) Full Next.js + Prisma + Railway legacy app (the system Portal 2.0 replaces)
   - (b) Stale doc copies (`AGENT_PROMPT.md`, `IMPLEMENTATION_PLAN_SUBAGENTS.md`, `KNOWN_ISSUES.md`, `master-plan`) — authoritative versions live in `./docs/` (or root + `docs/AGENT_PROMPT.md` for the full agent prompt)
   - (c) Stale data registry (`hair-solutions-portal/schemas/`, `hubdb/`, `SCHEMA_REGISTRY.md` 4.7 KB) — authoritative version is `./data/SCHEMA_REGISTRY.md` (14.5 KB)
   - (d) Stale theme scaffold (`hair-solutions-portal/src/`)
   - None of it is in `.gitignore`. If anyone runs `git add .`, the whole Next.js stack lands on `main`. Handle with `.gitignore` entry + decision on archive-vs-delete.

3. **HubSpot Content Hub Professional private-page GraphQL exposes**: `contact`, `company`, `deal`, `ticket`, `quote`, `line_item` — **NOT** native `order` or `invoices`. Serverless functions require Enterprise. HubDB on portal 50966981 is NOT exposed on membership GraphQL; HubDB reads use HubL `hubdb_table_rows(theme.hubdb.*_table_id)`.

4. **Every `theme/` subdirectory has a tracked `.DS_Store`** from the initial commit. Adds diff noise to every PR.

5. **Two orchestration rosters exist in-repo and they overlap in vocabulary**:
   - `docs/PORTAL_THEME_MULTI_AGENT_BUILD_PROMPT.md` defines **A1–A11** (theme-oriented)
   - `docs/IMPLEMENTATION_PLAN_SUBAGENTS.md` defines **A0–A15** (content/CRM/forms/ops-oriented)
     This plan uses the A1–A11 numbering from PORTAL_THEME_MULTI_AGENT_BUILD_PROMPT.md, with sub-splits (A5a/A5b, A7a/A7b, A9a/A9b, A10a/A10b) and new pre-flight A0a/A0b agents.

## Critical files to know about

| Path                                                        | Role                                                                                                                  |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `theme/fields.json`                                           | Theme config fields. **High-contention file** — must be split into per-agent group namespaces (see G-ownership below) |
| `theme/theme.json`                                            | Theme metadata + preview template                                                                                     |
| `theme/css/main.css`, `portal-layout.css`, `components/*.css` | Design tokens + layout + component styles                                                                             |
| `theme/js/main.js`                                            | Sidebar toggle + mobile behavior                                                                                      |
| `theme/templates/layouts/portal.html`                         | Current customer shell (will be superseded by `portal-shell.html`)                                                    |
| `theme/templates/layouts/base.html`                           | Base HTML + serverless ping hook                                                                                      |
| `theme/templates/portal-*.html`                               | 12 customer page templates (some kept, some replaced)                                                                 |
| `theme/modules/**/*.module/`                                  | 20 existing modules across navigation, dashboard, orders, billing, catalog, profile, customization, settings          |
| `theme/data-queries/*.graphql`                                | 10 queries, contact-scoped; `orders_list`/`dashboard`/`order_detail` use the deals-as-orders alias                    |
| `data/SCHEMA_REGISTRY.md`                                   | Authoritative IDs, HubDB table IDs, association-alias verification recipe                                             |
| `docs/PORTAL_THEME_MULTI_AGENT_BUILD_PROMPT.md`             | §3 design system, §4 page inventory, §6 access control, §9 acceptance criteria                                        |
| `docs/AGENT_PROMPT.md`                                      | Data model constraints, forms rule, ritual                                                                            |
| `docs/IMPLEMENTATION_PLAN_SUBAGENTS.md`                     | Quality gates G1–G7, wave structure                                                                                   |
| `docs/desired-layout-screenshots/Customer Portal/`          | 9 screenshots defining customer IA                                                                                    |
| `docs/desired-layout-screenshots/Admin Portal/`             | 24 screenshots defining admin IA                                                                                      |
| `ops/scripts/portal_task_complete.sh`                       | Canonical upload script: issues export → `hs cms upload` → git push                                                   |
| `ops/scripts/portal_build.sh`                               | JSON validation pre-flight                                                                                            |
| `.gitignore`                                                | Must be updated in A0a                                                                                                |

## Guiding principles

- **Modify first, add second.** Any existing module, template, or query that matches the target IA gets refined in place — not rewritten.
- **`fields.json` is group-scoped per agent** to eliminate the merge-conflict hotspot:
  - A1 owns `portal`, `portal_layout`, `hubdb`, `typography`
  - A6 owns `commerce` (Shopify CSP, Stripe URL, currency defaults)
  - A7 owns `admin` (shell flags, access-control hints)
  - A10a owns `admin_branding`, `admin_email`, `admin_domain`, `admin_notifications`
  - A10b owns `admin_users`, `admin_integrations`, `admin_self_reg`, `admin_ticket_settings`
- **HubSpot Forms for writes.** No bespoke POST from HubL. Embed `{% form form_to_use='…' %}`.
- **Orders-as-deals is locked.** Every orders-related HubL touches `p_order_collection__primary`, not a hypothetical `order_collection`. A9a must verify the real label in portal 50966981 before any query edits.
- **Admin templates must not leak data.** If G5b (admin access control feasibility) fails, all admin templates use `{% if contact.is_staff %}…{% else %}access denied{% endif %}` HubL guards rendering zero CRM data outside the guard.
- **Inter is self-hosted** under `theme/fonts/` — no CDN hand-wave. CSP on membership subdomain cannot be relied on for Google Fonts.
- **Every PR runs `portal_build.sh`** in the worktree before ready-for-review.
- **Ritual:** every agent closes with `bash ops/scripts/portal_task_complete.sh "type(scope): what you completed"` from the worktree when the feature is ready for orchestrator review (NOT on every commit).

## Agent split

Legend: **W**=wave, **S**=serial within wave, **P**=parallel within wave. All branches are created from `main` (or the tag at the tail of the prior wave for strict determinism).

### Wave 0 — Hygiene + verification (serial, blocking all downstream work)

| ID      | Branch                        | Scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A0a** | `chore/portal-repo-hygiene`   | Add `customer-portal/` (the nested Next.js tree) and `.DS_Store` to `.gitignore`. `git rm --cached` every tracked `.DS_Store`. Commit currently-untracked content that belongs on `main`: `docs/PORTAL_THEME_MULTI_AGENT_BUILD_PROMPT.md`, `docs/desired-layout-screenshots/`, `docs/base-theme-pro-style.pdf`, `ops/scripts/fetch_hubspot_theme.sh`, the modified `ops/scripts/portal_task_complete.sh`. Record in `docs/KNOWN_ISSUES.md` the decision about the nested `customer-portal/` directory (archive to `reference-themes/legacy-nextjs-portal/` OR leave untracked-but-gitignored — orchestrator decides). Tag `v0.0.0-portal-baseline`. |
| **A0b** | `chore/portal-theme-prune`    | Delete: `theme/data-queries/locations.graphql`, `theme/templates/portal-locations.html`, `theme/modules/location-cards.module/` (verify exact path), `theme/templates/portal-help.html`, `theme/templates/portal-support.html`. Remove `locations_table_id` references from `theme/fields.json` + `portal-sidebar.module/fields.json`. Remove sidebar nav links to the deleted pages. Explicitly **do not** cherry-pick from the nested `src/` scaffold — PR description must quote "verified `theme/` is the newer superset; nested scaffold is stub-heavy and older."                                                                                           |
| **A9a** | `spike/portal-graphql-verify` | Read-only spike. In HubSpot portal 50966981 GraphQL explorer, run `dashboard.graphql`, `orders_list.graphql`, `order_detail.graphql` against a seeded test contact that has at least one deal mirrored. Verify `deal_collection__contact_to_deal` resolves. Introspect `contact → ticket`, `contact → quote`, any document/event association — document exact association field names. Also verify: can a staff-only membership access group be created on this portal's tier (admin access feasibility — feeds G5b). No code changes. Results recorded in `data/SCHEMA_REGISTRY.md` §GraphQL-association-aliases and `docs/KNOWN_ISSUES.md`.       |

### Wave 1 — Foundation + chrome (serial)

| ID     | Branch                         | Scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A1** | `feat/portal-theme-foundation` | Finalize `theme/fields.json` — owns the `portal`, `portal_layout`, `hubdb`, `typography` groups; publishes the **`fields.json` group ownership map** in the PR description. Self-host Inter 400/500/600/700 as `.woff2` under `theme/fonts/` with `@font-face` in `theme/css/main.css`. Finalize `:root` tokens (colors per §3.2 of the build prompt, radius, shadow, spacing scale). Refine `theme/css/portal-layout.css` layout primitives and `theme/css/components/*.css`. Refine `theme/js/main.js`.                                                                                                                                                                                                                                                                           |
| **A2** | `feat/portal-chrome`           | Create `theme/templates/layouts/portal-shell.html` — one layout accepting a `shell_mode` block variable (`customer` \| `admin`) that selects which sidebar module to render. Keep existing `portal.html` as a thin back-compat extend during A3–A6. Refine `theme/modules/navigation/portal-sidebar.module` (customer nav: Dashboard, Tickets, Quotes, Invoices, Documents, Events, Knowledge Base, Orders, Shop, Billing, Customization, My Profile). Create `theme/modules/navigation/portal-admin-sidebar.module` with the admin IA (dashboard, CRM, commerce, service, settings). Refine `theme/modules/navigation/portal-header.module` with user-menu link set variation. New partials: `theme/templates/partials/breadcrumbs.html`, `empty-state.html`, `pagination.html`. |

### Wave 2 — Auth + new queries (parallel)

| ID      | Branch                    | Scope                                                                                                                                                                                                                                                                                                                                                                           |
| ------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A3**  | `feat/portal-system`      | System templates refined against BASE + Inter: `membership-login.html`, `membership-register.html`, `membership-reset-password-request.html`, `membership-reset-password.html`, `404.html`, `500.html`. Refine `theme/css/templates/system.css`.                                                                                                                                  |
| **A9b** | `feat/portal-graphql-new` | Using A9a's verified schema results, author new queries: `tickets.graphql` (customer-scoped), `quotes.graphql`, `documents.graphql`, `events.graphql`, and `knowledge_base.graphql` (only if KB mode is custom — see decision gate below). If A9a found any wrong alias on existing queries, fix them here. Delete `settings.graphql` if unused elsewhere. No template touches. |

### Wave 3 — Customer features (parallel)

| ID      | Branch                          | Scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A4**  | `feat/portal-customer-core`     | Refine `theme/templates/portal-dashboard.html` + `dashboard-stats`, `production-alert`, `recent-orders`, `quick-actions` modules. Refine `theme/templates/portal-profile.html` + `hair-profile-display.module`, `hair-profile-form.module`. Embed HubSpot Form for profile edits (form GUID recorded in PR description). Deliver the **DND re-save list** in PR description (pages that need to be re-saved in Design Manager after upload because they use `{% dnd_area %}`).                                                                                                                                                                                                                                                                                      |
| **A5a** | `feat/portal-customer-service`  | Native-service integration only. The CMS theme should **not** build custom ticket-list / ticket-detail / KB article pages. Instead, A5a owns the shared nav / CTA integration, field wiring, and any light visual shell treatment needed to send customers into the **account’s native HubSpot Customer Portal** for tickets and the **account’s native HubSpot Knowledge Base** for help content. Reusable service modules should be added only if they support those native handoffs or future admin reuse.                                                                                                                                                                         |
| **A5b** | `feat/portal-customer-content`  | Quotes + documents + events. Templates: `portal-quotes.html`, `portal-quote-detail.html`, `portal-documents.html`, `portal-events.html`, `portal-event-detail.html`. Modules: `modules/service/quote-list.module`, `quote-detail.module`, `documents-library.module`, `events-list.module`, `event-detail.module`. All modules accept the same `query_scope` field contract as A5a for A8 reuse.                                                                                                                                                                                                                                                                                                                                                                |
| **A6**  | `feat/portal-customer-commerce` | Refine in place: `portal-orders.html`, `portal-order-detail.html`, `portal-invoices.html`, `portal-customization.html` + existing commerce modules. Rewrite `portal-shop.html` as a Shopify web-component embed — A6 owns the new `commerce` group in `fields.json` for the Shopify shop handle / CSP settings. **CSP pre-flight required**: if the membership subdomain CSP blocks Shopify web-component module scripts, flag the orchestrator for a CSP update or sidecar. Rewrite `portal-billing.html` as subscription summary + "Manage in Stripe" button. Stripe URL source: **theme field for generic account-level URL** (simpler) OR **contact property per-user URL** (requires workflow support) — A6 decides with orchestrator and documents in PR. |

### Wave 4 — Admin (serial into parallel)

| ID      | Branch                    | Scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A7a** | `feat/portal-admin-shell` | Admin shell smoke-test + the second self-profile. Templates: `portal-admin-dashboard.html` (minimal metric cards), `portal-admin-profile.html` (admin's own profile — uses a different HubSpot Form GUID than customer profile). Module: `modules/admin/admin-metric-card.module`. Every template wraps content in `{% if contact.is_staff %}…{% else %}access denied {% endif %}`. Gated on **G5b**: A9a must have confirmed staff membership access groups are possible on this tier OR orchestrator has approved the HubL-guard fallback. |
| **A7b** | `feat/portal-admin-crm`   | Admin CRM list/detail pages: `portal-admin-contacts.html`, `portal-admin-contacts-detail.html`, `portal-admin-companies.html`, `portal-admin-companies-detail.html`, `portal-admin-documents.html`, `portal-admin-events.html`. Module: `modules/admin/crm-list-table.module`. New data-queries: `admin_contacts.graphql`, `admin_companies.graphql`.                                                                                                                                                                                        |
| **A8**  | `feat/portal-admin-ops`   | Admin commerce + service: `portal-admin-quotes.html` + detail, `portal-admin-invoices.html` + detail, `portal-admin-tickets.html` + detail, `portal-admin-knowledge-base.html` + editor. Reuses A5a/A5b modules via the `query_scope` field. New data-queries: `admin_tickets.graphql`, `admin_quotes.graphql`, etc.                                                                                                                                                                                                                         |

### Wave 5 — Admin settings (parallel)

| ID       | Branch                               | Scope                                                                                                                                                                                                                                                                                                                                                                                   |
| -------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A10a** | `feat/portal-admin-display-settings` | Display-only settings: A18 Branding, A19 Email customization, A20 Domain customization, A23 Notifications. Owns the `admin_branding`, `admin_email`, `admin_domain`, `admin_notifications` groups in `fields.json`. Settings are rendered from theme fields; saves happen in HubSpot theme-settings UI.                                                                                 |
| **A10b** | `feat/portal-admin-write-settings`   | Write-path settings stubbed or functional: A12 Users, A14 Self-registration, A15 Invoice settings, A16 Payment settings, A17 Subscription/plan, A21 HubSpot integration, A22 QuickBooks integration, A24 Ticket settings. On this tier, most will ship as read-only dashboards with "contact support" CTAs. Each page's stub-vs-real status is signed off by the orchestrator per page. |

### Wave 6 — Final QA (serial)

| ID      | Branch                 | Scope                                                                                                                                                                                                                                                              |
| ------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A11** | `feat/portal-theme-qa` | Cross-cutting: contrast, keyboard nav, table responsiveness, HubL errors, mobile sidebar, DND re-save log compilation, `portal_build.sh` + `portal_task_complete.sh --build-first` dry run against draft mode on portal 50966981, `SCHEMA_REGISTRY.md` final sync. |

## Quality gates (hard gates — orchestrator enforces before merging)

| Gate    | When                  | Blocks                             | Check                                                                                                                   |
| ------- | --------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **G0**  | A0a done              | A0b                                | `git status` clean; baseline tag pushed                                                                                 |
| **G1**  | A0b done              | A9a                                | Deletions complete; `portal_build.sh` passes; PR description explicit about not-merging-from-nested                     |
| **G3a** | A9a done              | A1, A9b                            | Every existing query + deals alias confirmed in portal explorer; results in `SCHEMA_REGISTRY.md`                        |
| **G5b** | A9a done              | A7a (and all A7/A8/A10 downstream) | Staff membership access group is provable on this tier, OR orchestrator has explicitly approved the HubL-guard fallback |
| **G4**  | A1 done               | A2                                 | `hs cms upload` succeeds; Inter renders on the dashboard in draft upload                                                |
| **G3b** | A9b done              | A4, A5a, A5b, A6, A8               | Every new query executes against seeded data                                                                            |
| **G5**  | After A3 + A7a merged | A11                                | Logged-out user cannot read `/portal/*`; non-staff cannot read `/portal/admin/*`                                        |
| **G6**  | After A4 + A5a merged | A11                                | All HubSpot Form embeds submit to correct GUIDs                                                                         |
| **G7**  | A11 done              | Release                            | Full QA checklist signed; `SCHEMA_REGISTRY.md` synced                                                                   |

## Decisions the orchestrator must make BEFORE spawning agents

These cannot be deferred; they change agent scope:

1. **Nested `customer-portal/` directory fate** (A0a): archive to `reference-themes/legacy-nextjs-portal/` OR leave untracked-but-gitignored in place.
2. **KB strategy** (A5a) — resolved: use the **account’s native HubSpot Service Hub Knowledge Base**. Any portal KB work is link / shell treatment only; no custom HubL KB build.
3. **Stripe portal URL source** (A6): generic account URL in theme field (simple) OR per-user URL on a contact property (requires a workflow upstream).
4. **Admin access control fallback policy** (A7a): if G5b fails, approve the HubL-guard fallback upfront so A7a isn't blocked waiting for a tier upgrade.
5. **Shopify web-component CSP** (A6): confirm with HubSpot Support whether the membership subdomain's CSP can be relaxed to allow Shopify module scripts, or plan for a sidecar.
6. **Roster vocabulary** (A0a): document in `docs/KNOWN_ISSUES.md` that this plan uses the A1–A11 numbering from `PORTAL_THEME_MULTI_AGENT_BUILD_PROMPT.md`, and that `IMPLEMENTATION_PLAN_SUBAGENTS.md`'s A0–A15 is a different roster describing platform work already done or deferred.

## Merge order (explicit)

```
W0   [S] A0a  → A0b  → A9a          # hygiene + pruning + verification spike
W1   [S] A1   → A2                    # foundation then chrome
W2   [P] A3 || A9b                    # system templates parallel with new queries
W3   [P] A4 || A5a || A5b || A6      # all customer features parallel (need A2 + A9b)
W4   [S] A7a                           # admin shell (needs G5b)
W4   [P] A7b || A8                    # admin CRM + admin ops parallel (need A7a + A5a/A5b modules)
W5   [P] A10a || A10b                 # admin settings parallel (need A7a)
W6   [S] A11                           # final QA
```

## Worktree commands

From `/Users/vMac/00-hair-solutions-co/00_engineering/04_hubspot/99-development/design-manager/customer-portal/`:

```bash
git fetch origin
git rev-parse main  # sanity: should be at or beyond f750499

WORKTREE_ROOT="/Users/vMac/00-hair-solutions-co/00_engineering/04_hubspot/99-development/design-manager/customer-portal-worktrees"
mkdir -p "$WORKTREE_ROOT"

# W0
git worktree add "$WORKTREE_ROOT/a0a" -b chore/portal-repo-hygiene main
# after A0a merges:
git worktree add "$WORKTREE_ROOT/a0b" -b chore/portal-theme-prune  main
# after A0b merges:
git worktree add "$WORKTREE_ROOT/a9a" -b spike/portal-graphql-verify main

# W1
git worktree add "$WORKTREE_ROOT/a1" -b feat/portal-theme-foundation main
git worktree add "$WORKTREE_ROOT/a2" -b feat/portal-chrome            main

# W2 (parallel)
git worktree add "$WORKTREE_ROOT/a3"  -b feat/portal-system      main
git worktree add "$WORKTREE_ROOT/a9b" -b feat/portal-graphql-new main

# W3 (parallel)
git worktree add "$WORKTREE_ROOT/a4"  -b feat/portal-customer-core     main
git worktree add "$WORKTREE_ROOT/a5a" -b feat/portal-customer-service  main
git worktree add "$WORKTREE_ROOT/a5b" -b feat/portal-customer-content  main
git worktree add "$WORKTREE_ROOT/a6"  -b feat/portal-customer-commerce main

# W4
git worktree add "$WORKTREE_ROOT/a7a" -b feat/portal-admin-shell main
git worktree add "$WORKTREE_ROOT/a7b" -b feat/portal-admin-crm   main
git worktree add "$WORKTREE_ROOT/a8"  -b feat/portal-admin-ops   main

# W5
git worktree add "$WORKTREE_ROOT/a10a" -b feat/portal-admin-display-settings main
git worktree add "$WORKTREE_ROOT/a10b" -b feat/portal-admin-write-settings   main

# W6
git worktree add "$WORKTREE_ROOT/a11" -b feat/portal-theme-qa main

# After a PR merges:
git worktree remove "$WORKTREE_ROOT/aXX"
```

**Note:** every worktree bases on `main` here for clarity. In practice the orchestrator runs `git pull --rebase origin main` inside the worktree immediately before the agent starts so the worktree picks up the latest merged wave. For strict determinism, replace `main` with the tag at the end of the prior wave (e.g. `git worktree add … v0.1-w1-a2` for W2 worktrees).

## Per-agent reading list

| Agent | First reads                                                                                                                                                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A0a   | `.gitignore`, `docs/PORTAL_THEME_MULTI_AGENT_BUILD_PROMPT.md`, `docs/KNOWN_ISSUES.md`, full `git status`                                                                                                                                                                  |
| A0b   | `data/SCHEMA_REGISTRY.md`, `docs/AGENT_PROMPT.md` §1, `theme/fields.json`, `theme/data-queries/locations.graphql`, `theme/modules/portal-sidebar.module/{module.html,fields.json}`, `theme/templates/portal-{help,support,locations}.html`, `theme/modules/location-cards.module/*` |
| A9a   | `data/SCHEMA_REGISTRY.md` (§GraphQL association aliases), `docs/AGENT_PROMPT.md`, `docs/KNOWN_ISSUES.md`, every file in `theme/data-queries/`, build-prompt §6                                                                                                              |
| A1    | Build-prompt §3, `docs/base-theme-pro-style.pdf`, `theme/css/main.css`, `portal-layout.css`, `components/*.css`, `theme/{fields.json,theme.json}`, `theme/js/main.js`                                                                                                           |
| A2    | Build-prompt §3, §4.1, §4.3, all 9 customer screenshots + all 24 admin screenshots, `theme/templates/layouts/{portal,base}.html`, `theme/modules/navigation/portal-{sidebar,header}.module/`, A1 PR description                                                               |
| A3    | `docs/AGENT_PROMPT.md` §7, `theme/templates/system/*`, `theme/css/templates/system.css`, A1 + A2 PRs, `docs/base-theme-pro-style.pdf`                                                                                                                                         |
| A9b   | A9a results, `docs/AGENT_PROMPT.md`, all existing `theme/data-queries/*.graphql`, customer + admin screenshots for tickets/quotes/documents/events/KB                                                                                                                       |
| A4    | `docs/AGENT_PROMPT.md` §7, `theme/templates/portal-{dashboard,profile}.html`, existing dashboard + profile modules, `theme/data-queries/{dashboard,hair_profile}.graphql`, customer dashboard + profile screenshots                                                           |
| A5a   | A9b ticket + KB results, customer screenshots (tickets, KB), build-prompt §4.1 C02–C04, C12–C13, A2 PR, KB-mode decision memo                                                                                                                                             |
| A5b   | A9b quotes/documents/events results, customer screenshots, build-prompt §4.1 C05–C11                                                                                                                                                                                      |
| A6    | `data/SCHEMA_REGISTRY.md` (orders-as-deals section), `theme/templates/portal-{orders,order-detail,invoices,shop,billing,customization}.html`, existing commerce modules, Shopify CSP + Stripe URL decision memos                                                            |
| A7a   | Build-prompt §4.3 + §6, admin screenshots (dashboard + profile), G5b memo, A2 shell contract                                                                                                                                                                              |
| A7b   | A7a PR, admin screenshots (contacts/companies/documents/events), A9b admin queries                                                                                                                                                                                        |
| A8    | A7a shell contract, A5a + A5b module field specs, A9b admin queries, admin screenshots (quotes/invoices/tickets/KB)                                                                                                                                                       |
| A10a  | A1 `fields.json` group map, build-prompt §4.3 settings, admin screenshots (branding/email/domain/notifications)                                                                                                                                                           |
| A10b  | A1 `fields.json`, `docs/KNOWN_ISSUES.md`, `data/SCHEMA_REGISTRY.md`, admin screenshots (write-path pages), A9a tier-availability memo                                                                                                                                     |
| A11   | Every prior PR description, `ops/scripts/portal_build.sh`, `ops/scripts/portal_task_complete.sh`, `docs/KNOWN_ISSUES.md`                                                                                                                                                  |

## Verification (end-to-end)

After A11 merges:

1. **Build check locally**:

   ```bash
   bash ops/scripts/portal_build.sh
   ```

2. **Draft upload to portal 50966981**:

   ```bash
   HUBSPOT_CMS_PUBLISH_MODE=draft bash ops/scripts/portal_task_complete.sh "chore(portal): end-to-end verification"
   ```

3. **Smoke tests in HubSpot preview**:
   - Customer flow: log in as seeded test customer → sidebar shows Dashboard, Tickets, Quotes, Invoices, Documents, Events, Knowledge Base, Orders, Shop, Billing, Customization, My Profile → click each → graceful empty state OR real data → Shop renders Shopify web component → Billing shows "Manage in Stripe" button → profile form submits.
   - Admin flow: log in as seeded staff contact → admin sidebar → click each nav item → G5b guard works (non-staff sees access denied; staff sees content).
   - Auth: logout → visit `/portal/dashboard` → redirected to login → register → password reset flow.
4. **Mobile check**: iPhone viewport — sidebar collapses, no horizontal scroll on Orders and Tickets tables.
5. **Contrast + keyboard**: tab through nav + focusable elements in each page; visible focus ring.
6. **DND log**: A4's list of pages that need re-saving in Design Manager — re-save each in the HubSpot UI.
7. **Final ritual**:

   ```bash
   bash ops/scripts/portal_task_complete.sh "feat(portal): ship A1-A11 multi-agent build"
   ```

## Out of scope (explicit handoffs)

- CRM property creation (already owned by the `A1` CRM agent in the parallel IMPLEMENTATION_PLAN_SUBAGENTS.md roster)
- HubDB seeding + sync (owned by the `A2` HubDB agent in the parallel roster; IDs already in `fields.json`)
- Production DNS for membership subdomain (`A15` release eng in the parallel roster)
- Private app token provisioning
- Stripe account-level portal URL generation (must be provided to A6)
- Shopify web-component script URL + shop handle (must be provided to A6)
- HubSpot Form GUIDs for customer profile + admin profile + ticket-new + quote-accept (must be provided to A4, A7a, A5a by form-owning agent or orchestrator)
