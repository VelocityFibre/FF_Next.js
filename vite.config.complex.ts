import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh for better development experience
      fastRefresh: true,
      // Optimize JSX runtime for better performance
      jsxRuntime: 'automatic',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'FibreFlow',
        short_name: 'FibreFlow',
        description: 'Fiber Network Project Management System',
        theme_color: '#FF7F00',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,json,txt}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/pages': resolve(__dirname, 'src/pages'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/assets': resolve(__dirname, 'src/assets'),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    hmr: {
      overlay: true,
      port: 24678, // Different port for HMR
    },
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
    cors: true,
    // Performance optimizations for development
    middlewareMode: false,
    fs: {
      strict: true,
    },
  },
  css: {
    postcss: './postcss.config.js',
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    chunkSizeWarningLimit: 300, // Lower limit to catch issues earlier
    cssCodeSplit: true,
    minify: 'esbuild',
    reportCompressedSize: false, // Faster builds
    // Skip type checking during build to avoid blocking deployment
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (assetInfo.name?.match(/\.(png|jpe?g|gif|svg|webp)$/)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (assetInfo.name?.match(/\.(woff2?|eot|ttf|otf)$/)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
  },
  optimizeDeps: {
    include: [
      // Critical path dependencies only
      'react', 
      'react-dom', 
      'react-router-dom',
      'clsx',
      'tailwind-merge',
      'date-fns',
      'axios'
    ],
    exclude: [
      '@vite/client', 
      '@vite/env',
      // Large optional dependencies - load dynamically
      'xlsx',
      'papaparse',
      'recharts',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion',
      'lucide-react',
      // State management - load when needed
      '@tanstack/react-query', 
      'zustand',
      // Firebase - load dynamically
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      // Database - load when needed
      'drizzle-orm',
      '@neondatabase/serverless'
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  esbuild: {
    target: 'esnext',
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    ignoreAnnotations: false,
  },
  // Performance monitoring
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    __PERFORMANCE_MONITORING__: JSON.stringify(true),
  },
})