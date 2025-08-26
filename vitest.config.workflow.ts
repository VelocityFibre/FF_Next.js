// Vitest configuration for workflow module testing
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'workflow-tests',
    environment: 'jsdom',
    setupFiles: [
      './src/modules/workflow/__tests__/setup/test-setup.ts'
    ],
    include: [
      'src/modules/workflow/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '**/*.d.ts',
      'src/modules/workflow/__tests__/e2e/**' // E2E tests run separately with Playwright
    ],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: './coverage/workflow',
      include: [
        'src/modules/workflow/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/modules/workflow/**/*.d.ts',
        'src/modules/workflow/**/*.stories.{ts,tsx}',
        'src/modules/workflow/**/*.test.{ts,tsx}',
        'src/modules/workflow/**/*.spec.{ts,tsx}',
        'src/modules/workflow/**/__tests__/**',
        'src/modules/workflow/**/__mocks__/**',
        'src/modules/workflow/**/index.ts', // Re-export files
        'src/modules/workflow/types/**', // Type definitions
      ],
      thresholds: {
        global: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        // Specific module thresholds
        'src/modules/workflow/context/': {
          branches: 98,
          functions: 98,
          lines: 98,
          statements: 98
        },
        'src/modules/workflow/services/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        'src/modules/workflow/components/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'src/modules/workflow/hooks/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        }
      },
      watermarks: {
        statements: [80, 95],
        functions: [80, 95],
        branches: [80, 95],
        lines: [80, 95]
      }
    },
    // Test execution options
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    silent: false,
    reporter: ['verbose', 'html', 'json'],
    outputFile: {
      html: './coverage/workflow/test-results.html',
      json: './coverage/workflow/test-results.json'
    },
    // Parallel execution for faster tests
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4
      }
    },
    // Watch mode configuration
    watch: {
      include: [
        'src/modules/workflow/**/*.{ts,tsx}'
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**'
      ]
    },
    // Performance monitoring
    logHeapUsage: true,
    allowOnly: true,
    passWithNoTests: false,
    isolate: true,
    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    mockReset: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@workflow': path.resolve(__dirname, './src/modules/workflow'),
      '@components': path.resolve(__dirname, './src/components'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services')
    }
  },
  esbuild: {
    target: 'node14'
  }
});