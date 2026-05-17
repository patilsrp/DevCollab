# syntax=docker/dockerfile:1.6

# ─── Stage 1: Dependencies ────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install only production dependencies (cached layer)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# ─── Stage 2: Build (for TypeScript compilation if used) ─────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
# Compile TypeScript if tsconfig exists, otherwise skip
RUN if [ -f tsconfig.json ]; then npm run build || true; fi

# ─── Stage 3: Production Runtime ──────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Install dumb-init for proper signal handling (PID 1 problem)
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001 -G nodejs

# Copy production dependencies and source
COPY --from=deps --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/src ./src
COPY --chown=nodeapp:nodejs package.json ./

# Create logs directory with correct ownership
RUN mkdir -p /app/logs && chown -R nodeapp:nodejs /app/logs

# Environment
ENV NODE_ENV=production
ENV PORT=3001

# Drop privileges
USER nodeapp

EXPOSE 3001

# Healthcheck (uses curl-free node check)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Use dumb-init as PID 1 for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]