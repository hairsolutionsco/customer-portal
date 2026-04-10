# Code Examples — Hair Concierge Agent Tools

## Tool 1: Shopify Product Query (GET_DATA)

```json
{
  "uid": "shopify-product-query",
  "type": "workflow-action",
  "isPublished": true,
  "config": {
    "actionUrl": "https://api.hairconcierge.ai/tools/shopify-product-query",
    "supportedClients": [{
      "client": "AGENTS",
      "toolType": "GET_DATA",
      "llmConfig": {
        "actionDescription": "Use when a customer asks about hair system products, wants to browse options, needs recommendations, or asks about specific product details. Pass the customer's query as search_query. Filter by base_type (lace, skin, mono, hybrid, frontal) if specified."
      }
    }],
    "inputFields": [
      { "typeDefinition": { "name": "search_query", "type": "string", "fieldType": "text" }, "supportedValueTypes": ["STATIC_VALUE"], "isRequired": false },
      { "typeDefinition": { "name": "base_type", "type": "enumeration", "fieldType": "select", "options": [{"value":"lace","label":"Lace"},{"value":"skin","label":"Skin"},{"value":"mono","label":"Mono"},{"value":"hybrid","label":"Hybrid"},{"value":"frontal","label":"Frontal"}] }, "supportedValueTypes": ["STATIC_VALUE"], "isRequired": false }
    ],
    "outputFields": [
      { "typeDefinition": { "name": "products", "type": "string", "externalOptions": false } },
      { "typeDefinition": { "name": "result_count", "type": "string", "externalOptions": false } }
    ],
    "labels": { "en": { "actionName": "Search Hair Systems Catalog", "appDisplayName": "Hair Concierge" } }
  }
}
```

## Tool 2: Reorder Hair System (TAKE_ACTION)

```json
{
  "uid": "reorder-hair-system",
  "type": "workflow-action",
  "isPublished": true,
  "config": {
    "actionUrl": "https://api.hairconcierge.ai/tools/reorder",
    "supportedClients": [{
      "client": "AGENTS",
      "toolType": "TAKE_ACTION",
      "llmConfig": {
        "actionDescription": "Use when a customer wants to reorder a hair system or place a new order. Requires customer_email. Set reorder_last to true if they want to repeat their last order. Returns a Shopify checkout URL."
      }
    }],
    "inputFields": [
      { "typeDefinition": { "name": "customer_email", "type": "string", "fieldType": "text" }, "supportedValueTypes": ["STATIC_VALUE"], "isRequired": false },
      { "typeDefinition": { "name": "product_name", "type": "string", "fieldType": "text" }, "supportedValueTypes": ["STATIC_VALUE"], "isRequired": false },
      { "typeDefinition": { "name": "reorder_last", "type": "enumeration", "fieldType": "select", "options": [{"value":"true","label":"Yes"},{"value":"false","label":"No"}] }, "supportedValueTypes": ["STATIC_VALUE"], "isRequired": false }
    ],
    "outputFields": [
      { "typeDefinition": { "name": "checkout_url", "type": "string", "externalOptions": false } },
      { "typeDefinition": { "name": "order_summary", "type": "string", "externalOptions": false } },
      { "typeDefinition": { "name": "cart_total", "type": "string", "externalOptions": false } }
    ],
    "labels": { "en": { "actionName": "Reorder Hair System", "appDisplayName": "Hair Concierge" } }
  }
}
```

## Tool 3: Check Subscription (GET_DATA)

```json
{
  "uid": "check-subscription",
  "type": "workflow-action",
  "config": {
    "actionUrl": "https://api.hairconcierge.ai/tools/subscription-status",
    "supportedClients": [{
      "client": "AGENTS",
      "toolType": "GET_DATA",
      "llmConfig": { "actionDescription": "Use when a customer asks about their subscription status, credits balance, next billing date, or subscription perks. Pass customer_email." }
    }],
    "inputFields": [{ "typeDefinition": { "name": "customer_email", "type": "string", "fieldType": "text" }, "supportedValueTypes": ["STATIC_VALUE"], "isRequired": false }],
    "outputFields": [
      { "typeDefinition": { "name": "subscription_status", "type": "string", "externalOptions": false } },
      { "typeDefinition": { "name": "credits_balance", "type": "string", "externalOptions": false } },
      { "typeDefinition": { "name": "next_billing_date", "type": "string", "externalOptions": false } },
      { "typeDefinition": { "name": "subscription_tier", "type": "string", "externalOptions": false } }
    ]
  }
}
```

## Tool 4: KB Deep Search (GENERATE)

```json
{
  "uid": "kb-deep-search",
  "type": "workflow-action",
  "config": {
    "actionUrl": "https://api.hairconcierge.ai/tools/kb-search",
    "supportedClients": [{
      "client": "AGENTS",
      "toolType": "GENERATE",
      "llmConfig": { "actionDescription": "Use when customer asks detailed questions about hair systems, maintenance, installation, troubleshooting, or product comparisons. Searches 1,200+ articles and returns a synthesized answer with source links." }
    }],
    "inputFields": [{ "typeDefinition": { "name": "query", "type": "string", "fieldType": "textarea" }, "supportedValueTypes": ["STATIC_VALUE"], "isRequired": false }],
    "outputFields": [
      { "typeDefinition": { "name": "answer", "type": "string", "externalOptions": false } },
      { "typeDefinition": { "name": "source_urls", "type": "string", "externalOptions": false } },
      { "typeDefinition": { "name": "confidence", "type": "string", "externalOptions": false } }
    ]
  }
}
```

## Signature Validation (Node.js)

```javascript
const crypto = require('crypto');
function validateHubSpotSignature(req, clientSecret) {
  const signature = req.headers['x-hubspot-signature'];
  const hash = crypto.createHash('sha256')
    .update(clientSecret + JSON.stringify(req.body))
    .digest('hex');
  return hash === signature;
}
```
