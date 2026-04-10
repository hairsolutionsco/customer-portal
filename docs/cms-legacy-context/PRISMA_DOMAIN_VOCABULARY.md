# Prisma domain vocabulary (legacy DB → HubSpot)

**Source:** `prisma/schema.prisma` (PostgreSQL app). **Do not** recreate this schema in HubSpot; use this file to **name things consistently** in HubL, JSON, and workflows.

Canonical JSON keys for hair profile on **contact** are **snake_case** in `portal_hair_profile_json` (see `data/SCHEMA_REGISTRY.md` and `data/schemas/hair_profile.json`). Prisma used **camelCase** on models—the registry already maps the intended portal contract.

## User roles (`UserRole`)

`CUSTOMER` | `SUPPORT` | `ADMIN`

**CMS portal:** Membership identifies the **contact**; staff use HubSpot apps, not the customer theme. No need to surface enum in theme unless building admin UI elsewhere.

## Order lifecycle (`OrderStatus`)

| Prisma value | Typical meaning |
|--------------|-----------------|
| `PENDING` | Created, not yet confirmed |
| `CONFIRMED` | Accepted / queued |
| `IN_PRODUCTION` | Manufacturing |
| `QUALITY_CHECK` | QC |
| `SHIPPED` | In transit |
| `DELIVERED` | Completed |
| `CANCELLED` | Cancelled |

**CMS mapping:** Native Commerce **order** stages and/or **deal** stages used as the GraphQL-visible mirror. Keep user-facing labels similar to the strings above (legacy UI replaced underscores with spaces).

## Production stages (`ProductionStage`)

`AWAITING_CONFIRMATION` → `MATERIALS_PREPARATION` → `BASE_CONSTRUCTION` → `HAIR_VENTILATION` → `STYLING` → `QUALITY_INSPECTION` → `PACKAGING` → `COMPLETED`

**CMS mapping:** Optional detail on order/deal properties or internal ops; theme modules may show a **subset** or simplified progress.

## Invoice status (`InvoiceStatus`)

`PENDING` | `PAID` | `OVERDUE` | `CANCELLED`

**CMS mapping:** Align with `portal_invoices_json` `status` and native invoices when available (`SCHEMA_REGISTRY.md`).

## Support ticket (`TicketStatus`, `TicketPriority`)

**Status:** `OPEN` → `IN_PROGRESS` → `WAITING_FOR_CUSTOMER` → `RESOLVED` → `CLOSED`  
**Priority:** `LOW` | `MEDIUM` | `HIGH` | `URGENT`

**CMS mapping:** HubSpot **tickets** object (Service Hub) if used on private pages or via embed/Worker.

## Production scheduling (`OrderProductionSchedule` + `ReminderStatus`)

Legacy fields worth preserving as **concepts** in CRM:

- `scheduledProductionDate`, `scheduledCompletionDate`
- `customizationConfirmed`, `customizationConfirmedAt`
- `reminderStatus`: `SCHEDULED` | `SENT` | `CONFIRMED` | `POSTPONED` | `CANCELLED`
- Postponement: `originalScheduledDate`, `postponedCount`, `postponementReason`

Implement with **contact/order/deal properties** and **workflows**, not app tables.

## Customization template (concept)

Legacy `CustomizationTemplate`: `name`, `baseType`, `hairColor`, `density`, `hairLength`, `style`, `attachmentMethod`, `additionalOptions` (JSON), `isDefault`, `notes`.

**CMS mapping:** Elements of `portal_saved_templates_json` (array of objects)—shape should stay compatible with forms and reorder UX; exact keys live in registry / props script.

## Order record (concept)

Legacy `Order` highlights: `orderNumber`, `shopifyOrderId`, `productName`, `status`, `productionStage`, money fields (`subtotal`, `tax`, `shipping`, `total`, `currency`), dates (`shippedAt`, `deliveredAt`, …), `configurationSnapshot` (JSON).

**CMS mapping:** Native **order** + associations to contact; until GraphQL exposes orders, **deal** mirror with properties carrying the same **business** facts.

## Subscription (concept)

`SubscriptionPlan` + `CustomerPlan`: Stripe IDs, `currentPeriodStart/End`, `nextScheduledProduction`, plan features, `systemsPerYear`.

**CMS mapping:** HubDB plans table + billing properties / Stripe Customer Portal links; see `billing` templates and `portal_billing_json` if used.

## Catalog product (concept)

Legacy `Product`: `slug`, Shopify IDs, `category`, images, `featured`, `displayOrder`.

**CMS mapping:** HubDB `products` rows (`SCHEMA_REGISTRY.md`).

## Notion (`NotionResourceType`)

`HELP_ARTICLE` | `CARE_GUIDE` | `PERSONAL_NOTE` | `GENERAL_KNOWLEDGE`

**CMS mapping:** Help content may move to **HubSpot knowledge base**, **CMS pages**, or continue **Notion** via server-side sync—theme should not assume Prisma `CustomerNotionResource`.
