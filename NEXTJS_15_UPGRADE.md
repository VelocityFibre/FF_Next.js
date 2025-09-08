# Next.js 15 Upgrade & Optimization Guide

## ✅ Completed Optimizations

### 1. **Upgraded to Next.js 15**
- Updated package.json to use Next.js 15
- Enabled Turbopack for development (`npm run dev` now uses --turbo flag)
- Added Turbopack build option (`npm run build:turbo`)

### 2. **Created TypeScript Config (next.config.ts)**
- Migrated from next.config.mjs to next.config.ts for better type safety
- Enabled React Compiler for automatic optimizations
- Configured Partial Prerendering (PPR) in incremental mode
- Added Web Vitals attribution for all metrics
- Improved security headers with CSP
- Optimized image configuration with AVIF support
- Added bundle analyzer integration

### 3. **Updated TypeScript Configuration**
- Changed target to ES2020 for better performance
- Updated moduleResolution to "bundler" (Next.js 15 recommended)
- Added stricter type checking options
- Configured incremental builds with proper cache location

### 4. **Added Performance Monitoring**
- Created lib/performance.ts for Web Vitals tracking
- Integrated with _app.tsx for automatic reporting
- Added thresholds for Core Web Vitals

## 📋 Next Steps

### Install Dependencies
```bash
npm install
```

### Development with Turbopack
```bash
npm run dev
```
Your dev server will now use Turbopack, providing up to 45% faster initial route compile times.

### Production Build
```bash
npm run build
```

### Analyze Bundle Size
```bash
npm run analyze:bundle
```

## 🚀 New Features Available

### 1. **Partial Prerendering (PPR)**
To enable PPR for a specific route, add to your page:
```typescript
export const experimental_ppr = true
```

### 2. **React Compiler**
Automatically enabled - reduces need for useMemo/useCallback

### 3. **After API**
Use for background tasks after response:
```typescript
import { after } from 'next/server'

export async function GET() {
  const response = NextResponse.json({ data: 'success' })
  
  after(() => {
    // Background task runs after response sent
    console.log('Response sent, doing cleanup')
  })
  
  return response
}
```

### 4. **Enhanced Forms**
Use next/form for client-side navigation with forms:
```typescript
import Form from 'next/form'

<Form action="/search">
  <input name="query" />
  <button type="submit">Search</button>
</Form>
```

## 🎯 Performance Best Practices

1. **Use Server Components by default** - Only use Client Components when needed
2. **Leverage Static Generation** - Next.js 15 optimizes this automatically
3. **Monitor Web Vitals** - Check console in dev mode for metrics
4. **Use Dynamic Imports** - For code splitting non-critical components
5. **Optimize Images** - Always use next/image component

## 🔍 Monitoring

Web Vitals are automatically tracked and logged in development. In production, they can be sent to your analytics service by configuring the NEXT_PUBLIC_ANALYTICS_URL environment variable.

## ⚠️ Breaking Changes

1. **Caching defaults changed** - Fetch requests and Route Handlers are no longer cached by default
2. **React 19 RC** - Some third-party libraries may need updates
3. **Minimum Node.js 18.17** required

## 🐛 Troubleshooting

If you encounter issues:
1. Clear .next folder: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check for React 19 compatibility in dependencies

## 📚 Resources

- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
- [Turbopack Documentation](https://turbo.build/pack)
- [Partial Prerendering Guide](https://nextjs.org/docs/app/getting-started/partial-prerendering)
- [React Compiler](https://react.dev/learn/react-compiler)