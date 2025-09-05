/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better dev experience
  reactStrictMode: true,
  
  // Environment variables available in the browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Optimize images from external sources if needed
  images: {
    domains: ['img.clerk.com'],
  },
  
  // Handle API routes properly
  async rewrites() {
    return [
      // Optional: keep legacy /api/* pattern if migrating from Vercel Functions
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;