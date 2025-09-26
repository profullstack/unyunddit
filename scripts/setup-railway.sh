#!/bin/bash

# Railway deployment setup script for onion-ssr-boilerplate
# This script helps configure Railway for Tor hidden service deployment

set -e

echo "🚂 Railway Deployment Setup for Onion SSR Boilerplate"
echo "======================================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "Please log in to Railway:"
    railway login
fi

echo "✅ Railway authentication confirmed"

# Create new Railway project
echo "📦 Creating Railway project..."
railway init

# Set environment variables
echo "🔧 Setting up environment variables..."
echo "Please provide your Supabase credentials:"

read -p "Supabase URL: " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
read -s -p "Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
echo

# Set variables in Railway
railway variables set SUPABASE_URL="$SUPABASE_URL"
railway variables set SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
railway variables set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
railway variables set NODE_ENV="production"
railway variables set PORT="3000"

echo "✅ Environment variables configured"

# Create volume for Tor keys persistence
echo "💾 Setting up persistent volume for Tor keys..."
echo "Note: You'll need to create a volume named 'tor-keys' in the Railway dashboard"
echo "Volume mount path: /var/lib/tor"

# Deploy the application
echo "🚀 Deploying to Railway..."
railway up

echo "======================================================"
echo "✅ Railway deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Railway dashboard"
echo "2. Create a volume named 'tor-keys' mounted at '/var/lib/tor'"
echo "3. Wait for deployment to complete"
echo "4. Check logs for your .onion address"
echo ""
echo "🧅 Your .onion address will be displayed in the Railway logs"
echo "🔍 Use 'railway logs' to monitor the deployment"
echo "======================================================"