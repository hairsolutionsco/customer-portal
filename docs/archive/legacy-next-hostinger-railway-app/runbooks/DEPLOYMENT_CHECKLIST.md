# Railway Deployment Checklist

Use this checklist to ensure your Hair Solutions Customer Portal is properly deployed to Railway.

## ✅ Pre-Deployment Checklist

- [ ] Railway account created
- [ ] Railway API token available: `<YOUR_RAILWAY_TOKEN>`
- [ ] Code pushed to GitHub repository
- [ ] Stripe account set up with API keys
- [ ] (Optional) Shopify store with Admin API access
- [ ] (Optional) Notion workspace with API integration
- [ ] (Optional) SMTP email credentials ready

## 🚀 Deployment Steps

### Option 1: Quick Deploy with Script (Recommended)

```bash
# Clone the repository
cd customer-portal

# Set Railway token
export RAILWAY_TOKEN=<YOUR_RAILWAY_TOKEN>

# Run deployment script
./railway-deploy.sh
```

### Option 2: Manual Deployment via CLI

```bash
# 1. Login to Railway
export RAILWAY_TOKEN=<YOUR_RAILWAY_TOKEN>
railway login

# 2. Initialize project
railway init

# 3. Add PostgreSQL
railway add --database postgresql

# 4. Set essential variables
railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
railway variables set NEXT_PUBLIC_SITE_NAME="Hair Solutions Customer Portal"

# 5. Deploy
railway up

# 6. Get your URL
RAILWAY_URL=$(railway domain)

# 7. Update URLs
railway variables set NEXTAUTH_URL="https://$RAILWAY_URL"
railway variables set NEXT_PUBLIC_APP_URL="https://$RAILWAY_URL"

# 8. Set Stripe keys (REQUIRED!)
railway variables set STRIPE_SECRET_KEY="sk_live_..."
railway variables set STRIPE_PUBLISHABLE_KEY="pk_live_..."
railway variables set STRIPE_WEBHOOK_SECRET="whsec_..."

# 9. Run migrations
railway run npx prisma migrate deploy

# 10. (Optional) Seed database
railway run npm run db:seed
```

### Option 3: Deploy via Railway Dashboard

1. Go to [railway.app/new](https://railway.app/new)
2. Deploy from GitHub repo: `hairsolutionsco/customer-portal`
3. Add PostgreSQL database
4. Set environment variables (see below)
5. Deploy automatically
6. Run migrations via dashboard

## 🔐 Required Environment Variables

Copy these variables from `.env.railway.template` and set them in Railway:

### Essential (Set Immediately)
- [ ] `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - Your Railway URL (e.g., `https://your-app.railway.app`)
- [ ] `NEXT_PUBLIC_APP_URL` - Same as NEXTAUTH_URL
- [ ] `NEXT_PUBLIC_SITE_NAME` - "Hair Solutions Customer Portal"

### Stripe (Required for Payments)
- [ ] `STRIPE_SECRET_KEY` - From Stripe Dashboard
- [ ] `STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` - From Stripe Webhooks

### Optional Integrations
- [ ] `SHOPIFY_STORE_DOMAIN` - Your Shopify domain
- [ ] `SHOPIFY_ADMIN_API_TOKEN` - From Shopify Admin
- [ ] `SHOPIFY_WEBHOOK_SECRET` - Your webhook secret
- [ ] `NOTION_API_KEY` - From Notion integrations
- [ ] `NOTION_HELP_DATABASE_ID` - Notion database ID
- [ ] `SMTP_HOST` - Email server (e.g., smtp.gmail.com)
- [ ] `SMTP_PORT` - Email port (usually 587)
- [ ] `SMTP_USER` - Email address
- [ ] `SMTP_PASSWORD` - Email password
- [ ] `EMAIL_FROM` - From address

## 📊 Post-Deployment Checklist

### Database Setup
- [ ] Migrations ran successfully: `railway run npx prisma migrate deploy`
- [ ] Database seeded (optional): `railway run npm run db:seed`
- [ ] Can connect to database (check logs)

### Application Testing
- [ ] Application is accessible at Railway URL
- [ ] Login page loads correctly
- [ ] Can log in with demo credentials:
  - Admin: `admin@hairsolutions.co` / `admin123`
  - Demo: `demo@example.com` / `demo123`
- [ ] Dashboard displays correctly
- [ ] No errors in logs: `railway logs`

### Security
- [ ] Changed all default passwords
- [ ] NEXTAUTH_SECRET is properly set
- [ ] All sensitive keys are set as environment variables (not in code)
- [ ] HTTPS is enabled (automatic with Railway)

### Integrations
- [ ] Stripe integration tested
- [ ] Stripe webhooks configured
- [ ] Shopify webhooks configured (if using)
- [ ] Email notifications working (if configured)
- [ ] Notion sync working (if configured)

## 🪝 Webhook Configuration

### Stripe Webhooks
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://your-app.railway.app/api/webhooks/stripe`
4. Select events:
   - [ ] `customer.subscription.created`
   - [ ] `customer.subscription.updated`
   - [ ] `customer.subscription.deleted`
   - [ ] `invoice.paid`
   - [ ] `invoice.payment_failed`
5. Copy signing secret → Set `STRIPE_WEBHOOK_SECRET`

### Shopify Webhooks (Optional)
1. Shopify Admin → Settings → Notifications → Webhooks
2. Create webhooks:
   - [ ] `orders/create` → `https://your-app.railway.app/api/webhooks/shopify`
   - [ ] `orders/updated` → `https://your-app.railway.app/api/webhooks/shopify`
   - [ ] `orders/paid` → `https://your-app.railway.app/api/webhooks/shopify`
   - [ ] `orders/cancelled` → `https://your-app.railway.app/api/webhooks/shopify`
3. Set webhook secret in environment variables

## 🌐 Custom Domain Setup (Optional)

- [ ] Domain purchased and DNS accessible
- [ ] Add domain in Railway: Settings → Domains
- [ ] Add CNAME record in DNS provider
- [ ] Wait for DNS propagation (can take up to 24 hours)
- [ ] Update environment variables:
  ```bash
  railway variables set NEXTAUTH_URL="https://portal.hairsolutions.co"
  railway variables set NEXT_PUBLIC_APP_URL="https://portal.hairsolutions.co"
  ```
- [ ] SSL certificate issued (automatic with Railway)

## 📈 Monitoring & Maintenance

### Set Up Monitoring
- [ ] Enable Railway deployment notifications
- [ ] Set up error alerts in Railway dashboard
- [ ] Monitor resource usage (CPU, Memory, Database)
- [ ] Set up uptime monitoring (optional: UptimeRobot, Pingdom)

### Regular Maintenance Tasks
- [ ] Review logs weekly: `railway logs`
- [ ] Monitor database size and performance
- [ ] Update dependencies monthly
- [ ] Review and rotate API keys quarterly
- [ ] Back up database regularly (Railway auto-backups)

## 🐛 Troubleshooting

If something goes wrong, check:

1. **Logs**: `railway logs` or Railway Dashboard → Logs
2. **Environment Variables**: Verify all are set correctly
3. **Database**: Ensure PostgreSQL service is running
4. **Build**: Check build logs for errors
5. **Migrations**: Ensure migrations completed successfully

Common issues and solutions in `RAILWAY_DEPLOYMENT.md` → Troubleshooting section.

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Deployment Guides**:
  - Quick Start: `RAILWAY_QUICKSTART.md`
  - Complete Guide: `RAILWAY_DEPLOYMENT.md`

## ✨ Success Criteria

Your deployment is successful when:

- ✅ Application is accessible via Railway URL
- ✅ Users can sign up and log in
- ✅ Database connections work
- ✅ Stripe integration functional
- ✅ Webhooks receiving events
- ✅ All environment variables set
- ✅ No errors in logs
- ✅ Default passwords changed
- ✅ Custom domain configured (if applicable)
- ✅ Monitoring enabled

## 🎉 Deployment Complete!

Once all items are checked:

1. Document your Railway URL and credentials securely
2. Share access with your team
3. Begin onboarding customers
4. Monitor performance and usage

**Need help?** Check the troubleshooting guides or reach out to Railway support.

---

**Last Updated**: 2025-11-17
**Railway Token**: `<YOUR_RAILWAY_TOKEN>`
**Repository**: `hairsolutionsco/customer-portal`
