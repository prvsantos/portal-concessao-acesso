# ============================================
# Multi-stage Dockerfile para Portal de Concessão de Acesso
# Ambiente: Produção
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

# Metadata
LABEL maintainer="Portal de Concessão de Acesso"
LABEL description="Sistema corporativo de gerenciamento de acessos"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production + dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# ============================================
# Stage 2: Production Runtime
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user (security best practice)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/wrangler.jsonc ./
COPY --from=builder --chown=nodejs:nodejs /app/migrations ./migrations
COPY --from=builder --chown=nodejs:nodejs /app/seed.sql ./

# Copy startup script
COPY --chown=nodejs:nodejs docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create data directory for D1 database
RUN mkdir -p /app/.wrangler/state/v3/d1 && \
    chown -R nodejs:nodejs /app/.wrangler

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/aplicacoes', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run application
CMD ["docker-entrypoint.sh"]
