# Unyunddit - Anonymous Reddit Clone

A completely anonymous Reddit clone designed for the Tor network with automatic post deletion after 72 hours. Built with SvelteKit and Supabase, featuring server-side rendering only (no client-side JavaScript) for maximum privacy and security.

## Features

- **Complete Anonymity**: No user accounts, registration, or tracking
- **Auto-Deletion**: All posts and comments automatically delete after 72 hours
- **Tor-Optimized**: Designed specifically for .onion websites
- **Server-Side Only**: No client-side JavaScript for enhanced security
- **Anonymous Voting**: IP-based voting system with hashed IPs for privacy
- **Nested Comments**: Support for threaded discussions up to 10 levels deep
- **Security Headers**: Strict CSP and privacy-focused HTTP headers

## Tech Stack

- **Frontend**: SvelteKit (SSR-only mode)
- **Backend**: Node.js 20+ with ESM modules
- **Database**: Supabase (PostgreSQL)
- **Package Manager**: pnpm
- **Security**: Strict Content Security Policy, no client-side JS

## Quick Start

### Prerequisites

- Node.js 20 or newer
- pnpm 8 or newer
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd unyunddit
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Run database migrations:
```bash
pnpx supabase db reset
```

5. Start the development server:
```bash
pnpm run dev
```

## Database Schema

The application uses three main tables:

### Posts
- `id`: Unique identifier
- `title`: Post title (max 300 chars)
- `content`: Post text content (max 10,000 chars, optional)
- `url`: External link (max 2,000 chars, optional)
- `upvotes`/`downvotes`: Vote counts
- `comment_count`: Number of comments
- `created_at`/`expires_at`: Timestamps

### Comments
- `id`: Unique identifier
- `post_id`: Reference to parent post
- `parent_id`: Reference to parent comment (for nesting)
- `content`: Comment text (max 5,000 chars)
- `upvotes`/`downvotes`: Vote counts
- `depth`: Nesting level (max 10)
- `created_at`/`expires_at`: Timestamps

### Votes
- `id`: Unique identifier
- `ip_hash`: SHA256 hash of voter's IP address
- `post_id`/`comment_id`: Reference to voted item
- `vote_type`: 'up' or 'down'
- `created_at`/`expires_at`: Timestamps

## Security Features

### Privacy Protection
- No user accounts or personal data collection
- IP addresses are hashed with SHA256 for voting
- Strict Content Security Policy blocks all JavaScript
- No referrer headers sent to external sites
- Server identification headers removed

### Tor Network Optimization
- Server-side rendering only (no client-side JS)
- Minimal external dependencies
- Privacy-focused HTTP headers
- No tracking or analytics

### Automatic Cleanup
- Posts and comments auto-delete after 72 hours
- Automated cleanup via PostgreSQL cron jobs
- Cascading deletes for related data

## API Endpoints

### Pages
- `/` - Home page (posts sorted by score)
- `/new` - New posts (sorted by creation time)
- `/submit` - Submit new post
- `/post/[id]` - Individual post with comments

### Actions
- `POST /?/upvote` - Upvote a post
- `POST /?/downvote` - Downvote a post
- `POST /submit?/submit` - Create new post
- `POST /post/[id]?/comment` - Add comment
- `POST /post/[id]?/upvoteComment` - Upvote comment
- `POST /post/[id]?/downvoteComment` - Downvote comment

## Development

### Project Structure
```
src/
├── lib/
│   └── supabase.js          # Database client
├── routes/
│   ├── +layout.svelte       # Base layout
│   ├── +page.svelte         # Home page
│   ├── +page.server.js      # Home page logic
│   ├── new/                 # New posts page
│   ├── submit/              # Submit post page
│   └── post/[id]/           # Individual post page
├── hooks.server.js          # Security headers
└── app.html                 # HTML template
```

### Commands
```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run preview      # Preview production build
pnpm run test         # Run tests
pnpm run lint         # Lint code
pnpm run format       # Format code
```

### Database Management
```bash
pnpx supabase db reset                    # Reset database
pnpx supabase migrations new <name>       # Create new migration
pnpm run db:migrate                       # Create migration (alias)
```

## Deployment

### Docker
```bash
docker build -t unyunddit .
docker run -p 3000:3000 unyunddit
```

### Railway
```bash
pnpm run deploy:railway
```

### DigitalOcean
```bash
pnpm run deploy:digitalocean
```

## Configuration

### Environment Variables
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for admin operations)

### Security Headers
The application sets strict security headers via `hooks.server.js`:
- Content Security Policy (blocks all JavaScript)
- Referrer Policy (no-referrer)
- X-Frame-Options (DENY)
- X-Content-Type-Options (nosniff)
- Permissions Policy (blocks geolocation, camera, microphone)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the WTFPL License - see the [LICENSE](LICENSE) file for details.

## Privacy Notice

This application is designed for maximum privacy:
- No personal data is collected or stored
- IP addresses are only used for voting (hashed with SHA256)
- All content automatically deletes after 72 hours
- No tracking, analytics, or third-party services
- Designed for use on the Tor network

## Support

For issues and questions, please use the GitHub issue tracker.


