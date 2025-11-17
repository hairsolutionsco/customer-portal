# Railway Deployment Troubleshooting Guide

Common issues and solutions for Railway deployments.

## 🔴 Build Failures

### 1. Dependency Conflict Errors

**Error:**
```
ERESOLVE unable to resolve dependency tree
Could not resolve dependency: peerOptional nodemailer@"^7.0.7"
```

**Solution:**
✅ **Fixed!** This was resolved by upgrading nodemailer to v7.1.0

If you see similar peer dependency issues:
```bash
# Option 1: Install with legacy peer deps (temporary)
npm install --legacy-peer-deps

# Option 2: Fix the actual version conflict (recommended)
# Update package.json with compatible versions
```

### 2. Out of Memory During Build

**Error:**
```
JavaScript heap out of memory
FATAL ERROR: Reached heap limit
```

**Solution:**
Add environment variable in Railway:
```bash
NODE_OPTIONS=--max-old-space-size=4096
```

### 3. Prisma Generation Fails

**Error:**
```
Prisma Client could not be generated
```

**Solution:**
Ensure `postinstall` script exists in package.json:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### 4. Build Command Not Found

**Error:**
```
npm ERR! missing script: build
```

**Solution:**
Check `package.json` has build script:
```json
{
  "scripts": {
    "build": "next build"
  }
}
```

## 🗄️ Database Issues

### 1. Can't Connect to Database

**Error:**
```
Can't reach database server at localhost:5432
```

**Solution:**
1. Ensure PostgreSQL service is added to Railway project:
   ```bash
   railway add --database postgresql
   ```

2. Verify `DATABASE_URL` is set (should be automatic):
   ```bash
   railway variables
   ```

3. Check database service is running in Railway dashboard

### 2. Migrations Not Applied

**Error:**
```
Invalid `prisma.user.findMany()` invocation
Table 'users' doesn't exist
```

**Solution:**
Run migrations manually:
```bash
railway run npx prisma migrate deploy
```

Or add to build command in `railway.json`:
```json
{
  "build": {
    "buildCommand": "npm run build && npx prisma migrate deploy"
  }
}
```

### 3. Database Connection Pool Exhausted

**Error:**
```
Too many connections
Connection pool timeout
```

**Solution:**
1. Use Prisma connection pooling (already configured)
2. Check for connection leaks in code
3. Increase connection pool size in `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     pool_timeout = 60
   }
   ```

## 🔐 Environment Variable Issues

### 1. NEXTAUTH_URL Not Set

**Error:**
```
[next-auth][error][NO_SECRET]
NEXTAUTH_URL is required
```

**Solution:**
Set in Railway:
```bash
railway variables set NEXTAUTH_URL=https://your-app.railway.app
railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### 2. Stripe Keys Not Working

**Error:**
```
No API key provided
Invalid API key
```

**Solution:**
1. Verify keys in Railway dashboard match Stripe dashboard
2. Ensure no extra quotes or whitespace
3. Use test keys for testing, live keys for production:
   ```bash
   # Test mode
   STRIPE_SECRET_KEY=sk_test_...

   # Live mode
   STRIPE_SECRET_KEY=sk_live_...
   ```

### 3. Database URL Contains Special Characters

**Error:**
```
Invalid DATABASE_URL
Connection string is invalid
```

**Solution:**
URL-encode special characters in password:
```
# Before: password: p@ssw0rd!
# After: password: p%40ssw0rd%21

DATABASE_URL="postgresql://user:p%40ssw0rd%21@host:5432/db"
```

## 🚀 Deployment Issues

### 1. Build Succeeds But App Crashes on Start

**Error:**
```
Application failed to respond
Error: listen EADDRINUSE: address already in use
```

**Solution:**
1. Check start command uses `$PORT`:
   ```json
   {
     "scripts": {
       "start": "next start -p ${PORT:-3000}"
     }
   }
   ```

2. Or Railway auto-detects Next.js and sets port automatically

### 2. Static Assets Not Loading

**Error:**
```
Failed to load resource: 404
/static/... not found
```

**Solution:**
1. Ensure `next build` completed successfully
2. Check `.next` folder is included in deployment
3. Verify `next.config.js` doesn't have incorrect `assetPrefix`

### 3. Application Returns 502 Bad Gateway

**Error:**
```
502 Bad Gateway
```

**Causes & Solutions:**

1. **App failed to start**: Check deploy logs for errors
2. **Health check failing**: App must respond on `$PORT`
3. **Build artifacts missing**: Ensure `.next` folder exists

## 📊 Performance Issues

### 1. Slow Cold Starts

**Issue:** App takes 30+ seconds to start

**Solution:**
1. This is normal for Next.js on serverless
2. Use Railway's "Always On" feature (paid plans)
3. Optimize build size:
   ```bash
   # Remove unused dependencies
   npm prune

   # Analyze bundle size
   npm run build -- --analyze
   ```

### 2. Database Query Timeouts

**Error:**
```
Query timeout
P2024: Timed out fetching
```

**Solution:**
1. Add indexes to frequently queried columns
2. Optimize N+1 queries with Prisma `include`
3. Increase timeout in Prisma:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     pool_timeout = 60
   }
   ```

## 🪝 Webhook Issues

### 1. Stripe Webhooks Not Receiving Events

**Issue:** Webhooks return 404 or don't trigger

**Solution:**
1. Verify webhook URL in Stripe dashboard:
   ```
   https://your-app.railway.app/api/webhooks/stripe
   ```

2. Check webhook endpoint exists:
   ```bash
   ls app/api/webhooks/stripe/route.ts
   ```

3. Test webhook locally with Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### 2. Webhook Signature Verification Fails

**Error:**
```
Webhook signature verification failed
No signatures found
```

**Solution:**
1. Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
2. Use signing secret from Stripe webhook settings
3. Check request body isn't parsed before verification

## 🔄 Redeployment

### Force Clean Deploy

If issues persist, try a clean deploy:

```bash
# Delete and recreate Railway service
railway down
railway up

# Or trigger rebuild in Railway dashboard
# Settings → Deployments → Redeploy
```

### Clear Build Cache

```bash
# Railway doesn't have manual cache clear
# But changing Nixpacks version can help
# Add to railway.toml:
[build]
nixpacksVersion = "1.0.0"
```

## 📞 Getting Help

### Check Logs

```bash
# View live logs
railway logs

# Follow logs (like tail -f)
railway logs --follow

# Filter logs
railway logs | grep error
```

### Railway Status

Check if Railway is having issues:
- https://status.railway.app

### Community Support

- Railway Discord: https://discord.gg/railway
- Railway Feedback: https://feedback.railway.app
- GitHub Issues: https://github.com/railwayapp/railway-issues

## ✅ Deployment Health Checklist

Before declaring success, verify:

- [ ] Build completes without errors
- [ ] Application starts successfully
- [ ] Can access homepage (no 502/503 errors)
- [ ] Database connection works
- [ ] Environment variables are set correctly
- [ ] Migrations applied successfully
- [ ] Can log in with test credentials
- [ ] Webhooks are configured and receiving events
- [ ] SSL certificate is active (automatic)
- [ ] Custom domain configured (if applicable)

## 🎯 Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Dependency conflict | Update package versions to compatible ones |
| Out of memory | Add `NODE_OPTIONS=--max-old-space-size=4096` |
| Database not found | `railway add --database postgresql` |
| Migrations not applied | `railway run npx prisma migrate deploy` |
| NEXTAUTH error | Set `NEXTAUTH_URL` and `NEXTAUTH_SECRET` |
| Build fails | Check `railway logs` for specific error |
| 502 Bad Gateway | Check app starts and responds on `$PORT` |
| Webhooks fail | Verify URL and signing secret |

---

**Still stuck?** Create an issue with:
1. Full error message from logs
2. Railway service configuration
3. Environment variables (redact secrets!)
4. Steps to reproduce

Good luck! 🚀
