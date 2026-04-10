# Local Testing Setup Guide

This guide will help you get the Hair Solutions Customer Portal running locally for testing.

## 🚨 Missing Requirements Checklist

### Currently Missing:
- [ ] Dependencies (node_modules)
- [ ] Environment variables (.env file)
- [ ] Local PostgreSQL database
- [ ] Prisma client generated
- [ ] Database migrations applied

## 📦 Step 1: Install Dependencies

```bash
cd customer-portal
npm install
```

This will:
- Install all Node.js dependencies
- Automatically run `prisma generate` (via postinstall hook)
- Take 2-5 minutes to complete

## 🗄️ Step 2: Set Up Database

### Option A: Use Railway Database (Easiest)

If you've already deployed to Railway, you can use that database for local testing:

```bash
# Get your DATABASE_URL from Railway
railway variables get DATABASE_URL

# Or if Railway is linked:
railway run env | grep DATABASE_URL

# Add to your .env file:
echo "DATABASE_URL=postgresql://..." >> .env
```

### Option B: Local PostgreSQL Database

Install PostgreSQL locally and create a database:

```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql
createdb hair_solutions_portal

# Ubuntu/Debian
sudo apt-get install postgresql
sudo service postgresql start
sudo -u postgres createdb hair_solutions_portal

# Windows
# Download from: https://www.postgresql.org/download/windows/
```

## 🔐 Step 3: Configure Environment Variables

Create a `.env` file with your configuration:

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
nano .env  # or use your preferred editor
```

### Minimal Configuration for Testing

Here's a minimal `.env` for local testing:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/hair_solutions_portal?schema=public"

# NextAuth (REQUIRED)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# App Config (REQUIRED)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Hair Solutions Customer Portal"

# Stripe (OPTIONAL for basic testing - use test keys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Leave these blank for initial testing
SHOPIFY_STORE_DOMAIN=""
SHOPIFY_ADMIN_API_TOKEN=""
SHOPIFY_WEBHOOK_SECRET=""
NOTION_API_KEY=""
NOTION_HELP_DATABASE_ID=""
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
EMAIL_FROM=""
```

### Generate NEXTAUTH_SECRET

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 🔄 Step 4: Run Database Migrations

Apply the database schema:

```bash
# Push schema to database (for development)
npm run db:push

# Or run migrations (recommended for production-like testing)
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

This creates:
- All database tables
- Sample admin user: `admin@hairsolutions.co` / `admin123`
- Sample support user: `support@hairsolutions.co` / `support123`
- Demo customer: `demo@example.com` / `demo123`

## 🚀 Step 5: Start Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:3000

## ✅ Verify Everything Works

### 1. Check the Homepage
- Visit http://localhost:3000
- You should see the login page

### 2. Test Login
- Try logging in with: `demo@example.com` / `demo123`
- You should be redirected to the dashboard

### 3. Check Database Connection
```bash
# Open Prisma Studio to browse your database
npm run db:studio
```

### 4. Check for Errors
- Look at terminal for any errors
- Check browser console (F12) for JavaScript errors

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Application starts without errors
- [ ] Can access login page
- [ ] Can log in with demo credentials
- [ ] Dashboard loads and displays data
- [ ] Can view profile
- [ ] Can navigate between pages

### Database
- [ ] Prisma client generated
- [ ] Migrations applied successfully
- [ ] Sample data seeded
- [ ] Can query database via Prisma Studio

### Authentication
- [ ] Can log in
- [ ] Can log out
- [ ] Session persists across page reloads
- [ ] Protected routes redirect to login

### Advanced (Optional)
- [ ] Can create new user
- [ ] Can update profile
- [ ] Orders display correctly
- [ ] Settings page accessible
- [ ] Can change password

## 🐛 Common Issues & Solutions

### Issue: "Can't reach database server"

**Solution:**
```bash
# Check if PostgreSQL is running
# macOS
brew services list

# Ubuntu/Linux
sudo service postgresql status

# Start if not running
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
```

### Issue: "Error: P1001: Can't reach database server"

**Solution:** Check your `DATABASE_URL` in `.env`:
```bash
# Make sure format is correct:
# postgresql://username:password@localhost:5432/database_name

# Test connection
npx prisma db pull
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
npx prisma generate
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

## 🔐 Stripe Testing (Optional)

To test payment features, use Stripe test mode:

1. Get test keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```
3. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

## 📊 Test Data

After seeding, you'll have:

**Users:**
- Admin: `admin@hairsolutions.co` / `admin123`
- Support: `support@hairsolutions.co` / `support123`
- Customer: `demo@example.com` / `demo123`

**Sample Data:**
- Hair profiles
- Orders
- Customization templates
- Help articles
- Support tickets

## 🎯 Next Steps After Local Testing

Once everything works locally:

1. **Deploy to Railway:**
   ```bash
   export RAILWAY_TOKEN=<YOUR_RAILWAY_TOKEN>
   ./railway-deploy.sh
   ```

2. **Test on Railway:**
   - Visit your Railway URL
   - Test all features in production environment
   - Configure webhooks for Stripe/Shopify

3. **Production Checklist:**
   - Change all default passwords
   - Use production API keys (not test keys)
   - Set up monitoring
   - Configure custom domain

## 📚 Additional Resources

- **Development Workflow**: See main `README.md`
- **Railway Deployment**: See `RAILWAY_QUICKSTART.md`
- **Troubleshooting**: See `RAILWAY_DEPLOYMENT.md`

## ⚡ Quick Start (TL;DR)

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with your database URL and generate NEXTAUTH_SECRET

# 3. Set up database
npm run db:push
npm run db:seed

# 4. Start app
npm run dev

# 5. Visit http://localhost:3000
# Login with: demo@example.com / demo123
```

---

**Need help?** Check the troubleshooting section above or create an issue in the repository.
