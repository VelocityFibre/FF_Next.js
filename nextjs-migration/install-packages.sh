#!/bin/bash

echo "Installing FibreFlow Next.js packages..."
echo "This script will install packages one by one to avoid timeout issues"
echo ""

# Function to install a package
install_package() {
    echo "Installing $1..."
    npm install $1 --save $2 --legacy-peer-deps
    if [ $? -eq 0 ]; then
        echo "✅ $1 installed successfully"
    else
        echo "❌ Failed to install $1 - retrying..."
        npm install $1 --save $2 --legacy-peer-deps
    fi
    echo ""
}

# Core dependencies
echo "=== Installing Core Dependencies ==="
install_package "next@14.2.25"
install_package "react@18"
install_package "react-dom@18"

echo "=== Installing TypeScript ==="
install_package "typescript" "--save-dev"
install_package "@types/node" "--save-dev"
install_package "@types/react" "--save-dev"
install_package "@types/react-dom" "--save-dev"

echo "=== Installing Database Tools ==="
install_package "@neondatabase/serverless"
install_package "drizzle-orm"
install_package "drizzle-kit" "--save-dev"

echo "=== Installing Clerk Auth ==="
install_package "@clerk/nextjs"

echo "=== Installing State Management ==="
install_package "@tanstack/react-query"
install_package "zustand"

echo "=== Installing Form & Validation ==="
install_package "react-hook-form"
install_package "zod"

echo "=== Installing UI Dependencies ==="
install_package "recharts"
install_package "tailwindcss" "--save-dev"
install_package "autoprefixer" "--save-dev"
install_package "postcss" "--save-dev"

echo "=== Installing Dev Tools ==="
install_package "eslint" "--save-dev"
install_package "eslint-config-next" "--save-dev"

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Set up Clerk authentication keys in .env.local"
echo "2. Run: npm run db:push (to set up database)"
echo "3. Run: npm run dev (to start development server)"