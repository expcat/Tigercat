#!/bin/bash

# Environment Check Script for Tigercat Development
# This script checks if your development environment meets the requirements

set -e

echo "🐯 Tigercat Development Environment Check"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check version
check_version() {
    local name=$1
    local current=$2
    local required=$3
    
    if [ -z "$current" ]; then
        echo -e "${RED}✗${NC} $name is not installed"
        return 1
    fi
    
    # Simple version comparison (assumes semver format)
    local current_major=$(echo $current | cut -d. -f1)
    local required_major=$(echo $required | cut -d. -f1)
    
    if [ "$current_major" -ge "$required_major" ]; then
        echo -e "${GREEN}✓${NC} $name: $current (required: >= $required)"
        return 0
    else
        echo -e "${RED}✗${NC} $name: $current (required: >= $required)"
        return 1
    fi
}

# Extract major version from a semver/range string (e.g. "^19.2.3" -> "19")
extract_major() {
    local version_range=$1
    echo "$version_range" | sed -E 's/[^0-9]*([0-9]+).*/\1/'
}

# Track overall status
has_errors=0

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    if ! check_version "Node.js" "$NODE_VERSION" "18.0.0"; then
        has_errors=1
    fi
else
    echo -e "${RED}✗${NC} Node.js is not installed"
    has_errors=1
fi
echo ""

# Check pnpm
echo "Checking pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    if ! check_version "pnpm" "$PNPM_VERSION" "8.0.0"; then
        has_errors=1
    fi
else
    echo -e "${RED}✗${NC} pnpm is not installed"
    echo -e "${YELLOW}ℹ${NC} Install pnpm: npm install -g pnpm@10"
    has_errors=1
fi
echo ""

# Check if node_modules exists
echo "Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies are installed"
else
    echo -e "${YELLOW}⚠${NC} Dependencies are not installed"
    echo -e "${YELLOW}ℹ${NC} Run: pnpm install"
    has_errors=1
fi
echo ""

# Check framework versions (React / Vue)
echo "Checking framework versions..."
if [ -d "node_modules" ]; then
    REACT_REQUIRED=$(node -e "const p=require('./package.json'); process.stdout.write(p.devDependencies?.react ?? '')" 2>/dev/null)
    VUE_REQUIRED=$(node -e "const p=require('./package.json'); process.stdout.write(p.devDependencies?.vue ?? '')" 2>/dev/null)

    if node -e "require.resolve('react/package.json')" &> /dev/null; then
        REACT_VERSION=$(node -e "process.stdout.write(require('react/package.json').version)" 2>/dev/null)
        REACT_REQUIRED_MAJOR=$(extract_major "$REACT_REQUIRED")
        if ! check_version "react" "$REACT_VERSION" "${REACT_REQUIRED_MAJOR}.0.0"; then
            echo -e "${YELLOW}ℹ${NC} Declared range: ${REACT_REQUIRED}"
            has_errors=1
        else
            echo -e "${YELLOW}ℹ${NC} Declared range: ${REACT_REQUIRED}"
        fi
    else
        echo -e "${RED}✗${NC} react is not installed"
        echo -e "${YELLOW}ℹ${NC} Declared range: ${REACT_REQUIRED}"
        has_errors=1
    fi

    if node -e "require.resolve('vue/package.json')" &> /dev/null; then
        VUE_VERSION=$(node -e "process.stdout.write(require('vue/package.json').version)" 2>/dev/null)
        VUE_REQUIRED_MAJOR=$(extract_major "$VUE_REQUIRED")
        if ! check_version "vue" "$VUE_VERSION" "${VUE_REQUIRED_MAJOR}.0.0"; then
            echo -e "${YELLOW}ℹ${NC} Declared range: ${VUE_REQUIRED}"
            has_errors=1
        else
            echo -e "${YELLOW}ℹ${NC} Declared range: ${VUE_REQUIRED}"
        fi
    else
        echo -e "${RED}✗${NC} vue is not installed"
        echo -e "${YELLOW}ℹ${NC} Declared range: ${VUE_REQUIRED}"
        has_errors=1
    fi
else
    echo -e "${YELLOW}⚠${NC} Dependencies are not installed; skipping React/Vue version check"
fi
echo ""

# Check if packages are built
echo "Checking build artifacts..."
if [ -f "packages/core/dist/index.js" ] && [ -f "packages/vue/dist/index.js" ] && [ -f "packages/react/dist/index.js" ]; then
    echo -e "${GREEN}✓${NC} All packages are built"
else
    echo -e "${YELLOW}⚠${NC} Some packages are not built"
    echo -e "${YELLOW}ℹ${NC} Run: pnpm build"
    has_errors=1
fi
echo ""

# Summary
echo "=========================================="
if [ $has_errors -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Environment check passed! You're ready to develop."
    echo ""
    echo "Quick start commands:"
    echo "  pnpm test              # Run all tests"
    echo "  pnpm demo:vue          # Run Vue3 demo"
    echo "  pnpm demo:react        # Run React demo"
    echo "  pnpm dev               # Watch mode for all packages"
    exit 0
else
    echo -e "${RED}✗${NC} Environment check failed. Please install missing dependencies."
    exit 1
fi
