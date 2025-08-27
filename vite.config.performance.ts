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
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    minify: 'esbuild',
    reportCompressedSize: false, // Faster builds
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // CSS and styling dependencies
          if (id.includes('node_modules/tailwindcss') || 
              id.includes('node_modules/autoprefixer') ||
              id.includes('node_modules/postcss')) {
            return 'styles';
          }
          
          // Core React dependencies and ALL React-dependent libraries in vendor chunk
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom') ||
              id.includes('node_modules/@tanstack/react-query') || 
              id.includes('node_modules/zustand') ||
              id.includes('node_modules/recharts') ||
              id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/@mui') || 
              id.includes('node_modules/@emotion') || 
              id.includes('node_modules/framer-motion')) {
            return 'vendor';
          }
          
          // All context files and React hooks must be in vendor chunk to ensure React is available
          if (id.includes('src/contexts/') || 
              id.includes('Context.tsx') || 
              id.includes('context/') ||
              id.includes('/context.tsx') ||
              id.includes('src/hooks/') ||
              id.includes('src/components/ui/') ||
              id.includes('useState') ||
              id.includes('useEffect') ||
              id.includes('forwardRef')) {
            return 'vendor';
          }
          
          // Excel processing library (large dependency)
          if (id.includes('node_modules/xlsx') || id.includes('node_modules/papaparse')) {
            return 'xlsx';
          }
          
          // Firebase
          if (id.includes('node_modules/firebase')) {
            return 'firebase';
          }
          
          // Database and ORM
          if (id.includes('node_modules/drizzle-orm') || id.includes('node_modules/@neondatabase')) {
            return 'database';
          }
          
          // Module-specific chunks for large modules
          if (id.includes('src/modules/analytics')) {
            return 'analytics';
          }
          
          if (id.includes('src/modules/suppliers')) {
            return 'suppliers';
          }
          
          if (id.includes('src/modules/procurement')) {
            return 'procurement';
          }
          
          if (id.includes('src/modules/projects')) {
            return 'projects';
          }
          
          if (id.includes('src/modules/contractors')) {
            return 'contractors';
          }
          
          // Services
          if (id.includes('src/services')) {
            return 'services';
          }
        },
        assetFileNames: (assetInfo) => {
          // Optimize CSS asset naming and caching
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
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'recharts', 
      '@tanstack/react-query', 
      'zustand', 
      'lucide-react', 
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'clsx',
      'tailwind-merge',
      'framer-motion',
      'date-fns',
      'axios'
    ],
    exclude: ['@vite/client', '@vite/env'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  esbuild: {
    target: 'esnext',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  // Performance monitoring
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    __PERFORMANCE_MONITORING__: JSON.stringify(true),
  },
})