import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // React 19 and strict mode
  reactStrictMode: true,
  
  // Experimental features for Next.js 15
  experimental: {
    // Enable React Compiler for automatic optimizations
    reactCompiler: true,
    
    // Partial Prerendering - opt-in per route with export const experimental_ppr = true
    ppr: 'incremental',
    
    // After API for background tasks
    after: true,
    
    // Optimize CSS
    optimizeCss: true,
    
    // Web Vitals attribution
    webVitalsAttribution: ['CLS', 'LCP', 'INP', 'FCP', 'TTFB'],
    
    // Parallel routes
    parallelRoutes: true,
    
    // Server Actions size limit (default 1MB, increase if needed)
    serverActionsBodySizeLimit: '2mb',
  },
  
  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Turbopack configuration
  turbo: {
    // Rules for Turbopack if using build:turbo
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Bundle analyzer
  webpack: (config, { isServer }) => {
    // Bundle analyzer setup
    if (process.env.BUNDLE_ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : '../analyze/client.html',
          openAnalyzer: false,
        })
      )
    }
    
    return config
  },
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
  
  // Image optimization
  images: {
    domains: ['img.clerk.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Security headers with CSP
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Static assets caching
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // Redirects for common patterns
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
  
  // Output configuration
  output: 'standalone',
  
  // Ignore build errors in production (use with caution)
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // Module aliases already defined in tsconfig
  // No need to duplicate here
}

export default nextConfig