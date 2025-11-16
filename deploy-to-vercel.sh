#!/bin/bash

# Hair Solutions Customer Portal - Vercel Deployment Script
# Run this script from your local machine to deploy to Vercel

set -e  # Exit on error

echo "🚀 Hair Solutions Portal - Vercel Deployment"
echo "============================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
else
    echo "✅ Vercel CLI already installed"
fi

echo ""
echo "🔐 Step 1: Login to Vercel"
echo "A browser window will open for authentication..."
vercel login

echo ""
echo "✅ Authentication successful!"
echo ""

echo "🏗️  Step 2: Deploy to Vercel"
echo "This will deploy your app and set up the project..."
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "✨ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to your Vercel dashboard: https://vercel.com/dashboard"
echo "2. Find your project 'customer-portal'"
echo "3. Go to Settings → Environment Variables"
echo "4. Add all variables from your .env file"
echo "5. Add Vercel Postgres database from Storage tab"
echo "6. Redeploy after adding environment variables"
echo ""
echo "📝 Required environment variables:"
echo "   - DATABASE_URL (from Vercel Postgres)"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL (your production URL)"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_PUBLISHABLE_KEY"
echo "   - SHOPIFY_STORE_DOMAIN"
echo "   - SHOPIFY_ADMIN_API_TOKEN"
echo "   - And others from .env.example"
echo ""
echo "🎉 Your portal will be live at: https://customer-portal-xyz.vercel.app"
echo "   (You can add custom domain customerportal.hairsolutions.co later)"
