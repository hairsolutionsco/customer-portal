# Breeze Customer Agent — HubSpot Developer Reference

## What It Is

AI-powered support agent that uses your content to answer customer questions. Auto-deploys to connected custom channels (including Hair Concierge) as of January 2026.

## Setup Checklist

- [ ] Sales or Service Hub Professional+ active
- [ ] Messaging channel connected (custom channel registered)
- [ ] AI settings enabled: generative AI tools, CRM data, customer conversion data, files data
- [ ] Customer agent editor permissions granted

## Knowledge Sources to Feed It

For Hair Concierge, add all of:
- All hairsolutions.co product pages
- 1,200+ blog articles
- Knowledge base articles (51 subcategories)
- Product specification documents
- Maintenance guides
- FAQ content

Supported upload formats: `.docx`, `.pdf`, `.txt`, `.html`, `.csv`, `.json`, `.md`, `.pptx`, `.mp4`

## Personality & Behaviour

- Set to **Custom brand voice** for Hair Concierge persona
- Generates responses backed by verifiable sources
- Asks follow-up questions when unclear
- Escalates to human agents when unable to answer
- Auto-closes inactive conversations: live chat/WhatsApp = 24hrs, email = 72hrs

## Pricing

| Action | Credits |
|--------|---------|
| Customer Agent conversation | 100 |
| Prospecting Agent (per contact/month) | 100 |
| Data Agent prompt | 10 |
| Breeze workflow action | 10 |
| Reopened conversation | 0 |

## Extending with Agent Tools

Add capabilities beyond KB answers:
1. **Shopify Product Query** — browse catalog, get product details
2. **Reorder Hair System** — create Shopify cart, return checkout URL
3. **Check Subscription** — view status, credits, next billing date
4. **KB Deep Search** — deep search across all documentation

Each capability = one Agent Tool defined in your HubSpot project.
