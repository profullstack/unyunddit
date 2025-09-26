#!/bin/bash

# Digital Ocean Droplet setup script for onion-ssr-boilerplate
# Creates a Droplet with persistent storage for Tor keys (alternative to App Platform)

set -e

echo "🌊 Digital Ocean Droplet Setup for Persistent .onion"
echo "===================================================="

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

# Get user input for droplet configuration
echo "🔧 Droplet Configuration"
read -p "Droplet name [onion-ssr-boilerplate]: " DROPLET_NAME
DROPLET_NAME=${DROPLET_NAME:-onion-ssr-boilerplate}

read -p "Region [nyc3]: " REGION
REGION=${REGION:-nyc3}

read -p "Size [s-1vcpu-1gb]: " SIZE
SIZE=${SIZE:-s-1vcpu-1gb}

# Create SSH key if needed
echo "🔑 SSH Key Setup"
SSH_KEY_NAME="onion-ssr-key"

if ! doctl compute ssh-key list --format Name --no-header | grep -q "$SSH_KEY_NAME"; then
    echo "Creating SSH key for droplet access..."
    
    # Generate SSH key if it doesn't exist locally
    if [ ! -f ~/.ssh/id_rsa ]; then
        ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
    fi
    
    # Add SSH key to Digital Ocean
    doctl compute ssh-key import "$SSH_KEY_NAME" --public-key-file ~/.ssh/id_rsa.pub
    echo "✅ SSH key added to Digital Ocean"
else
    echo "✅ SSH key already exists"
fi

# Create the droplet
echo "🚀 Creating Digital Ocean Droplet..."
DROPLET_ID=$(doctl compute droplet create "$DROPLET_NAME" \
    --region "$REGION" \
    --size "$SIZE" \
    --image docker-20-04 \
    --ssh-keys "$SSH_KEY_NAME" \
    --format ID \
    --no-header \
    --wait)

echo "✅ Droplet created with ID: $DROPLET_ID"

# Get droplet IP
DROPLET_IP=$(doctl compute droplet get "$DROPLET_ID" --format PublicIPv4 --no-header)
echo "🌐 Droplet IP: $DROPLET_IP"

# Create deployment script
cat > deploy-to-droplet.sh << EOF
#!/bin/bash

# Deploy onion-ssr-boilerplate to Digital Ocean Droplet
# Run this script after the droplet is ready

DROPLET_IP="$DROPLET_IP"

echo "🚀 Deploying to Digital Ocean Droplet: \$DROPLET_IP"

# Copy files to droplet
scp -r . root@\$DROPLET_IP:/app/

# Connect and deploy
ssh root@\$DROPLET_IP << 'ENDSSH'
cd /app

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Set environment variables
echo "SUPABASE_URL=\$1" > .env
echo "SUPABASE_ANON_KEY=\$2" >> .env
echo "SUPABASE_SERVICE_ROLE_KEY=\$3" >> .env

# Build and start the application
docker build -t onion-ssr-boilerplate .
docker run -d --name onion-ssr-app \\
    --restart unless-stopped \\
    -p 80:3000 \\
    -v tor-keys:/var/lib/tor \\
    --env-file .env \\
    onion-ssr-boilerplate

echo "✅ Application deployed!"
echo "🧅 Check logs for .onion address:"
echo "   docker logs onion-ssr-app"

ENDSSH

EOF

chmod +x deploy-to-droplet.sh

echo "===================================================="
echo "✅ Digital Ocean Droplet setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Wait for droplet to be ready (2-3 minutes)"
echo "2. Run the deployment script:"
echo "   ./deploy-to-droplet.sh SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "🌐 Droplet IP: $DROPLET_IP"
echo "🔑 SSH access: ssh root@$DROPLET_IP"
echo "🧅 Your .onion address will be persistent on this droplet"
echo "===================================================="