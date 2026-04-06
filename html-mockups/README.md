# Hair Solutions Customer Portal

A production-ready, secure customer portal for Hair Solutions built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## 🎯 Project Overview

This is a comprehensive customer portal that allows Hair Solutions customers to:

- **Manage their hair profile** with detailed measurements and preferences
- **Track orders** with real-time production status updates
- **Automated production reminders** for scheduled system deliveries
- **Quick reorder** using saved customization templates
- **Manage subscriptions** and billing through Stripe
- **Shop maintenance products** with integrated Shopify catalog
- **Access support** with ticket system
- **View help articles** synced from Notion
- **Find affiliated locations** worldwide (private directory)
- **Manage account settings** including active sessions and 2FA

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with role-based access control (RBAC)
- **Payments**: Stripe (subscriptions, one-time payments, card on file)
- **Integrations**:
  - Shopify (orders, products)
  - Notion (help articles, customer-specific content)
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Icons**: Heroicons

### Key Features

#### 🔐 Security First
- **Row-level security**: Customers only see their own data
- **Role-based access control**: CUSTOMER, SUPPORT, ADMIN roles
- **2FA support**: Optional two-factor authentication
- **Session management**: View and revoke active sessions
- **Audit logging**: Track all important actions
- **Secure integrations**: Webhook signature verification for Shopify and Stripe

#### 👤 Customer Experience
- **Onboarding flow**: Guided hair profile setup
- **Production reminders**: Automated notifications before system production
- **Quick reorder**: One-click reorder with saved templates
- **Customization templates**: Save multiple configurations
- **Dashboard**: Real-time overview of orders and upcoming production
- **Help center**: Searchable knowledge base

#### 💼 Business Features
- **Order management**: Full lifecycle tracking
- **Subscription plans**: Recurring delivery schedules
- **Invoice system**: PDF generation and export
- **Support tickets**: Customer service workflow
- **Product catalog**: Maintenance products shop
- **Location directory**: Private affiliated specialist network

## 📦 Project Structure

```
customer-portal/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                  # Authentication pages (login, signup, etc.)
│   ├── app/                     # Main authenticated app
│   │   ├── page.tsx            # Dashboard
│   │   ├── orders/             # Order management
│   │   ├── invoices/           # Invoice list
│   │   ├── customization/      # Customization templates
│   │   ├── billing/            # Plans & billing
│   │   ├── shop/               # Maintenance products
│   │   ├── support/            # Support tickets
│   │   ├── help/               # Help articles
│   │   ├── locations/          # Affiliated locations
│   │   ├── profile-setup/      # Hair profile onboarding
│   │   └── settings/           # Account settings
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth + signup
│   │   ├── profile/           # Profile management
│   │   └── webhooks/          # Shopify & Stripe webhooks
│   └── layout.tsx             # Root layout
├── components/                 # React components
│   ├── layout/                # Sidebar, Header
│   ├── dashboard/             # Dashboard widgets
│   ├── profile/               # Hair profile forms
│   ├── customization/         # Template management
│   └── settings/              # Settings tabs
├── lib/                       # Utilities and integrations
│   ├── auth.ts               # NextAuth configuration
│   ├── auth-utils.ts         # Authorization helpers
│   ├── prisma.ts             # Prisma client
│   ├── shopify.ts            # Shopify integration
│   ├── notion.ts             # Notion integration (SECURE)
│   ├── stripe.ts             # Stripe integration
│   ├── api-response.ts       # API response helpers
│   └── utils.ts              # General utilities
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
├── .env.example              # Environment variables template
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- (Optional) Shopify store with Admin API access
- (Optional) Stripe account
- (Optional) Notion workspace with API integration

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd customer-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/hair_solutions_portal"

   # NextAuth (generate secret with: openssl rand -base64 32)
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # Stripe (get from Stripe dashboard)
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."

   # Shopify (get from Shopify admin)
   SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
   SHOPIFY_ADMIN_API_TOKEN="shpat_..."
   SHOPIFY_WEBHOOK_SECRET="your-webhook-secret"

   # Notion (get from Notion integrations)
   NOTION_API_KEY="secret_..."
   NOTION_HELP_DATABASE_ID="..."

   # Email (for password reset, etc.)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   EMAIL_FROM="Hair Solutions <noreply@hairsolutions.co>"
   ```

4. **Set up the database**
   ```bash
   # Push the schema to your database
   npm run db:push

   # Or run migrations (for production)
   npm run db:migrate

   # Seed with example data
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Default Users (After Seeding)

- **Admin**: `admin@hairsolutions.co` / `admin123`
- **Support**: `support@hairsolutions.co` / `support123`
- **Demo Customer**: `demo@example.com` / `demo123`

## 🔧 Configuration

### Shopify Integration

1. Create a private app or custom app in Shopify
2. Grant access to:
   - Orders (read)
   - Products (read)
3. Set up webhooks in Shopify admin pointing to:
   - `https://your-domain.com/api/webhooks/shopify`
   - Topics: `orders/create`, `orders/updated`, `orders/paid`, `orders/cancelled`
4. Add credentials to `.env`

### Stripe Integration

1. Create a Stripe account
2. Create products and prices in Stripe Dashboard
3. Copy Price IDs to your `SubscriptionPlan` records in database
4. Set up webhooks in Stripe pointing to:
   - `https://your-domain.com/api/webhooks/stripe`
5. Add credentials to `.env`

### Notion Integration

#### ⚠️ SECURITY CRITICAL: Notion Setup

The Notion integration is designed with **security first**. Never expose shared databases that could leak customer data.

**Safe Pattern (Required):**

1. Create a Notion integration in your workspace
2. For general help articles:
   - Create a dedicated database for public knowledge
   - Add database ID to `NOTION_HELP_DATABASE_ID` in `.env`
   - Run sync to import articles to PostgreSQL

3. For customer-specific content:
   - Each customer gets their own private Notion pages
   - Use `CustomerNotionResource` table to map pages to customers
   - API enforces that users can ONLY access their mapped pages

**Example: Adding customer-specific Notion content**

```typescript
import { addCustomerNotionResource } from '@/lib/notion'

// Admin-only operation
await addCustomerNotionResource(
  userId,
  'notion-page-id-123',
  'PERSONAL_NOTE',
  'Your Custom Hair Care Guide'
)
```

## 📊 Database Models

### Core Models

- **User**: Customer accounts with roles (CUSTOMER, SUPPORT, ADMIN)
- **HairProfile**: Measurements, preferences, lifestyle info
- **CustomizationTemplate**: Saved hair system configurations
- **Order**: Order tracking with production stages
- **OrderProductionSchedule**: Automated production reminders
- **Invoice**: Billing and payment records
- **SubscriptionPlan / CustomerPlan**: Recurring subscription management
- **Product**: Maintenance shop products
- **SupportTicket / SupportMessage**: Customer support system
- **HelpArticle**: Knowledge base articles
- **CustomerNotionResource**: Secure customer-Notion mapping
- **AffiliatedLocation**: Private specialist directory
- **AuditLog**: Security and compliance tracking

## 🔐 Security Features

### Authentication & Authorization

- **NextAuth.js** with secure JWT sessions
- **Password hashing** with bcrypt
- **Role-based access control** (RBAC)
- **Row-level security** enforced in all API routes
- **2FA support** with TOTP (speakeasy)
- **Session tracking** with device information

### Best Practices Implemented

1. **Input validation** on all forms
2. **SQL injection prevention** via Prisma
3. **XSS protection** via React's automatic escaping
4. **CSRF protection** via NextAuth
5. **Webhook signature verification** for Shopify and Stripe
6. **Environment variable validation** for sensitive config
7. **Audit logging** for accountability

## 📱 Features by Page

### Dashboard (`/app`)
- Welcome message with customer name
- Active orders count and status
- Next production alert with confirmation CTA
- Recent orders list
- Quick actions (reorder, support, manage plan)

### Hair Profile (`/app/profile-setup`)
- Onboarding flow for new customers
- Head measurements form
- Hair preferences (style, color, density, base type)
- Lifestyle questions (activity level, sweating)
- Photo upload placeholders

### Orders (`/app/orders`)
- Full order history with filtering
- Order status tracking
- Production stage indicators
- Quick reorder functionality

### Customization (`/app/customization`)
- Saved configuration templates
- Default template for quick reorder
- Template management (create, edit, delete)

### Plans & Billing (`/app/billing`)
- Current subscription details
- Available plans comparison
- Payment method management
- Stripe Customer Portal integration

### Shop (`/app/shop`)
- Maintenance products catalog
- Product filtering and search
- Add to cart functionality
- Shopify product sync

### Support (`/app/support`)
- Support ticket creation
- Ticket history with status
- Message threading
- Priority management

### Help (`/app/help`)
- Searchable knowledge base
- Articles by category
- Featured articles
- Notion sync integration

### Locations (`/app/locations`)
- Private specialist directory
- Filter by country/city
- Contact information
- Services offered

### Settings (`/app/settings`)
- Profile information
- Password change
- 2FA setup
- Active sessions management
- Notification preferences

## 🔄 Automated Features

### Order Production Reminders

The system automatically tracks upcoming order production:

1. When a customer has a subscription plan, the next production date is calculated
2. A `OrderProductionSchedule` record is created
3. Customers see reminders on the dashboard
4. Before production, customers can:
   - Confirm their customization (uses default template)
   - Modify customization for this order
   - Postpone production date

**Implementation**: See `/app/app/page.tsx` and `NextProductionAlert` component

### Webhook Processing

- **Shopify webhooks**: Auto-sync orders when created/updated
- **Stripe webhooks**: Auto-update subscriptions and invoices

## 🚢 Deployment

### Recommended: Railway (Easiest & Fastest)

Railway provides the simplest deployment experience with built-in PostgreSQL and excellent Next.js support.

**Quick Deploy:**
```bash
# Set your Railway token
export RAILWAY_TOKEN=your-token-here

# Run automated deployment
./railway-deploy.sh
```

**Or manually:**
```bash
railway login
railway init
railway add --database postgresql
railway up
railway run npx prisma migrate deploy
```

**📚 See detailed guides:**
- **Quick Start**: `RAILWAY_QUICKSTART.md` - Get deployed in 5 minutes
- **Complete Guide**: `RAILWAY_DEPLOYMENT.md` - Comprehensive deployment documentation

### Alternative: Vercel + Vercel Postgres

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Create Vercel Postgres database
5. Run migrations: `npx prisma migrate deploy`
6. Deploy!

### Alternative: Any Node.js host + Managed PostgreSQL

1. Build the project: `npm run build`
2. Set up PostgreSQL database (AWS RDS, DigitalOcean, etc.)
3. Run migrations: `npx prisma migrate deploy`
4. Start: `npm start`

### Environment Variables for Production

Make sure to set all required environment variables from `.env.example` in your hosting platform.

For Railway, use the `.env.railway.template` file as a reference.

## 📝 Development Workflow

### Running Locally

```bash
# Start dev server
npm run dev

# Run Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name description_of_changes

# Seed the database
npm run db:seed
```

### Database Changes

1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_change_name`
3. Commit both schema and migration files

## 🎨 Customization

### Branding

- Update colors in `tailwind.config.ts`
- Change site name in `app/layout.tsx`
- Replace logo in sidebar component

### Email Templates

- Configure SMTP settings in `.env`
- Email sending functionality in `lib/email.ts` (TODO: create if needed)

### Feature Flags

Use the `FeatureFlag` model to enable/disable features:

```typescript
const chatbotEnabled = await prisma.featureFlag.findUnique({
  where: { key: 'chatbot_enabled' }
})
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sign up flow
- [ ] Login/logout
- [ ] Complete hair profile
- [ ] Create customization template
- [ ] View orders
- [ ] Access help articles
- [ ] Browse locations
- [ ] Manage settings
- [ ] Change password
- [ ] View active sessions

### Future: Automated Tests

```bash
# TODO: Add testing setup
# npm run test
```

## 🐛 Troubleshooting

### Database connection issues

```bash
# Check DATABASE_URL is correct
# Test connection:
npx prisma db pull
```

### NextAuth errors

```bash
# Make sure NEXTAUTH_SECRET is set
# Generate new secret:
openssl rand -base64 32
```

### Webhook failures

- Check webhook URLs are publicly accessible
- Verify webhook secrets in `.env`
- Check webhook logs in Shopify/Stripe dashboard

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Stripe Documentation](https://stripe.com/docs)
- [Shopify API Documentation](https://shopify.dev/docs)
- [Notion API Documentation](https://developers.notion.com)

## 🔮 Future Enhancements

### Planned Features

- [ ] **Chatbot integration**: AI assistant for customer support
- [ ] **Mobile app**: React Native companion app
- [ ] **Email notifications**: Production reminders via email
- [ ] **SMS notifications**: Text message alerts
- [ ] **Video consultations**: Integrated video calling
- [ ] **Referral system**: Customer referral tracking
- [ ] **Review system**: Order satisfaction ratings
- [ ] **Multi-language support**: Internationalization
- [ ] **Advanced analytics**: Customer insights dashboard
- [ ] **Automated tests**: Jest + React Testing Library

### Architecture for Future Growth

The codebase is designed to scale:

- Modular structure for easy feature addition
- Role-based access for team expansion
- Webhook architecture for integrations
- Feature flags for gradual rollouts
- Audit logging for compliance

## 📄 License

Proprietary - Hair Solutions

## 👥 Contact

For questions or support regarding this portal, contact:
- Email: support@hairsolutions.co
- Website: https://hairsolutions.co

---

**Built with ❤️ for Hair Solutions customers**
