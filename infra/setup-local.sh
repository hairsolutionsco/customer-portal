#!/bin/bash

# Local Development Setup Script — run from anywhere; operates on **customer-portal/app/**.
set -e
NEXT_ROOT="$(cd "$(dirname "$0")/../app" && pwd)"
cd "$NEXT_ROOT"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Hair Solutions Customer Portal - Local Setup${NC}"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js $NODE_VERSION installed${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v) installed${NC}"
echo ""

# Step 1: Install dependencies
echo -e "${BLUE}Step 1: Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Running npm install (this may take a few minutes)..."
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ node_modules already exists, skipping install${NC}"
    echo "  To reinstall: rm -rf node_modules && npm install"
fi
echo ""

# Step 2: Set up environment variables
echo -e "${BLUE}Step 2: Setting up environment variables...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from .env.example${NC}"

        # Generate NEXTAUTH_SECRET
        NEXTAUTH_SECRET=$(openssl rand -base64 32)

        # Update .env with generated secret
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|your-secret-key-here-generate-with-openssl-rand-base64-32|$NEXTAUTH_SECRET|g" .env
        else
            # Linux
            sed -i "s|your-secret-key-here-generate-with-openssl-rand-base64-32|$NEXTAUTH_SECRET|g" .env
        fi

        echo -e "${GREEN}✓ Generated NEXTAUTH_SECRET${NC}"
        echo ""
        echo -e "${YELLOW}⚠ IMPORTANT: You need to configure your DATABASE_URL in .env${NC}"
        echo ""
        echo "Options:"
        echo "1. Use Railway database (if already deployed):"
        echo "   railway variables get DATABASE_URL"
        echo ""
        echo "2. Use local PostgreSQL:"
        echo "   DATABASE_URL=\"postgresql://user:password@localhost:5432/hair_solutions_portal\""
        echo ""
        read -p "Press Enter after you've updated DATABASE_URL in .env..."
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ .env already exists${NC}"
fi
echo ""

# Step 3: Check if DATABASE_URL is set
echo -e "${BLUE}Step 3: Checking database configuration...${NC}"
if ! grep -q "DATABASE_URL=\"postgresql://" .env; then
    echo -e "${YELLOW}⚠ DATABASE_URL might not be configured correctly${NC}"
    echo "Make sure your .env has a valid DATABASE_URL"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo ""

# Step 4: Generate Prisma Client
echo -e "${BLUE}Step 4: Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"
echo ""

# Step 5: Set up database
echo -e "${BLUE}Step 5: Setting up database...${NC}"
echo "Choose an option:"
echo "1. Push schema (quick, for development)"
echo "2. Run migrations (recommended, for production-like testing)"
echo "3. Skip (I'll do it manually)"
read -p "Enter choice (1-3): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo "Pushing schema to database..."
        npm run db:push
        echo -e "${GREEN}✓ Schema pushed${NC}"
        ;;
    2)
        echo "Running migrations..."
        npm run db:migrate
        echo -e "${GREEN}✓ Migrations complete${NC}"
        ;;
    3)
        echo "Skipping database setup"
        ;;
    *)
        echo -e "${YELLOW}Invalid choice, skipping${NC}"
        ;;
esac
echo ""

# Step 6: Seed database
echo -e "${BLUE}Step 6: Seeding database (optional)${NC}"
read -p "Do you want to seed the database with sample data? (Y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    npm run db:seed
    echo -e "${GREEN}✓ Database seeded${NC}"
    echo ""
    echo "Sample users created:"
    echo "  Admin:    admin@hairsolutions.co / admin123"
    echo "  Support:  support@hairsolutions.co / support123"
    echo "  Customer: demo@example.com / demo123"
fi
echo ""

# Summary
echo "=================================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "To start the development server:"
echo -e "  ${BLUE}npm run dev${NC}"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
echo "Additional commands:"
echo "  npm run db:studio  - Open Prisma Studio (database GUI)"
echo "  npm run lint       - Run linter"
echo "  npm run build      - Build for production"
echo ""
echo "For more information, see:"
echo "  - ../docs/app/TESTING_SETUP.md (testing guide)"
echo "  - ../README.md (customer-portal layout)"
echo ""
echo -e "${YELLOW}⚠ Remember to change default passwords before going to production!${NC}"
