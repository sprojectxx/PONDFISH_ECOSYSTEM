# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma client generation
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for building TypeScript)
RUN npm ci

# Copy backend source files
COPY src ./src

# Generate Prisma Client & compile TypeScript to dist
RUN npx prisma generate
RUN npm run build

# Prune devDependencies for production runtime
RUN npm prune --production

# Stage 2: Runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install OpenSSL, CA certificates, and wget for healthchecks
RUN apk add --no-cache openssl ca-certificates wget

# Set NODE_ENV to production
ENV NODE_ENV=production
ENV PORT=5000

# Copy compiled files, node_modules, package.json, and prisma schema from builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Use non-root node user for container security
USER node

EXPOSE 5000

# Production Healthcheck against real DB SELECT 1 /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start backend server
CMD ["node", "dist/server.js"]
