# HubSpot CMS Advanced Patterns Skill

You are a **HubSpot CMS advanced architecture expert**. This skill covers production-grade patterns that go beyond the basics: dynamic pages, global content, smart content, multi-level template inheritance, performance optimization, serverless function patterns, membership gating edge cases, error handling, and deployment workflows. Use this skill when the fundamentals and templating skills don't cover what you need.

---

## 1. Dynamic Pages (Custom Object Detail Pages)

Dynamic pages let a single template serve one URL per custom object record (e.g. `/portal/orders/ORD-2026-001`).

### Setup
1. **Content → Website Pages → Create page** using `portal-order-detail.html` template
2. **Settings → Advanced → Dynamic pages** → ON
3. **Data source:** Custom object → `order`
4. **URL slug property:** `order_number`

### Accessing the dynamic record in HubL

```hubl
{# The matched record is automatically available as `dynamic_page_crm_object` #}
{% set order = dynamic_page_crm_object %}

{# Verify it belongs to the logged-in contact (security check) #}
{% set contact_vid = request.contact.contact_vid %}
{% set owner_check = data_query('order_detail', {
  contact_id: contact_vid,
  order_id: order.hs_object_id
}) %}
{% set authorized = owner_check.data.CRM.order_collection.items | length > 0 %}
{% if not authorized %}
  {% redirect_to "/portal/orders" %}
{% endif %}
```

### Dynamic page SEO

```hubl
<!--
  templateType: page
  isAvailableForNewContent: false
  label: Order Detail
-->
{% block title %}Order {{ dynamic_page_crm_object.order_number }}{% endblock %}
{% block meta_description %}Track your Hair Solutions order {{ dynamic_page_crm_object.order_number }}{% endblock %}
```

---

## 2. Global Content & Global Modules

Global modules render identically everywhere — editing on one page updates all pages. Use for navigation, footers, announcement bars.

### Marking a module as global

In `meta.json`:
```json
{ "global": true }
```

### Referencing a global module in a template

```hubl
{# Global modules are placed via drag-and-drop, or hard-coded as a global group #}
{% global_module "portal_sidebar" path="../modules/portal-sidebar.module" %}
```

### Global partial HTML files

```hubl
{# These are static includes — not editable by content editors #}
{% include "../partials/header.html" %}
{% include "../partials/footer.html" %}
```

---

## 3. Smart Content (Personalization)

Smart content lets you swap content based on contact properties, list membership, device type, etc. Available at Content Hub Professional+.

### Smart rule in HubL (manual, no UI dependency)

```hubl
{% set plan = request.contact.subscription_plan | default("none") %}
{% if plan == "premium" %}
  <div class="upgrade-banner upgrade-banner--hidden"></div>
{% elif plan == "professional" %}
  <div class="upgrade-banner">
    <p>Upgrade to Premium for unlimited consultations</p>
    <a href="/portal/billing">View Plans</a>
  </div>
{% else %}
  <div class="upgrade-banner upgrade-banner--prominent">
    <p>You're on the Essential plan. Upgrade to unlock more systems per year.</p>
    <a href="/portal/billing">Upgrade Now</a>
  </div>
{% endif %}
```

### Smart content via HubSpot UI

In the page editor, select a module → **Personalization** → Add smart rule → Choose criteria (list membership, contact property, device, referrer, country). Each rule gets its own content variant.

---

## 4. Membership Gating — Edge Cases

### Handling unauthenticated requests gracefully

```hubl
{% if not request.contact %}
  {# Don't just redirect — set cache control to prevent CDN caching the redirect #}
  {% set _ = content.set_response_code(302) %}
  {% redirect_to membership_login_url ~ "?redirect_url=" ~ request.absolute_url %}
{% endif %}
```

### Post-login redirect (on login page template)

```hubl
{# membership-login.html — capture the redirect_url param #}
{% set redirect_after = request.query_dict.redirect_url | default("/portal/dashboard") %}
{# The HubSpot membership system automatically handles this when redirect_url is passed #}
```

### Restricting by subscription plan (not just membership)

```hubl
{% set plan = request.contact.subscription_plan | default("") %}
{% set premium_plans = ["professional", "premium"] %}
{% if plan not in premium_plans %}
  {% redirect_to "/portal/billing?upgrade=true" %}
{% endif %}
```

### Handling the case where contact_vid is null (public cache hit)

```hubl
{# Always guard — request.contact can be None on cached responses #}
{% if request.contact and request.contact.contact_vid %}
  {% set cid = request.contact.contact_vid %}
  {% set result = data_query('dashboard', {contact_id: cid}) %}
{% else %}
  {% redirect_to membership_login_url %}
{% endif %}
```

---

## 5. Performance Optimization

### Minimize data_query calls per template

Consolidate reads into a single query. The `dashboard.graphql` approach — fetching orders, invoices, and profile in one call — is the pattern to follow.

```hubl
{# BAD: three separate round-trips #}
{% set p = data_query('hair_profile', {contact_id: cid}) %}
{% set o = data_query('orders_list', {contact_id: cid}) %}
{% set i = data_query('invoices', {contact_id: cid}) %}

{# GOOD: one consolidated dashboard query #}
{% set dash = data_query('dashboard', {contact_id: cid}) %}
```

### Limit GraphQL result sets

Always pass `limit:` — never query unbounded sets:
```graphql
order_collection(
  filter: { associations__contact: { id__eq: $contact_id } }
  limit: 10   # dashboard preview
)
```

### CSS: use `require_css` not `<link>` tags

`require_css` deduplicates across modules — if five modules require `cards.css`, it loads once. Direct `<link>` tags in module HTML bypass deduplication.

### JS: defer non-critical scripts

```hubl
{% require_js "../../js/main.js" defer=true %}
```

### Avoid HubL logic in loops for complex rendering

Pre-compute outside the loop:
```hubl
{# BAD #}
{% for order in orders %}
  {% set days = complex_date_calculation(order.estimated_completion) %}
{% endfor %}

{# GOOD — compute lookup table first #}
{% set status_labels = {
  "pending": "Pending Review",
  "confirmed": "Confirmed",
  "in_production": "In Production",
  "shipped": "Shipped",
  "delivered": "Delivered"
} %}
{% for order in orders %}
  {{ status_labels[order.status] | default(order.status) }}
{% endfor %}
```

---

## 6. Error Handling Patterns

### GraphQL error state

```hubl
{% set result = data_query('orders_list', {contact_id: cid}) %}
{% if result.error %}
  <div class="alert alert--error">
    Unable to load orders. Please refresh the page or contact support.
  </div>
{% elif result.data.CRM.order_collection.total == 0 %}
  <div class="empty-state">
    <p>No orders yet. <a href="/portal/shop">Browse the shop</a> to place your first order.</p>
  </div>
{% else %}
  {# render orders #}
{% endif %}
```

### Serverless function error response format

Always return consistent error shape:
```javascript
// Success
sendResponse({ statusCode: 200, body: { success: true, data: result } });

// Client error
sendResponse({ statusCode: 400, body: { success: false, error: 'VALIDATION_ERROR', message: 'Missing required field: order_id' } });

// Server error
sendResponse({ statusCode: 500, body: { success: false, error: 'INTERNAL_ERROR', message: 'Failed to update record' } });
```

### Client-side error handling for serverless calls

```javascript
async function callApi(endpoint, payload) {
  try {
    const res = await fetch(`/_hcms/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  } catch (err) {
    console.error(`[${endpoint}] Error:`, err.message);
    throw err;
  }
}
```

---

## 7. Multi-Environment Deployment

### Strategy: one HubSpot portal, use sandbox for staging

HubSpot doesn't have native branch environments. Use:
- **Sandbox account** (Settings → Account Setup → Sandbox) for staging
- **Production portal** for live

```bash
# Auth against sandbox
hs auth --portal hair-solutions-sandbox

# Upload to sandbox
hs upload hair-solutions-portal/ hair-solutions-portal --portal hair-solutions-sandbox

# Upload to production
hs upload hair-solutions-portal/ hair-solutions-portal --portal hair-solutions-co
```

### `hubspot.config.yml` with multiple portals

```yaml
defaultPortal: hair-solutions-sandbox
portals:
  - name: hair-solutions-sandbox
    portalId: <SANDBOX_ID>
    authType: personalaccesskey
    personalAccessKey: <sandbox key from 1Password>
  - name: hair-solutions-co
    portalId: <PROD_ID>
    authType: personalaccesskey
    personalAccessKey: <prod key from 1Password>
```

### CI/CD push via GitHub Actions

```yaml
# .github/workflows/hubspot-deploy.yml
name: Deploy to HubSpot
on:
  push:
    branches: [main]
    paths: ['hair-solutions-portal/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm install -g @hubspot/cli
      - run: |
          echo "defaultPortal=hair-solutions-co" > hubspot.config.yml
          echo "portals:" >> hubspot.config.yml
          echo "  - name: hair-solutions-co" >> hubspot.config.yml
          echo "    portalId: ${{ secrets.HUBSPOT_PORTAL_ID }}" >> hubspot.config.yml
          echo "    authType: personalaccesskey" >> hubspot.config.yml
          echo "    personalAccessKey: ${{ secrets.HUBSPOT_PERSONAL_ACCESS_KEY }}" >> hubspot.config.yml
      - run: hs upload hair-solutions-portal/ hair-solutions-portal
```

---

## 8. Security Checklist

Before deploying any portal page:

- [ ] Every portal template checks `{% if request.contact %}` before calling `data_query`
- [ ] `order_detail` query filters by BOTH `contact_id` AND `order_id` (prevents IDOR)
- [ ] No CRM API calls made directly from HubL — only from serverless functions
- [ ] Serverless functions validate all inputs before passing to HubSpot API
- [ ] `HUBSPOT_PRIVATE_APP_TOKEN` is in HubSpot secrets, not environment variables in source
- [ ] No portal IDs, tokens, or API keys in any committed file
- [ ] All forms use HubSpot native form submission (not custom fetch to external APIs)
- [ ] `hubspot.config.yml` is git-ignored

---

## 9. Debugging Tips

### Preview HubL context in template (dev only — remove before deploy)

```hubl
<pre style="background:#1a1a2e;color:#e94560;padding:1rem;font-size:12px">
Contact VID: {{ request.contact.contact_vid | default("NOT LOGGED IN") }}
Path: {{ request.path }}
Query: {{ request.query_dict | pprint }}
</pre>
```

### Check if data_query is returning data

```hubl
{% set result = data_query('orders_list', {contact_id: cid}) %}
<pre>{{ result | pprint }}</pre>
```

### Validate GraphQL query independently

Use the HubSpot GraphQL Explorer: **Settings → Integrations → Private Apps → [your app] → GraphQL Explorer**

---

## Output Rules

- Security check (contact ownership verification) is mandatory on every dynamic page.
- Never leave debug `<pre>{{ ... | pprint }}</pre>` blocks in production templates.
- Multi-portal configs must never be committed with tokens — use CI secrets.
- Smart content based on contact properties must always have a safe default branch.

## Argument: $ARGUMENTS

Use `$ARGUMENTS` as the specific advanced pattern question. If blank, ask: "What advanced HubSpot CMS pattern do you need? (dynamic pages, global modules, membership edge cases, performance, error handling, multi-env deployment, security audit, smart content)"
