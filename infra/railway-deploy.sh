#!/bin/bash

# Railway deploy helper — runs with **customer-portal/app/** as cwd (Railway project root).
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/../app"

echo "🚂 Railway Deployment Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

# Check if RAILWAY_TOKEN is set
if [ -z "$RAILWAY_TOKEN" ]; then
    echo -e "${RED}Error: RAILWAY_TOKEN environment variable is not set${NC}"
    echo "Please set your Railway API token:"
    echo "  export RAILWAY_TOKEN=your-token-here"
    echo ""
    echo "Or run: railway login"
    exit 1
fi

echo -e "${GREEN}✓ Railway CLI is ready${NC}"
echo ""

# Step 1: Initialize or link project
echo -e "${BLUE}Step 1: Setting up Railway project...${NC}"
if [ ! -f ".railway" ]; then
    echo "Creating new Railway project..."
    railway init
else
    echo "Railway project already linked"
fi

# Step 2: Add PostgreSQL database
echo ""
echo -e "${BLUE}Step 2: Setting up PostgreSQL database...${NC}"
echo "Adding PostgreSQL database to your project..."
railway add --database postgresql || echo "Database might already exist"

# Step 3: Set environment variables
echo ""
echo -e "${BLUE}Step 3: Setting environment variables...${NC}"

# Generate NEXTAUTH_SECRET if not provided
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "Generated NEXTAUTH_SECRET"

# Set essential environment variables
railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
railway variables set NEXT_PUBLIC_SITE_NAME="Hair Solutions Customer Portal"

echo -e "${GREEN}✓ Essential variables set${NC}"
echo ""
echo -e "${YELLOW}⚠️  Important: You still need to set the following variables manually:${NC}"
echo ""
echo "1. After first deployment, set:"
echo "   railway variables set NEXTAUTH_URL=https://your-app.railway.app"
echo "   railway variables set NEXT_PUBLIC_APP_URL=https://your-app.railway.app"
echo ""
echo "2. Stripe variables (required):"
echo "   railway variables set STRIPE_SECRET_KEY=sk_..."
echo "   railway variables set STRIPE_PUBLISHABLE_KEY=pk_..."
echo "   railway variables set STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "3. Optional integrations (Shopify, Notion, Email)"
echo "   See .env.example for all available variables"
echo ""

# Step 4: Deploy
echo -e "${BLUE}Step 4: Deploying application...${NC}"
echo "This may take a few minutes..."
echo ""

railway up

echo ""
echo -e "${GREEN}✓ Deployment initiated!${NC}"
echo ""

# Step 5: Get deployment URL
echo -e "${BLUE}Step 5: Getting deployment URL...${NC}"
RAILWAY_URL=$(railway domain 2>/dev/null || echo "Run 'railway domain' to get your URL")

if [ "$RAILWAY_URL" != "Run 'railway domain' to get your URL" ]; then
    echo -e "${GREEN}Your app is deployed at: $RAILWAY_URL${NC}"

    # Update NEXTAUTH_URL automatically
    echo ""
    echo "Updating NEXTAUTH_URL and NEXT_PUBLIC_APP_URL..."
    railway variables set NEXTAUTH_URL="https://$RAILWAY_URL"
    railway variables set NEXT_PUBLIC_APP_URL="https://$RAILWAY_URL"
fi

# Step 6: Run migrations
echo ""
echo -e "${BLUE}Step 6: Running database migrations...${NC}"
railway run npx prisma migrate deploy

echo ""
echo -e "${GREEN}✓ Migrations completed${NC}"

# Step 7: Optional - Seed database
echo ""
read -p "Do you want to seed the database with sample data? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Seeding database..."
    railway run npm run db:seed
    echo -e "${GREEN}✓ Database seeded${NC}"
fi

# Summary
echo ""
echo "================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Visit your app: https://$RAILWAY_URL"
echo "2. Configure remaining environment variables (Stripe, Shopify, etc.)"
echo "3. Set up webhooks for Stripe and Shopify"
echo "4. Test your deployment thoroughly"
echo ""
echo "View logs: railway logs"
echo "Open dashboard: railway open"
echo ""
echo "For detailed instructions, see ../docs/app/RAILWAY_DEPLOYMENT.md"
echo ""
