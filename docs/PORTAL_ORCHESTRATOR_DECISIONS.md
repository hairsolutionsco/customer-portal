# Portal orchestrator decisions (ADR log)

**Source of truth for scope:** [`docs/cms-customer-portal-plan.md`](cms-customer-portal-plan.md). This file records **orchestrator-level** choices called out under *Decisions the orchestrator must make BEFORE spawning agents*, **Wave 3 — A6**, **Wave 4 — A7a**, and **Quality gates — G5b**.

---

## ADR-001 — Stripe Customer/Billing Portal URL source (A6)

**Context (plan):** A6 rewrites `portal-billing.html` with a “Manage in Stripe” CTA. URL may be a **generic account-level theme field** or a **per-contact property** (upstream workflow).

| Option | Pros | Cons |
|--------|------|------|
| **Theme field (single URL)** | No CRM property or workflow; trivial for editors; matches “one Stripe account / one portal experience” | Same link for every member; not suitable if Stripe portal links must be customer-specific |
| **Contact property + workflow** | Per-user Stripe portal/session URLs when Stripe generates unique links | Requires property, workflow reliability, and A6 HubL to read the field |

**Recommendation (default for Hair Solutions):** **Theme-level single Billing Portal URL** in the `commerce` group (`fields.json` — A6 ownership per plan *Guiding principles*). Rationale: lower operational burden, aligns with *Out of scope* (“Stripe account-level portal URL generation — must be provided to A6”) as one supplied value; per-contact URLs add CRM and automation surface area unless product policy demands individualized Stripe sessions.

**Vincent must supply**

| Path | Deliverable |
|------|-------------|
| **Theme field (recommended)** | The **canonical Stripe Customer/Billing Portal URL** (or the stable pattern HubSpot will paste into theme settings). Confirm whether one URL suffices for all logged-in members. |
| **If per-contact instead** | **Contact property** internal name + type (single-line text/URL); **workflow or integration** spec that sets it (trigger, idempotency, empty-state behavior); **example values** for QA; note in A6 PR that orchestrator chose property path. |

**Status:** Pending confirmation of URL strategy; A6 documents final choice in PR per plan.

---

## ADR-002 — Shopify web components and CSP (A6)

**Context (plan):** A6 embeds Shopify via web components on `portal-shop.html`. Plan requires **CSP pre-flight**: if the **membership subdomain** CSP blocks Shopify module scripts, escalate **CSP update** or **sidecar**.

| Option | Idea | Tradeoff |
|--------|------|----------|
| **A — HubSpot membership subdomain CSP relaxation** | Allow required Shopify script/style/frame sources on the private membership host | Depends on HubSpot tier/support; security review; may be slow or unavailable |
| **B — Sidecar / embed page** | Host embed on a domain you control (or Shopify) and iframe/link | More moving parts; UX and auth boundaries need a clear story |

**Recommendation — next step:** **Confirm with HubSpot Support** (or account CSM) whether **Content Hub Professional / membership pages** can expose CSP allowlists needed for **Shopify web components** (script origins, connect-src, frame-src as required). Capture the answer in `docs/KNOWN_ISSUES.md` or A6 PR. Parallel: prototype in draft upload to see **browser console CSP violations** (plan *Verification* smoke: Shop renders web component).

**Fallback UX:** If CSP cannot be satisfied in-portal, ship **Shop** as **primary CTA linking out** to the **Shopify storefront** (logged-in or public URL per commerce policy), with short copy that checkout continues on Shopify. Prefer link-out over a broken embed.

**Vincent must supply (plan *Out of scope*):** Shopify **shop handle**, **web-component script URL(s)** (if embed path survives CSP), and the **storefront URL** for fallback.

---

## ADR-003 — G5b admin access: membership group vs HubL `is_staff` (A7a)

**Context (plan):** **G5b** blocks **A7a** until staff **membership access groups** are provable on the tier **or** the orchestrator **explicitly approves** the **HubL-guard fallback**. **Guiding principles:** if G5b “fails,” admin templates still use `{% if contact.is_staff %}…{% else %}access denied{% endif %}` and render **no CRM data** outside the guard. A7a wraps every admin template in that guard.

| Layer | Role |
|-------|------|
| **Staff membership access group** | HubSpot-native gate for who can reach admin routes at membership/auth layer (ideal) |
| **`contact.is_staff` HubL guard** | Defense in depth + **required** template pattern per plan; also the **approved fallback** when tier cannot prove access groups |

**Recommendation — provisional path so A7a is not blocked**

1. **A9a** documents whether **staff-only membership access group** is **possible on portal 50966981** (plan Wave 0 — **A9a** spike feeds **G5b**).
2. If **yes:** configure staff group; A7a still keeps **`is_staff`** (or equivalent) guards as specified.
3. If **no / unclear:** orchestrator **records explicit approval** of the **HubL-guard fallback** (this ADR + gate memo) so **G5b** clears and **A7a** proceeds without waiting on tier upgrades.

**Tie to A7a:** A7a remains **gated on G5b** per plan; **unblocking** means satisfying G5b by **proof** or **documented orchestrator approval** of the fallback — not skipping guards.

---

## Quick reference

| ADR | Plan anchor | Owner agent |
|-----|-------------|-------------|
| 001 | *Decisions…* item 3; **Wave 3 — A6**; *Out of scope* Stripe URL | A6 |
| 002 | *Decisions…* item 5; **Wave 3 — A6** CSP pre-flight; *Verification* Shop | A6 + orchestrator |
| 003 | **G5b**; *Decisions…* item 4; **Guiding principles** admin leak; **Wave 4 — A7a** | A9a + orchestrator + A7a |
