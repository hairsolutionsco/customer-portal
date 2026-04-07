# HubSpot Plugin — Hair Solutions Customer Portal

## Project Overview

You are building **Customer Portal 2.0** for **Hair Solutions Co**, a hair replacement company. The portal is a full **HubSpot CMS theme** that replaces an existing Next.js/Prisma portal. The architectural blueprint is the [HubSpot/recruiting-agency-graphql-theme](https://github.com/HubSpot/recruiting-agency-graphql-theme).

**HubSpot Tier:** Content Hub Professional + Service Hub Professional  
**Output directory:** `hair-solutions-portal/`  
**Branch:** `claude/hubspot-plugin-creation-G0JUG`

---

## Skill Routing

Use the slash commands below for specialized HubSpot tasks:

| Task | Command |
|------|---------|
| CRM data model, Custom Objects, associations, properties | `/hubspot-crm-model` |
| HubL, GraphQL queries, modules, templates, CLI, APIs | `/hubspot-developer` |
| Automation, workflows, sequences, reporting, ops | `/hubspot-business-ops` |
| UI how-to, page builder, form setup, membership config | `/hubspot-how-to` |
| Breeze AI, AI agents, ChatSpot, predictive scoring | `/hubspot-ai-expert` |
| Customer situation review, CRM contact audit, SITREP | `/hubspot-customer-sitrep` |

---

## Core Architecture Constraints

### Authentication
- Use **HubSpot Memberships** — never NextAuth, Prisma, or custom JWT
- Gate every portal page with membership group
- Scope all GraphQL queries to `{{ request.contact.contact_vid }}`
- System templates: `membership-login.html`, `membership-register.html`, `membership-reset-password.html`

### Data Access
- **Read operations:** GraphQL data queries (`/data-queries/*.graphql`) only
- **Write operations:** HubSpot Forms only — never direct API calls from templates
- **Catalog data:** HubDB tables (`hubdb/*.json`)
- **Domain models:** Custom Objects defined in `schemas/*.json`

### Custom Objects (5 total)
1. `hair_profile` — per-contact hair measurements & preferences
2. `order` — hair system orders with production stage tracking
3. `order_status_history` — audit trail for order status changes
4. `customization_template` — saved hair configurations per contact
5. `invoice` — billing records associated to contacts

### HubDB Tables (3 total)
- `subscription_plans` — tiered subscription offerings
- `affiliated_locations` — partner salon/clinic locations
- `products` — shop catalog (Hair Systems, Adhesives, Maintenance, Accessories)

---

## Portal Pages & Modules

| Page Template | Primary Module | GraphQL Query |
|---------------|---------------|---------------|
| `portal-dashboard.html` | `dashboard-stats`, `recent-orders`, `production-alert`, `quick-actions` | `dashboard.graphql` |
| `portal-orders.html` | `order-list` | `orders_list.graphql` |
| `portal-order-detail.html` | `order-detail` | `order_detail.graphql` |
| `portal-profile.html` | `hair-profile-display`, `hair-profile-form` | `hair_profile.graphql` |
| `portal-customization.html` | `customization-grid` | `customization_templates.graphql` |
| `portal-shop.html` | `product-grid` | `products.graphql` |
| `portal-billing.html` | `billing-current`, `billing-plans` | `billing.graphql` |
| `portal-invoices.html` | `invoice-table` | `invoices.graphql` |
| `portal-locations.html` | `location-cards` | `locations.graphql` |
| `portal-settings.html` | `settings-profile`, `settings-notifications` | `settings.graphql` |

---

## HubL & GraphQL Patterns

### GraphQL — always scope to current contact
```hubl
{% set result = data_query('hair_profile', {contact_id: request.contact.contact_vid}) %}
{% for item in result.data.CRM.hair_profile_collection.items %}
  {# render item #}
{% endfor %}
```

### Module HTML structure
```hubl
{# modules/dashboard-stats.module/module.html #}
{% require_css "../../../css/components/cards.css" %}
{% set stats = data_query('dashboard', {contact_id: request.contact.contact_vid}) %}
```

### HubDB query
```hubl
{% set plans = hubdb_table_rows('subscription_plans', 'orderBy=display_order&is_active=true') %}
```

---

## Brand Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `brand_color` | `#1a1a2e` | Primary / nav background |
| `accent_color` | `#e94560` | CTAs, active states |
| `success_color` | `#22c55e` | Delivered, paid statuses |
| `warning_color` | `#f59e0b` | In-production, pending |
| `error_color` | `#ef4444` | Cancelled, overdue |
| Font primary | Inter | Body text |
| Font heading | Inter | Headings |

---

## File Completeness Rules

- **No placeholder comments.** No `// TODO`, `<!-- add code here -->`, or stub functions.
- Every `.module/` folder must contain: `meta.json`, `fields.json`, `module.html`, `module.css`.
- Every `schema/*.json` must be valid for `POST /crm/v3/schemas`.
- Every `hubdb/*.json` must include `columns` array and `rows` array with sample data.
- Every GraphQL query file must compile — no undefined fragments or missing type conditions.

---

## Secrets & Environment

- Do **not** print or hardcode HubSpot Private App tokens, API keys, or portal IDs.
- HubSpot credentials live in 1Password vault `HubSpot / hair-solutions-co`.
- For local development use `hs auth` (HubSpot CLI) — never embed tokens in source files.
- The `.mcp.json` at repo root contains the Railway MCP server config only; HubSpot API access is via `hs` CLI or the HubSpot MCP server (configure separately).

---

## MCP Configuration

Production MCP config is at repo root `.mcp.json`. To add the HubSpot MCP server:

```json
{
  "mcpServers": {
    "hubspot": {
      "command": "npx",
      "args": ["-y", "@hubspot/mcp-server"],
      "env": {
        "HUBSPOT_PRIVATE_APP_TOKEN": "<from 1Password>"
      }
    }
  }
}
```

Do **not** commit tokens. Use `HUBSPOT_PRIVATE_APP_TOKEN` env var from shell or `.env.local` (git-ignored).

---

## Git Workflow

- Develop on branch: `claude/hubspot-plugin-creation-G0JUG`
- Push: `git push -u origin claude/hubspot-plugin-creation-G0JUG`
- Do not open a PR without explicit user instruction.
