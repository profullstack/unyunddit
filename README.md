<div align="center">

# Unyunddit - Anonymous Reddit Clone

![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Tor](https://img.shields.io/badge/Tor_Network-7D4698?style=for-the-badge&logo=tor-browser&logoColor=white)

[![License: WTFPL](https://img.shields.io/badge/License-WTFPL-brightgreen.svg)](http://www.wtfpl.net/about/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange)](https://pnpm.io/)

</div>

A completely anonymous Reddit clone designed specifically for the Tor network, featuring automatic post deletion after 72 hours. Built with SvelteKit and Supabase, it uses server-side rendering only (no client-side JavaScript) to maximize privacy and security.

## 🌟 Features

- **Complete Anonymity**: No user accounts, registration, or tracking required
- **Auto-Deletion**: All posts and comments automatically delete after 72 hours
- **Tor-Optimized**: Designed specifically for .onion websites and Tor browsers
- **Server-Side Only**: No client-side JavaScript for enhanced security
- **Anonymous Voting**: IP-based voting system with SHA256 hashed IPs for privacy
- **Nested Comments**: Support for threaded discussions up to 10 levels deep
- **Security Headers**: Strict CSP and privacy-focused HTTP headers

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | SvelteKit (SSR-only mode) |
| **Backend** | Node.js 20+ with ESM modules |
| **Database** | Supabase (PostgreSQL) |
| **Package Manager** | pnpm |
| **Security** | Strict Content Security Policy, no client-side JS |

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or newer ([Download here](https://nodejs.org/))
- **pnpm**: Version 8 or newer ([Installation guide](https://pnpm.io/installation))
- **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)

### Installation

Follow these steps to set up the project locally:

#### 1. Clone the Repository

```bash
git clone https://github.com/profullstack/unyunddit.git
cd unyunddit
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit the `.env` file with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_DB_PASSWORD=your-database-password

# JWT Configuration
JWT_SECRET=your-secret-key-here

# Port Configuration (optional)
PORT=8000
NGINX_PORT=8080

# Post Deletion Configuration (optional)
DELETE_FREQUENCY=72
```

> **💡 Tip**: You can find your Supabase credentials in your project's API settings at [app.supabase.com](https://app.supabase.com).

#### 4. Initialize the Database

Run the database migrations to set up the required tables:

```bash
pnpm run db:reset
```

#### 5. Start the Development Server

```bash
pnpm run dev
```

Your application will be available at `http://localhost:5173`

## 📊 Database Schema

The application uses three main tables for data management:

### Posts Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `title` | VARCHAR(300) | Post title |
| `content` | TEXT(10,000) | Post text content (optional) |
| `url` | VARCHAR(2,000) | External link (optional) |
| `upvotes` | INTEGER | Number of upvotes |
| `downvotes` | INTEGER | Number of downvotes |
| `comment_count` | INTEGER | Total number of comments |
| `created_at` | TIMESTAMP | Creation timestamp |
| `expires_at` | TIMESTAMP | Expiration timestamp (72 hours) |

### Comments Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `post_id` | UUID | Reference to parent post |
| `parent_id` | UUID | Reference to parent comment (for nesting) |
| `content` | TEXT(5,000) | Comment text content |
| `upvotes` | INTEGER | Number of upvotes |
| `downvotes` | INTEGER | Number of downvotes |
| `depth` | INTEGER | Nesting level (maximum 10) |
| `created_at` | TIMESTAMP | Creation timestamp |
| `expires_at` | TIMESTAMP | Expiration timestamp (72 hours) |

### Votes Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `ip_hash` | VARCHAR(64) | SHA256 hash of voter's IP address |
| `post_id` | UUID | Reference to voted post (nullable) |
| `comment_id` | UUID | Reference to voted comment (nullable) |
| `vote_type` | ENUM | Vote type ('up' or 'down') |
| `created_at` | TIMESTAMP | Creation timestamp |
| `expires_at` | TIMESTAMP | Expiration timestamp (72 hours) |

## 🔐 Security Features

### Privacy Protection

- **No Personal Data**: Zero user accounts or personal data collection
- **IP Hashing**: IP addresses are hashed using SHA256 for anonymous voting
- **Strict CSP**: Content Security Policy blocks all client-side JavaScript
- **No Referrer Leaks**: Referrer headers are not sent to external sites
- **Anonymous Server**: Server identification headers are removed

### Tor Network Optimization

- **Pure SSR**: Server-side rendering only, no client-side JavaScript
- **Minimal Dependencies**: Reduced external dependencies for faster loading
- **Privacy Headers**: HTTP headers configured for maximum privacy
- **No Tracking**: Absolutely no analytics, cookies, or tracking mechanisms

### Automatic Cleanup

- **Time-Based Deletion**: All content automatically expires after 72 hours
- **Automated Process**: PostgreSQL cron jobs handle cleanup automatically
- **Cascading Deletes**: Related data (votes, comments) are properly cleaned up
- **Configurable**: Deletion frequency can be adjusted via environment variables

## 🔗 API Endpoints

### Pages

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Home page with posts sorted by score |
| `/new` | GET | New posts sorted by creation time |
| `/popular` | GET | Popular posts with high activity |
| `/submit` | GET | Post submission form |
| `/post/[id]` | GET | Individual post with comments thread |

### Actions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/?/upvote` | POST | Upvote a post on home page |
| `/?/downvote` | POST | Downvote a post on home page |
| `/submit?/submit` | POST | Create a new post |
| `/post/[id]?/comment` | POST | Add comment to a post |
| `/post/[id]?/upvoteComment` | POST | Upvote a specific comment |
| `/post/[id]?/downvoteComment` | POST | Downvote a specific comment |

> **📝 Note**: All actions use SvelteKit's form actions for server-side processing without JavaScript.

## 💻 Development

### Project Structure

```
src/
├── lib/                     # Shared utilities and components
│   ├── supabase.js         # Database client configuration
│   ├── auth.js             # Authentication utilities
│   ├── categories.js       # Category management
│   ├── posts.js           # Post-related functions
│   ├── voting.js          # Voting system logic
│   ├── sanitize.js        # Content sanitization
│   └── components/        # Reusable Svelte components
├── routes/                 # SvelteKit pages and API routes
│   ├── +layout.svelte     # Base layout template
│   ├── +page.svelte       # Home page component
│   ├── +page.server.js    # Home page server logic
│   ├── new/               # New posts page
│   ├── popular/           # Popular posts page
│   ├── submit/            # Post submission page
│   ├── post/[id]/         # Individual post pages
│   └── api/               # API endpoints
├── hooks.server.js         # Global server hooks (security headers)
├── app.html               # HTML document template
└── app.d.ts               # TypeScript definitions
```

### Available Commands

#### Development
```bash
pnpm run dev              # Start development server with hot reload
pnpm run build            # Build application for production
pnpm run preview          # Preview production build locally
pnpm run start            # Start production server
```

#### Code Quality
```bash
pnpm run test             # Run test suite
pnpm run test:run         # Run tests once (no watch mode)
pnpm run test:ui          # Run tests with UI interface
pnpm run test:coverage    # Generate test coverage report
pnpm run lint             # Check code for linting errors
pnpm run lint:fix         # Fix automatically fixable linting errors
pnpm run format           # Format code using Prettier
pnpm run format:check     # Check code formatting
```

#### Database Management
```bash
pnpm run db:reset         # Reset database and run all migrations
pnpm run db:migrate       # Create a new database migration
```

#### Docker Operations
```bash
pnpm run docker:build     # Build Docker image
pnpm run docker:up        # Start services with Docker Compose
pnpm run docker:down      # Stop Docker Compose services
```

#### Deployment
```bash
pnpm run deploy:railway        # Deploy to Railway platform
pnpm run deploy:digitalocean   # Deploy to DigitalOcean
```

## 🚢 Deployment

Choose your preferred deployment method below:

### Docker Deployment

The easiest way to deploy is using Docker:

#### Build and Run Locally
```bash
# Build the Docker image
docker build -t unyunddit .

# Run the container
docker run -p 8000:8000 --env-file .env unyunddit
```

#### Using Docker Compose
```bash
# Start all services
pnpm run docker:up

# Stop all services
pnpm run docker:down
```

### Railway Platform

Railway offers simple deployment with automatic builds:

#### Prerequisites
- Railway account ([railway.app](https://railway.app))
- Railway CLI installed

#### Deploy
```bash
# Automated deployment script
pnpm run deploy:railway

# Or manually
railway login
railway link
railway up
```

### DigitalOcean

Deploy to a DigitalOcean droplet for full control:

#### Prerequisites
- DigitalOcean account
- DigitalOcean CLI (`doctl`) installed and configured

#### Deploy
```bash
# Automated deployment script
pnpm run deploy:digitalocean

# Or create droplet manually
pnpm run droplet:create
```

### Environment Variables for Production

Ensure these environment variables are set in your production environment:

```env
# Required
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key

# Optional
PORT=8000
DELETE_FREQUENCY=72
NODE_ENV=production
```

> **⚠️ Security Note**: Never commit your `.env` file to version control. Use your platform's environment variable settings for production deployments.

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_URL` | Yes | Your Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (public) | `eyJ0eXAiOiJKV1QiLCJhbGciOiJI...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (private) | `eyJ0eXAiOiJKV1QiLCJhbGciOiJI...` |
| `SUPABASE_DB_PASSWORD` | Yes | Database password | `your-secure-password` |
| `JWT_SECRET` | Yes | JWT signing secret | `your-jwt-secret-key` |
| `PORT` | No | Server port (default: 8000) | `8000` |
| `NGINX_PORT` | No | Nginx port (default: 8080) | `8080` |
| `DELETE_FREQUENCY` | No | Hours before content deletion (default: 72) | `72` |

### Security Headers

The application automatically sets strict security headers via `hooks.server.js`:

| Header | Value | Purpose |
|--------|-------|---------|
| **Content-Security-Policy** | `default-src 'self'; script-src 'none'` | Blocks all JavaScript execution |
| **Referrer-Policy** | `no-referrer` | Prevents referrer information leakage |
| **X-Frame-Options** | `DENY` | Prevents clickjacking attacks |
| **X-Content-Type-Options** | `nosniff` | Prevents MIME type sniffing |
| **Permissions-Policy** | `geolocation=(), camera=(), microphone=()` | Blocks hardware access |

> **🔒 Privacy Focus**: These headers ensure maximum privacy and security for Tor users.

## 🤝 Contributing

We welcome contributions to improve Unyunddit! Here's how you can help:

### Contribution Guidelines

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/profullstack/unyunddit.git
   cd unyunddit
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes
   git checkout -b fix/bug-description
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Run Quality Checks**
   ```bash
   # Run tests
   pnpm run test

   # Check linting
   pnpm run lint

   # Check formatting
   pnpm run format:check

   # Verify build works
   pnpm run build
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   # Follow conventional commits: feat:, fix:, docs:, etc.
   ```

6. **Submit a Pull Request**
   - Push to your fork
   - Create a pull request with a clear description
   - Link any related issues

### Areas for Contribution

- **Bug Fixes**: Help identify and fix issues
- **Documentation**: Improve guides and API documentation
- **UI/UX**: Enhance the user interface and experience
- **Security**: Strengthen privacy and security features
- **Performance**: Optimize loading times and efficiency
- **Accessibility**: Improve accessibility for all users

### Code Style

- Use **Prettier** for formatting
- Follow **ESLint** rules
- Write meaningful commit messages
- Add comments for complex logic
- Include tests for new features

### Need Help?

- Check existing [issues](https://github.com/profullstack/unyunddit/issues)
- Join discussions in pull requests
- Create an issue if you're unsure about something

## 📄 License

This project is licensed under the **WTFPL License** - see the [LICENSE](LICENSE) file for details.

> **What is WTFPL?** The "Do What The F*ck You Want To Public License" is a very permissive license that allows you to do anything with this code.

## 🔒 Privacy Notice

Unyunddit is designed with privacy as the top priority:

### Data Collection
- **No Personal Data**: Zero collection or storage of personal information
- **No User Accounts**: No registration or login required
- **No Cookies**: No tracking cookies or persistent storage
- **No Analytics**: No Google Analytics, tracking pixels, or metrics collection

### IP Address Handling
- **Hashed Only**: IP addresses are SHA256 hashed for voting prevention
- **Temporary**: Hashed IPs are deleted after 72 hours
- **Never Stored**: Raw IP addresses are never stored in the database

### Tor Network Ready
- **Optimized**: Built specifically for .onion sites
- **No JavaScript**: Server-side rendering eliminates JS fingerprinting
- **Privacy Headers**: HTTP headers configured for maximum anonymity

## 💬 Support

Need help or found a bug? Here's how to get support:

### Bug Reports
- Create an issue on [GitHub Issues](https://github.com/profullstack/unyunddit/issues)
- Include steps to reproduce
- Mention your browser and operating system

### Feature Requests
- Check [existing issues](https://github.com/profullstack/unyunddit/issues) first
- Describe the feature and its benefits
- Consider contributing the feature yourself!

### Documentation
- Check this README for common questions
- Look at the [Deployment Guide](DEPLOYMENT.md) for deployment help
- Review code comments for technical details

### Security Issues
- For security vulnerabilities, create a private issue
- Do not publicly disclose security issues
- We'll respond as quickly as possible

---

<div align="center">

**Built for Privacy • Designed for Anonymity • Optimized for Tor**

*Made with love by the privacy-conscious community*

</div>


