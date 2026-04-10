# Agent Tools — HubSpot Developer Reference

## Complete hsmeta.json Schema

```json
{
  "uid": "unique-tool-identifier",
  "type": "workflow-action",
  "isPublished": true,
  "config": {
    "actionUrl": "https://your-server.com/api/tools/tool-name",
    "supportedClients": [
      {
        "client": "AGENTS",
        "toolType": "GET_DATA",
        "llmConfig": {
          "actionDescription": "Instructions for the AI agent — when and how to use this tool. Written for the LLM, not humans."
        }
      },
      { "client": "WORKFLOWS" }
    ],
    "inputFields": [
      {
        "typeDefinition": {
          "name": "field_name",
          "type": "string",
          "fieldType": "text"
        },
        "supportedValueTypes": ["STATIC_VALUE"],
        "isRequired": false
      }
    ],
    "outputFields": [
      {
        "typeDefinition": {
          "name": "result",
          "type": "string",
          "externalOptions": false
        }
      }
    ],
    "labels": {
      "en": {
        "actionName": "Human-readable tool name",
        "appDisplayName": "Hair Concierge",
        "actionDescription": "Description shown in workflow UI",
        "inputFieldLabels": { "field_name": "Field Label" }
      }
    }
  }
}
```

## Input Field Types

| `type` | `fieldType` | Use case |
|--------|-------------|----------|
| `string` | `text` | Short text |
| `string` | `textarea` | Long text |
| `enumeration` | `select` | Dropdown |
| `number` | `number` | Numeric |
| `boolean` | — | True/false |

## Tool Type Reference

| Type | User review? | Use for |
|------|-------------|---------|
| `GET_DATA` | No | Retrieve info |
| `GENERATE` | No | Create content/summaries |
| `TAKE_ACTION` | Yes | Create/update/delete operations |

## Dual Audience Design

| Element | AI agent sees | Human sees |
|---------|--------------|------------|
| `llmConfig.actionDescription` | ✅ Primary instruction | ❌ |
| `labels.actionDescription` | ❌ | ✅ Workflow UI |
| `labels.actionName` | ❌ | ✅ Tool picker |
| `labels.inputFieldLabels` | ❌ | ✅ Form labels |

## BLOCK State (async operations)

```json
{ "outputFields": { "hs_execution_state": "BLOCK", "hs_expiration_duration": "PT1H" } }
```
Unblock: `POST https://api.hubspot.com/callbacks/{callbackId}/complete`

## Testing Workflow

1. **Phase 1 — Workflow testing:** Test core logic via HubSpot workflows (no AI)
2. **Phase 2 — Agent testing:** Use Developer Tool Testing Agent to test LLM integration

## hsproject.json

```json
{ "platformVersion": "2025.2" }
```
Always `2025.2` — never change this.
