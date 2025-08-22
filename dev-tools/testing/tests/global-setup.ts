import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🎭 Starting Playwright global setup...');
  
  // Any global setup needed before tests
  // e.g., start services, seed database, etc.
  
  console.log('✅ Playwright global setup complete');
}

export default globalSetup;