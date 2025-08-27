/**
 * Quick Visual Comparison Test: Dev Server vs Production
 * Simplified test to capture clear comparison screenshots
 * 
 * @visual @comparison @headed
 */
import { test, expect } from '@playwright/test';

const DEV_URL = 'http://localhost:5178/app/dashboard';
const PROD_URL = 'https://fibreflow-292c7.web.app/app/dashboard';

test('Quick Visual Comparison - Desktop', async ({ browser }) => {
  // Create two browser contexts for side-by-side comparison
  const devContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  
  const prodContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const devPage = await devContext.newPage();
  const prodPage = await prodContext.newPage();

  try {
    console.log('🔍 Navigating to Development Environment...');
    await devPage.goto(DEV_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await devPage.waitForTimeout(2000); // Allow content to render

    console.log('🔍 Navigating to Production Environment...');
    await prodPage.goto(PROD_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await prodPage.waitForTimeout(2000); // Allow content to render

    console.log('📸 Capturing Development Screenshot...');
    await devPage.screenshot({ 
      path: './dev-tools/testing/test-results/dev-environment-desktop.png',
      fullPage: true 
    });

    console.log('📸 Capturing Production Screenshot...');
    await prodPage.screenshot({ 
      path: './dev-tools/testing/test-results/prod-environment-desktop.png',
      fullPage: true 
    });

    console.log('✅ Screenshots captured successfully');

  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
  } finally {
    await devContext.close();
    await prodContext.close();
  }
});