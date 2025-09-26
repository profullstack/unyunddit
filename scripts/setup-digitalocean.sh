#!/bin/bash

# Digital Ocean deployment setup script for onion-ssr-boilerplate
# This script helps deploy to Digital Ocean App Platform with Tor hidden service

set -e

echo "🌊 Digital Ocean Deployment Setup for Onion SSR Boilerplate"
echo "============================================================"

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "❌ Digital Ocean CLI (doctl) not found."
    echo "📥 Please install it from: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    echo "💡 Or run: snap install doctl"
    exit 1
fi

echo "✅ Digital Ocean CLI found"

# Check authentication
echo "🔐 Checking Digital Ocean authentication..."
if ! doctl account get &> /dev/null; then
    echo "Please authenticate with Digital Ocean:"
    echo "1. Get your API token from: https://cloud.digitalocean.com/account/api/tokens"
    read -s -p "Enter your Digital Ocean API token: " DO_TOKEN
    echo
    doctl auth init --access-token "$DO_TOKEN"
fi

echo "✅ Digital Ocean authentication confirmed"

# Create app spec file
echo "📝 Creating Digital Ocean App Platform spec..."
cat > .do/app.yaml << EOF
name: onion-ssr-boilerplate
services:
- name: web
  source_dir: /
  github:
    repo: your-username/onion-ssr-boilerplate
    branch: main
  run_command: /start.sh
  environment_slug: docker
  instance_count: 1
  instance_size_slug: basic-xxs
  dockerfile_path: Dockerfile
  http_port: 3000
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "3000"
  - key: SUPABASE_URL
    value: YOUR_SUPABASE_URL
    type: SECRET
  - key: SUPABASE_ANON_KEY
    value: YOUR_SUPABASE_ANON_KEY
    type: SECRET
  - key: SUPABASE_SERVICE_ROLE_KEY
    value: YOUR_SUPABASE_SERVICE_ROLE_KEY
    type: SECRET
EOF

echo "✅ App spec created at .do/app.yaml"

# Set environment variables
echo "🔧 Setting up environment variables..."
echo "Please provide your Supabase credentials:"

read -p "Supabase URL: " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
read -s -p "Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
echo

# Update the app spec with actual values
sed -i "s|YOUR_SUPABASE_URL|$SUPABASE_URL|g" .do/app.yaml
sed -i "s|YOUR_SUPABASE_ANON_KEY|$SUPABASE_ANON_KEY|g" .do/app.yaml
sed -i "s|YOUR_SUPABASE_SERVICE_ROLE_KEY|$SUPABASE_SERVICE_ROLE_KEY|g" .do/app.yaml

echo "✅ Environment variables configured"

# Create the app
echo "🚀 Creating Digital Ocean app..."
doctl apps create .do/app.yaml

echo "============================================================"
echo "✅ Digital Ocean deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Digital Ocean dashboard"
echo "2. Monitor the deployment progress"
echo "3. Check app logs for your .onion address"
echo "4. The Tor hidden service will be available once deployment completes"
echo ""
echo "🧅 Your .onion address will be displayed in the app logs"
echo "🔍 Use 'doctl apps logs <app-id>' to monitor the deployment"
echo ""
echo "💡 Tip: The first deployment may take 5-10 minutes for Tor to generate keys"
echo "============================================================"