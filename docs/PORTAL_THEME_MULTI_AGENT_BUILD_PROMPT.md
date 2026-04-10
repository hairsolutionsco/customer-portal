# Multi-agent build prompt — full Hair Solutions customer + admin portal theme (BASE styling)

Use this document when you spin up **multiple agents on separate git worktrees** to build **one cohesive HubSpot CMS theme**. Each agent should receive **only their section** plus the **Global contract** and **Merge order** sections.

**Canonical technical spec (data model, GraphQL caveats, membership, rituals):** `docs/AGENT_PROMPT.md` and `docs/IMPLEMENTATION_PLAN_SUBAGENTS.md`.  
**Do not contradict those**; this file adds **IA (information architecture)** from the CorePortal reference screenshots and **visual design** aligned to **BASE + Inter**.

---

## 1. Mission

Deliver a **production HubSpot CMS theme** under `customer-portal/cms/` that implements:

1. **Customer (membership) portal** — all end-user pages and flows listed in section 4.1–4.2.
2. **Admin portal** — all administrative pages listed in section 4.3 (same theme, different templates/modules and **server-side permission model** — see section 6).
3. **Visual language** — **BASE-aligned** neutrals, **Inter** as the single UI font family, and shared tokens in CSS (section 3).
4. **Operational completeness** — list pages, detail pages implied by tables, settings forms, and global chrome (header, sidebar, breadcrumbs, empty states, pagination patterns).

**Out of scope for “theme-only” agents (must be explicit handoffs):** CRM property creation, HubDB sync, production DNS, membership group configuration in HubSpot UI, private app tokens. Theme agents **consume** `data/SCHEMA_REGISTRY.md` and document **new** GraphQL assumptions in PR descriptions or SCHEMA_REGISTRY updates via the orchestrator.

---

## 2. Repository map (single source of truth on disk)


| Area                            | Path                                                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Theme root                      | `customer-portal/cms/`                                                                                                  |
| Theme fields / `theme.json`     | `customer-portal/cms/fields.json`, `customer-portal/cms/theme.json`                                                     |
| Global CSS                      | `customer-portal/cms/css/main.css`, `portal-layout.css`, `css/components/*`                                             |
| JS                              | `customer-portal/cms/js/main.js`                                                                                        |
| Layouts / partials              | `customer-portal/cms/templates/layouts/*`, `templates/partials/*`                                                       |
| Page templates                  | `customer-portal/cms/templates/*.html`                                                                                  |
| Modules                         | `customer-portal/cms/modules/**/*.module/`                                                                              |
| GraphQL                         | `customer-portal/cms/data-queries/*.graphql`                                                                            |
| Reference screenshots (IA)      | `customer-portal/docs/desired-layout-screenshots/`                                                                      |
| BASE token reference (optional) | `customer-portal/reference-themes/base-child-marketplace-base/_fetched-from-hubspot/css/` (variables + main top matter) |


**Upload name in HubSpot Design Manager:** default `**hair-solutions-portal`** (or orchestrator-defined); agents must not rename without coordination.

---

## 3. Design system — BASE styling + Inter (mandatory shared contract)

### 3.1 Typography

- **Single UI family:** **Inter** for all headings, body, labels, tables, and buttons.  
- Stack example: `Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.  
- **Load Inter** in a way that works on HubSpot membership pages (theme settings and/or layout partial). Avoid adding heavy font libraries beyond what BASE-style sites typically use.

### 3.2 Color and chrome (align to BASE + Hair Solutions admin branding reference)

From the **Branding Customization** reference and BASE variable patterns, treat these as **defaults** (override via `fields.json` theme settings where practical):


| Token                       | Default                | Usage                |
| --------------------------- | ---------------------- | -------------------- |
| Navbar / sidebar background | `#131313`              | Primary nav chrome   |
| Nav link (inactive)         | `#B8B8B8`              | Sidebar text         |
| Surface / page background   | `#F5F8FA` or `#f4f5f7` | App shell background |
| Card / content surface      | `#FFFFFF`              | Main panels          |
| Primary text                | `#191919`–`#333333`    | Body copy            |
| Borders / dividers          | `#E1E1E1` / `#EEEEEE`  | Tables, cards        |


**Semantic colors** (keep distinct from “brand gray”):

- Link / primary action accent: pick **one** blue and use consistently (e.g. `#326EDC` **or** `#33475B` — choose once in `fields.json`).  
- Success / warning / error: accessible greens, ambers, reds; document hex in theme fields.

### 3.3 CSS architecture

- Define **design tokens as CSS custom properties** on `:root` in `css/main.css` (e.g. `--hs-font-sans`, `--hs-color-nav-bg`, `--hs-color-nav-link`, `--hs-radius`, `--hs-shadow`).  
- Map HubL `theme.`* fields to those variables (same pattern as existing portal `main.css`).  
- **Do not** fork unrelated design systems per page; new pages **reuse** `portal-layout.css` and component CSS (`buttons`, `forms`, `tables`, `cards`, `badges`).  
- **Responsive:** sidebar collapse / mobile nav required for all new layouts (match reference: dark rail + light content).

### 3.4 Optional BASE parent reference

A **child-of-BASE** theme exists in HubSpot at `@marketplace/SmartAcre_Inc_/BASE` for SmartAcre updates. **This build** targets a **standalone** `hair-solutions-portal` theme that **visually aligns** with BASE; agents should not depend on uploading a child theme unless the orchestrator switches strategy.

---

## 4. Complete page inventory (required routes)

Treat each row as a **first-class template or routed experience** (some may share one template with query params — document the choice in the agent’s PR).

### 4.1 Customer portal — primary navigation (sidebar)


| ID  | Route / slug pattern (suggested) | Template purpose                                                      |
| --- | -------------------------------- | --------------------------------------------------------------------- |
| C01 | `/portal` or `/portal/dashboard` | Dashboard — summary cards, profile snippet, support contact, activity |
| C02 | `/portal/tickets`                | Tickets list — search, show closed, pagination                        |
| C03 | `/portal/tickets/new`            | Create ticket                                                         |
| C04 | `/portal/tickets/:id`            | Ticket detail                                                         |
| C05 | `/portal/quotes`                 | Quotes list — search, show archived                                   |
| C06 | `/portal/quotes/:id`             | Quote detail                                                          |
| C07 | `/portal/invoices`               | Invoices list                                                         |
| C08 | `/portal/invoices/:id`           | Invoice detail / pay / download (as entitlements allow)               |
| C09 | `/portal/documents`              | Documents library                                                     |
| C10 | `/portal/events`                 | Events list / empty state                                             |
| C11 | `/portal/events/:id`             | Event detail (if applicable)                                          |
| C12 | `/portal/knowledge-base`         | KB search + article list                                              |
| C13 | `/portal/knowledge-base/:slug`   | Article reader                                                        |
| C14 | `/portal/profile`                | Account — profile fields, photo, password, 2FA                        |


### 4.2 Customer portal — global / auth (not necessarily in sidebar)


| ID  | Purpose                                                        |
| --- | -------------------------------------------------------------- |
| CX1 | Login (membership system template)                             |
| CX2 | Register / self-registration (if enabled)                      |
| CX3 | Password reset / request                                       |
| CX4 | Logout (action + confirmation optional)                        |
| CX5 | Embedded support (chat widget or link — may be global partial) |


### 4.3 Admin portal — navigation groups

Use a **parallel shell** (admin layout) with the following pages. **Access control** is critical: prefer **HubSpot CMS membership separate access group(s)** for staff, or documented middleware pattern — see section 6.

**CRM**


| ID  | Page                                      |
| --- | ----------------------------------------- |
| A01 | Admin dashboard                           |
| A02 | Contacts — list                           |
| A03 | Contacts — create/edit (or modal pattern) |
| A04 | Companies — list                          |
| A05 | Companies — create/edit                   |
| A06 | Documents — list; create folder; upload   |
| A07 | Events — list; create; archived           |


**Commerce**


| ID  | Page                                          |
| --- | --------------------------------------------- |
| A08 | Quotes — list; archived                       |
| A09 | Invoices — list; **create invoice**; archived |


**Service**


| ID  | Page                                      |
| --- | ----------------------------------------- |
| A10 | Tickets — list; show closed               |
| A11 | Knowledge base — list; **create article** |


**Settings**


| ID  | Page                                                                                 |
| --- | ------------------------------------------------------------------------------------ |
| A12 | Users — list; seat / plan upsell entry                                               |
| A13 | Portal settings — visible sections toggles; editable customer fields; document rules |
| A14 | Self registration — enable + save                                                    |
| A15 | Invoice settings                                                                     |
| A16 | Payment settings                                                                     |
| A17 | Subscription / plan management                                                       |
| A18 | Branding                                                                             |
| A19 | Email customization                                                                  |
| A20 | Domain customization                                                                 |
| A21 | Integration — HubSpot                                                                |
| A22 | Integration — QuickBooks                                                             |
| A23 | Notifications — list; add                                                            |
| A24 | Ticket settings                                                                      |


**Admin implied detail routes:** mirror customer where admins drill into a row (ticket/quote/invoice/contact/company/event/article/notification).

---

## 5. Worktree / agent split (recommended)

Each agent works in **their own git worktree** from the same repo. **One branch per agent** (e.g. `feat/portal-agent-01-…`) and merge via PRs in **dependency order** (section 8).


| Agent                                      | Branch prefix                         | Scope                                                                                                                       | Delivers                                                                    |
| ------------------------------------------ | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **P0 — Orchestrator**                      | n/a                                   | Locks design tokens, `fields.json` keys, template naming, merge order                                                       | Approves PRs; runs `portal_task_complete.sh` when needed                    |
| **A1 — Design foundation**                 | `feat/portal-theme-foundation`        | `fields.json`, `theme.json`, `css/main.css` tokens, `portal-layout.css` shell primitives, `js/main.js` sidebar behavior     | Token contract + layout regions documented in PR                            |
| **A2 — Global chrome modules**             | `feat/portal-chrome`                  | `portal-header`, `portal-sidebar` (customer + admin variants or shared with mode), breadcrumbs partial, empty state partial | Depends on A1                                                               |
| **A3 — System / membership templates**     | `feat/portal-system`                  | `templates/system/`* or equivalent login/register/reset                                                                     | Depends on A1–A2                                                            |
| **A4 — Customer dashboard + profile**      | `feat/portal-customer-core`           | C01, C14 + dashboard modules                                                                                                | Depends on A1–A2; GraphQL per `AGENT_PROMPT.md`                             |
| **A5 — Customer service & commerce lists** | `feat/portal-customer-tickets-quotes` | C02–C08 + modules (lists, filters, pagination)                                                                              | Depends on A2; coordinates queries with A9                                  |
| **A6 — Customer docs, events, KB**         | `feat/portal-customer-content`        | C09–C13                                                                                                                     | Depends on A2; KB may be HubSpot KB or custom module — document             |
| **A7 — Admin shell + CRM**                 | `feat/portal-admin-crm`               | A01–A07 + admin layout                                                                                                      | Depends on A1–A2                                                            |
| **A8 — Admin commerce + service**          | `feat/portal-admin-ops`               | A08–A11                                                                                                                     | Depends on A7                                                               |
| **A9 — Data layer**                        | `feat/portal-graphql`                 | `data-queries/*.graphql` + SCHEMA_REGISTRY notes                                                                            | Can start early but **must reconcile** before A4–A8 merge                   |
| **A10 — Admin settings**                   | `feat/portal-admin-settings`          | A12–A24                                                                                                                     | Depends on A7; heavy forms — may stub **read-only** first if APIs undecided |
| **A11 — QA / consistency pass**            | `feat/portal-theme-qa`                | Cross-cutting: contrast, keyboard nav, table responsiveness, HubL errors                                                    | Last before release branch                                                  |


**Rule:** No agent renames another agent’s files without orchestrator approval. **Touch minimal surface area** per PR.

---

## 6. Admin vs customer — access and implementation expectations

- **Customer pages** use **HubSpot private content / memberships** scoped to the contact.  
- **Admin pages** must **not** rely on “security through obscurity.” Implement **separate membership access** (e.g. staff group) or the orchestrator-approved alternative documented in `AGENT_PROMPT.md` / issues.  
- If a feature cannot be secured on CMS alone, the template must **not** expose sensitive data in HTML; use serverless or external app — flag for orchestrator.

---

## 7. Module and template conventions

- **Templates:** `portal-{area}-{name}.html` for customer; `portal-admin-{area}-{name}.html` for admin (adjust to match existing theme naming if already established).  
- **Modules:** group under `modules/navigation/`, `modules/dashboard/`, `modules/admin/`, etc. Each module: `module.html`, `module.css`, `module.js`, `fields.json`, `meta.json`.  
- **Tables:** reusable table wrapper + consistent pagination row (match screenshot patterns: search right, archive toggle, page size).  
- **Forms:** HubSpot forms for writes where possible (per `AGENT_PROMPT.md`).  
- **GraphQL:** every list/detail page documents its query file and required variables; handle **empty states** gracefully.

---

## 8. Merge order (enforced)

1. **A1** → merged first (tokens + base layout).
2. **A2** → chrome.
3. **A3** → system templates.
4. **A9** → GraphQL baseline merged before large page merges (or feature branches rebase onto it).
5. **A4 → A6** customer features (can parallel after A2 + A9 baseline).
6. **A7 → A8 → A10** admin (sequential recommended: CRM shell before settings sprawl).
7. **A11** → final QA pass.

---

## 9. Acceptance criteria (theme-wide)

- All routes in section 4 have a **template or documented merge** (no orphan links in sidebars).  
- Sidebar IA matches **customer** and **admin** structures from screenshots (names may be customized via `fields.json` repeater or hardcoded HubL — pick one pattern).  
- **Inter** only for UI type; weights/sizes create hierarchy.  
- Colors match **section 3.2** defaults or controlled theme fields.  
- Mobile: navigable without horizontal scroll on core pages.  
- `hs upload` / `hs cms upload` succeeds for `customer-portal/cms/` on default account.  
- No PAKs or secrets committed; no `hubspot.config.yml` in git.

---

## 10. Spawn snippet (paste into each agent session)

```text
You are {{AGENT_ID}} building the Hair Solutions HubSpot CMS portal theme.

Read FIRST:
- customer-portal/docs/PORTAL_THEME_MULTI_AGENT_BUILD_PROMPT.md — sections: Global contract (§3), your agent row (§5), Merge order (§8).
- customer-portal/docs/AGENT_PROMPT.md — GraphQL, membership, data model constraints.
- customer-portal/data/SCHEMA_REGISTRY.md — authoritative IDs and names.

Your scope: {{SCOPE_FROM_SECTION_5}}.
Branch/worktree: {{BRANCH_NAME}}. Do not edit files outside your scope.

Design: Inter-only UI font; BASE-aligned tokens in §3.2; reuse css/components and portal-layout.

Done when: your routes/modules listed in your PR + §9 checkboxes for your slice + upload succeeds.
```

Replace `{{AGENT_ID}}`, `{{SCOPE_FROM_SECTION_5}}`, `{{BRANCH_NAME}}` per agent.

---

## 11. Worktree commands (reference for humans)

From repo root (example):

```bash
git fetch origin
git worktree add ../customer-portal-wt-a1 -b feat/portal-theme-foundation origin/main
```

Repeat with unique paths and branches per agent. Merge via PRs following section 8.

---

*Document version: 1.0 — aligns IA to `docs/desired-layout-screenshots/` (CorePortal reference) and styling to BASE + Inter + branding extract.*