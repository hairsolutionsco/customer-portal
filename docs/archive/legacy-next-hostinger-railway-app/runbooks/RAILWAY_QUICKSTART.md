# Railway Quick Start Guide

Get your Hair Solutions Customer Portal deployed to Railway in minutes!

## 🚀 Super Quick Deploy (5 Minutes)

### Prerequisites
- Railway account with API token: `<YOUR_RAILWAY_TOKEN>`
- Stripe account (for payments)

### Option A: Automated Script Deployment

```bash
# Set your Railway token
export RAILWAY_TOKEN=<YOUR_RAILWAY_TOKEN>

# Run the deployment script
./railway-deploy.sh
```

That's it! The script will:
- ✅ Create Railway project
- ✅ Add PostgreSQL database
- ✅ Set essential environment variables
- ✅ Deploy your application
- ✅ Run database migrations
- ✅ (Optional) Seed database with sample data

### Option B: Manual CLI Deployment

```bash
# 1. Set your Railway token
export RAILWAY_TOKEN=<YOUR_RAILWAY_TOKEN>

# 2. Login to Railway
railway login

# 3. Initialize project
railway init

# 4. Add PostgreSQL database
railway add --database postgresql

# 5. Set environment variables
railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
railway variables set NEXT_PUBLIC_SITE_NAME="Hair Solutions Customer Portal"

# 6. Deploy
railway up

# 7. Get your URL
railway domain

# 8. Update URLs (replace YOUR_URL with actual URL from step 7)
railway variables set NEXTAUTH_URL="https://YOUR_URL"
railway variables set NEXT_PUBLIC_APP_URL="https://YOUR_URL"

# 9. Set Stripe keys (REQUIRED)
railway variables set STRIPE_SECRET_KEY="sk_live_..."
railway variables set STRIPE_PUBLISHABLE_KEY="pk_live_..."
railway variables set STRIPE_WEBHOOK_SECRET="whsec_..."

# 10. Run migrations
railway run npx prisma migrate deploy

# 11. (Optional) Seed database
railway run npm run db:seed
```

### Option C: Railway Dashboard (No CLI)

1. **Create Project**
   - Go to [railway.app/new](https://railway.app/new)
   - Click "Deploy from GitHub repo"
   - Select your repository

2. **Add Database**
   - Click "New" → "Database" → "Add PostgreSQL"

3. **Set Variables**
   - Go to your service → "Variables" tab
   - Click "RAW Editor"
   - Paste the template from `.env.railway.template`
   - Fill in your actual values

4. **Deploy**
   - Railway automatically deploys on git push
   - Or click "Deploy" in the dashboard

5. **Run Migrations**
   - Go to service → "Settings" → "Deploy"
   - Under "Build Command": `npm run build && npx prisma migrate deploy`

## 📋 Required Environment Variables

After deployment, you MUST set these:

```bash
# Your Railway app URL (get from dashboard or `railway domain`)
NEXTAUTH_URL=https://your-app.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.railway.app

# Stripe (from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🔍 Verify Deployment

1. Visit your Railway URL
2. You should see the login page
3. Try logging in with default credentials:
   - Admin: `admin@hairsolutions.co` / `admin123`
   - Demo: `demo@example.com` / `demo123`

## 🪝 Set Up Webhooks

### Stripe Webhooks
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-app.railway.app/api/webhooks/stripe`
3. Select events: `customer.subscription.*`, `invoice.*`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Shopify Webhooks (Optional)
1. Shopify Admin → Settings → Notifications → Webhooks
2. Add endpoint: `https://your-app.railway.app/api/webhooks/shopify`
3. Topics: `orders/create`, `orders/updated`, `orders/paid`

## 🎯 Next Steps

- [ ] Change default passwords
- [ ] Set up custom domain (Railway Settings → Domains)
- [ ] Configure remaining variables (Shopify, Notion, Email)
- [ ] Test all features
- [ ] Set up monitoring alerts

## 📚 Need More Help?

- **Detailed Guide**: See `RAILWAY_DEPLOYMENT.md`
- **Railway Docs**: https://docs.railway.app
- **Get Support**: https://discord.gg/railway

## 🐛 Common Issues

### "Can't connect to database"
```bash
# Check database is running
railway run echo $DATABASE_URL
```

### "NEXTAUTH_URL is required"
```bash
# Set after first deployment
railway variables set NEXTAUTH_URL="https://$(railway domain)"
```

### "Build failed"
```bash
# View logs
railway logs

# Increase memory if needed
railway variables set NODE_OPTIONS="--max-old-space-size=4096"
```

## 🎉 Success!

Your app is now live! Visit your Railway URL and start using your customer portal.

**Security Reminder**: Change all default passwords immediately!
