#!/bin/sh
set -e

# Default values
: ${BACKEND_HOST:=backend}
: ${BACKEND_PORT:=5050}
: ${FRONTEND_PORT:=3000}

echo "Starting Frontend with configuration:"
echo "  BACKEND_HOST: ${BACKEND_HOST}"
echo "  BACKEND_PORT: ${BACKEND_PORT}"
echo "  FRONTEND_PORT: ${FRONTEND_PORT}"

# Process the nginx template with environment variables
echo "Processing nginx configuration template..."
envsubst '${BACKEND_HOST} ${BACKEND_PORT} ${FRONTEND_PORT}' \
    < /etc/nginx/templates/nginx.conf.template \
    > /etc/nginx/nginx.conf

echo "Nginx configuration processed successfully"

# Start nginx
exec nginx -g 'daemon off;'