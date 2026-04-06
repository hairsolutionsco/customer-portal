# Railway Deployment Guide - Hair Solutions Customer Portal

This guide will walk you through deploying the Hair Solutions Customer Portal to Railway.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deployment](#quick-deployment)
3. [Detailed Setup](#detailed-setup)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

## ✅ Prerequisites

Before deploying to Railway, ensure you have:

- [ ] A Railway account ([sign up at railway.app](https://railway.app))
- [ ] Railway CLI installed (`npm install -g @railway/cli`)
- [ ] Git repository with your code
- [ ] All third-party API keys ready (Stripe, Shopify, Notion, SMTP)

## 🚀 Quick Deployment

### Option 1: Deploy via Railway Dashboard

1. **Go to Railway Dashboard**: Visit [railway.app/dashboard](https://railway.app/dashboard)

2. **Create New Project**: Click "New Project"

3. **Deploy from GitHub**:
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect it's a Next.js app

4. **Add PostgreSQL Database**:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically create a `DATABASE_URL` variable

5. **Configure Environment Variables**: See [Environment Variables](#environment-variables) section below

6. **Deploy**: Railway will automatically build and deploy your app

### Option 2: Deploy via Railway CLI

```bash
# Login to Railway
railway login

# Initialize Railway project
railway init

# Link to a new project
railway link

# Add PostgreSQL database
railway add --database postgresql

# Set environment variables (see Environment Variables section)
railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)
railway variables set NEXTAUTH_URL=https://your-app.railway.app

# Deploy
railway up
```

## 🔧 Detailed Setup

### Step 1: Create Railway Project

```bash
# Login to Railway
railway login

# Create a new project
railway init

# This will create a new project and link your local directory to it
```

### Step 2: Add PostgreSQL Database

**Via CLI:**
```bash
railway add --database postgresql
```

**Via Dashboard:**
1. Go to your project in Railway dashboard
2. Click "New" → "Database" → "Add PostgreSQL"
3. The database will be provisioned automatically

Railway will automatically create and inject the `DATABASE_URL` environment variable into your application.

### Step 3: Configure Environment Variables

You need to set all required environment variables. You can do this via CLI or the Railway Dashboard.

**Via CLI:**
```bash
# Generate NextAuth secret
railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Set your Railway app URL (get this after first deployment)
railway variables set NEXTAUTH_URL=https://your-app.railway.app
railway variables set NEXT_PUBLIC_APP_URL=https://your-app.railway.app

# Set app name
railway variables set NEXT_PUBLIC_SITE_NAME="Hair Solutions Customer Portal"

# Stripe keys
railway variables set STRIPE_SECRET_KEY=sk_live_...
railway variables set STRIPE_PUBLISHABLE_KEY=pk_live_...
railway variables set STRIPE_WEBHOOK_SECRET=whsec_...

# Shopify keys
railway variables set SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
railway variables set SHOPIFY_ADMIN_API_TOKEN=shpat_...
railway variables set SHOPIFY_WEBHOOK_SECRET=your-webhook-secret

# Notion keys
railway variables set NOTION_API_KEY=secret_...
railway variables set NOTION_HELP_DATABASE_ID=...

# SMTP/Email configuration
railway variables set SMTP_HOST=smtp.gmail.com
railway variables set SMTP_PORT=587
railway variables set SMTP_USER=your-email@gmail.com
railway variables set SMTP_PASSWORD=your-app-password
railway variables set EMAIL_FROM="Hair Solutions <noreply@hairsolutions.co>"
```

**Via Dashboard:**
1. Go to your project in Railway dashboard
2. Click on your service
3. Go to "Variables" tab
4. Click "New Variable" and add each variable
5. Or use "RAW Editor" to paste all variables at once

### Step 4: Deploy Application

**Via CLI:**
```bash
# Deploy your application
railway up

# This will build and deploy your app
```

**Via GitHub (Automatic):**
1. Connect your GitHub repository in Railway dashboard
2. Railway will automatically deploy on every push to main branch
3. Set up auto-deployments: Settings → Environment → Connect to GitHub

### Step 5: Run Database Migrations

After the first deployment, you need to set up the database schema:

```bash
# Connect to your Railway project
railway link

# Run Prisma migrations
railway run npx prisma migrate deploy

# Optional: Seed the database with sample data
railway run npm run db:seed
```

**Alternative - Via Railway Dashboard:**
1. Go to your service in Railway dashboard
2. Click "Settings" → "Deploy"
3. Under "Custom Build Command", add: `npm run build && npx prisma migrate deploy`

## 🔐 Environment Variables

### Required Variables

Create these environment variables in Railway:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string (auto-created by Railway) | `postgresql://...` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js sessions | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Railway app URL | `https://your-app.railway.app` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `https://your-app.railway.app` |
| `NEXT_PUBLIC_SITE_NAME` | Site name | `Hair Solutions Customer Portal` |

### Stripe Variables (Required for payments)

| Variable | Description | Where to find |
|----------|-------------|---------------|
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe Dashboard → Developers → API keys |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Stripe Dashboard → Developers → Webhooks |

### Shopify Variables (Optional - for product integration)

| Variable | Description | Where to find |
|----------|-------------|---------------|
| `SHOPIFY_STORE_DOMAIN` | Your Shopify store domain | e.g., `your-store.myshopify.com` |
| `SHOPIFY_ADMIN_API_TOKEN` | Shopify Admin API token | Shopify Admin → Apps → Create private app |
| `SHOPIFY_WEBHOOK_SECRET` | Shopify webhook secret | Set when creating webhooks |

### Notion Variables (Optional - for help articles)

| Variable | Description | Where to find |
|----------|-------------|---------------|
| `NOTION_API_KEY` | Notion integration token | Notion → Settings → Integrations |
| `NOTION_HELP_DATABASE_ID` | Notion database ID for help articles | Copy from Notion database URL |

### Email Variables (Optional - for notifications)

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password/app password | Your app-specific password |
| `EMAIL_FROM` | From email address | `Hair Solutions <noreply@hairsolutions.co>` |

### Setting All Variables at Once

Create a `.env.production` file locally (DO NOT commit this to Git):

```env
# Copy this template and fill in your values
DATABASE_URL="postgresql://..." # Auto-provided by Railway
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="https://your-app.railway.app"
NEXT_PUBLIC_APP_URL="https://your-app.railway.app"
NEXT_PUBLIC_SITE_NAME="Hair Solutions Customer Portal"

STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
SHOPIFY_ADMIN_API_TOKEN="shpat_..."
SHOPIFY_WEBHOOK_SECRET="your-webhook-secret"

NOTION_API_KEY="secret_..."
NOTION_HELP_DATABASE_ID="..."

SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="Hair Solutions <noreply@hairsolutions.co>"
```

Then use Railway's "RAW Editor" in the Variables tab to paste all variables.

## 💾 Database Setup

### Automatic Setup

Railway automatically provisions a PostgreSQL database when you add it to your project. The `DATABASE_URL` is automatically injected as an environment variable.

### Manual Migration

After deployment, run migrations:

```bash
# Via Railway CLI
railway run npx prisma migrate deploy

# Or set it in the build command in railway.json
```

### Seeding the Database

To populate the database with sample data:

```bash
railway run npm run db:seed
```

This will create:
- Admin user: `admin@hairsolutions.co` / `admin123`
- Support user: `support@hairsolutions.co` / `support123`
- Demo customer: `demo@example.com` / `demo123`

**⚠️ Important**: Change these default passwords immediately in production!

### Database Backups

Railway automatically backs up your PostgreSQL database. You can:
- View backups in Railway dashboard → Database → Backups
- Restore from a backup if needed
- Download database snapshots

## 🎯 Post-Deployment

### 1. Get Your App URL

After deployment, Railway will provide a URL like:
```
https://your-app.railway.app
```

### 2. Update Environment Variables

Update these variables with your actual Railway URL:

```bash
railway variables set NEXTAUTH_URL=https://your-app.railway.app
railway variables set NEXT_PUBLIC_APP_URL=https://your-app.railway.app
```

### 3. Configure Custom Domain (Optional)

**Via Railway Dashboard:**
1. Go to your service
2. Click "Settings" → "Domains"
3. Click "Add Domain"
4. Enter your custom domain (e.g., `portal.hairsolutions.co`)
5. Add the provided CNAME record to your DNS provider
6. Update environment variables with your custom domain

```bash
railway variables set NEXTAUTH_URL=https://portal.hairsolutions.co
railway variables set NEXT_PUBLIC_APP_URL=https://portal.hairsolutions.co
```

### 4. Set Up Webhooks

#### Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter URL: `https://your-app.railway.app/api/webhooks/stripe`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the webhook signing secret
6. Add to Railway: `railway variables set STRIPE_WEBHOOK_SECRET=whsec_...`

#### Shopify Webhooks

1. Go to Shopify Admin → Settings → Notifications → Webhooks
2. Create webhooks:
   - `orders/create` → `https://your-app.railway.app/api/webhooks/shopify`
   - `orders/updated` → `https://your-app.railway.app/api/webhooks/shopify`
   - `orders/paid` → `https://your-app.railway.app/api/webhooks/shopify`
   - `orders/cancelled` → `https://your-app.railway.app/api/webhooks/shopify`
3. Set the webhook secret in Railway

### 5. Test Your Deployment

1. Visit your Railway app URL
2. Try signing up for a new account
3. Complete the hair profile setup
4. Test key features:
   - [ ] User authentication (login/logout)
   - [ ] Dashboard loads correctly
   - [ ] Database connections work
   - [ ] Environment variables are correctly set

### 6. Monitor Your Application

**Via Railway Dashboard:**
1. Go to your service
2. Check "Deployments" tab for build logs
3. Check "Metrics" tab for:
   - CPU usage
   - Memory usage
   - Network traffic
4. Check "Logs" tab for application logs

**Set Up Alerts:**
1. Go to project settings
2. Configure notifications for:
   - Failed deployments
   - High resource usage
   - Errors

## 🔧 Advanced Configuration

### Enable Automatic Deployments

Connect your GitHub repository to enable automatic deployments:

1. Go to Railway dashboard → Your service
2. Click "Settings" → "Source"
3. Connect to GitHub
4. Select your repository
5. Choose the branch to deploy (e.g., `main`)
6. Enable "Auto Deploy"

Now every push to your main branch will trigger a deployment.

### Environment-Specific Deployments

Create separate Railway projects for different environments:

```bash
# Development environment
railway environment development

# Production environment
railway environment production
```

Set different environment variables for each environment.

### Database Connection Pooling

For better performance with PostgreSQL, consider using connection pooling:

1. Railway provides connection pooling by default
2. Your `DATABASE_URL` from Railway includes pooling
3. Prisma automatically handles connection pooling

### Logs and Debugging

View logs in real-time:

```bash
# Via CLI
railway logs

# Follow logs (like tail -f)
railway logs --follow
```

### Scaling

Railway automatically scales your application based on traffic. To adjust:

1. Go to Railway dashboard → Your service
2. Click "Settings" → "Resources"
3. Adjust memory and CPU limits

## 🐛 Troubleshooting

### Build Failures

**Issue**: Build fails with "out of memory" error
**Solution**:
```bash
# Increase Node.js memory limit
railway variables set NODE_OPTIONS="--max-old-space-size=4096"
```

**Issue**: Prisma client not generated
**Solution**: Make sure `postinstall` script runs:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Database Connection Issues

**Issue**: "Can't reach database server"
**Solution**:
1. Check `DATABASE_URL` is set correctly
2. Verify PostgreSQL service is running in Railway dashboard
3. Try restarting the database service

**Issue**: "Too many database connections"
**Solution**:
1. Use Prisma connection pooling (already configured)
2. Check for connection leaks in your code
3. Use Railway's connection pooling URL

### Deployment Issues

**Issue**: App deploys but shows 500 error
**Solution**:
1. Check logs: `railway logs`
2. Verify all environment variables are set
3. Check that database migrations ran successfully
4. Run migrations manually: `railway run npx prisma migrate deploy`

**Issue**: Static files (CSS/JS) not loading
**Solution**:
1. Ensure `npm run build` completes successfully
2. Check Next.js configuration
3. Verify public assets are in the correct directory

### NextAuth Issues

**Issue**: "NEXTAUTH_URL is not set"
**Solution**:
```bash
railway variables set NEXTAUTH_URL=https://your-app.railway.app
```

**Issue**: "Invalid callback URL"
**Solution**:
1. Ensure `NEXTAUTH_URL` matches your actual Railway URL
2. Include `https://` in the URL
3. Redeploy after changing environment variables

### Webhook Issues

**Issue**: Webhooks not receiving events
**Solution**:
1. Verify webhook URL is publicly accessible
2. Check webhook secret is correctly set
3. Review webhook logs in Stripe/Shopify dashboard
4. Check Railway logs for incoming webhook requests

## 📊 Monitoring & Maintenance

### Regular Maintenance Tasks

1. **Database Backups**: Railway automatically backs up your database
2. **Update Dependencies**: Regularly update npm packages
3. **Monitor Logs**: Check for errors and warnings
4. **Review Metrics**: Monitor CPU, memory, and database usage

### Health Checks

Railway automatically performs health checks. Configure in `railway.toml`:

```toml
[deploy]
healthcheckPath = "/"
healthcheckTimeout = 100
```

### Costs Monitoring

1. Go to Railway dashboard → Billing
2. Monitor your usage
3. Set up billing alerts
4. Review resource usage regularly

## 🎓 Next Steps

After successful deployment:

1. [ ] Configure custom domain
2. [ ] Set up SSL certificate (automatic with Railway)
3. [ ] Configure webhooks for Stripe and Shopify
4. [ ] Test all integrations (Stripe, Shopify, Notion, Email)
5. [ ] Change default user passwords
6. [ ] Set up monitoring and alerts
7. [ ] Create a backup/restore plan
8. [ ] Document your deployment process

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Railway Discord Community](https://discord.gg/railway)

## 🆘 Getting Help

If you encounter issues:

1. Check Railway documentation: https://docs.railway.app
2. Check application logs: `railway logs`
3. Join Railway Discord: https://discord.gg/railway
4. Contact Railway support through the dashboard

---

**Deployed successfully?** 🎉 Don't forget to:
- Update your DNS records for custom domain
- Test all features thoroughly
- Monitor your application logs
- Set up proper backup procedures

Good luck with your deployment! 🚀
