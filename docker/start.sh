#!/bin/sh

# Start script for onion-ssr-boilerplate
# Supports Railway and Digital Ocean deployment with Tor hidden service

echo "=========================================="
echo "🧅 ONION SSR BOILERPLATE STARTUP"
echo "=========================================="

# Debug volume mounting
echo "🔍 VOLUME DEBUGGING"
echo "Checking /var/lib/tor directory..."
ls -la /var/lib/tor/ || echo "Directory doesn't exist yet"
echo "Checking for existing hidden service..."
ls -la /var/lib/tor/hidden_service/ || echo "Hidden service directory doesn't exist yet"

# Ensure proper ownership of Tor directories
echo "Setting up Tor directories..."
mkdir -p /var/lib/tor/hidden_service
mkdir -p /var/log/tor
chown -R tor:tor /var/lib/tor
chown -R tor:tor /var/log/tor
chmod 700 /var/lib/tor
chmod 700 /var/lib/tor/hidden_service

echo "After setup:"
ls -la /var/lib/tor/
ls -la /var/lib/tor/hidden_service/ || echo "Hidden service directory is empty (expected for first run)"
echo "=========================================="

# Start Tor in the background
echo "🔄 Starting Tor with SOCKS proxy..."
tor -f /etc/tor/torrc &
TOR_PID=$!

# Wait for Tor to initialize and check SOCKS proxy
echo "⏳ Waiting for Tor SOCKS proxy to be ready..."
for i in {1..30}; do
    if nc -z 127.0.0.1 9050; then
        echo "✅ Tor SOCKS proxy is ready on port 9050"
        break
    fi
    echo "⏳ Waiting for Tor SOCKS proxy... ($i/30)"
    sleep 2
done

# Verify SOCKS proxy is working
if ! nc -z 127.0.0.1 9050; then
    echo "❌ ERROR: Tor SOCKS proxy failed to start on port 9050"
    echo "🔍 Checking Tor process..."
    ps aux | grep tor
    echo "🔍 Checking Tor logs..."
    tail -20 /var/log/tor/notices.log || echo "No Tor logs found"
else
    echo "✅ Tor SOCKS proxy confirmed working on 127.0.0.1:9050"
fi

# Wait for hidden service to be ready
echo "⏳ Waiting for hidden service initialization..."
sleep 10

# Get the onion address
echo "=========================================="
echo "🧅 TOR HIDDEN SERVICE STATUS"
echo "=========================================="

if [ -f /var/lib/tor/hidden_service/hostname ]; then
    ONION_URL=$(cat /var/lib/tor/hidden_service/hostname)
    export PUBLIC_ONION_URL="http://${ONION_URL}"
    
    echo "✅ Tor hidden service is ACTIVE!"
    echo "🌐 Your .onion address: ${ONION_URL}"
    echo "🔗 Full URL: ${PUBLIC_ONION_URL}"
    echo "📋 Share this URL for anonymous access"
    echo "🔒 This is your permanent .onion address"
else
    echo "⏳ Waiting for Tor to generate onion address..."
    sleep 15
    if [ -f /var/lib/tor/hidden_service/hostname ]; then
        ONION_URL=$(cat /var/lib/tor/hidden_service/hostname)
        export PUBLIC_ONION_URL="http://${ONION_URL}"
        
        echo "✅ Tor hidden service is ACTIVE!"
        echo "🌐 Your .onion address: ${ONION_URL}"
        echo "🔗 Full URL: ${PUBLIC_ONION_URL}"
        echo "📋 Share this URL for anonymous access"
        echo "🔒 This is your permanent .onion address"
    else
        echo "⚠️  WARNING: Tor onion address not yet generated!"
        echo "🔍 Check Tor logs for issues"
        echo "📝 The service will still start, but .onion access may not be available"
        export PUBLIC_ONION_URL=""
    fi
fi

echo "=========================================="

# Start the Node.js application
echo "🚀 Starting SvelteKit application on port ${PORT:-3000}..."
echo "🔧 Environment: ${NODE_ENV:-production}"
echo "🗄️ Database: Supabase"
echo "🛡️ Security: SSR-only mode with strict CSP"
echo "=========================================="

# Start the app in background and monitor
cd /app
node build/index.js &
APP_PID=$!

# Function to display onion URL periodically
display_onion_info() {
    while true; do
        sleep 300  # Every 5 minutes
        if [ -f /var/lib/tor/hidden_service/hostname ]; then
            CURRENT_ONION=$(cat /var/lib/tor/hidden_service/hostname)
            echo "=========================================="
            echo "🧅 TOR STATUS UPDATE"
            echo "🌐 Your .onion address: ${CURRENT_ONION}"
            echo "🔗 Full URL: http://${CURRENT_ONION}"
            echo "📋 Share this URL for anonymous access"
            echo "⏰ $(date)"
            echo "🔧 App PID: ${APP_PID}"
            echo "🔧 Tor PID: ${TOR_PID}"
            echo "=========================================="
        else
            echo "⚠️  Tor hidden service not ready yet..."
        fi
    done
}

# Start periodic display in background
display_onion_info &
MONITOR_PID=$!

# Cleanup function
cleanup() {
    echo "🛑 Shutting down services..."
    kill $APP_PID 2>/dev/null
    kill $TOR_PID 2>/dev/null
    kill $MONITOR_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Wait for the main app process
wait $APP_PID