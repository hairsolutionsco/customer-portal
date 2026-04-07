# HubSpot CMS Data APIs Skill

You are a **HubSpot CMS data layer expert**. This skill covers every mechanism for reading and writing data in a HubSpot CMS theme: GraphQL data queries, HubDB, the CRM API, serverless functions, private app authentication, and webhooks. It defines the authoritative patterns for the Hair Solutions portal.

---

## 1. GraphQL Data Queries

GraphQL is the **only** approved read mechanism for CRM data in templates. Queries live in `src/data-queries/*.graphql` and are called in HubL with `data_query()`.

### Rules
- Always scope to `{{ request.contact.contact_vid }}` — never query all records
- Every query must handle the null/empty case in HubL
- Query names must match the file name (e.g. `hair_profile.graphql` → query `HairProfile`)
- Use fragments for shared field sets across queries

### `data_query()` HubL call pattern

```hubl
{% set result = data_query('hair_profile', {contact_id: request.contact.contact_vid}) %}
{% if result.data and result.data.CRM and result.data.CRM.hair_profile_collection %}
  {% set items = result.data.CRM.hair_profile_collection.items %}
  {% set profile = items[0] if items | length > 0 else null %}
{% endif %}
```

---

### Query: `dashboard.graphql`

```graphql
query Dashboard($contact_id: String!) {
  CRM {
    order_collection(
      filter: { associations__contact: { id__eq: $contact_id } }
      limit: 100
    ) {
      total
      items {
        hs_object_id
        order_number
        status
        production_stage
        estimated_completion
        total
        shipped_at
        delivered_at
      }
    }
    invoice_collection(
      filter: { associations__contact: { id__eq: $contact_id } }
      limit: 10
    ) {
      total
      items {
        hs_object_id
        invoice_number
        status
        total
        due_date
        paid_at
      }
    }
    hair_profile_collection(
      filter: { associations__contact: { id__eq: $contact_id } }
      limit: 1
    ) {
      items {
        hs_object_id
        onboarding_completed
        preferred_style
        base_type
      }
    }
  }
}
```

---

### Query: `hair_profile.graphql`

```graphql
query HairProfile($contact_id: String!) {
  CRM {
    hair_profile_collection(
      filter: { associations__contact: { id__eq: $contact_id } }
      limit: 1
    ) {
      items {
        hs_object_id
        head_circumference
        front_to_nape
        ear_to_ear
        temple_to_temple
        preferred_style
        density
        hair_color
        base_type
        attachment_method
        activity_level
        sweating_level
        work_environment
        sports_activities
        photo_front
        photo_side
        photo_back
        photo_top
        notes
        allergies
        onboarding_completed
      }
    }
  }
}
```

---

### Query: `orders_list.graphql`

```graphql
query OrdersList($contact_id: String!) {
  CRM {
    order_collection(
      filter: { associations__contact: { id__eq: $contact_id } }
      sort: { property: "hs_createdate", order: DESCENDING }
      limit: 50
    ) {
      total
      items {
        hs_object_id
        order_number
        product_name
        status
        production_stage
        subtotal
        total
        currency
        estimated_completion
        shipped_at
        delivered_at
        hs_createdate
      }
    }
  }
}
```

---

### Query: `order_detail.graphql`

```graphql
query OrderDetail($contact_id: String!, $order_id: String!) {
  CRM {
    order_collection(
      filter: {
        AND: [
          { associations__contact: { id__eq: $contact_id } }
          { hs_object_id__eq: $order_id }
        ]
      }
      limit: 1
    ) {
      items {
        hs_object_id
        order_number
        product_name
        status
        production_stage
        subtotal
        tax
        shipping
        total
        currency
        estimated_production_start
        estimated_completion
        actual_completion_date
        shipped_at
        delivered_at
        customer_notes
        configuration_snapshot
        associations {
          order_status_history_collection__order_to_order_status_history {
            items {
              hs_object_id
              status
              stage
              notes
              created_by
              hs_createdate
            }
          }
        }
      }
    }
  }
}
```

HubL call (reads order_id from URL query param):
```hubl
{% set order_id = request.query_dict.id %}
{% set result = data_query('order_detail', {
  contact_id: request.contact.contact_vid,
  order_id: order_id
}) %}
```

---

### Query: `invoices.graphql`

```graphql
query Invoices($contact_id: String!) {
  CRM {
    invoice_collection(
      filter: { associations__contact: { id__eq: $contact_id } }
      sort: { property: "issue_date", order: DESCENDING }
      limit: 50
    ) {
      total
      items {
        hs_object_id
        invoice_number
        amount
        tax
        total
        currency
        status
        issue_date
        due_date
        paid_at
        pdf_url
        description
      }
    }
  }
}
```

---

### Query: `billing.graphql`

```graphql
query Billing($contact_id: String!) {
  CRM {
    contact(id: $contact_id) {
      subscription_plan
      subscription_start_date
      subscription_renewal_date
      payment_status
    }
    invoice_collection(
      filter: {
        AND: [
          { associations__contact: { id__eq: $contact_id } }
          { status__in: ["pending", "overdue"] }
        ]
      }
      limit: 10
    ) {
      total
      items {
        hs_object_id
        invoice_number
        total
        status
        due_date
      }
    }
  }
}
```

---

### Query: `customization_templates.graphql`

```graphql
query CustomizationTemplates($contact_id: String!) {
  CRM {
    customization_template_collection(
      filter: { associations__contact: { id__eq: $contact_id } }
      sort: { property: "is_default", order: DESCENDING }
      limit: 20
    ) {
      total
      items {
        hs_object_id
        template_name
        base_type
        hair_color
        density
        hair_length
        style
        attachment_method
        additional_options
        is_default
        notes
      }
    }
  }
}
```

---

### Query: `settings.graphql`

```graphql
query Settings($contact_id: String!) {
  CRM {
    contact(id: $contact_id) {
      firstname
      lastname
      email
      phone
      mobilephone
      address
      city
      state
      zip
      country
      subscription_plan
      portal_last_login
      onboarding_stage
    }
  }
}
```

---

## 2. HubDB

HubDB tables store catalog/configuration data (not CRM records). Tables must be **published** before HubL can query them.

### HubL query patterns

```hubl
{# All rows, sorted #}
{% set plans = hubdb_table_rows('subscription_plans', 'orderBy=display_order&is_active__eq=true') %}

{# Filter by column value #}
{% set products = hubdb_table_rows('products', 'category__eq=Hair+Systems&in_stock__eq=true&orderBy=display_order') %}

{# Single row by row ID #}
{% set row = hubdb_table_row('products', row_id) %}

{# Iterate #}
{% for plan in plans %}
  <h3>{{ plan.name }}</h3>
  <p>${{ plan.price }}/{{ plan.interval }}</p>
{% endfor %}
```

### Filter operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `__eq` | equals | `status__eq=active` |
| `__ne` | not equals | `status__ne=archived` |
| `__gt` | greater than | `price__gt=100` |
| `__lt` | less than | `price__lt=500` |
| `__gte` | >= | `display_order__gte=1` |
| `__lte` | <= | `display_order__lte=10` |
| `__in` | in list | `category__in=Hair+Systems,Adhesives` |
| `__contains` | text contains | `name__contains=lace` |

### HubDB JSON schema format (`hubdb/*.json`)

```json
{
  "name": "subscription_plans",
  "label": "Subscription Plans",
  "useForPages": false,
  "allowChildTables": false,
  "columns": [
    { "name": "name",            "label": "Name",             "type": "TEXT" },
    { "name": "description",     "label": "Description",      "type": "RICHTEXT" },
    { "name": "price",           "label": "Price (USD/mo)",   "type": "NUMBER" },
    { "name": "interval",        "label": "Billing Interval", "type": "TEXT" },
    { "name": "systems_per_year","label": "Systems/Year",     "type": "NUMBER" },
    { "name": "features",        "label": "Features",         "type": "RICHTEXT" },
    { "name": "is_active",       "label": "Active",           "type": "BOOLEAN" },
    { "name": "display_order",   "label": "Display Order",    "type": "NUMBER" }
  ],
  "rows": [
    { "values": { "name": "Essential",    "price": 199, "interval": "month", "systems_per_year": 2, "is_active": true, "display_order": 1, "features": "<ul><li>2 systems/year</li><li>Email support</li><li>Basic maintenance</li></ul>" } },
    { "values": { "name": "Professional", "price": 349, "interval": "month", "systems_per_year": 4, "is_active": true, "display_order": 2, "features": "<ul><li>4 systems/year</li><li>Priority support</li><li>Quarterly refresh</li><li>Style consultations</li></ul>" } },
    { "values": { "name": "Premium",      "price": 549, "interval": "month", "systems_per_year": 6, "is_active": true, "display_order": 3, "features": "<ul><li>6 systems/year</li><li>Unlimited consultations</li><li>Emergency replacements</li><li>VIP scheduling</li></ul>" } }
  ]
}
```

---

## 3. CRM API (via Serverless Functions)

For any write operation that cannot use a HubSpot Form, use a **serverless function** as a proxy. Never call the CRM API directly from HubL templates.

### Serverless function location

```
hair-solutions-portal/
└── serverless/
    ├── hubspot.functions/
    │   ├── serverless.json
    │   └── update-profile.js
```

### `serverless.json`

```json
{
  "runtime": "nodejs18.x",
  "version": "1.0",
  "environment": {},
  "secrets": ["HUBSPOT_PRIVATE_APP_TOKEN"],
  "endpoints": {
    "update-profile": {
      "method": "POST",
      "file": "update-profile.js"
    }
  }
}
```

### `update-profile.js` — example serverless handler

```javascript
const hubspot = require('@hubspot/api-client');

exports.main = async (context, sendResponse) => {
  const { contact_id, properties } = context.body;

  // Validate inputs
  if (!contact_id || !properties) {
    return sendResponse({ statusCode: 400, body: { error: 'Missing required fields' } });
  }

  const client = new hubspot.Client({
    accessToken: process.env.HUBSPOT_PRIVATE_APP_TOKEN
  });

  try {
    // Search for hair_profile associated with contact
    const searchResult = await client.crm.objects.searchApi.doSearch('hair_profile', {
      filterGroups: [{
        filters: [{
          propertyName: 'associations.contact',
          operator: 'EQ',
          value: contact_id
        }]
      }],
      limit: 1,
      properties: ['hs_object_id']
    });

    if (!searchResult.results.length) {
      return sendResponse({ statusCode: 404, body: { error: 'Hair profile not found' } });
    }

    const profileId = searchResult.results[0].id;

    await client.crm.objects.basicApi.update('hair_profile', profileId, {
      properties
    });

    sendResponse({ statusCode: 200, body: { success: true } });
  } catch (err) {
    console.error(err);
    sendResponse({ statusCode: 500, body: { error: 'Update failed' } });
  }
};
```

### Calling a serverless function from JavaScript

```javascript
// In src/js/main.js or a module script
async function updateHairProfile(data) {
  const res = await fetch('/_hcms/api/update-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
```

---

## 4. Private App Authentication

HubSpot Private Apps replace API Keys (deprecated). Use for serverless functions and any backend-side API calls.

```
Scopes required for Hair Solutions portal:
- crm.objects.custom.read
- crm.objects.custom.write
- crm.objects.contacts.read
- crm.schemas.custom.read
- hubdb.tables.read
- hubdb.tables.write
```

Store token in: 1Password → `HubSpot / hair-solutions-co → Private App Token`  
Inject via: `hs secrets add HUBSPOT_PRIVATE_APP_TOKEN` (referenced in `serverless.json`)

**Never** hardcode or commit tokens.

---

## 5. CRM API Quick Reference

```javascript
const hubspot = require('@hubspot/api-client');
const client = new hubspot.Client({ accessToken: process.env.HUBSPOT_PRIVATE_APP_TOKEN });

// Get contact
const contact = await client.crm.contacts.basicApi.getById(contactId, ['email','firstname','lastname']);

// Update contact property
await client.crm.contacts.basicApi.update(contactId, {
  properties: { subscription_plan: 'professional' }
});

// Create custom object record
await client.crm.objects.basicApi.create('order', {
  properties: {
    order_number: 'ORD-2026-001',
    status: 'pending',
    total: 850.00
  }
});

// Associate order to contact
await client.crm.associations.v4.basicApi.create(
  'order', orderId, 'contact', contactId,
  [{ associationCategory: 'USER_DEFINED', associationTypeId: 1 }]
);

// Search custom object
const results = await client.crm.objects.searchApi.doSearch('order', {
  filterGroups: [{
    filters: [{ propertyName: 'status', operator: 'IN', values: ['pending','in_production'] }]
  }],
  sorts: [{ propertyName: 'hs_createdate', direction: 'DESCENDING' }],
  limit: 10
});
```

---

## 6. GraphQL Filter Operator Reference

| Operator | Type | Example |
|----------|------|---------|
| `__eq` | exact match | `status__eq: "delivered"` |
| `__ne` | not equal | `status__ne: "cancelled"` |
| `__in` | in list | `status__in: ["pending","confirmed"]` |
| `__not_in` | not in list | — |
| `__gt` | greater than (numbers, dates) | `total__gt: 100` |
| `__lt` | less than | `estimated_completion__lt: "2026-05-01"` |
| `__gte` | >= | — |
| `__lte` | <= | — |
| `__contains` | text contains | `order_number__contains: "ORD"` |
| `id__eq` | object ID | `hs_object_id__eq: "12345"` |
| `associations__contact` | has association | `associations__contact: { id__eq: $contact_id }` |

---

## Output Rules

- Every GraphQL query must include `hs_object_id` in its field selection.
- Every `data_query()` call must be wrapped in a null-check before accessing nested fields.
- HubDB queries always return an array — check `| length > 0` before accessing `[0]`.
- Serverless functions must validate all inputs; never pass raw user input directly to API calls.
- Token access in serverless: always via `process.env.HUBSPOT_PRIVATE_APP_TOKEN`, never hardcoded.
- The `contact(id: $contact_id)` GraphQL resolver queries standard contact properties only — custom contact properties must also be defined as CRM properties, not custom object properties.

## Argument: $ARGUMENTS

Use `$ARGUMENTS` as the specific data API task. If blank, ask: "What data API topic do you need? (GraphQL query, HubDB schema/query, serverless function, CRM API, private app setup, filter operators)"
