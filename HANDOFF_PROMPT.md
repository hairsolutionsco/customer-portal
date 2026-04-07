# Hand-off — Customer Portal 2.0 (single orchestrator prompt)

**Cursor:** This repo has **`.cursor/rules/portal-2-orchestrator.mdc`** (`alwaysApply: true`). New chats in this workspace should **read this file + §1** automatically — you do **not** need to paste the full handoff every time unless you want to override §1.

**Other tools / paste:** Copy this file into a new session when the tool has no project rules.

### Mandatory: you must use subagents

You are the **orchestrator**, not a solo implementer. **You must absolutely use subagents** (Task tool, Background Agents, Claude Code subagents, or your environment’s equivalent) to carry the work. **Do not** absorb the full scope of A0–A15, multi-file theme work, and HubSpot verification in a single thread when parallel delegation is possible.

| Rule | Detail |
|------|--------|
| **Spawn** | For each row in **§1 Subagents to launch**, spawn **one dedicated subagent** with **§2 Subagent prompt** (filled placeholders). Same **Parallel group** = launch together. |
| **Stay orchestrator** | You coordinate, merge results, run gates (`portal:verify`, `portal_task_complete.sh`), and fix cross-cutting blockers — you do **not** replace subagents for their scoped issues. |
| **If the tool allows only one agent** | Still **structure** work as sequential subagent-sized tasks: finish one spawn’s scope, ritual, then the next — never “one giant unprompted refactor.” |
| **Exception** | Tiny one-file fixes (e.g. typo in one module) may be direct; anything touching **GraphQL + HubL + upload**, **CRM/HubDB API**, or **≥2 concerns** → **subagent**. |

Your job: run **§1 Next session** in order, **always** execute the subagent grid (per rules above), then run the **task completion ritual** when a batch finishes. Deep specs live in linked docs — do not duplicate them here.

---

## 1. Next session — do this now *(edit this section each handoff)*

### Snapshot

- **Repo:** `00-engineering/apps/customer-portal` · theme: `hair-solutions-portal/`
- **Issues:** #3–#57 · exports: `exports/github-issues.json` (run `npm run portal:issues` to refresh)
- **Data model:** **Hair profile + saved templates → Contact properties.** **Orders → native Commerce `order`.** **Invoices → native `invoices`.** **Custom objects not required** for go-live (CMS custom objects = Enterprise per HubSpot docs). **GraphQL** on membership pages officially lists contact, company, deal, ticket, quote, line_item — **confirm** whether `order`/invoices appear in **your** explorer; if not, use **Deal/Contact mirror** via workflows.
- **Baseline:** GraphQL in repo targets **deals-as-orders** (`deal_collection__contact_to_deal` — verify in explorer), **HubDB** table names `products`, `affiliated_locations`, `subscription_plans`, and contact JSON fields `portal_hair_profile_json`, `portal_saved_templates_json`, `portal_invoices_json`. **API (required):** **`./scripts/op_env.sh npm run portal:hubspot-props`** (CRM scopes) and **`./scripts/op_env.sh npm run portal:hubdb-sync`** (**hubdb** scope on the private app). **Next gate:** upload theme; fix association labels + HubDB column names if validation errors.

### Lead agent — run in order

1. Read **`IMPLEMENTATION_PLAN_SUBAGENTS.md`** §4 (current wave) and §7 (gate for that wave).
2. Run `npm run portal:issues` if the GitHub snapshot may be stale.
3. **Required — subagents:** Execute **§1 Subagents to launch** below: spawn **one subagent per row** (mandatory; see **Mandatory: you must use subagents** above), respecting **Parallel group** (same group = may run together; lower groups first if numbered). **Skipping subagents to “do it all yourself” is not allowed** for normal waves.
4. After the batch: **`./scripts/portal_task_complete.sh "type(scope): what completed"`** (use `SKIP_HUBSPOT=1` only if you must skip upload). Upload uses **`hs`** with default account from **`~/.hscli/config.yml`**; local `hair-solutions-portal/hubspot.config.yml` is optional. See **§3 Task completion ritual**.

### Subagents to launch *(fill before paste — example row set for early Wave 0–1)*

| Parallel group | Agent | Role (from plan §3) | Issues | Notes |
|----------------|-------|---------------------|--------|--------|
| 1 | **A0** | Platform bootstrap | #3, #4, #5 | **`hs account auth`** (global **`~/.hscli/config.yml`**); **`hs accounts list`** OK; portal choice per **§4**; no PAKs in git — **do not use `hs init`** (removed / incompatible with global accounts) |
| 2a | **A1** | CRM config (hair profile → contact props) | #6 | Parallel with 2b after group 1 if portal connected |
| 2b | **A1** | CRM config (native orders + associations) | #7 | Not blocked on custom object; introspect GraphQL for `order` |
| — | **A1** | Timeline / status (#8) | #8 | Deal stages, tickets, or native order — **not** strictly after custom order schema |
| 2c | **A2** | HubDB | #12–#14 | **`npm run portal:hubdb-sync`** from seed JSON (API); do not create tables manually unless API blocked |
| *later* | **A3** | Membership & access | #49–#50 | After subdomain/plan clear |
| *later* | **A5** + **A6** | GraphQL CRM + HubDB | #20–#29 | **Only after** `SCHEMA_REGISTRY.md` has real IDs/names |
| *later* | **A7** | Global chrome | #30–#31 | **Before** wide A8–A12 page parallelization |
| *later* | **A8–A12** | Pages / system UI | #32–#42 | Parallel per plan §4 after A7 |
| *later* | **A13** | Forms | #43–#48 | |
| *later* | **A14** | Service / KB | #51–#53 | |
| *later* | **A15** | Release | #54–#57 | |

**Delete or mark *later* rows** so the next agent only spawns what applies **this** session. For a minimal first paste, use **group 1 only (A0)** until `hs accounts list` works (global **`~/.hscli/config.yml`** or local `hubspot.config.yml`); then **2a + 2b + 2c** together; add **#8** when timeline approach is chosen.

### Blockers / do not launch until

- **A5/A6:** `hair-solutions-portal/SCHEMA_REGISTRY.md` populated enough to match explorer names (see plan handoff).
- **#8:** Agreed pattern for order timeline (native order fields / deal / ticket) documented in **SCHEMA_REGISTRY.md** — **not** dependent on custom order object.
- **Parallel A8–A12:** **A7** (#30–#31) merged first.

---

## 2. Subagent prompt *(copy once per spawn; replace placeholders)*

```text
You are Agent {{AGENT_ID}} ({{ROLE_NAME}}) for hairsolutionsco/customer-portal — a **dedicated subagent** spawned by the portal orchestrator (do not try to run the whole program alone).

Orchestrator batch: {{BATCH_DESCRIPTION}}

1. Read IMPLEMENTATION_PLAN_SUBAGENTS.md — your role in §3, wave in §4, issues: {{ISSUE_NUMBERS}}.
2. Read AGENT_PROMPT.md — only the sections from the execution-model table for your role.
3. Read master-plan for the matching phase.
4. Work only in your scope. Update hair-solutions-portal/SCHEMA_REGISTRY.md if CRM/HubDB IDs or GraphQL association names change.

Done when: GitHub issue AC + quality gate G* from IMPLEMENTATION_PLAN_SUBAGENTS.md §7 satisfied; orchestrator runs portal_task_complete.sh (or you run it if solo).
```

---

## 3. Evergreen reference *(rarely changes)*

### Mission

Deliver **Portal 2.0** on **HubSpot CMS** under `hair-solutions-portal/`. The Next.js app in this repo is **legacy**.

**Done (program):** issues **#3–#57** closed or explicitly deferred; portal usable on membership domain with real data, forms, deploy, QA — per **`master-plan`**, **`AGENT_PROMPT.md`**, and issue AC.

### Repo map

| Path | Purpose |
|------|---------|
| `hair-solutions-portal/src/` | Theme source (upload with `hs`) |
| `hair-solutions-portal/schemas/` | Custom object JSON (POST to HubSpot) |
| `hair-solutions-portal/hubdb/` | HubDB seed JSON |
| `hair-solutions-portal/SCHEMA_REGISTRY.md` | Live IDs + GraphQL names (**required** before A5/A6 finalize) |

**GitHub:** `hairsolutionsco/customer-portal`

### Task completion ritual

From `00-engineering/apps/customer-portal`:

```bash
./scripts/portal_task_complete.sh "type(scope): what completed"
```

Refreshes issue exports, `hs upload` (if config present), git commit + push. Flags: `SKIP_HUBSPOT=1`, etc. — see **`IMPLEMENTATION_PLAN_SUBAGENTS.md` §6a**.

**Secrets:** Never print PAKs; never commit `hair-solutions-portal/hubspot.config.yml` or `.env` (`.env` is gitignored). Optional local **`HUBSPOT_PERSONAL_ACCESS_KEY`** and **`HUBSPOT_SERVICE_KEY`** live in `.env` only — see **`.env.example`**; paste values yourself; do not commit them.

### HubSpot CLI and portal choice (#3–#5)

**Default:** credentials live in **`~/.hscli/config.yml`**. If **`hs accounts list`** already shows your portal and uploads work, **do nothing** — auth lasts until you revoke the key or use a new machine. Only run **`hs account auth`** when you need to (first setup, rotated personal access key, new account, or CLI says you are not logged in). Theme upload from `hair-solutions-portal/`: **`hs cms upload src hair-solutions-portal`** on newer CLI, or **`hs upload src hair-solutions-portal`** on older CLI. **`portal_task_complete.sh`** detects which works (no local config file required).

**Do not use `hs init`:** HubSpot’s current CLI uses **global account management**; `hs init` returns an error directing you to **`hs account auth`**. Optional gitignored **`hubspot.config.yml`** is only relevant if your CLI version documents it; default path is global config + `hs accounts list` / default account.

| Situation | Approach |
|-----------|----------|
| HubSpot **Sandbox** available | Prefer it for build/test. |
| One primary portal only | Use it; disciplined drafts/test data; clear Design Manager folder (`HUBSPOT_THEME_DEST`, default `hair-solutions-portal`). |
| Need isolation | Second portal if licensing allows. |

Production portal: extra care for **published** `/portal/*`, HubDB, CRM test records, and **membership/DNS (#5, #57)**.

### Doc index *(detail lives here, not in this handoff)*

1. **`IMPLEMENTATION_PLAN_SUBAGENTS.md`** — waves, roster A0–A15, G1–G7, §6a ritual
2. **`AGENT_PROMPT.md`** — file-level build spec; section → agent map
3. **`master-plan`** — architecture, routes, phases
4. **`exports/github-issues.json`** — AC per issue

**Reference theme:** [HubSpot/recruiting-agency-graphql-theme](https://github.com/HubSpot/recruiting-agency-graphql-theme)

### If stuck

- **GraphQL:** Explorer + introspection → fix `.graphql` / HubL → **SCHEMA_REGISTRY.md**
- **Upload:** `hs accounts list`, config path, `HUBSPOT_THEME_DEST`
- **Membership:** #5 / #57; prefer sandbox when possible

### Autonomous / overnight runs *(expectations + setup)*

**Reality:** Closing **all** of #3–#57 by morning is **unlikely without** (a) a **running agent session** for hours, (b) working **`hs`** auth (**`~/.hscli/config.yml`** or local config) + **`gh` auth**, (c) **HubSpot UI** access for some issues (access groups, workflows, forms, DNS). The model may also **hit usage limits** or stop for confirmations. Treat “overnight” as **maximize progress**, not guaranteed completion.

**Before you leave the machine:**

| Prerequisite | Why |
|--------------|-----|
| **`hs account auth`** done; **`hs accounts list`** shows default; **`hs upload`** / **`hs cms upload`** works once manually from `hair-solutions-portal/` | Unblocks ritual uploads |
| `gh auth status` OK | `npm run portal:issues` and ritual push |
| Machine **stays awake**; Cursor / agent **allowed to run** | Sleep kills long jobs |
| **§1** table trimmed to the **next waves** you want (e.g. A0→A1/A2) | Agent doesn’t wander |

**Cursor (recommended):** Open this workspace (so the **orchestrator rule** loads). Start **one** chat or **Background Agent** with a single instruction, e.g. *“You are the portal orchestrator. Follow `HANDOFF_PROMPT.md` §1; **you must use subagents** for each row in the §1 table (Task tool / parallel agents); after each wave run `portal_task_complete.sh`; if HubSpot blocks you, `SKIP_HUBSPOT=1` and continue repo work; don’t wait for me.”* Enable **auto-run / accept edits** for that session if your Cursor settings allow.

**Claude Code / other CLIs:** Point the tool at this directory and give it the same instruction plus path to `HANDOFF_PROMPT.md`.

**No-AI automation:** You can cron `npm run portal:issues` to keep `exports/github-issues.json` fresh; that alone does **not** implement features or close HubSpot-side work.

---

*End of hand-off — paste the entire file for the receiving orchestrator (or rely on `.cursor/rules` in Cursor).*
