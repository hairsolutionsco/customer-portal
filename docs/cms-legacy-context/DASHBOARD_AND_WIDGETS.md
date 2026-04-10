# Dashboard copy and widget behavior (legacy → CMS)

Source: `app/app/page.tsx` and `components/dashboard/*`.

## Page framing

- **Title pattern:** “Welcome back, {first name}!” (fallback: “there”).
- **Subtitle:** “Here’s what’s happening with your hair systems”.

## Stat cards (`DashboardStats`)

| Label | Meaning | CMS module | Data hint |
|-------|---------|------------|-----------|
| Total Orders | Count of all orders for the member | `dashboard-stats.module` | From orders collection (deals mirror or native orders when available). |
| Active Orders | Orders whose status is not terminal (legacy: not `DELIVERED` or `CANCELLED`) | same | Define “active” consistently with `status-badge` / order list. |
| Profile | “Complete” vs “Incomplete” from `onboardingCompleted` | same | Contact `portal_hair_profile_json` → `onboarding_completed` (see `SCHEMA_REGISTRY.md`). |

## Next production alert (`NextProductionAlert`)

**Heading:** “Next system production scheduled”.

**Body:** States the **scheduled production date** and **days until** that date.

**CTAs (when customization not confirmed):**

- Primary: “Confirm customization” (legacy linked to order-scoped confirm URL).
- Secondary: “Change date” (postpone).

**Confirmed state:** “✓ Customization confirmed” (no buttons).

**CMS module:** `production-alert.module`. Data must come from CRM-native scheduling (deal properties, custom properties, or synced fields)—not Postgres `OrderProductionSchedule`.

## Quick actions (`QuickActions`)

| Name | Description | Target IA | Enabled when |
|------|-------------|-----------|--------------|
| Quick Reorder | Reorder with your saved configuration | Customization / shop CTA | `hasProfile` |
| Complete Profile / Update Profile | Set up or update hair profile | Profile template | always (label toggles) |
| Contact Support | Get help from our team | Support template | always |
| Choose a Plan / Manage Plan | Subscribe or manage subscription | Billing | always (label toggles with `hasPlan`) |

**CMS module:** `quick-actions.module`.

## Recent orders (`RecentOrders`)

- **Section title:** “Recent Orders”.
- **Empty state:** “No orders yet” + CTA “Create your first order” → customization (legacy) or shop / contact flow in CMS.
- **Row content:** order number, product name, created date, **status pill**, **total** (formatted currency).
- **Footer:** If list at cap (legacy: 5+), link “View all orders” → orders list template.

**CMS module:** `recent-orders.module`. Status colors in legacy TSX used `OrderStatus` enum keys—align labels with `PRISMA_DOMAIN_VOCABULARY.md` and whatever fields the theme reads from deals/orders.
