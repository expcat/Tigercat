#!/bin/bash

# Setup script for new developers
# This script will set up the entire development environment

set -e

echo "🐯 Tigercat Development Setup"
echo "=============================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js >= 18.0.0 from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
echo "✓ Node.js $NODE_VERSION detected"

# Check/Install pnpm
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm@10.26.2
    echo "✓ pnpm installed"
else
    PNPM_VERSION=$(pnpm --version)
    echo "✓ pnpm $PNPM_VERSION detected"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
pnpm install

# Build packages
echo ""
echo "Building packages..."
pnpm build

# Run environment check
echo ""
./scripts/check-env.sh

echo ""
echo "=============================="
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Read DEVELOPMENT.md for development guidelines"
echo "  2. Run 'pnpm test' to run all tests"
echo "  3. Run 'pnpm demo:vue' or 'pnpm demo:react' to see the demos"
echo "  4. Run 'pnpm dev' for watch mode during development"
echo ""
