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
    // Temporarily disable watch options to avoid Watchpack issues
    // TODO: Re-enable when Next.js/watchpack compatibility is fixed

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