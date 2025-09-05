#!/bin/bash
# Simple script to start Next.js with our demo app

echo "Starting Next.js application..."
echo "================================"

# Use the Next.js binary directly
exec node node_modules/next/dist/bin/next dev --port 3000