# HubSpot CMS Fundamentals Skill

You are a **HubSpot CMS platform expert**. This skill covers the foundational layer of HubSpot CMS development: file system architecture, theme structure, module system, CLI workflow, local development, and the HubSpot design manager. Use this skill before writing any HubSpot code — it defines the rules everything else builds on.

---

## 1. HubSpot CMS File System

HubSpot CMS stores all developer assets in a virtual file system (the **Design Manager**). All files can be managed via CLI or UI.

### Top-Level Asset Types

| Type | Extension(s) | Location in Design Manager |
|------|-------------|---------------------------|
| Templates | `.html` | `templates/` |
| Modules | `.module/` (folder) | `modules/` |
| CSS | `.css` | `css/` |
| JavaScript | `.js` | `js/` |
| Images | `.png .jpg .svg .gif` | `images/` |
| Data queries | `.graphql` | `data-queries/` |
| Theme config | `theme.json` | theme root |
| Global fields | `fields.json` | theme root |
| Sections | `.html` | `sections/` |
| Global content | `.html` | `global/` |

### Theme Directory Layout (canonical)

```
hair-solutions-portal/
├── theme.json                    ← theme metadata
├── fields.json                   ← global theme fields (brand tokens)
├── images/
│   └── template-previews/
│       └── theme-screenshot.png
├── css/
│   ├── main.css
│   ├── portal-layout.css
│   └── components/
│       ├── cards.css
│       ├── tables.css
│       ├── badges.css
│       ├── forms.css
│       └── buttons.css
├── js/
│   └── main.js
├── data-queries/
│   └── *.graphql
├── modules/
│   └── <name>.module/
│       ├── meta.json
│       ├── fields.json
│       ├── module.html
│       └── module.css
├── templates/
│   ├── layouts/
│   │   ├── base.html
│   │   └── portal.html
│   ├── partials/
│   │   ├── header.html
│   │   └── footer.html
│   ├── portal-dashboard.html
│   └── system/
│       ├── membership-login.html
│       ├── membership-register.html
│       ├── membership-reset-password.html
│       ├── 404.html
│       └── 500.html
└── sections/
    └── portal-content-section.html
```

---

## 2. Theme Configuration

### `theme.json` — required fields

```json
{
  "name": "hair-solutions-portal",
  "label": "Hair Solutions Portal",
  "version": "1.0.0",
  "author": "Hair Solutions Co",
  "screenshot_path": "./images/template-previews/theme-screenshot.png",
  "responsive": true,
  "enable_domain_stylesheets": false,
  "previewable": true
}
```

### `fields.json` — global theme fields

These power the **Theme Settings** panel in the page editor. Every template can reference them via `{{ theme.<field_name> }}`.

```json
[
  {
    "type": "color",
    "name": "brand_color",
    "label": "Brand Color",
    "default": { "color": "#1a1a2e", "opacity": 100 }
  },
  {
    "type": "color",
    "name": "accent_color",
    "label": "Accent Color",
    "default": { "color": "#e94560", "opacity": 100 }
  },
  {
    "type": "font",
    "name": "font_primary",
    "label": "Primary Font",
    "default": {
      "font": "Inter",
      "font_set": "GOOGLE",
      "size": 16,
      "size_unit": "px",
      "color": "#333333"
    }
  },
  {
    "type": "image",
    "name": "logo",
    "label": "Company Logo",
    "default": { "src": "", "alt": "Hair Solutions" }
  },
  {
    "type": "text",
    "name": "company_name",
    "label": "Company Name",
    "default": "Hair Solutions"
  }
]
```

---

## 3. Module System

Every module is a **folder** ending in `.module/`. It is the primary unit of content composition in HubSpot CMS — reusable, configurable, drag-and-drop.

### Required Files

| File | Purpose |
|------|---------|
| `meta.json` | Module identity, host template types, editor settings |
| `fields.json` | Editable content fields (shown in page editor sidebar) |
| `module.html` | HubL/HTML template |
| `module.css` | Scoped CSS (auto-loaded when module is on page) |

### `meta.json` — full reference

```json
{
  "label": "Dashboard Stats",
  "icon": "bar-chart",
  "css_assets": [],
  "js_assets": [],
  "other_assets": [],
  "smart_objects": [],
  "editable_in_editor": true,
  "global": false,
  "is_available_for_new_content": true,
  "categories": ["BODY_CONTENT"],
  "host_template_types": ["PAGE", "BLOG_POST", "BLOG_LISTING", "EMAIL", "QUOTE"]
}
```

- `global: true` → module renders the same content everywhere; editing anywhere updates everywhere
- `host_template_types` — limit which template types can use this module
- `categories` — used for filtering in drag-and-drop editor

### `fields.json` — field type reference

```json
[
  { "type": "text",       "name": "heading",     "label": "Heading",      "default": "Dashboard" },
  { "type": "richtext",   "name": "body",        "label": "Body text",    "default": "" },
  { "type": "image",      "name": "hero_image",  "label": "Hero image",   "default": { "src": "", "alt": "" } },
  { "type": "url",        "name": "cta_url",     "label": "CTA link",     "default": { "href": "#", "type": "EXTERNAL" } },
  { "type": "boolean",    "name": "show_stats",  "label": "Show stats?",  "default": true },
  { "type": "number",     "name": "limit",       "label": "Max items",    "default": 5 },
  { "type": "color",      "name": "bg_color",    "label": "Background",   "default": { "color": "#ffffff", "opacity": 100 } },
  { "type": "font",       "name": "font",        "label": "Font",         "default": {} },
  { "type": "choice",     "name": "layout",      "label": "Layout",       "default": "grid",
    "choices": [["grid","Grid"],["list","List"],["compact","Compact"]] },
  { "type": "group",      "name": "items",       "label": "Items",        "default": [], "children": [
    { "type": "text", "name": "item_label", "label": "Label", "default": "" },
    { "type": "number", "name": "item_value", "label": "Value", "default": 0 }
  ]}
]
```

### Accessing fields in `module.html`

```hubl
{{ module.heading }}
{{ module.body }}
<img src="{{ module.hero_image.src }}" alt="{{ module.hero_image.alt }}">
<a href="{{ module.cta_url.href }}">Click here</a>
{% if module.show_stats %}...{% endif %}
{% for item in module.items %}{{ item.item_label }}: {{ item.item_value }}{% endfor %}
```

---

## 4. Template Types

| Type | Annotation | Use case |
|------|-----------|---------|
| Page | `<!-- templateType: page -->` | Standard CMS pages |
| Blog listing | `<!-- templateType: blog_listing -->` | Blog index |
| Blog post | `<!-- templateType: blog_post -->` | Individual posts |
| Email | `<!-- templateType: email -->` | Marketing/transactional email |
| System | no annotation needed | Login, 404, 500, etc. |
| Section | `<!-- templateType: section -->` | Drag-and-drop section presets |

### Required template annotations (top of every `.html` template)

```hubl
<!--
  templateType: page
  isAvailableForNewContent: true
  label: Portal Dashboard
  screenshotPath: ../images/template-previews/portal-dashboard.png
-->
```

---

## 5. HubSpot CLI — Complete Reference

### Setup & Auth

```bash
# Install globally
npm install -g @hubspot/cli

# Authenticate (opens browser OAuth)
hs auth

# Check connected accounts
hs accounts list

# Switch default account
hs accounts use <accountName>
```

### Local ↔ Remote Sync

```bash
# Upload entire theme
hs upload hair-solutions-portal/ hair-solutions-portal

# Upload single file
hs upload hair-solutions-portal/src/templates/portal-dashboard.html \
  hair-solutions-portal/templates/portal-dashboard.html

# Watch for changes (hot-reload)
hs watch hair-solutions-portal/ hair-solutions-portal

# Fetch remote file to local
hs fetch hair-solutions-portal/templates/portal-dashboard.html \
  hair-solutions-portal/src/templates/portal-dashboard.html

# Fetch entire theme from remote
hs fetch hair-solutions-portal/ hair-solutions-portal/
```

### Custom Objects & HubDB

```bash
# Create custom object from schema JSON
hs schema create schemas/hair_profile.json

# List custom object schemas
hs schema list

# Upload HubDB table (create or update)
hs hubdb upsert hubdb/subscription_plans.json

# Fetch HubDB table to JSON
hs hubdb fetch subscription_plans > hubdb/subscription_plans.json
```

### Modules

```bash
# Create a new module scaffold
hs create module dashboard-stats
# → creates dashboard-stats.module/ with stub files

# Validate a module
hs lint hair-solutions-portal/src/modules/dashboard-stats.module
```

---

## 6. Local Development Setup

### `hubspot.config.yml` (auto-generated by `hs auth`, at repo root)

```yaml
defaultPortal: hair-solutions-co
portals:
  - name: hair-solutions-co
    portalId: <PORTAL_ID>
    authType: personalaccesskey
    personalAccessKey: <from 1Password — never commit>
    auth:
      tokenInfo:
        accessToken: ...
        expiresAt: ...
```

**Git-ignore this file** — tokens live in 1Password.

### `.gitignore` additions

```
hubspot.config.yml
.env.local
node_modules/
```

### Recommended workflow

```bash
# 1. Auth once per machine
hs auth

# 2. Start watch session
hs watch hair-solutions-portal/ hair-solutions-portal --initial-upload

# 3. Edit files locally → HubSpot auto-syncs
# 4. Test in browser at your HubSpot portal domain
```

---

## 7. Content Hub Tier — Feature Availability

| Feature | Starter | Professional | Enterprise |
|---------|---------|-------------|-----------|
| CMS themes | Yes | Yes | Yes |
| Custom modules | Yes | Yes | Yes |
| HubDB | — | Yes | Yes |
| GraphQL data queries | — | Yes | Yes |
| Memberships | — | Yes | Yes |
| Dynamic pages | — | Yes | Yes |
| Serverless functions | — | Yes | Yes |
| Custom CDN/domain | — | Yes | Yes |
| Activity logging (design manager) | — | — | Yes |

Hair Solutions is on **Content Hub Professional** — all features above except Enterprise tier are available.

---

## Output Rules

- Always include the full required file set when creating a module (all 4 files).
- `meta.json` must always set `host_template_types` explicitly.
- Never use inline `<style>` in `module.html` — CSS goes in `module.css` only.
- Template annotations are required at the top of every `.html` template file.
- Never hardcode portal IDs, access tokens, or private app keys.

## Argument: $ARGUMENTS

Use `$ARGUMENTS` as the specific fundamentals question or task. If blank, ask: "What HubSpot CMS fundamentals topic do you need? (theme structure, module scaffold, CLI commands, fields.json, meta.json, template annotations, local dev setup)"
