# Design Assets

This directory contains design references and HubSpot CMS templates for the Hair Solutions Customer Portal.

## Structure

```
design/
├── hubspot-cms/          # HubSpot CMS theme files (HubL templates)
│   ├── layouts/          # Base page layout (shell, sidebar, header, footer)
│   │   └── base.html     # Main layout — extends all page templates
│   ├── modules/          # Reusable HubSpot drag-and-drop modules
│   │   ├── data-table.module/
│   │   ├── hero.module/
│   │   ├── profile-form.module/
│   │   ├── sidebar.module/
│   │   └── toast-alert.module/
│   └── templates/        # Page templates (one per portal route)
│       ├── dashboard.html
│       ├── dashboard-liquid-glass.html
│       ├── orders.html
│       ├── invoices.html
│       ├── account.html
│       ├── support.html
│       ├── knowledge-base.html
│       ├── ai-agent.html
│       ├── login.html
│       ├── settings.html
│       ├── home.html
│       ├── contacts.html
│       ├── companies.html
│       ├── deals.html
│       ├── quotes.html
│       ├── documents.html
│       └── blog-*.hubl.html   # Blog listing/detail (Elevate theme)
└── mockups/              # Static HTML/CSS visual mockups ("Liquid Glass" dark theme)
    ├── styles.css        # Complete design system — tokens, layout, components
    ├── dashboard.html
    ├── orders.html
    ├── invoices.html
    ├── account.html
    ├── support.html
    ├── knowledge-base.html
    ├── store.html
    └── ai-assistant.html
```

## HubSpot CMS (`hubspot-cms/`)

HubL-based templates for the HubSpot CMS customer portal. Each page template:
- Sets `portal_route` and `requires_auth`
- Extends `layouts/base.html` (Bootstrap 5 shell with sidebar navigation)
- Renders into `#portal-app` via a client-side JS bundle (`portal.bundle.js`)

The layout injects `window.PORTAL_CONFIG` with HubSpot personalization tokens (contact name, email, company) for the logged-in member.

### Modules

| Module | Purpose |
|--------|---------|
| `toast-alert` | Default toast notification template (used in base layout) |
| `sidebar` | Configurable brand block (portal name/subtitle) |
| `hero` | Marketing hero card with optional CTA |
| `data-table` | Placeholder data table with empty state |
| `profile-form` | Placeholder for client-rendered profile form |

## Mockups (`mockups/`)

Standalone HTML mockups implementing the **Liquid Glass** dark design system. Open any `.html` file directly in a browser to preview. These serve as the visual design reference for the portal UI.

### Design System Highlights

- **Theme**: Dark glass panels with frosted blur effects
- **Typography**: Sora (headings) + Manrope (body)
- **Colors**: Dark blue glass base, cyan/blue accent (`#5ca6ff`), semantic status colors
- **Components**: KPI cards, data tables, filter chips, badges, split layouts, chat bubbles
- **Responsive**: Mobile sidebar toggle, stacked layouts on small screens
- **Animations**: Fade-up entrance, stagger delays, pulse indicators

### Page Mapping (Mockups → Next.js App)

| Mockup | Next.js Route | Notes |
|--------|---------------|-------|
| `dashboard.html` | `/app` | KPIs, widget grid, recent orders |
| `orders.html` | `/app/orders` | Order list with filters + detail panel |
| `invoices.html` | `/app/invoices` | KPI summary + invoice table |
| `account.html` | `/app/settings` | Profile sections + edit form |
| `support.html` | `/app/support` | Ticket list + create form |
| `knowledge-base.html` | `/app/help` | Article search + preview |
| `store.html` | `/app/shop` | Product catalog + cart |
| `ai-assistant.html` | — | Chat UI (not yet in Next.js) |
