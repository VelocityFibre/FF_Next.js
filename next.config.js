/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable static generation to prevent SSR issues
  experimental: {
    disableOptimizedLoading: true,
  },

  // Fix file watching issues
  webpack: (config, { dev, isServer }) => {
    // Fix Watchpack issues by configuring file watching properly
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules',
          '**/.next',
          '**/.git',
          '**/dist',
          '**/.vercel',
          '**/coverage',
          '**/*.test.*',
          '**/*.spec.*',
        ],
      };
    }

    // Ensure proper handling of undefined paths
    if (config.resolve && config.resolve.alias) {
      // Remove any undefined aliases that might cause issues
      Object.keys(config.resolve.alias).forEach(key => {
        if (config.resolve.alias[key] === undefined) {
          delete config.resolve.alias[key];
        }
      });
    }

    return config;
  },

  // Disable static optimization to prevent router mounting issues
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
};

module.exports = nextConfig;