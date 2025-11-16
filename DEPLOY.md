# Deployment Guide - Hair Solutions Customer Portal

This guide covers deploying your customer portal to Vercel.

## 📋 Prerequisites

Before deploying, make sure you have:
- [ ] GitHub account
- [ ] Vercel account (free - sign up at [vercel.com](https://vercel.com))
- [ ] All API keys ready (Stripe, Shopify, Notion)
- [ ] Code pushed to GitHub repository

---

## 🎯 Method 1: GitHub Integration (RECOMMENDED)

This is the **easiest and best** method. Vercel will automatically deploy when you push to GitHub.

### Step 1: Push Code to GitHub (Already Done ✅)

Your code is already on GitHub!

### Step 2: Connect to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub

2. **Import Repository**
   - Click "Import Project"
   - Select `hairsolutionsco/customer-portal`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `prisma generate && next build` (auto-filled)
   - Click "Deploy" (don't add env vars yet)

4. **Wait for Initial Build** (will fail - that's OK!)
   - This creates the project structure
   - We'll add environment variables next

### Step 3: Add Vercel Postgres Database

1. **In your Vercel project**, go to the **Storage** tab
2. Click **Create Database** → **Postgres**
3. Choose a region (closest to your customers)
4. Click **Create**
5. Go to `.env.local` tab and copy the `DATABASE_URL`

### Step 4: Add Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add each variable from the list below:

#### Required Variables:

```env
# Database (from Vercel Postgres)
DATABASE_URL=postgres://...  (copy from Storage tab)

# NextAuth
NEXTAUTH_URL=https://customerportal.hairsolutions.co  (your production domain)
NEXTAUTH_SECRET=  (generate with: openssl rand -base64 32)

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Shopify
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_API_TOKEN=shpat_...
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret

# Notion
NOTION_API_KEY=secret_...
NOTION_HELP_DATABASE_ID=...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=Hair Solutions <noreply@hairsolutions.co>

# App
NEXT_PUBLIC_APP_URL=https://customerportal.hairsolutions.co
NEXT_PUBLIC_SITE_NAME=Hair Solutions Customer Portal
```

3. For each variable:
   - Click **Add Another**
   - Name: `DATABASE_URL` (for example)
   - Value: (paste value)
   - Environment: Select **Production**, **Preview**, **Development**
   - Click **Save**

### Step 5: Run Database Migration

After adding environment variables, you need to set up the database:

**Option A: From your local machine**
```bash
# Set the production DATABASE_URL temporarily
export DATABASE_URL="postgres://..." (from Vercel)

# Run migration
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

**Option B: Using Vercel CLI**
```bash
vercel env pull .env.production
DATABASE_URL="..." npx prisma migrate deploy
```

### Step 6: Redeploy

1. Go to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Click **Redeploy**
4. Check **Use existing Build Cache**
5. Click **Redeploy**

### Step 7: Add Custom Domain

1. Go to **Settings** → **Domains**
2. Add `customerportal.hairsolutions.co`
3. Follow DNS instructions to point your domain to Vercel
4. Wait for SSL certificate (automatic)

### Step 8: Configure Webhooks

Update webhook URLs in external services:

**Shopify:**
- Go to Settings → Notifications → Webhooks
- Add webhooks pointing to: `https://customerportal.hairsolutions.co/api/webhooks/shopify`
- Topics: `orders/create`, `orders/updated`, `orders/paid`, `orders/cancelled`

**Stripe:**
- Go to Developers → Webhooks
- Add endpoint: `https://customerportal.hairsolutions.co/api/webhooks/stripe`
- Select events: `customer.subscription.*`, `invoice.*`, `checkout.session.completed`
- Copy webhook signing secret to Vercel env vars

---

## 🖥️ Method 2: CLI Deployment (Alternative)

If you prefer using the command line from **your local computer**:

### Step 1: Clone Repository (if needed)

```bash
git clone <your-repo-url>
cd customer-portal
```

### Step 2: Run Deployment Script

```bash
./deploy-to-vercel.sh
```

This script will:
1. Install Vercel CLI (if needed)
2. Login to your Vercel account
3. Deploy the application
4. Show you next steps

### Step 3: Follow Post-Deployment Steps

After running the script, follow steps 3-8 from Method 1 above.

---

## ✅ Verify Deployment

After deployment, test these endpoints:

1. **Homepage**: `https://customerportal.hairsolutions.co`
   - Should redirect to login page

2. **Login**: `https://customerportal.hairsolutions.co/login`
   - Try logging in with demo account

3. **API Health Check**:
   ```bash
   curl https://customerportal.hairsolutions.co/api/auth/csrf
   ```
   - Should return CSRF token

4. **Database Connection**: Login and check dashboard
   - Should show orders, profile, etc.

---

## 🔧 Troubleshooting

### Build Fails

**Error**: "Prisma Client not generated"

**Solution**: Build command should be:
```bash
prisma generate && next build
```

### Database Connection Error

**Error**: "Can't reach database server"

**Solution**:
1. Check `DATABASE_URL` in environment variables
2. Make sure it's set for Production, Preview, AND Development
3. Verify Vercel Postgres is in same region

### Webhooks Not Working

**Error**: Webhooks return 401/403

**Solution**:
1. Verify webhook secrets in environment variables
2. Check webhook URL is correct (https, not http)
3. Review webhook logs in Shopify/Stripe dashboard

### "Module not found" Errors

**Solution**:
1. Clear build cache
2. Redeploy
3. Check all dependencies in package.json

---

## 🔄 Auto-Deployment

With GitHub integration, every time you push to your main branch:
1. Vercel automatically builds
2. Runs tests (if configured)
3. Deploys to production
4. Updates your domain

**Preview deployments**: Every pull request gets its own preview URL!

---

## 💰 Pricing

Vercel costs for this app:

| Component | Cost |
|-----------|------|
| Vercel Pro Plan | $20/month |
| Vercel Postgres (Starter) | $20/month |
| **Total** | **$40/month** |

This includes:
- ✅ Unlimited deployments
- ✅ SSL certificate
- ✅ DDoS protection
- ✅ Global CDN
- ✅ Analytics
- ✅ Auto-scaling
- ✅ 10GB Postgres database

---

## 📊 Monitoring

After deployment, monitor your app:

1. **Analytics**: Vercel dashboard → Analytics tab
2. **Logs**: Vercel dashboard → Logs (real-time)
3. **Database**: Storage tab → Query your database
4. **Performance**: Speed Insights (free add-on)

---

## 🚀 Next Steps After Deployment

1. **Test all features** with real data
2. **Configure custom email domain** (for @hairsolutions.co emails)
3. **Set up monitoring alerts** (Vercel integrations)
4. **Add error tracking** (Sentry integration recommended)
5. **Configure backups** for Postgres database
6. **Train your team** on using the portal
7. **Onboard first customers**!

---

## 🆘 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: support@vercel.com
- **Check deployment logs** in Vercel dashboard for errors

---

## 📝 Deployment Checklist

Before going live:

- [ ] All environment variables added
- [ ] Database migrated and seeded
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Shopify webhooks configured
- [ ] Stripe webhooks configured
- [ ] Test login/signup flow
- [ ] Test order creation
- [ ] Test support tickets
- [ ] Test all integrations
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Team trained

---

**Your portal is now live! 🎉**

Customers can access it 24/7 at: `https://customerportal.hairsolutions.co`
