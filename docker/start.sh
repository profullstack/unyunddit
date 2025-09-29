#!/bin/sh

# Debug volume mounting
echo "=========================================="
echo "🔍 VOLUME DEBUGGING"
echo "=========================================="
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

# Start Tor in the background with logs to stdout
echo "=========================================="
echo "🔧 STARTING TOR HIDDEN SERVICE"
echo "=========================================="
echo "📋 Tor logs will be visible in Railway logs with [TOR] prefix"
echo "🔍 Tor config: /etc/tor/torrc"
echo "📁 Hidden service dir: /var/lib/tor/hidden_service/"

# Start Tor with explicit logging to stdout
echo "[TOR] Starting Tor daemon..."
(tor -f /etc/tor/torrc 2>&1 | while IFS= read -r line; do
    echo "[TOR] $line"
done) &
TOR_PID=$!

echo "🔧 Tor started with PID: $TOR_PID"
echo "=========================================="

# Wait for Tor to initialize and check SOCKS proxy
echo "Waiting for Tor SOCKS proxy to be ready..."
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

# Wait a bit more for hidden service
sleep 5

# Get the onion address and inject it into the app
echo "=========================================="
echo "🧅 TOR HIDDEN SERVICE INITIALIZATION"
echo "=========================================="

if [ -f /var/lib/tor/hidden_service/hostname ]; then
    ONION_URL=$(cat /var/lib/tor/hidden_service/hostname)
    export PUBLIC_ONION_URL="http://${ONION_URL}"
    
    echo "✅ Tor hidden service is ACTIVE!"
    echo "🌐 Your .onion address: ${ONION_URL}"
    echo "🔗 Full URL: ${PUBLIC_ONION_URL}"
    echo "📋 Share this URL for anonymous access"
    
    # Test hidden service connectivity
    echo "🔍 Testing hidden service connectivity..."
    echo "📡 Checking if port 8080 is accessible..."
    if nc -z 127.0.0.1 8080; then
        echo "✅ Port 8080 is accessible"
    else
        echo "❌ Port 8080 is NOT accessible"
    fi
    
    # Check hidden service files
    echo "📁 Hidden service files:"
    ls -la /var/lib/tor/hidden_service/
    
    # Test if we can reach our own hidden service (this tests the full Tor circuit)
    echo "🔄 Testing hidden service reachability..."
    if command -v curl >/dev/null 2>&1; then
        echo "📡 Testing HTTP request to hidden service via Tor..."
        timeout 30 curl --socks5-hostname 127.0.0.1:9050 -s -o /dev/null -w "HTTP Status: %{http_code}\n" "${PUBLIC_ONION_URL}/" || echo "❌ Hidden service test failed"
    else
        echo "⚠️ curl not available for hidden service testing"
    fi
    
    # Inject onion URL into the built app
    echo "window.PUBLIC_ONION_URL = '${PUBLIC_ONION_URL}';" > /app/build/client/_app/onion-config.js
    echo "✅ Onion URL injected into application"
else
    echo "⏳ Waiting for Tor to generate onion address..."
    sleep 10
    if [ -f /var/lib/tor/hidden_service/hostname ]; then
        ONION_URL=$(cat /var/lib/tor/hidden_service/hostname)
        export PUBLIC_ONION_URL="http://${ONION_URL}"
        
        echo "✅ Tor hidden service is ACTIVE!"
        echo "🌐 Your .onion address: ${ONION_URL}"
        echo "🔗 Full URL: ${PUBLIC_ONION_URL}"
        echo "📋 Share this URL for anonymous access"
        
        # Inject onion URL into the built app
        echo "window.PUBLIC_ONION_URL = '${PUBLIC_ONION_URL}';" > /app/build/client/_app/onion-config.js
        echo "✅ Onion URL injected into application"
    else
        echo "⚠️  WARNING: Tor onion address not yet generated!"
        echo "🔍 Check Tor logs for issues"
        export PUBLIC_ONION_URL=""
        echo "window.PUBLIC_ONION_URL = '';" > /app/build/client/_app/onion-config.js
    fi
fi

echo "=========================================="

# Start the Node.js application with the onion URL available
echo "🚀 Starting SvelteKit application on port 8080..."
echo "=========================================="

# Start the app in background and monitor onion URL
cd /app
echo "🚀 Starting Node.js app..."
echo "📁 Current directory: $(pwd)"
echo "📋 App files:"
ls -la build/ || echo "❌ Build directory not found"
echo "🔧 Starting Node.js with PORT=8080..."

# Start with explicit logging
PORT=8080 node build/index.js 2>&1 &
APP_PID=$!

echo "✅ Node.js started with PID: $APP_PID"
echo "⏳ Waiting for app to initialize..."
sleep 3

# Test if the app is responding
echo "🔍 Testing app connectivity..."
if nc -z 127.0.0.1 8080; then
    echo "✅ App is responding on port 8080"
else
    echo "❌ App is NOT responding on port 8080"
    echo "🔍 Checking app process..."
    ps aux | grep node || echo "No node processes found"
fi

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
            echo "=========================================="
        fi
    done
}

# Start periodic display in background
display_onion_info &
MONITOR_PID=$!

# Tor logs are now directly piped to stdout above, no need for separate tail

# Wait for the main app process
wait $APP_PID