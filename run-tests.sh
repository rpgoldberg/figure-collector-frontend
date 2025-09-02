#!/bin/bash
# WSL Path Fix Script for React Testing Library
# This script bypasses UNC path issues when running tests in WSL

# Force proper working directory and ensure we're using WSL native tools
cd "$(dirname "$0")"
export CURRENT_DIR="$(pwd)"

# Set environment variables to force Node.js path resolution
export NODE_PATH="$CURRENT_DIR/node_modules"
export PWD="$CURRENT_DIR"

# Force npm to use WSL paths and avoid Windows path conflicts
export npm_config_cache="$CURRENT_DIR/.npm-cache"
export npm_config_prefix="$CURRENT_DIR/.npm-global"
export npm_config_fund=false
export npm_config_audit=false

# Set React Scripts specific environment variables
export BROWSER=none
export CI=true

echo "Current directory: $CURRENT_DIR"
echo "Installing dependencies with proper path resolution..."

# Check if node_modules exists and install if needed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/react-scripts" ]; then
    echo "Installing dependencies..."
    npm install --ignore-scripts
    npm rebuild --ignore-scripts || true
fi

# Install missing Jest dependencies specifically for React Scripts
if [ ! -d "node_modules/jest-config" ]; then
    echo "Installing missing jest-config..."
    npm install jest-config --ignore-scripts
fi

# Try different ways to run tests
if [ -f "node_modules/.bin/react-scripts" ]; then
    echo "Running tests with react-scripts..."
    chmod +x node_modules/.bin/react-scripts || true
    node_modules/.bin/react-scripts test --watchAll=false "$@"
else
    echo "Error: react-scripts not found. Dependencies may not be properly installed."
    exit 1
fi
