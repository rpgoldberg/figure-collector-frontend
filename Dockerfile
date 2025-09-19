# Build stage using Ubuntu 22.04 with official Node.js binaries
FROM ubuntu:22.04 as build

# Install Node.js 24 using official binaries (avoids package manager CVEs)
RUN apt-get update && apt-get install -y \
    curl \
    xz-utils \
    && NODE_VERSION=v24.8.0 \
    && curl -fsSLO https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz \
    && tar -xJf node-${NODE_VERSION}-linux-x64.tar.xz -C /usr/local --strip-components=1 \
    && rm node-${NODE_VERSION}-linux-x64.tar.xz \
    && apt-get remove -y curl xz-utils \
    && apt-get autoremove -y --purge \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Accept build arguments for React environment variables
ARG REACT_APP_API_URL=/api

COPY package*.json ./

# Install dependencies without NODE_ENV=production to ensure all packages are installed
RUN npm install --no-audit --no-fund

COPY . .

# Set environment variables for the build
ARG NODE_ENV=production
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=$NODE_ENV

# Build will now have access to REACT_APP_API_URL
RUN npm run build

# Runtime stage using nginx unprivileged for better security
FROM nginxinc/nginx-unprivileged:1.29.1-alpine3.22

# Switch to root to install packages
USER root

# Install gettext for envsubst (Alpine version)
RUN apk add --no-cache gettext

# Switch back to nginx user for security
USER nginx

COPY --from=build /app/build /usr/share/nginx/html

# Frontend version is now handled via self-registration to backend

# Copy nginx template
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Default environment variables (will be overridden by Docker Compose)
ENV BACKEND_HOST=figure-collector-backend
ENV BACKEND_PORT=5050
ENV FRONTEND_PORT=5051

# EXPOSE will be handled by Docker Compose port mapping

# Use nginx's built-in template substitution
CMD ["nginx", "-g", "daemon off;"]
