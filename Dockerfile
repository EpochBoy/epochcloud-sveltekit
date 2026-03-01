# Build stage
FROM docker.io/library/node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build with version info
ARG VERSION=dev
ARG COMMIT=unknown
ARG BUILD_TIME=unknown

ENV PUBLIC_VERSION=${VERSION}
ENV PUBLIC_COMMIT=${COMMIT}
ENV PUBLIC_BUILD_TIME=${BUILD_TIME}

RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Runtime stage
FROM docker.io/library/node:22-alpine

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy built app and production dependencies
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Non-root user
RUN adduser -D -u 1000 appuser
USER appuser

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "build"]
