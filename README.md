# 🧅 Onion SSR Boilerplate

A privacy-focused **SvelteKit boilerplate** for building `.onion` websites with **100% server-side rendering** and **Supabase** integration. Perfect for Tor hidden services where users often disable JavaScript by default.

## ✨ Features

- **🔒 SSR-Only Mode**: 100% server-side rendered with no client-side JavaScript
- **🗄️ Supabase Integration**: Database-backed applications using Supabase's REST API
- **🛡️ Security Headers**: Strict Content Security Policy and privacy headers
- **📝 Form Handling**: Classic HTML form interactions with server-side validation
- **🐳 Docker Ready**: Containerized deployment for Tor hidden services
- **⚡ Node.js Adapter**: Built with adapter-node for standalone server deployment
- **🎨 No External Dependencies**: Self-contained CSS, no CDNs or external assets
- **🔧 Modern Tooling**: ESLint, Prettier, and modern JavaScript (ES2024+)

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+**
- **pnpm** (recommended package manager)
- **Supabase account** (for database features)

### 1. Clone and Install

```bash
git clone <repository-url>
cd onion-ssr-boilerplate
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
# SUPABASE_URL=https://your-project-id.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Setup

```bash
# Initialize Supabase (optional - for local development)
pnpx supabase init

# Run migrations (if using Supabase locally)
pnpx supabase db reset

# Or apply migrations to your hosted Supabase project
# via the Supabase dashboard
```

### 4. Development

```bash
# Start development server
pnpm run dev

# Open http://localhost:5173
```

### 5. Production Build

```bash
# Build for production
pnpm run build

# Start production server
node build
```

## 🐳 Docker Deployment

### Option 1: Docker Compose (Recommended)

```bash
# Build and start with Tor hidden service
docker-compose up -d

# Check your .onion address
docker-compose exec tor cat /var/lib/tor/hidden_service/hostname
```

### Option 2: Docker Only

```bash
# Build the image
docker build -t onion-ssr-boilerplate .

# Run the container
docker run -p 3000:3000 \
  -e SUPABASE_URL=your-url \
  -e SUPABASE_ANON_KEY=your-key \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-key \
  onion-ssr-boilerplate
```

## 🏗️ Project Structure

```
onion-ssr-boilerplate/
├── src/
│   ├── routes/                 # SvelteKit routes
│   │   ├── +layout.js         # Global SSR-only configuration
│   │   ├── +layout.svelte     # Global layout
│   │   ├── +page.svelte       # Homepage
│   │   └── guestbook/         # Example guestbook feature
│   │       ├── +page.svelte   # Guestbook UI
│   │       └── +page.server.js # Server-side logic
│   ├── lib/
│   │   └── supabase.js        # Supabase client configuration
│   ├── hooks.server.js        # Security headers and middleware
│   └── app.html               # HTML template
├── supabase/
│   └── migrations/            # Database migrations
├── static/                    # Static assets
├── Dockerfile                 # Container configuration
├── docker-compose.yml         # Docker Compose with Tor
└── README.md                  # This file
```

## 🔧 Configuration

### SSR-Only Mode

The boilerplate enforces SSR-only mode globally via [`src/routes/+layout.js`](src/routes/+layout.js):

```javascript
export const ssr = true;        // Enable server-side rendering
export const csr = false;       // Disable client-side rendering
export const prerender = false; // Disable prerendering
```

### Security Headers

Strict security headers are configured in [`src/hooks.server.js`](src/hooks.server.js):

- **Content Security Policy**: Blocks all JavaScript, allows only self-hosted assets
- **Privacy Headers**: No referrer, no content sniffing, frame protection
- **Server Identification**: Removes server headers for privacy

### Supabase Integration

Server-side Supabase client in [`src/lib/supabase.js`](src/lib/supabase.js):

```javascript
import { createSupabaseServerClient } from '$lib/supabase.js';

// In your +page.server.js files
export async function load() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('table').select('*');
  return { data };
}
```

## 📝 Example: Guestbook

The included guestbook demonstrates:

- **HTML Forms**: Pure form-based interactions
- **Server Actions**: Form submission handling
- **Database Integration**: Supabase CRUD operations
- **Validation**: Server-side input validation
- **Error Handling**: User-friendly error messages

Visit `/guestbook` to see it in action.

## 🛡️ Security Features

### Content Security Policy

```
default-src 'none';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
form-action 'self';
script-src 'none';
```

### Privacy Headers

- `Referrer-Policy: no-referrer`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

### No External Dependencies

- Self-hosted fonts and assets
- No CDN dependencies
- No analytics or tracking
- No external API calls from client

## 🔄 Development Workflow

### Code Quality

```bash
# Lint code
pnpm run lint

# Format code
pnpm run format

# Type check
pnpm run check

# Run tests
pnpm run test

# Run tests with coverage
pnpm run test:coverage
```

### Database Migrations

```bash
# Create new migration
pnpx supabase migrations new feature_name

# Apply migrations locally
pnpx supabase db reset

# Generate types (optional)
pnpx supabase gen types typescript --local > src/lib/database.types.ts
```

## 🌐 Tor Hidden Service Setup

### Manual Setup (Linux)

1. **Install Tor**:
   ```bash
   sudo apt update && sudo apt install tor
   ```

2. **Configure Tor** (`/etc/tor/torrc`):
   ```
   HiddenServiceDir /var/lib/tor/hidden_service/
   HiddenServicePort 80 127.0.0.1:3000
   HiddenServiceVersion 3
   ```

3. **Start Services**:
   ```bash
   sudo systemctl start tor
   node build  # Your SvelteKit app on port 3000
   ```

4. **Get .onion Address**:
   ```bash
   sudo cat /var/lib/tor/hidden_service/hostname
   ```

### Docker Setup (Recommended)

Use the included `docker-compose.yml` for automated setup with Tor.

## ☁️ Cloud Deployment

### Railway (Recommended for Persistent .onion)

Railway supports persistent volumes, making it ideal for maintaining the same .onion address across deployments.

```bash
# Automated Railway setup
pnpm run deploy:railway

# Or manual setup:
npm install -g @railway/cli
railway login
railway init
# Set environment variables in Railway dashboard
railway up
```

**Railway Setup:**
1. Create a volume named `tor-keys` mounted at `/var/lib/tor`
2. Set environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy using the included [`railway.toml`](railway.toml) configuration
4. Monitor logs for your permanent .onion address

### Digital Ocean App Platform

Digital Ocean App Platform provides easy deployment but .onion addresses will change on each deployment (no persistent volumes).

```bash
# Automated Digital Ocean setup
pnpm run deploy:digitalocean

# Or manual setup:
doctl auth init
doctl apps create .do/app.yaml
```

**Digital Ocean Setup:**
1. Install `doctl` CLI tool
2. Configure environment variables in the app spec
3. Deploy using the included [`.do/app.yaml`](.do/app.yaml) configuration
4. Monitor app logs for your .onion address

### Deployment Comparison

| Feature | Railway | Digital Ocean | Docker Compose |
|---------|---------|---------------|----------------|
| **Persistent .onion** | ✅ Yes (volumes) | ❌ No | ✅ Yes (local) |
| **Auto-scaling** | ✅ Yes | ✅ Yes | ❌ No |
| **Cost** | Free tier available | Free tier available | Self-hosted |
| **Setup Complexity** | Low | Medium | High |
| **Best For** | Production .onion sites | Testing/development | Self-hosting |

## 📚 Learn More

- **SvelteKit**: [svelte.dev/docs/kit](https://svelte.dev/docs/kit)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Tor Hidden Services**: [community.torproject.org](https://community.torproject.org/onion-services/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

WTFPL (Do What The Fuck You Want To Public License) - see [LICENSE](LICENSE) file for details.

This project is released under the WTFPL, which means you can literally do whatever you want with it. Build .onion sites, modify the code, sell it, or use it to take over the world - we don't care! 🧅

## 🔒 Privacy Notice

This boilerplate is designed for privacy-focused applications:

- No analytics or tracking
- No external API calls
- No client-side JavaScript
- Strict security headers
- Self-contained assets

Perfect for building anonymous, privacy-respecting web applications on the Tor network.

---

**Built for the privacy-conscious developer community** 🧅
