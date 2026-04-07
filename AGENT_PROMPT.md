# Code Agent Prompt — Build Customer Portal 2.0 on HubSpot CMS

## Context

You are building **Customer Portal 2.0** for a hair replacement company called **Hair Solutions**. This is a full HubSpot CMS theme that replaces an existing Next.js/Prisma customer portal. The portal uses **HubSpot Memberships** for authentication, **GraphQL data queries** to show per-customer CRM data, **Custom Objects** for domain models, **HubDB tables** for catalog data, and **HubSpot Forms** for all write operations.

**The architectural blueprint is the [HubSpot/recruiting-agency-graphql-theme](https://github.com/HubSpot/recruiting-agency-graphql-theme) repo.** That theme does exactly what we need — membership-gated pages, GraphQL queries scoped to `request.contact.contact_vid`, custom object schemas, dynamic pages, and HubSpot forms. Our portal follows the same patterns with hair-industry data instead of job applications.

The customer has **HubSpot Content Hub Professional** and **Service Hub Professional**.

---

## What to Build

Build every file in the theme directory structure below. The output is a complete, uploadable HubSpot CMS theme in a directory called `hair-solutions-portal/`. Every file must be production-ready — no placeholder comments, no TODO stubs, no "add your code here" blocks.

---

## Directory Structure

```
hair-solutions-portal/
├── schemas/
│   ├── hair_profile.json
│   ├── order.json
│   ├── order_status_history.json
│   ├── customization_template.json
│   └── invoice.json
├── hubdb/
│   ├── subscription_plans.json
│   ├── affiliated_locations.json
│   └── products.json
└── src/
    ├── theme.json
    ├── fields.json
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
    │   ├── dashboard.graphql
    │   ├── hair_profile.graphql
    │   ├── orders_list.graphql
    │   ├── order_detail.graphql
    │   ├── customization_templates.graphql
    │   ├── invoices.graphql
    │   ├── billing.graphql
    │   ├── products.graphql
    │   ├── locations.graphql
    │   └── settings.graphql
    ├── modules/
    │   ├── portal-sidebar.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── portal-header.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── dashboard-stats.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── production-alert.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── recent-orders.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── quick-actions.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── order-list.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── order-detail.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── hair-profile-display.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── hair-profile-form.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── customization-grid.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── invoice-table.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── billing-current.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── billing-plans.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── product-grid.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── location-cards.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   ├── settings-profile.module/
    │   │   ├── meta.json
    │   │   ├── fields.json
    │   │   ├── module.html
    │   │   └── module.css
    │   └── settings-notifications.module/
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
    │   ├── portal-orders.html
    │   ├── portal-order-detail.html
    │   ├── portal-profile.html
    │   ├── portal-customization.html
    │   ├── portal-shop.html
    │   ├── portal-billing.html
    │   ├── portal-invoices.html
    │   ├── portal-locations.html
    │   ├── portal-settings.html
    │   └── system/
    │       ├── membership-login.html
    │       ├── membership-register.html
    │       ├── membership-reset-password.html
    │       ├── membership-reset-password-request.html
    │       ├── 404.html
    │       └── 500.html
    └── sections/
        └── portal-content-section.html
```

---

## 1. Custom Object Schemas

Create these as JSON files under `schemas/`. They will be posted to **`POST /crm/v3/schemas`**. Follow the exact format from [HubSpot/recruiting-agency-graphql-theme/schemas/](https://github.com/HubSpot/recruiting-agency-graphql-theme/tree/main/schemas).

### `schemas/hair_profile.json`

```
name: hair_profile
labels: { singular: "Hair Profile", plural: "Hair Profiles" }
primaryDisplayProperty: preferred_style
requiredProperties: []
associatedObjects: ["CONTACT"]
properties:
  - head_circumference: number
  - front_to_nape: number
  - ear_to_ear: number
  - temple_to_temple: number
  - preferred_style: text
  - density: enumeration [light, medium, heavy]
  - hair_color: text
  - base_type: enumeration [lace, skin, mono]
  - attachment_method: enumeration [tape, glue, clips]
  - activity_level: text
  - sweating_level: enumeration [low, moderate, high]
  - work_environment: text
  - sports_activities: text
  - photo_front: text (URL)
  - photo_side: text (URL)
  - photo_back: text (URL)
  - photo_top: text (URL)
  - notes: text (textarea)
  - allergies: text (textarea)
  - onboarding_completed: booleancheckbox
```

### `schemas/order.json`

```
name: order
labels: { singular: "Order", plural: "Orders" }
primaryDisplayProperty: order_number
associatedObjects: ["CONTACT"]
properties:
  - order_number: text (hasUniqueValue: true)
  - product_name: text
  - status: enumeration [pending, confirmed, in_production, quality_check, shipped, delivered, cancelled]
  - production_stage: enumeration [awaiting_confirmation, materials_preparation, base_construction, hair_ventilation, styling, quality_inspection, packaging, completed]
  - subtotal: number
  - tax: number
  - shipping: number
  - total: number
  - currency: text (default "USD")
  - estimated_production_start: date
  - estimated_completion: date
  - actual_completion_date: date
  - shipped_at: date
  - delivered_at: date
  - customer_notes: text (textarea)
  - configuration_snapshot: text (textarea, JSON string)
```

### `schemas/order_status_history.json`

```
name: order_status_history
labels: { singular: "Order Status Update", plural: "Order Status Updates" }
primaryDisplayProperty: status
associatedObjects: [] (will associate with order custom object after creation)
properties:
  - status: enumeration [pending, confirmed, in_production, quality_check, shipped, delivered, cancelled]
  - stage: enumeration [awaiting_confirmation, materials_preparation, base_construction, hair_ventilation, styling, quality_inspection, packaging, completed]
  - notes: text (textarea)
  - created_by: text
```

### `schemas/customization_template.json`

```
name: customization_template
labels: { singular: "Customization Template", plural: "Customization Templates" }
primaryDisplayProperty: template_name
associatedObjects: ["CONTACT"]
properties:
  - template_name: text
  - base_type: enumeration [lace, skin, mono]
  - hair_color: text
  - density: enumeration [light, medium, heavy]
  - hair_length: text
  - style: text
  - attachment_method: enumeration [tape, glue, clips]
  - additional_options: text (textarea)
  - is_default: booleancheckbox
  - notes: text (textarea)
```

### `schemas/invoice.json`

```
name: invoice
labels: { singular: "Invoice", plural: "Invoices" }
primaryDisplayProperty: invoice_number
associatedObjects: ["CONTACT"]
properties:
  - invoice_number: text (hasUniqueValue: true)
  - amount: number
  - tax: number
  - total: number
  - currency: text (default "USD")
  - status: enumeration [pending, paid, overdue, cancelled]
  - issue_date: date
  - due_date: date
  - paid_at: date
  - pdf_url: text
  - description: text (textarea)
```

---

## 2. HubDB Table Seed Data

Create JSON files under `hubdb/` with table definitions and sample rows.

### `hubdb/subscription_plans.json`
Table columns: name (text), description (richtext), price (number), currency (text), interval (text: "month"/"year"), systems_per_year (number), features (richtext), is_active (boolean), display_order (number)

Sample rows:
1. Essential — $199/mo — 2 systems/year — Basic maintenance, email support
2. Professional — $349/mo — 4 systems/year — Priority support, quarterly refresh, style consultations
3. Premium — $549/mo — 6 systems/year — Unlimited consultations, emergency replacements, VIP scheduling

### `hubdb/affiliated_locations.json`
Table columns: name (text), country (text), state (text), city (text), address (text), postal_code (text), phone (text), email (text), website (text), services_offered (text), specialties (text), latitude (number), longitude (number), description (richtext), is_featured (boolean), display_order (number)

Include 3 sample locations.

### `hubdb/products.json`
Table columns: name (text), slug (text), description (richtext), short_description (text), price (number), compare_at_price (number), currency (text), category (text), primary_image (image), in_stock (boolean), featured (boolean), display_order (number)

Categories: Hair Systems, Adhesives, Maintenance, Accessories
Include 6 sample products.

---

## 3. Theme Configuration

### `src/theme.json`
```json
{
  "name": "hair-solutions-portal",
  "label": "Hair Solutions Portal",
  "version": "1.0.0",
  "author": "Hair Solutions Co",
  "screenshot_path": "./images/template-previews/theme-screenshot.png",
  "responsive": true
}
```

### `src/fields.json`
Global theme fields:
- `brand_color` (color, default: `#1a1a2e`) — Primary brand color
- `accent_color` (color, default: `#e94560`) — Accent/CTA color
- `success_color` (color, default: `#22c55e`)
- `warning_color` (color, default: `#f59e0b`)
- `error_color` (color, default: `#ef4444`)
- `font_primary` (font, default: Inter)
- `font_heading` (font, default: Inter)
- `logo` (image) — Company logo
- `company_name` (text, default: "Hair Solutions")

---

## 4. CSS Files

### Design System (in `src/css/main.css`)
Use CSS custom properties derived from `theme.brand_color`, etc. (via HubL `{{ theme.brand_color.color }}`). The design should be clean, modern, professional — similar to a SaaS dashboard. Think Stripe Dashboard or Linear.

- CSS variables for colors, spacing, typography, border-radius, shadows
- Base reset / normalize
- Typography scale
- Utility classes for spacing, text alignment, visibility

### `src/css/portal-layout.css`
- Fixed left sidebar (280px wide, dark background matching brand_color, white text)
- Header bar (sticky top, white background, shadow)
- Main content area with padding
- Mobile: sidebar hidden by default, hamburger toggle, sidebar slides in as overlay
- Responsive breakpoints: 768px (tablet), 1024px (desktop)

### Component CSS files (`src/css/components/`)
- `cards.css` — Card containers with shadow, hover states, stat cards with icon
- `tables.css` — Styled tables with striped rows, hover highlight, responsive (horizontal scroll on mobile)
- `badges.css` — Status badges for order status (pending=yellow, confirmed=blue, in_production=purple, shipped=indigo, delivered=green, cancelled=red), invoice status, plan status
- `forms.css` — HubSpot form overrides to match theme styling
- `buttons.css` — Primary, secondary, outline, ghost, danger button variants + sizes

---

## 5. JavaScript

### `src/js/main.js`
Minimal vanilla JS:
- Sidebar toggle (mobile hamburger menu)
- Active sidebar link highlighting based on `window.location.pathname`
- Dismissable alert/notification banners
- Tab switching for settings page (profile / notifications / security tabs)
- No frameworks, no build step — this runs directly in the browser

---

## 6. GraphQL Data Queries

**CRITICAL PATTERN:** All queries that fetch per-customer data MUST use `request.contact.contact_vid` to scope data to the logged-in member. This is the HubSpot Memberships integration point.

Reference from the recruiting-agency-graphql-theme:
```graphql
# This is a REAL WORKING example from HubSpot's reference theme:
# label: "Applications"
# description: ""
# $contact_id: {{ request.contact.contact_vid || '' }}
query applications($contact_id: String!) {
  CRM {
    contact(uniqueIdentifier: "id", uniqueIdentifierValue: $contact_id) {
      associations {
        p_job_application_collection__job_application_to_contact {
          items {
            _metadata { id }
            status
            role_applied_for
          }
        }
      }
    }
  }
}
```

### `data-queries/dashboard.graphql`

```graphql
# label: "Portal Dashboard"
# description: "Dashboard data for logged-in customer"
# $contact_id: {{ request.contact.contact_vid || '' }}
query dashboard($contact_id: String!) {
  CRM {
    contact(uniqueIdentifier: "id", uniqueIdentifierValue: $contact_id) {
      firstname
      lastname
      email
      current_plan
      plan_status
      period_end
      associations {
        p_hair_profile_collection__hair_profile_to_contact {
          items {
            onboarding_completed
          }
        }
        p_order_collection__order_to_contact {
          items {
            _metadata { id }
            order_number
            product_name
            status
            production_stage
            total
            estimated_completion
            hs_createdate
          }
          total
        }
      }
    }
  }
}
```

### `data-queries/orders_list.graphql`

Fetch all orders associated with the logged-in contact. Include: `_metadata.id`, `order_number`, `product_name`, `status`, `production_stage`, `total`, `currency`, `estimated_completion`, `hs_createdate`, `shipped_at`, `delivered_at`.

### `data-queries/order_detail.graphql`

**Dynamic page query.** Uses `dynamic_page_hubdb_row` or `dynamic_page_crm_object` pattern. Fetch a single order by its `order_number` (the dynamic slug). Include ALL order fields plus associated `order_status_history` items (for the production timeline). Also verify the order belongs to the logged-in contact via `contact_vid`.

```graphql
# label: "Order Detail"
# description: "Single order with status history"
# $contact_id: {{ request.contact.contact_vid || '' }}
# $order_slug: {{ request.path_param_dict.dynamic_slug || '' }}
```

### `data-queries/hair_profile.graphql`

Fetch the contact's associated hair profile with ALL fields: measurements (head_circumference, front_to_nape, ear_to_ear, temple_to_temple), preferences (preferred_style, density, hair_color, base_type, attachment_method), lifestyle (activity_level, sweating_level, work_environment, sports_activities), photos (photo_front, photo_side, photo_back, photo_top), notes, allergies, onboarding_completed.

### `data-queries/customization_templates.graphql`

Fetch all customization templates associated with the contact. Include: `_metadata.id`, `template_name`, `base_type`, `hair_color`, `density`, `hair_length`, `style`, `attachment_method`, `additional_options`, `is_default`, `notes`, `hs_createdate`.

### `data-queries/invoices.graphql`

Fetch all invoices associated with the contact. Include: `_metadata.id`, `invoice_number`, `amount`, `tax`, `total`, `currency`, `status`, `issue_date`, `due_date`, `paid_at`, `pdf_url`, `description`, `hs_createdate`.

### `data-queries/billing.graphql`

Fetch contact's plan properties: `current_plan`, `plan_price`, `billing_interval`, `period_start`, `period_end`, `plan_status`. Also fetch the HubDB `subscription_plans` table for the plan comparison grid.

### `data-queries/products.graphql`

Fetch all rows from HubDB `products` table. No contact scoping needed — this is a public catalog. Use `HUBDB { table(name: "products") { ... } }`.

### `data-queries/locations.graphql`

Fetch all rows from HubDB `affiliated_locations` table. No contact scoping needed.

### `data-queries/settings.graphql`

Fetch contact properties for the settings page: `firstname`, `lastname`, `email`, `phone`, `address`, `city`, `state`, `zip`, `notify_order_updates`, `notify_production_reminders`, `notify_marketing`.

---

## 7. Templates

### Layout Pattern

**`templates/layouts/base.html`** — Full HTML skeleton:
```hubl
<!DOCTYPE html>
<html lang="{{ html_lang }}" {{ html_lang_dir }}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {{ standard_header_includes }}
  {{ require_css(get_asset_url("../../css/main.css")) }}
  {% block head %}{% endblock %}
</head>
<body>
  {% block body %}{% endblock %}
  {{ standard_footer_includes }}
  {% block scripts %}{% endblock %}
</body>
</html>
```

**`templates/layouts/portal.html`** — Extends base, adds portal chrome:
```hubl
{% extends "./base.html" %}
{% block head %}
  {{ require_css(get_asset_url("../../css/portal-layout.css")) }}
  {{ require_css(get_asset_url("../../css/components/cards.css")) }}
  {{ require_css(get_asset_url("../../css/components/tables.css")) }}
  {{ require_css(get_asset_url("../../css/components/badges.css")) }}
  {{ require_css(get_asset_url("../../css/components/buttons.css")) }}
  {{ require_css(get_asset_url("../../css/components/forms.css")) }}
{% endblock %}
{% block body %}
  <div class="portal-layout">
    {% module "sidebar" path="../modules/portal-sidebar.module" %}
    <div class="portal-main">
      {% module "header" path="../modules/portal-header.module" %}
      <main class="portal-content">
        {% block portal_content %}{% endblock %}
      </main>
    </div>
  </div>
{% endblock %}
{% block scripts %}
  {{ require_js(get_asset_url("../../js/main.js")) }}
{% endblock %}
```

### Page Templates

Each page template follows this pattern:
```hubl
<!--
  templateType: page
  isAvailableForNewContent: true
  label: "Portal - [Page Name]"
  screenshotPath: ../images/template-previews/portal-[page].png
  dataQueryPath: ../data-queries/[query_name]
-->
{% extends "./layouts/portal.html" %}
{% block portal_content %}
  {% dnd_area "portal_content" %}
    {% dnd_section %}
      {% dnd_module path="../modules/[module-name].module" %}{% end_dnd_module %}
    {% end_dnd_section %}
  {% end_dnd_area %}
{% endblock %}
```

Build these page templates:
| Template | Label | dataQueryPath | Modules |
|----------|-------|---------------|---------|
| portal-dashboard.html | Portal - Dashboard | dashboard | dashboard-stats, production-alert, recent-orders, quick-actions |
| portal-orders.html | Portal - Orders | orders_list | order-list |
| portal-order-detail.html | Portal - Order Detail | order_detail | order-detail |
| portal-profile.html | Portal - Profile | hair_profile | hair-profile-display, hair-profile-form |
| portal-customization.html | Portal - Customization | customization_templates | customization-grid |
| portal-shop.html | Portal - Shop | products | product-grid |
| portal-billing.html | Portal - Billing | billing | billing-current, billing-plans |
| portal-invoices.html | Portal - Invoices | invoices | invoice-table |
| portal-locations.html | Portal - Locations | locations | location-cards |
| portal-settings.html | Portal - Settings | settings | settings-profile, settings-notifications |

**`portal-order-detail.html`** is special — it's a **dynamic page** template. The `order_number` comes from the URL slug via `request.path_param_dict.dynamic_slug`.

### System Templates (Membership Auth)

Build branded auth pages under `templates/system/`. HubSpot injects the actual forms — we provide the page wrapper and styling. Reference: [HubSpot/cms-theme-boilerplate/src/templates/system/](https://github.com/HubSpot/cms-theme-boilerplate/tree/main/src/templates/system).

The login/register/reset pages should use a centered card layout, brand colors, logo, and clean typography. No sidebar — these are standalone pages.

Each system template must include the proper `templateType` annotation:
```hubl
<!--
  templateType: membership_login_page
  isAvailableForNewContent: true
  label: "Portal - Login"
-->
```

Template types: `membership_login_page`, `membership_register_page`, `membership_reset_password_page`, `membership_reset_password_request_page`, `error_page` (404), `error_page` (500).

---

## 8. Modules

Each module is a directory containing 4 files. Follow the exact HubSpot module structure.

### Module `meta.json` Pattern
```json
{
  "label": "Module Label",
  "css_assets": [{ "path": "module.css" }],
  "js_assets": [],
  "host_template_types": ["PAGE"],
  "global": false,
  "icon": "path/to/icon.svg"
}
```

For modules that need GraphQL data: data is available in the template via `data_query.data.CRM.*` or `data_query.data.HUBDB.*` — the `dataQueryPath` in the **page template** annotation makes it available to all modules on that page.

### Module Details

#### `portal-sidebar.module` (global: true)
Navigation sidebar with these links:
- Dashboard → `/portal`
- Orders → `/portal/orders`
- Hair Profile → `/portal/profile`
- Customization → `/portal/customization`
- Shop → `/portal/shop`
- Billing → `/portal/billing`
- Invoices → `/portal/invoices`
- Locations → `/portal/locations`
- Support → `/portal/support` (links to Service Hub portal)
- Help Center → `/portal/help` (links to Knowledge Base)
- Settings → `/portal/settings`

Active state: compare `request.path` against each link. Show logo at top. Show "Logout" at bottom using `{{ member_logout_url }}`.

#### `portal-header.module` (global: true)
Top bar showing: "Welcome, {{ request.contact.firstname }}" on left. Logout link on right. Mobile hamburger toggle button for sidebar.

#### `dashboard-stats.module`
3-4 stat cards in a row:
- Total Orders (count from `data_query.data.CRM.contact.associations.p_order_collection__order_to_contact.total`)
- Active Orders (filter orders where status != delivered/cancelled)
- Profile Status (Complete ✓ or "Needs Setup" based on hair_profile.onboarding_completed)
- Current Plan (from contact.current_plan)

#### `production-alert.module`
Yellow/amber alert banner showing the next upcoming production date. Find the order with the nearest `estimated_completion` in the future. If none, show nothing (hidden). Display: "Your next system — [product_name] — estimated completion: [date]"

#### `recent-orders.module`
Table of the 5 most recent orders. Columns: Order #, Product, Status (badge), Total, Date. Each row links to `/portal/orders/[order_number]`.

#### `quick-actions.module`
Grid of action buttons:
- "New Order" → link to shop or form
- "Update Profile" → `/portal/profile`
- "Contact Support" → support link
- "View Invoices" → `/portal/invoices`

#### `order-list.module`
Full order table with all orders. Columns: Order #, Product, Status (badge), Production Stage (badge), Total, Ordered Date, Est. Completion. Each row links to order detail. Include a status filter (All / Active / Completed / Cancelled).

#### `order-detail.module`
Full single-order view:
- Header: order number, product name, status badge, ordered date
- Order summary: subtotal, tax, shipping, total
- Production timeline: visual horizontal progress bar showing all 8 stages (awaiting_confirmation through completed), current stage highlighted
- Status history: chronological list from order_status_history association
- Configuration: display the configuration_snapshot
- Customer notes

#### `hair-profile-display.module`
Read-only display of hair profile data in organized sections:
- **Measurements**: head circumference, front-to-nape, ear-to-ear, temple-to-temple
- **Style Preferences**: preferred style, density, color, base type, attachment method
- **Lifestyle**: activity level, sweating, work environment, sports
- **Photos**: display photo URLs as images in a 2x2 grid

If no profile exists (onboarding_completed is false or no profile association): show a "Complete Your Hair Profile" call-to-action card.

#### `hair-profile-form.module`
Has a `form_id` field (type: form) in fields.json. Renders a HubSpot form via `{% form form_to_use="{{ module.form_id.form_id }}" %}`. This form will be created in HubSpot UI and its ID configured when the page is built.

#### `customization-grid.module`
Card grid of saved customization templates. Each card: template name, style, density, color, base type, "Default" badge if `is_default`. "Create New Template" button at top.

#### `invoice-table.module`
Table of all invoices. Columns: Invoice #, Date, Amount, Status (badge), Description. "View PDF" link if `pdf_url` exists.

#### `billing-current.module`
Current plan display: plan name, price, billing interval, status badge, period end date. "Change Plan" button.

#### `billing-plans.module`
Plan comparison grid from HubDB. Each card: plan name, price/interval, systems per year, features list, CTA button. Current plan marked with "Current Plan" badge.

#### `product-grid.module`
Product cards from HubDB. Each card: image, name, short description, price (with compare_at_price strikethrough if applicable), category badge, "Inquire" button. Filter tabs by category.

#### `location-cards.module`
Location cards from HubDB. Each card: name, address, phone, email, services offered, "Get Directions" link (Google Maps URL from lat/long). Featured locations get a highlight badge.

#### `settings-profile.module`
Display current contact info (name, email, phone, address). "Edit Profile" button that shows/embeds a HubSpot form (form_id field).

#### `settings-notifications.module`
Display notification toggles: order updates, production reminders, marketing. These are read-only display of current values with a "Update Preferences" button linking to a form.

---

## 9. Partials

### `templates/partials/header.html`
Simple site header for non-portal pages (marketing pages). Logo + company name. Not used inside the portal layout.

### `templates/partials/footer.html`
Simple footer. Copyright, links.

---

## 10. Sections

### `sections/portal-content-section.html`
A reusable drag-and-drop section wrapper for portal content modules.

---

## Data Access Patterns

**In module.html files, access GraphQL data like this:**

```hubl
{# Contact data #}
{% set contact = data_query.data.CRM.contact %}
{{ contact.firstname }}

{# Associated custom objects #}
{% set orders = contact.associations.p_order_collection__order_to_contact.items %}
{% for order in orders %}
  {{ order.order_number }} — {{ order.status }}
{% endfor %}

{# HubDB data #}
{% set plans = data_query.data.HUBDB.table.rows %}
{% for plan in plans %}
  {{ plan.name }} — ${{ plan.price }}
{% endfor %}
```

**Association naming convention** (from the recruiting-agency theme):
- Custom object → Contact: `p_{object_name}_collection__{object_name}_to_contact`
- The exact association name depends on how the schema defines it. Use the pattern above.

**Dynamic page slug access:**
```hubl
{% set slug = request.path_param_dict.dynamic_slug %}
```

**Membership contact access:**
```hubl
{{ request.contact.firstname }}
{{ request.contact.contact_vid }}
{{ member_logout_url }}
```

**HubDB direct access (alternative to GraphQL):**
```hubl
{% for row in hubdb_table_rows("products") %}
  {{ row.name }} — ${{ row.price }}
{% endfor %}
```

---

## 11. Important Conventions

1. **Every `.graphql` file** must have the comment header with `# label:`, `# description:`, and any `# $variable:` declarations
2. **Every template** must have the HTML comment annotation with `templateType`, `isAvailableForNewContent`, `label`, and `dataQueryPath`
3. **Module meta.json** must specify `host_template_types: ["PAGE"]` and `global: true/false`
4. **Module fields.json** must be a valid array of HubSpot field objects with `name`, `label`, `type`, `default`
5. **No external CDN dependencies** — everything self-contained in the theme
6. **CSS uses HubL variables** for theme colors: `{{ theme.brand_color.color }}`, etc.
7. **All contact-scoped queries** use `request.contact.contact_vid` — never hardcode IDs
8. **Status badges** use consistent color coding across all modules
9. **Responsive design** — every module works on mobile (320px+)
10. **Accessible** — proper semantic HTML, ARIA labels, focus states, color contrast

---

## 12. Reference Files

Study these actual files from the HubSpot recruiting-agency-graphql-theme for exact syntax:

**GraphQL query with contact scoping (applications.graphql):**
```graphql
# label: "Applications"
# description: ""
# $contact_id: {{ request.contact.contact_vid || '' }}
query applications($contact_id: String!) {
  CRM {
    contact(uniqueIdentifier: "id", uniqueIdentifierValue: $contact_id) {
      firstname
      lastname
      associations {
        p_job_application_collection__job_application_to_contact {
          items {
            _metadata {
              id
            }
            status
            role_applied_for
            hs_createdate
          }
          total
        }
      }
    }
  }
}
```

**Module meta.json (role-details.module):**
```json
{
  "label": "Role Details",
  "css_assets": [{"path": "module.css"}],
  "js_assets": [],
  "host_template_types": ["PAGE"],
  "global": false
}
```

**Module template accessing GraphQL data (application-listing):**
```hubl
{% set applications = data_query.data.CRM.contact.associations.p_job_application_collection__job_application_to_contact.items %}
{% if applications %}
  {% for application in applications %}
    <div class="application-card">
      <h3>{{ application.role_applied_for }}</h3>
      <span class="badge badge--{{ application.status }}">{{ application.status }}</span>
    </div>
  {% endfor %}
{% else %}
  <p>No applications yet.</p>
{% endif %}
```

**Page template with dataQueryPath:**
```hubl
<!--
  templateType: page
  isAvailableForNewContent: true
  label: Application Listing
  screenshotPath: ../images/application-listing.png
  dataQueryPath: ../data-queries/applications
-->
{% extends "./layouts/base.html" %}
{% block body %}
  {% dnd_area "main_content" %}
    {% dnd_section %}
      {% dnd_module path="../modules/application-listing.module" %}{% end_dnd_module %}
    {% end_dnd_section %}
  {% end_dnd_area %}
{% endblock %}
```

**Custom Object Schema (role.json):**
```json
{
  "name": "role",
  "labels": {
    "singular": "Role",
    "plural": "Roles"
  },
  "primaryDisplayProperty": "role_name",
  "requiredProperties": ["role_name"],
  "properties": [
    {
      "name": "role_name",
      "label": "Role Name",
      "type": "string",
      "fieldType": "text",
      "groupName": "role_information"
    },
    {
      "name": "department",
      "label": "Department",
      "type": "enumeration",
      "fieldType": "select",
      "groupName": "role_information",
      "options": [
        { "label": "Engineering", "value": "engineering" },
        { "label": "Design", "value": "design" }
      ]
    }
  ],
  "associatedObjects": ["CONTACT"]
}
```

**Membership system template (from boilerplate):**
```hubl
<!--
  templateType: membership_login_page
  isAvailableForNewContent: true
  label: Membership Login
-->
{% extends "./layouts/base.html" %}
{% block body %}
<div class="membership-page">
  <div class="membership-card">
    <img src="{{ theme.logo.src }}" alt="{{ theme.company_name }}" class="membership-logo">
    <h1>Welcome Back</h1>
    {% membership_login "login" label="", password_placeholder="Password", username_placeholder="Email address", submit="Log In" %}
    <div class="membership-links">
      <a href="{{ membership_registration_url }}">Create an account</a>
      <a href="{{ membership_password_saved_url }}">Forgot password?</a>
    </div>
  </div>
</div>
{% endblock %}
```

---

## Summary

Build **every single file** listed in the directory structure. No stubs. No placeholders. Production-ready HubL, GraphQL, CSS, and JS. The theme should be uploadable via `hs upload src hair-solutions-portal` and immediately functional once pages are created and access groups configured in HubSpot.

The current Next.js portal's data model is defined in `prisma/schema.prisma` — use it as the source of truth for what data exists and how it relates. The Prisma models map 1:1 to the HubSpot custom objects defined above.
