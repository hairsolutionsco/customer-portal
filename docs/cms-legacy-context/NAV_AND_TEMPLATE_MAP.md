# Navigation and CMS template map

Derived from `components/layout/Sidebar.tsx` (legacy Next app). **Order and labels** are the intended IA for the membership portal.

## Primary nav (customer)

| # | Label (UI) | Legacy path | CMS template | Notes |
|---|------------|-------------|----------------|-------|
| 1 | Dashboard | `/app` | `theme/templates/portal-dashboard.html` | Home after login. |
| 2 | Hair Profile | `/app/profile-setup` | `portal-profile.html` | Onboarding + ongoing edits; maps to contact JSON (`portal_hair_profile_json`). |
| 3 | Orders | `/app/orders` | `portal-orders.html` | List; detail → `portal-order-detail.html`. |
| 4 | Invoices | `/app/invoices` | `portal-invoices.html` | Mirror / `portal_invoices_json` per registry. |
| 5 | Customization | `/app/customization` | `portal-customization.html` | Saved templates; `portal_saved_templates_json`. |
| 6 | Plans & Billing | `/app/billing` | `portal-billing.html` | Plans + subscription framing; HubDB `subscription_plans` + billing JSON if used. |
| 7 | Shop | `/app/shop` | `portal-shop.html` | Maintenance catalog; HubDB `products`. |
| 8 | Support | `/app/support` | `portal-support.html` | Tickets / conversations (HubSpot tickets or external). |
| 9 | Help | `/app/help` | `portal-help.html` | Knowledge / articles (Notion sync was app-era; CMS may use KB or static). |
| 10 | Locations | `/app/locations` | `portal-locations.html` | HubDB `affiliated_locations`. |
| 11 | Settings | `/app/settings` | `portal-settings.html` | Profile + notifications modules. |

## CMS modules that mirror nav sections

Sidebar chrome: `portal-sidebar.module`, `portal-header.module`.

Feature modules (under `theme/modules/`): `dashboard-stats`, `production-alert`, `quick-actions`, `recent-orders`, `order-list`, `order-detail`, `status-badge`, `hair-profile-form`, `hair-profile-display`, `customization-grid`, `invoice-table`, `billing-current`, `billing-plans`, `product-grid`, `location-cards`, `settings-profile`, `settings-notifications`.

## Auth routes (Next-only; CMS uses membership templates)

Legacy paths under `app/(auth)/`: login, signup, forgot-password, error. **CMS equivalent:** `theme/templates/system/membership-*.html` (login, register, reset password).

## Deep links called out in components

- Quick reorder: `/app/customization?reorder=true` → customization template with reorder mode in CMS (query param or dedicated CTA).
- Production confirmation (legacy): `/app/orders/{orderNumber}/confirm` and `.../postpone` → implement as HubSpot-native flows (forms, CTAs to ticket/order update, or Worker); **no** requirement to keep those exact URLs on CMS.
