# 🚀 Deployment Guide for Onion SSR Boilerplate

This guide covers all deployment options for the onion-ssr-boilerplate, including cloud platforms and self-hosting options.

## 🎯 Deployment Options Overview

| Option | Persistent .onion | Cost | Complexity | Best For |
|--------|------------------|------|------------|----------|
| **Railway** | ✅ Yes | Free tier | Low | Production sites |
| **DO Droplet** | ✅ Yes | $6/month | Medium | Full control |
| **DO App Platform** | ❌ No | Free tier | Low | Testing/dev |
| **Docker Compose** | ✅ Yes | Self-hosted | High | Local/VPS |

## ☁️ Cloud Deployment

### 🚂 Railway (Recommended)

Railway provides persistent volumes, making it perfect for maintaining the same .onion address.

#### Quick Deploy
```bash
pnpm run deploy:railway
```

#### Manual Setup
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and initialize
railway login
railway init

# 3. Create persistent volume for Tor keys
pnpm run volume:railway

# 4. Set environment variables
railway variables set SUPABASE_URL="your-url"
railway variables set SUPABASE_ANON_KEY="your-key"
railway variables set SUPABASE_SERVICE_ROLE_KEY="your-service-key"

# 5. Deploy
railway up
```

#### Volume Setup
The `tor-keys` volume must be created in Railway dashboard:
- **Volume Name**: `tor-keys`
- **Mount Path**: `/var/lib/tor`
- **Size**: 1GB (minimum)

### 🌊 Digital Ocean

#### Option 1: App Platform (No Persistent .onion)
```bash
pnpm run deploy:digitalocean
```

#### Option 2: Droplet (Persistent .onion)
```bash
# Create droplet with persistent storage
pnpm run droplet:create

# Follow the generated deployment script
./deploy-to-droplet.sh SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY
```

## 🐳 Docker Deployment

### Local Development
```bash
# Start with Docker Compose
docker-compose up -d

# Check .onion address
docker-compose logs app | grep "onion address"
```

### VPS/Server Deployment
```bash
# Build and run
docker build -t onion-ssr-boilerplate .
docker run -d \
  --name onion-ssr-app \
  --restart unless-stopped \
  -p 80:3000 \
  -v tor-keys:/var/lib/tor \
  -e SUPABASE_URL="your-url" \
  -e SUPABASE_ANON_KEY="your-key" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-key" \
  onion-ssr-boilerplate

# Check .onion address
docker logs onion-ssr-app | grep "onion address"
```

## 🔧 Environment Variables

All deployment methods require these Supabase environment variables:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing
3. Go to **Settings** → **API**
4. Copy the **URL** and **anon key**
5. Copy the **service_role key** (keep this secret!)

## 🧅 .onion Address Management

### Persistent Addresses
- **Railway**: Use volumes (`pnpm run volume:railway`)
- **DO Droplet**: Automatic with persistent storage
- **Docker**: Use named volumes (`-v tor-keys:/var/lib/tor`)

### Non-Persistent Addresses
- **DO App Platform**: New .onion on each deployment
- **Temporary containers**: New .onion each time

## 📊 Monitoring and Logs

### Railway
```bash
# View logs
railway logs

# Monitor deployment
railway status
```

### Digital Ocean
```bash
# App Platform logs
doctl apps logs <app-id>

# Droplet logs
ssh root@droplet-ip
docker logs onion-ssr-app
```

### Docker
```bash
# View logs
docker logs onion-ssr-app

# Follow logs
docker logs -f onion-ssr-app

# Check Tor status
docker exec onion-ssr-app cat /var/lib/tor/hidden_service/hostname
```

## 🔍 Troubleshooting

### Common Issues

#### .onion Address Not Generated
```bash
# Check Tor logs
docker logs onion-ssr-app | grep -i tor

# Verify Tor configuration
docker exec onion-ssr-app cat /etc/tor/torrc

# Check Tor process
docker exec onion-ssr-app ps aux | grep tor
```

#### Database Connection Issues
```bash
# Verify environment variables
docker exec onion-ssr-app env | grep SUPABASE

# Test database connection
docker exec onion-ssr-app node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
console.log('Database connection test:', client.supabaseUrl);
"
```

#### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000

# Use different port
docker run -p 8080:3000 onion-ssr-boilerplate
```

## 🔄 Updates and Maintenance

### Railway Updates
```bash
# Deploy new version
railway up

# Check deployment status
railway status
```

### Digital Ocean Updates
```bash
# App Platform
doctl apps create-deployment <app-id>

# Droplet
ssh root@droplet-ip
cd /app
git pull
docker build -t onion-ssr-boilerplate .
docker stop onion-ssr-app
docker rm onion-ssr-app
docker run -d --name onion-ssr-app --restart unless-stopped -p 80:3000 -v tor-keys:/var/lib/tor --env-file .env onion-ssr-boilerplate
```

### Docker Updates
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

## 🛡️ Security Considerations

### Production Checklist
- [ ] Environment variables are set as secrets (not plain text)
- [ ] .env files are not committed to git
- [ ] Tor keys volume is properly mounted
- [ ] Security headers are enabled
- [ ] Database RLS policies are configured
- [ ] No external CDN dependencies

### Monitoring
- Monitor .onion address accessibility
- Check application logs regularly
- Verify database connectivity
- Monitor resource usage

## 📞 Support

If you encounter issues:

1. Check the logs first
2. Verify environment variables
3. Test database connectivity
4. Check Tor configuration
5. Review security headers

For persistent issues, check the project repository for updates and community support.