/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Basic configuration only
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Basic image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;