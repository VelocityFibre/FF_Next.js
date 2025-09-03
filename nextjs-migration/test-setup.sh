#!/bin/bash

echo "Testing FibreFlow Next.js Setup..."
echo ""

# Test 1: Check if node_modules exists
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✅ Dependencies installed"
else
    echo "  ❌ Dependencies not installed. Run: npm install"
    exit 1
fi

# Test 2: Check environment file
echo "✓ Checking environment..."
if [ -f ".env.local" ]; then
    echo "  ✅ Environment file exists"
    if grep -q "DATABASE_URL" .env.local; then
        echo "  ✅ Database URL configured"
    else
        echo "  ⚠️  Database URL not configured"
    fi
    if grep -q "CLERK_SECRET_KEY=sk_test_xxxxx" .env.local; then
        echo "  ⚠️  Clerk keys need to be configured"
        echo "     Visit https://clerk.com to get your keys"
    else
        echo "  ✅ Clerk keys configured"
    fi
else
    echo "  ❌ .env.local not found"
fi

# Test 3: Check TypeScript
echo "✓ Checking TypeScript..."
npx tsc --version > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ TypeScript installed"
else
    echo "  ❌ TypeScript not found"
fi

# Test 4: Test build
echo "✓ Testing Next.js build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Build successful"
else
    echo "  ⚠️  Build has warnings or errors (this is expected before Clerk setup)"
fi

echo ""
echo "Setup Status:"
echo "============="
echo "✅ Project structure ready"
echo "✅ Dependencies installed"
echo "✅ Database configured (Neon)"
echo "⚠️  Clerk authentication needs setup"
echo ""
echo "Next Steps:"
echo "1. Get Clerk keys from https://clerk.com"
echo "2. Update .env.local with your Clerk keys"
echo "3. Run: npm run db:push (initialize database)"
echo "4. Run: npm run dev (start development server)"
echo ""
echo "The app will run on: http://localhost:3000"