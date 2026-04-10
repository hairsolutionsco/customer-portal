# Templates, `dataQueryPath`, and modules

## How data reaches the page

1. A **page template** under `theme/templates/` declares a GraphQL file via YAML-style comment:

```hubl
<!--
  templateType: page
  isAvailableForNewContent: true
  label: "Portal - Dashboard"
  screenshotPath: ../images/template-previews/portal-dashboard.png
  dataQueryPath: ../data-queries/dashboard
-->
```

`dataQueryPath` is **relative to the template file** and omits the `.graphql` extension. HubSpot runs the query when the page renders (membership context).

2. **Modules** on that page read the result from **`data_query`** (HubSpot-provided object), e.g.:

- `data_query.data.CRM.contact.firstname`
- `data_query.data.CRM.contact.associations.p_order_collection__primary.items`

Exact paths must match the **query’s** selection set and aliases.

## Layout chain

- **`layouts/base.html`** — document shell, `standard_header_includes`, shared CSS/JS.
- **`layouts/portal-shell.html`** — portal chrome; supports **`shell_mode`** (`customer` \| `admin`) and default sidebar/header blocks.
- **`layouts/portal.html`** — thin wrapper for **customer** pages extending the shell (backward compatible with older `extends` paths).

System templates (**login**, **register**, **404**, …) live under `templates/system/` and generally **do not** use portal sidebars.

## Dynamic pages (order detail)

For **one record per URL** (e.g. order/deal detail), templates use HubSpot **dynamic page** routing. The slug is available in HubL (e.g. `request.path_param_dict.dynamic_slug` — confirm in-product for your route setup).

The **`order_detail.graphql`** query should:

- Take `$contact_id` from `request.contact.contact_vid`.
- Take a **slug** or **id** variable from the dynamic segment.
- Return **only** the matching deal/order row **if** it belongs to that contact (filter in query or guard in module).

Adjust to match explorer-verified fields.

## DND areas

Many portal templates wrap content in `{% dnd_area %}`. After upload, some pages may need a **re-save** in Design Manager to register DND regions — track those in PR notes (canonical plan A4).

## `graphql()` in HubL (optional)

You can execute ad hoc queries with `graphql('path')` in HubL; this theme **primarily** uses **template-level `dataQueryPath`** so all modules share one result and validation is centralized. Use inline `graphql()` only for small experiments or shared partials.
