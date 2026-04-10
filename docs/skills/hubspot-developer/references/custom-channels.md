# Custom Channels API — HubSpot Developer Reference

## Step 1: Register Channel

```
POST /conversations/v3/custom-channels?hapikey={DEV_API_KEY}&appId={appId}
```

```json
{
  "name": "Hair Concierge",
  "webhookUrl": "https://api.hairconcierge.ai/hubspot/webhook",
  "capabilities": {
    "deliveryIdentifierTypes": ["CHANNEL_SPECIFIC_OPAQUE_ID"],
    "allowConversationStart": true,
    "allowOutgoingMessages": true,
    "allowInlineImages": true,
    "threadingModel": "INTEGRATION_THREAD_ID",
    "richText": ["BOLD", "ITALIC", "HYPERLINK", "LISTS"],
    "outgoingAttachmentTypes": ["FILE"],
    "maxFileAttachmentCount": 3,
    "maxFileAttachmentSizeBytes": 2000000
  },
  "channelDescription": "AI-powered hair replacement concierge",
  "channelLogoUrl": "https://hairconcierge.ai/logo.png"
}
```

## Step 2: Connect Channel Account

```
POST /conversations/v3/custom-channels/{channelId}/channel-accounts
```
```json
{
  "inboxId": "123456",
  "name": "Hair Concierge App",
  "deliveryIdentifier": { "type": "CHANNEL_SPECIFIC_OPAQUE_ID", "value": "hair-concierge-app-v1" },
  "authorized": true
}
```

## Step 3: Publish Incoming Messages

When user sends a message in the app:
```
POST /conversations/v3/custom-channels/{channelId}/messages
```
```json
{
  "text": "User's message",
  "channelAccountId": "account-id",
  "integrationThreadId": "thread-uuid-123",
  "messageDirection": "INCOMING",
  "senders": [{ "deliveryIdentifier": { "type": "HS_EMAIL_ADDRESS", "value": "customer@example.com" }, "name": "John Smith" }],
  "recipients": [{ "deliveryIdentifier": { "type": "CHANNEL_SPECIFIC_OPAQUE_ID", "value": "hair-concierge-app-v1" } }],
  "timestamp": "2026-02-11T15:30:00Z"
}
```

## Step 4: Handle Outgoing Messages (Webhook)

HubSpot sends `OUTGOING_CHANNEL_MESSAGE_CREATED` events to your `webhookUrl`.
Your backend receives it → pushes to mobile app via WebSocket/push notification.

## Threading Models

- **`INTEGRATION_THREAD_ID`** (recommended): You manage thread IDs, supports concurrent conversations
- **`DELIVERY_IDENTIFIER`**: HubSpot manages, only ONE active thread per participant pair

## Requirements

- Public app (private apps not supported)
- Sales or Service Hub Professional+
- OAuth scopes: `conversations.custom_channels.read`, `conversations.custom_channels.write`
