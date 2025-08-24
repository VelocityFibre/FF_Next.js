import { defineConfig, devices } from '@playwright/test';

/**
 * FibreFlow Playwright Configuration
 * E2E and UI testing for the React application
 */
export default defineConfig({
  // Test directory
  testDir: './dev-tools/testing/tests/e2e',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['json', { outputFile: 'dev-tools/testing/test-results/results.json' }],
    ['junit', { outputFile: 'dev-tools/testing/test-results/results.xml' }],
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:5174',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // Run in headed mode to see what's happening
    headless: false,
    
    // Slow down actions to see them
    launchOptions: {
      slowMo: 300,
    },
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet viewports
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Global setup and teardown
  globalSetup: './dev-tools/testing/tests/global-setup.ts',
  globalTeardown: './dev-tools/testing/tests/global-teardown.ts',

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },

  // Test timeout
  timeout: 30 * 1000, // 30 seconds

  // Expect timeout
  expect: {
    timeout: 5 * 1000, // 5 seconds
  },

  // Output directory for test results
  outputDir: 'dev-tools/testing/test-results/',
});