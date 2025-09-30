# Deployment Guide: Real IP Detection Fix

## 🚨 Current Issue
Railway is properly sending real client IPs, but your app is seeing `127.0.0.1` because the current deployment doesn't have the nginx proxy setup.

## ✅ Solution Implemented

### 1. Architecture
```
Railway Load Balancer → Docker Container (nginx:8080) → SvelteKit (8000)
```

### 2. Files Updated
- [`docker/nginx.conf`](docker/nginx.conf) - Nginx proxy configuration
- [`docker/start.sh`](docker/start.sh) - Starts both nginx and SvelteKit
- [`Dockerfile`](Dockerfile) - Includes nginx installation
- [`railway.toml`](railway.toml) - Updated port configuration
- [`.env.example`](.env.example) - Added NGINX_PORT configuration

## 🚀 Deployment Steps

### Step 1: Update Railway Environment Variables
In your Railway dashboard, set:
```
PORT=8000
NGINX_PORT=8080
```

### Step 2: Redeploy
The updated configuration will:
1. Railway sends real client IP in headers
2. Nginx receives these headers on port 8080
3. Nginx forwards to SvelteKit on port 8000 with proper headers
4. SvelteKit reads `X-Real-IP` header for real client IP

### Step 3: Verify
After deployment, you can verify the fix in two ways:

**Option A: Check the `/raw` endpoint**
Visit `https://your-app.railway.app/raw` to see all headers and IP detection info in JSON format.

**Option B: Check server logs**
Look for logs showing:
```
🔍 [IP-DEBUG] ALL HEADERS:
   x-forwarded-for: [REAL_CLIENT_IP]
   x-real-ip: [REAL_CLIENT_IP]
   x-forwarded-host: your-app.railway.app
   x-railway-edge: railway/us-west2
```

## 🔧 How It Works

### Before (Broken)
```
Railway → Docker Container → SvelteKit (port 8080)
Headers: X-Real-IP: 76.236.30.220
App sees: 127.0.0.1 (because no nginx proxy)
```

### After (Fixed)
```
Railway → Docker Container → Nginx (port 8080) → SvelteKit (port 8000)
Headers: X-Real-IP: 76.236.30.220 → X-Real-IP: 76.236.30.220
App sees: 76.236.30.220 (real client IP)
```

## 🎯 Expected Results

After redeployment, you should see:
- Real client IPs in logs instead of `127.0.0.1`
- Unique vote tracking per user
- Proper IP-based rate limiting

## 🔍 Troubleshooting

### Debug Endpoint
Use the `/raw` endpoint to see exactly what headers your app is receiving:
```bash
curl https://your-app.railway.app/raw
```

This will show:
- All HTTP headers
- IP detection results
- Environment configuration
- Railway-specific headers

### If still seeing `127.0.0.1`:
1. Check Railway environment variables are set correctly
2. Verify the new Docker image is deployed
3. Check nginx is running: logs should show "Nginx started"
4. Look for nginx errors in deployment logs
5. Use `/raw` endpoint to see if Railway headers are being received

The enhanced debugging will show exactly which headers Railway is sending to help identify any remaining issues.