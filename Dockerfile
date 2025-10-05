# Multi-stage Dockerfile for Figure Collector Frontend
# Supports: base, development, test, builder, production stages
# Security patch: CVE-2025-9900 (libtiff) via Ubuntu 22.04 latest packages

# ============================================================================
# BASE STAGE - Ubuntu 22.04 with Node.js and security patches
# ============================================================================
FROM ubuntu:22.04 as base

# Update all packages including libtiff5 security patch (CVE-2025-9900)
# Target: libtiff5 4.3.0-6ubuntu0.11 → 4.3.0-6ubuntu0.12
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y \
    curl \
    xz-utils \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install Node.js 24 using official binaries (avoids package manager CVEs)
RUN NODE_VERSION=v24.8.0 \
    && curl -fsSLO https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz \
    && tar -xJf node-${NODE_VERSION}-linux-x64.tar.xz -C /usr/local --strip-components=1 \
    && rm node-${NODE_VERSION}-linux-x64.tar.xz

WORKDIR /app

# ============================================================================
# DEVELOPMENT STAGE - For local development with hot reload
# ============================================================================
FROM base as development

# Copy package files
COPY package*.json ./

# Install all dependencies including dev dependencies
RUN npm install --no-audit --no-fund

# Copy source code
COPY . .

# Accept build arguments for React environment variables
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=development

EXPOSE 3000

# Health check using Node.js with explicit timeout handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const req = require('http').get('http://localhost:3000', { timeout: 5000 }, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('timeout', () => { req.destroy(); process.exit(1); }); req.on('error', () => process.exit(1));"

CMD ["npm", "start"]

# ============================================================================
# TEST STAGE - For running tests in CI/CD
# ============================================================================
FROM base as test

# Install bash for test scripts
RUN apt-get update && apt-get install -y bash \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy package files
COPY package*.json ./

# Install all dependencies including test dependencies
RUN npm install --no-audit --no-fund

# Copy source code and tests
COPY . .

# Ensure test output directory exists
RUN mkdir -p /app/test-output

# Default to running tests
CMD ["npm", "test", "--", "--watchAll=false", "--coverage"]

# ============================================================================
# BUILDER STAGE - Build optimized production bundle
# ============================================================================
FROM base as builder

# Copy package files
COPY package*.json ./

# Install dependencies without NODE_ENV=production to ensure all packages are installed
RUN npm install --no-audit --no-fund

# Copy source code
COPY . .

# Accept build arguments for React environment variables
ARG REACT_APP_API_URL=/api
ARG NODE_ENV=production
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=$NODE_ENV

# Build React app
RUN npm run build

# ============================================================================
# PRODUCTION STAGE - Nginx server with built React app
# ============================================================================
FROM ubuntu:22.04 as production

# Build arguments for OCI labels
ARG GITHUB_ORG=rpgoldberg
ARG GITHUB_REPO=figure-collector-frontend

# Add OCI labels
LABEL org.opencontainers.image.title="Figure Collector Frontend"
LABEL org.opencontainers.image.description="React frontend for Figure Collector"
LABEL org.opencontainers.image.vendor="Figure Collector Services"
LABEL org.opencontainers.image.source="https://github.com/${GITHUB_ORG}/${GITHUB_REPO}"

# Update all packages including libtiff5 security patch (CVE-2025-9900)
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y \
    nginx \
    gettext-base \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install Node.js for health check
RUN NODE_VERSION=v24.8.0 \
    && curl -fsSLO https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz \
    && tar -xJf node-${NODE_VERSION}-linux-x64.tar.xz -C /usr/local --strip-components=1 \
    && rm node-${NODE_VERSION}-linux-x64.tar.xz

# Create nginx user and set up directories
RUN useradd --system --no-create-home --shell /bin/false nginx \
    && mkdir -p /var/cache/nginx /var/log/nginx /etc/nginx/templates /etc/nginx/conf.d \
    && mkdir -p /var/lib/nginx/body /var/lib/nginx/proxy /var/lib/nginx/fastcgi \
    && mkdir -p /var/lib/nginx/uwsgi /var/lib/nginx/scgi /run/nginx \
    && chown -R nginx:nginx /var/cache/nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx \
    && chown -R nginx:nginx /usr/share/nginx \
    && chown -R nginx:nginx /var/lib/nginx \
    && chown -R nginx:nginx /run/nginx

# Copy built React app from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx template
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Configure nginx to not use user directive (we're already running as nginx user)
RUN sed -i '/^user /d' /etc/nginx/nginx.conf \
    && sed -i '/^pid /d' /etc/nginx/nginx.conf

# Create startup script to process templates
RUN echo '#!/bin/bash\n\
envsubst '\''$BACKEND_HOST $BACKEND_PORT $FRONTEND_PORT'\'' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf\n\
exec nginx -g "daemon off; pid /run/nginx/nginx.pid;"' > /usr/local/bin/start-nginx.sh \
    && chmod +x /usr/local/bin/start-nginx.sh \
    && chown nginx:nginx /usr/local/bin/start-nginx.sh

# Switch to nginx user for security
USER nginx

# Default environment variables (will be overridden by Docker Compose)
ENV BACKEND_HOST=figure-collector-backend
ENV BACKEND_PORT=5050
ENV FRONTEND_PORT=5051

EXPOSE 80

# Health check using Node.js with explicit timeout handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const req = require('http').get('http://localhost:80', { timeout: 5000 }, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('timeout', () => { req.destroy(); process.exit(1); }); req.on('error', () => process.exit(1));"

# Use custom startup script for template substitution
CMD ["/usr/local/bin/start-nginx.sh"]
