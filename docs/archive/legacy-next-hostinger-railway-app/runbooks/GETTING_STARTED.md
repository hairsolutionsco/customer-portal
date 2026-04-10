# Getting Started - Hair Solutions Customer Portal

Quick guide to get up and running with testing the application.

## 🎯 What You Need

### Currently Missing for Testing:
1. ❌ **Node.js dependencies** - Not installed yet
2. ❌ **Environment variables (.env)** - Need to configure
3. ❌ **Database** - Need PostgreSQL (local or Railway)

## ⚡ Quick Start (Automated)

Run the automated setup script:

```bash
# From customer-portal/ (this app’s product root):
bash infra/setup-local.sh
```

This will:
- ✅ Install all dependencies
- ✅ Create .env file from template
- ✅ Generate authentication secret
- ✅ Set up database schema
- ✅ Seed with sample data
- ✅ Get you ready to test!

## 🔧 Manual Setup

If you prefer to set up manually:

### 1. Install Dependencies (Required)
```bash
npm install
```
*Takes 2-5 minutes*

### 2. Configure Environment (Required)
```bash
# Copy example file
cp .env.example .env

# Generate secret
openssl rand -base64 32

# Edit .env and add:
# - DATABASE_URL (PostgreSQL connection)
# - NEXTAUTH_SECRET (generated above)
# - NEXTAUTH_URL=http://localhost:3000
```

### 3. Set Up Database (Required)

**Option A: Use Railway Database**
```bash
# If already deployed to Railway
railway variables get DATABASE_URL
# Add to .env
```

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL, then:
createdb hair_solutions_portal

# Add to .env:
# DATABASE_URL="postgresql://user:password@localhost:5432/hair_solutions_portal"
```

### 4. Initialize Database (Required)
```bash
# Apply schema
npm run db:push

# Add sample data (optional but recommended)
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## 🧪 Test Credentials

After seeding, log in with:

- **Customer**: `demo@example.com` / `demo123`
- **Admin**: `admin@hairsolutions.co` / `admin123`
- **Support**: `support@hairsolutions.co` / `support123`

## 📝 Minimum .env Configuration

```env
# Required for basic testing
DATABASE_URL="postgresql://user:password@localhost:5432/hair_solutions_portal"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Hair Solutions Customer Portal"

# Optional: Add Stripe test keys for payment testing
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## 🚀 Deploy to Railway (Cloud Hosting)

Once local testing works:

```bash
export RAILWAY_TOKEN=<YOUR_RAILWAY_TOKEN>
./railway-deploy.sh
```

Or see: `RAILWAY_QUICKSTART.md`

## 🐛 Troubleshooting

### "Module not found"
```bash
rm -rf node_modules
npm install
```

### "Can't reach database server"
- Check PostgreSQL is running
- Verify DATABASE_URL in .env is correct
- Test connection: `npx prisma db pull`

### "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## 📚 Documentation

| File | Purpose |
|------|---------|
| `TESTING_SETUP.md` | Detailed local testing setup |
| `RAILWAY_QUICKSTART.md` | Deploy to Railway in 5 minutes |
| `RAILWAY_DEPLOYMENT.md` | Complete deployment guide |
| `README.md` | Full project documentation |

## ✅ Verification Checklist

- [ ] Dependencies installed (`node_modules` exists)
- [ ] `.env` file created and configured
- [ ] Database connected and migrations applied
- [ ] Can access http://localhost:3000
- [ ] Can log in with test credentials
- [ ] Dashboard displays without errors

## 🆘 Need Help?

See detailed troubleshooting in:
- `TESTING_SETUP.md` - Local setup issues
- `RAILWAY_DEPLOYMENT.md` - Deployment issues

---

**Ready to test?** Run `bash infra/setup-local.sh` from **`customer-portal/`** and follow the prompts!
