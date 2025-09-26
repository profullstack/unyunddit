#!/bin/bash

# Railway volume creation script for onion-ssr-boilerplate
# Creates persistent volume for Tor keys to maintain .onion address

set -e

echo "💾 Railway Volume Setup for Tor Keys"
echo "====================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
fi

# Check authentication
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "Please log in to Railway:"
    railway login
fi

echo "✅ Railway authentication confirmed"

# Get project info
PROJECT_ID=$(railway status --json | jq -r '.project.id' 2>/dev/null || echo "")

if [ -z "$PROJECT_ID" ]; then
    echo "❌ No Railway project found in current directory"
    echo "💡 Run 'railway init' first or 'pnpm run deploy:railway'"
    exit 1
fi

echo "📦 Found Railway project: $PROJECT_ID"

# Create volume using Railway CLI
echo "💾 Creating persistent volume for Tor keys..."

# Note: Railway CLI doesn't have direct volume creation commands
# This needs to be done through the Railway dashboard
echo "📋 MANUAL STEPS REQUIRED:"
echo ""
echo "1. Go to your Railway dashboard: https://railway.app/dashboard"
echo "2. Select your project: onion-ssr-boilerplate"
echo "3. Go to the 'Variables' tab"
echo "4. Click 'Add Volume'"
echo "5. Set volume name: 'tor-keys'"
echo "6. Set mount path: '/var/lib/tor'"
echo "7. Save the volume configuration"
echo ""
echo "🔄 After creating the volume, redeploy your service:"
echo "   railway up --detach"
echo ""
echo "🧅 Your .onion address will persist across deployments!"
echo "====================================="

# Alternative: Check if volume exists via API (if Railway adds this feature)
echo "💡 TIP: The volume ensures your .onion address stays the same"
echo "💡 TIP: Without a volume, you'll get a new .onion address on each deploy"