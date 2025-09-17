FROM node:24-alpine as build

WORKDIR /app

# Accept build arguments for React environment variables
ARG REACT_APP_API_URL=/api
ARG NODE_ENV=production

# Set them as environment variables for the build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=$NODE_ENV

COPY package*.json ./

RUN npm install

COPY . .

# Build will now have access to REACT_APP_API_URL
RUN npm run build

FROM nginx:alpine

# Install envsubst for environment variable substitution and curl for health checks
RUN apk add --no-cache gettext curl

COPY --from=build /app/build /usr/share/nginx/html

# Frontend version is now handled via self-registration to backend

# Copy nginx template
COPY nginx/nginx.conf.template /etc/nginx/templates/default.conf.template

# Default environment variables (will be overridden by Docker Compose)
ENV BACKEND_HOST=figure-collector-backend
ENV BACKEND_PORT=5050
ENV FRONTEND_PORT=5051

# EXPOSE will be handled by Docker Compose port mapping

# Use nginx's built-in template substitution
CMD ["nginx", "-g", "daemon off;"]
