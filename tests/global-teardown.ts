import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🎭 Starting Playwright global teardown...');
  
  // Any global cleanup needed after tests
  // e.g., stop services, cleanup database, etc.
  
  console.log('✅ Playwright global teardown complete');
}

export default globalTeardown;