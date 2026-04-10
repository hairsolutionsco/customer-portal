# Quick Start Guide

Get your Hair Solutions Customer Portal running in 5 minutes!

## Prerequisites

- **Node.js 18+** installed
- **PostgreSQL** database running locally or accessible remotely
- **Git** for version control

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Prisma, NextAuth, Stripe, and more.

### 2. Configure Environment Variables

The `.env` file has been created with placeholder values. Update it with your real credentials:

```bash
# Edit .env file
nano .env  # or use your preferred editor
```

**Minimum required for local development:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/hair_solutions_portal"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
```

**Optional (can add later):**
- Stripe keys (for payments)
- Shopify credentials (for order sync)
- Notion API key (for help articles)
- SMTP settings (for emails)

### 3. Set Up Database

```bash
# Push the Prisma schema to your database
npm run db:push

# Seed with example data (recommended for development)
npm run db:seed
```

This creates all tables and adds:
- 1 admin user
- 1 support user
- 1 demo customer
- 3 subscription plans
- 5 maintenance products
- 3 affiliated locations
- Sample help articles

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

### 5. Login

Use one of the seeded accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hairsolutions.co | admin123 |
| Support | support@hairsolutions.co | support123 |
| Customer | demo@example.com | demo123 |

## What You'll See

### As a Customer (demo@example.com)

1. **Dashboard** - Overview of orders and upcoming production
2. **Hair Profile** - Complete your measurements and preferences
3. **Orders** - View order history and track status
4. **Customization** - Save hair system templates for quick reorder
5. **Plans & Billing** - Choose a subscription plan
6. **Shop** - Browse maintenance products
7. **Support** - Create support tickets
8. **Help** - Access knowledge base articles
9. **Locations** - Find affiliated specialists worldwide
10. **Settings** - Manage account and preferences

### As an Admin (admin@hairsolutions.co)

Full access to all features plus:
- View all customers' data (respecting RBAC)
- Manage subscription plans
- Handle support tickets
- Access audit logs

## Next Steps

### Add Real Integrations

1. **Stripe** (for payments)
   - Get API keys from [Stripe Dashboard](https://dashboard.stripe.com)
   - Add to `.env`: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
   - Create products in Stripe and link to subscription plans

2. **Shopify** (for orders)
   - Create private app in Shopify admin
   - Add to `.env`: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_API_TOKEN`
   - Set up webhooks pointing to your server

3. **Notion** (for help articles)
   - Create integration at [Notion Integrations](https://www.notion.so/my-integrations)
   - Add to `.env`: `NOTION_API_KEY`, `NOTION_HELP_DATABASE_ID`
   - Run sync to import articles

### Explore the Codebase

- **`/app/app/*`** - All customer-facing pages
- **`/lib/*`** - Integration modules and utilities
- **`/components/*`** - Reusable React components
- **`/prisma/schema.prisma`** - Database models

### Development Tools

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Create a new database migration
npx prisma migrate dev --name your_change_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Common Issues

### Database Connection Error

**Problem**: Can't connect to PostgreSQL

**Solution**:
1. Make sure PostgreSQL is running
2. Check `DATABASE_URL` in `.env` is correct
3. Test connection: `npx prisma db pull`

### NextAuth Error

**Problem**: "Invalid session" or auth errors

**Solution**:
1. Generate a new `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```
2. Add it to `.env`
3. Restart dev server

### Port Already in Use

**Problem**: Port 3000 is already in use

**Solution**:
```bash
# Use a different port
PORT=3001 npm run dev
```

## Production Deployment

See [README.md](./README.md) for full deployment guide.

**Quick deploy to Vercel:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Need Help?

- 📖 Read the full [README.md](./README.md)
- 🔍 Check [Prisma Schema](./prisma/schema.prisma) for data models
- 🛠️ Review code comments for implementation details
- 📧 Contact: support@hairsolutions.co

---

**You're all set! Start customizing the portal for your needs.** 🚀
