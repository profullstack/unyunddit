# Multi-stage Docker build for onion-ssr-boilerplate
# Optimized for Railway and Digital Ocean deployment with Tor hidden service

# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code (excluding .env files for security)
COPY . .
RUN rm -f .env .env.local .env.production

# Set build-time environment variables
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG SUPABASE_DB_PASSWORD
ARG SUPABASE_JWT_SECRET

ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV SUPABASE_DB_PASSWORD=$SUPABASE_DB_PASSWORD
ENV SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner

# Install pnpm, tor, and netcat for proxy testing
RUN apk add --no-cache tor netcat-openbsd && \
    npm install -g pnpm

WORKDIR /app

# Copy built application
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --prod --no-frozen-lockfile

# Copy tor configuration
COPY docker/torrc /etc/tor/torrc

# Create tor data directory and log directory
RUN mkdir -p /var/lib/tor/hidden_service && \
    mkdir -p /var/log/tor && \
    chown -R tor:tor /var/lib/tor && \
    chown -R tor:tor /var/log/tor

# Copy and set up start script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Expose port (Railway uses PORT env var, defaults to 3000)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD nc -z 127.0.0.1 ${PORT:-3000} || exit 1

# Start the application with Tor
CMD ["/start.sh"]