# syntax=docker/dockerfile:1.6

# ─── Stage 1: Dependencies ────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ─── Stage 2: Build ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables (Vite inlines VITE_* at build time)
ARG VITE_SERVER_URL=http://localhost:3001
ENV VITE_SERVER_URL=${VITE_SERVER_URL}

RUN npm run build

# ─── Stage 3: Serve via nginx ─────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]