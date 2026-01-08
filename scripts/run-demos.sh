#!/bin/bash

# Run both Vue3 and React demos simultaneously
# This script starts both demo servers in the background and manages them

set -e

echo "🐯 Starting Tigercat Demos"
echo "=========================="
echo ""

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "Error: pnpm is not installed"
    echo "Install it with: npm install -g pnpm"
    exit 1
fi

# Check if packages are built and up-to-date
NEED_BUILD=0

if [ ! -f "packages/core/dist/index.js" ] || [ ! -f "packages/react/dist/index.js" ] || [ ! -f "packages/vue/dist/index.js" ]; then
    NEED_BUILD=1
else
    # Rebuild if any source file is newer than its package dist entry
    if find packages/core/src -type f -newer packages/core/dist/index.js -print -quit | grep -q .; then
        NEED_BUILD=1
    fi
    if find packages/react/src -type f -newer packages/react/dist/index.js -print -quit | grep -q .; then
        NEED_BUILD=1
    fi
    if find packages/vue/src -type f -newer packages/vue/dist/index.js -print -quit | grep -q .; then
        NEED_BUILD=1
    fi
fi

if [ "$NEED_BUILD" -eq 1 ]; then
    echo "Packages are missing or outdated. Building now..."
    pnpm --filter @tigercat/core --filter @tigercat/react --filter @tigercat/vue build || {
        echo "Error: Build failed. Please fix build errors and try again."
        exit 1
    }
fi

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "Stopping demo servers..."
    if [ ! -z "$VUE_PID" ] && kill -0 $VUE_PID 2>/dev/null; then
        kill $VUE_PID 2>/dev/null || true
    fi
    if [ ! -z "$REACT_PID" ] && kill -0 $REACT_PID 2>/dev/null; then
        kill $REACT_PID 2>/dev/null || true
    fi
    exit 0
}

# Set up cleanup trap
trap cleanup INT TERM

# Start Vue3 demo
echo "Starting Vue3 demo on http://localhost:5173"
pnpm --filter @tigercat-demo/vue3 dev > /tmp/vue3-demo.log 2>&1 &
VUE_PID=$!

# Start React demo
echo "Starting React demo on http://localhost:5174"
pnpm --filter @tigercat-demo/react dev > /tmp/react-demo.log 2>&1 &
REACT_PID=$!

echo ""
echo "✓ Both demos are starting..."
echo ""
echo "  Vue3:  http://localhost:5173"
echo "  React: http://localhost:5174"
echo ""
echo "Logs:"
echo "  Vue3:  /tmp/vue3-demo.log"
echo "  React: /tmp/react-demo.log"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $VUE_PID $REACT_PID
