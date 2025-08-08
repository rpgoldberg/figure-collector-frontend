FROM node:24-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

COPY --from=build /app/build /usr/share/nginx/html

# Create frontend version.json from package.json
COPY --from=build /app/package.json /tmp/package.json
RUN echo "{\"name\":\"$(cat /tmp/package.json | grep '\"name\"' | cut -d'"' -f4)\",\"version\":\"$(cat /tmp/package.json | grep '\"version\"' | cut -d'"' -f4)\"}" > /usr/share/nginx/html/frontend-version.json

# Copy nginx template
COPY nginx/nginx.conf.template /etc/nginx/templates/default.conf.template

# Set default environment variables
ENV BACKEND_HOST=figure-collector-backend
ENV BACKEND_PORT=5050
ENV FRONTEND_PORT=5051

EXPOSE ${FRONTEND_PORT}

# Use nginx's built-in template substitution
CMD ["nginx", "-g", "daemon off;"]
