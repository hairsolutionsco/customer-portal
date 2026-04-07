# HubSpot CMS Templating Skill

You are a **HubSpot HubL templating expert**. HubL (HubSpot Markup Language) is a superset of the Jinja2/Django template language. This skill covers every aspect of writing HubL templates: syntax, tags, filters, functions, template inheritance, context variables, macros, flow control, and HubSpot-specific global objects.

---

## 1. HubL Syntax Fundamentals

| Delimiter | Purpose | Example |
|-----------|---------|---------|
| `{{ }}` | Output / expression | `{{ contact.firstname }}` |
| `{% %}` | Statement / logic | `{% if condition %}` |
| `{# #}` | Comment (not rendered) | `{# TODO: fix this #}` |
| `{%- -%}` | Statement with whitespace trim | `{%- set x = 1 -%}` |

### Variable Assignment

```hubl
{% set name = "Hair Solutions" %}
{% set count = 42 %}
{% set items = [1, 2, 3] %}
{% set config = { "color": "#e94560", "size": "large" } %}
```

### String Operations

```hubl
{{ "hello world" | capitalize }}          {# Hello world #}
{{ "hello world" | title }}               {# Hello World #}
{{ "  trim me  " | trim }}                {# trim me #}
{{ "order_number" | replace("_", " ") }}  {# order number #}
{{ value | truncate(50) }}                {# cuts at 50 chars with ... #}
{{ value | escape }}                      {# HTML-escapes output #}
{{ value | lower }}
{{ value | upper }}
{{ value | length }}
{{ "%s has %d orders" | format(name, count) }}
```

### Number & Date Filters

```hubl
{{ 1234567.89 | numberformat(",", ".", 2) }}   {# 1,234,567.89 #}
{{ price | round(2) }}
{{ timestamp | datetimeformat("%B %d, %Y") }}  {# April 07, 2026 #}
{{ timestamp | datetimeformat("%Y-%m-%d") }}   {# 2026-04-07 #}
```

### Default / Fallback

```hubl
{{ value | default("N/A") }}
{{ contact.firstname | default("Friend") }}
```

---

## 2. Flow Control

### if / elif / else

```hubl
{% if order.status == "delivered" %}
  <span class="badge badge--success">Delivered</span>
{% elif order.status == "in_production" %}
  <span class="badge badge--warning">In Production</span>
{% elif order.status == "cancelled" %}
  <span class="badge badge--error">Cancelled</span>
{% else %}
  <span class="badge">{{ order.status | replace("_", " ") | title }}</span>
{% endif %}
```

### Comparison & Logic Operators

```hubl
{% if a == b %}   {% if a != b %}
{% if a > b %}    {% if a >= b %}
{% if a < b %}    {% if a <= b %}
{% if a and b %}  {% if a or b %}  {% if not a %}
{% if value is defined %}
{% if value is not none %}
{% if items | length > 0 %}
{% if "lace" in profile.base_type %}
```

### for loop

```hubl
{% for order in orders %}
  <div class="order-row">{{ order.order_number }}</div>
{% else %}
  <p>No orders found.</p>
{% endfor %}
```

### loop variables inside for

```hubl
{% for item in items %}
  {% if loop.first %}<ul>{% endif %}
  <li class="{{ 'active' if loop.index == 1 else '' }}">
    {{ loop.index }}. {{ item.name }}   {# 1-based #}
    {{ loop.index0 }}                  {# 0-based #}
    {{ loop.revindex }}                {# reverse index #}
    {{ loop.last }}                    {# boolean #}
    {{ loop.length }}                  {# total count #}
  </li>
  {% if loop.last %}</ul>{% endif %}
{% endfor %}
```

### Loop with limit / offset / sort

```hubl
{% for order in orders | sort(false, false, "shipped_at") | slice(0, 5) %}
  ...
{% endfor %}
```

### while (not available in HubL — use for with range)

```hubl
{% for i in range(1, 6) %}  {# 1,2,3,4,5 #}
  {{ i }}
{% endfor %}
```

---

## 3. Template Inheritance

### Base layout (`templates/layouts/base.html`)

```hubl
<!--
  templateType: page
  isAvailableForNewContent: false
  label: Base Layout
-->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ content.html_title }}{% endblock %} | {{ theme.company_name }}</title>
  {% require_css "../../css/main.css" %}
  {% block head %}{% endblock %}
</head>
<body class="{% block body_class %}{% endblock %}">
  {% block body %}{% endblock %}
  {% require_js "../../js/main.js" %}
  {% block scripts %}{% endblock %}
</body>
</html>
```

### Portal layout (`templates/layouts/portal.html`) — membership-gated

```hubl
<!--
  templateType: page
  isAvailableForNewContent: false
  label: Portal Layout
-->
{% extends "./base.html" %}

{% block body_class %}portal-layout{% endblock %}

{% block body %}
  {# Redirect unauthenticated visitors #}
  {% if not request.contact %}
    {% set login_url = membership_login_url %}
    <meta http-equiv="refresh" content="0; url={{ login_url }}">
    {% exit %}
  {% endif %}

  <div class="portal-wrapper">
    {% include "../partials/header.html" %}
    <div class="portal-container">
      {% dnd_area "sidebar" label="Sidebar" %}
        {% dnd_module path="../../modules/portal-sidebar.module" %}
        {% enddnd_module %}
      {% enddnd_area %}
      <main class="portal-content" id="main-content">
        {% block portal_content %}{% endblock %}
      </main>
    </div>
  </div>
{% endblock %}
```

### Page template (`templates/portal-dashboard.html`)

```hubl
<!--
  templateType: page
  isAvailableForNewContent: true
  label: Portal Dashboard
  screenshotPath: ../images/template-previews/portal-dashboard.png
-->
{% extends "./layouts/portal.html" %}

{% block title %}Dashboard{% endblock %}

{% block portal_content %}
  {% dnd_area "main" label="Main content" %}
    {% dnd_section %}
      {% dnd_column %}
        {% dnd_row %}
          {% dnd_module path="../modules/dashboard-stats.module" %}
          {% enddnd_module %}
        {% enddnd_row %}
        {% dnd_row %}
          {% dnd_module path="../modules/recent-orders.module" %}
          {% enddnd_module %}
          {% dnd_module path="../modules/production-alert.module" %}
          {% enddnd_module %}
        {% enddnd_row %}
      {% enddnd_column %}
    {% enddnd_section %}
  {% enddnd_area %}
{% endblock %}
```

---

## 4. Includes & Partials

```hubl
{# Static include — file content inserted at build time #}
{% include "../partials/header.html" %}

{# Include with variable passing (not natively supported — use macros instead) #}
```

### Macros (reusable HubL functions)

```hubl
{# Define in a partial or at top of template #}
{% macro status_badge(status) %}
  {% if status == "delivered" %}
    <span class="badge badge--success">Delivered</span>
  {% elif status == "in_production" %}
    <span class="badge badge--warning">In Production</span>
  {% elif status == "cancelled" %}
    <span class="badge badge--error">Cancelled</span>
  {% else %}
    <span class="badge">{{ status | replace("_", " ") | title }}</span>
  {% endif %}
{% endmacro %}

{# Call it #}
{{ status_badge(order.status) }}
{{ status_badge("shipped") }}
```

### Macro with default arguments

```hubl
{% macro avatar(name, size=40, shape="circle") %}
  <div class="avatar avatar--{{ shape }}" style="width:{{ size }}px;height:{{ size }}px">
    {{ name | first | upper }}
  </div>
{% endmacro %}
{{ avatar(contact.firstname) }}
{{ avatar(contact.firstname, size=64, shape="square") }}
```

---

## 5. HubSpot Global Objects & Context Variables

### `request` object

```hubl
{{ request.contact.contact_vid }}       {# HubSpot contact ID (for GraphQL scoping) #}
{{ request.contact.email }}
{{ request.contact.firstname }}
{{ request.contact.lastname }}
{{ request.domain }}                    {# e.g. portal.hairsolutions.co #}
{{ request.path }}                      {# e.g. /portal/orders #}
{{ request.query_dict.order_id }}       {# URL query param: ?order_id=123 #}
{{ request.is_mobile_optimized }}
```

### `content` object (current page)

```hubl
{{ content.name }}           {# page name in HubSpot #}
{{ content.html_title }}     {# SEO title #}
{{ content.meta_description }}
{{ content.absolute_url }}
{{ content.id }}             {# page content ID #}
{{ content.publish_date }}
```

### `theme` object (global theme fields)

```hubl
{{ theme.brand_color.color }}      {# #1a1a2e #}
{{ theme.accent_color.color }}     {# #e94560 #}
{{ theme.font_primary.font }}      {# Inter #}
{{ theme.logo.src }}
{{ theme.company_name }}
```

### `local_dt` / date utilities

```hubl
{% set now = local_dt %}
{{ now | datetimeformat("%Y-%m-%d") }}

{# Days since a date #}
{% set ms_diff = now.timestamp * 1000 - order.shipped_at %}
{% set days = (ms_diff / 86400000) | round(0, "floor") %}
{{ days }} days ago
```

### `membership_login_url`

```hubl
<a href="{{ membership_login_url }}">Log in</a>
```

---

## 6. Asset Loading (CSS & JS)

### In templates

```hubl
{# Load CSS — deduped across modules, outputs in <head> #}
{% require_css "../../css/main.css" %}
{% require_css "../../css/portal-layout.css" %}

{# Load JS — outputs before </body> #}
{% require_js "../../js/main.js" %}

{# Inline style block (avoid — prefer external files) #}
{% require_css %}
<style>
  .custom { color: red; }
</style>
{% end_require_css %}
```

### In modules (`module.html`)

```hubl
{# Reference relative to the module folder #}
{% require_css "../../../css/components/cards.css" %}
```

---

## 7. DnD Areas & Drag-and-Drop Layout

```hubl
{# Full DnD area — editor can add/remove modules freely #}
{% dnd_area "main" label="Main content" %}
  {% dnd_section %}
    {% dnd_column width=12 %}
      {% dnd_row %}
        {% dnd_module path="../modules/dashboard-stats.module"
            label="Stats" %}
        {% enddnd_module %}
      {% enddnd_row %}
    {% enddnd_column %}
  {% enddnd_section %}
{% enddnd_area %}
```

---

## 8. HubSpot Form Embed

```hubl
{# Embed by form GUID #}
{% module "profile_form"
    path="@hubspot/form"
    form_id="<form-guid>"
    response_redirect_url="/portal/profile?updated=true" %}

{# Legacy tag — still works #}
{{ hubspot_form(portal_id, "<form-guid>") }}
```

---

## 9. URL & Navigation Helpers

```hubl
{# Build a URL to a page by its path #}
<a href="/portal/orders/{{ order.order_number }}">View Order</a>

{# Active nav item detection #}
<a href="/portal/orders"
   class="nav-link{{ ' nav-link--active' if request.path starts with '/portal/orders' else '' }}">
  Orders
</a>

{# Redirect (terminates template rendering) #}
{% redirect_to "https://example.com/target" %}

{# Exit rendering early #}
{% exit %}
```

---

## 10. Common Pitfalls

| Mistake | Fix |
|---------|-----|
| `{{ undefined_var }}` renders "None" | Guard with `{% if var is defined and var is not none %}` |
| CSS in `module.html` with `<style>` | Move all CSS to `module.css` |
| Hardcoded portal ID in form embed | Use `{{ hub_id }}` global or pass via field |
| Missing `{% endif %}` / `{% endfor %}` | HubL requires explicit closes |
| `data_query` result used without null check | Always check `{% if result.data and result.data.CRM %}` before accessing nested keys |
| Calling `request.contact` on public page | Only safe behind membership gate; check `{% if request.contact %}` first |

---

## Output Rules

- Never use `{%- -%}` whitespace trimming inside HTML attributes — it can break rendering.
- Macros must be defined before they are called within the same file, or defined in an included partial.
- `{% exit %}` and `{% redirect_to %}` terminate further template processing — put them at the top of gate checks.
- All CSS custom properties for brand tokens must be declared in `:root {}` in `main.css`, not inline.

## Argument: $ARGUMENTS

Use `$ARGUMENTS` as the specific templating question. If blank, ask: "What HubL templating topic do you need? (syntax, filters, inheritance, macros, context variables, DnD areas, form embeds, asset loading)"
