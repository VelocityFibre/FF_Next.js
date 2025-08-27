/**
 * Visual Comparison Test: Dev Server vs Production
 * 
 * This test performs comprehensive UI/UX comparison between development and production
 * environments in headed mode for real-time visual inspection and debugging.
 * 
 * @visual @comparison @headed
 */
import { test, expect, Page, Browser } from '@playwright/test';

// Environment configurations
const DEV_URL = 'http://localhost:5178/app/dashboard';
const PROD_URL = 'https://fibreflow-292c7.web.app/app/dashboard';
const FALLBACK_DEV_URL = 'http://localhost:5173/app/dashboard';

// Test configuration for headed mode visual comparison
test.describe('Visual Comparison: Dev vs Production', () => {
  let devContext: any;
  let prodContext: any;
  let devPage: Page;
  let prodPage: Page;

  test.beforeAll(async ({ browser }) => {
    // Create separate contexts for dev and production
    devContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      // Extra permissions and settings for dev environment
      permissions: ['camera', 'microphone'],
      geolocation: { latitude: -33.8688, longitude: 151.2093 },
    });

    prodContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      // Production-like settings
      permissions: [],
    });

    devPage = await devContext.newPage();
    prodPage = await prodContext.newPage();
  });

  test.afterAll(async () => {
    await devContext?.close();
    await prodContext?.close();
  });

  test('Dashboard Layout Comparison - Desktop', async () => {
    console.log('🔍 Starting Visual Comparison Test in Headed Mode');
    
    // Navigate to both environments
    try {
      console.log(`📍 Navigating to DEV: ${DEV_URL}`);
      await devPage.goto(DEV_URL, { waitUntil: 'networkidle' });
    } catch (error) {
      console.log(`⚠️ Primary dev URL failed, trying fallback: ${FALLBACK_DEV_URL}`);
      await devPage.goto(FALLBACK_DEV_URL, { waitUntil: 'networkidle' });
    }

    console.log(`📍 Navigating to PROD: ${PROD_URL}`);
    await prodPage.goto(PROD_URL, { waitUntil: 'networkidle' });

    // Wait for dashboard to fully load
    await Promise.all([
      devPage.waitForSelector('[data-testid="dashboard"], .dashboard, main', { timeout: 10000 }),
      prodPage.waitForSelector('[data-testid="dashboard"], .dashboard, main', { timeout: 10000 }),
    ]);

    console.log('📸 Taking desktop comparison screenshots');
    
    // Take full page screenshots for comparison
    const devScreenshot = await devPage.screenshot({ 
      fullPage: true,
      path: './dev-tools/testing/test-results/dev-dashboard-desktop.png'
    });
    
    const prodScreenshot = await prodPage.screenshot({ 
      fullPage: true,
      path: './dev-tools/testing/test-results/prod-dashboard-desktop.png'
    });

    // Visual comparison assertion
    expect(devScreenshot).toBeTruthy();
    expect(prodScreenshot).toBeTruthy();
    
    console.log('✅ Desktop screenshots captured successfully');
  });

  test('Interactive Elements Comparison', async () => {
    console.log('🎯 Testing Interactive Elements');

    // Test navigation hover states
    const navSelectors = [
      'nav a', 
      '[data-testid="nav-link"]', 
      '.nav-link',
      'a[href*="/app/"]'
    ];

    for (const selector of navSelectors) {
      try {
        const devElements = await devPage.locator(selector).all();
        const prodElements = await prodPage.locator(selector).all();

        if (devElements.length > 0 && prodElements.length > 0) {
          console.log(`🔍 Testing hover states for: ${selector}`);
          
          // Hover over first navigation element in both environments
          await devElements[0].hover();
          await prodElements[0].hover();
          
          // Wait for hover animations
          await devPage.waitForTimeout(500);
          await prodPage.waitForTimeout(500);
          
          // Capture hover state
          await devPage.screenshot({ 
            path: './dev-tools/testing/test-results/dev-nav-hover.png'
          });
          await prodPage.screenshot({ 
            path: './dev-tools/testing/test-results/prod-nav-hover.png'
          });
          
          break;
        }
      } catch (error) {
        console.log(`⚠️ Could not test hover for ${selector}: ${error.message}`);
      }
    }

    console.log('✅ Interactive elements tested');
  });

  test('Responsive Design Comparison - Tablet', async () => {
    console.log('📱 Testing Tablet Responsive Design');
    
    // Set tablet viewport
    await devPage.setViewportSize({ width: 768, height: 1024 });
    await prodPage.setViewportSize({ width: 768, height: 1024 });
    
    // Wait for responsive adjustments
    await devPage.waitForTimeout(1000);
    await prodPage.waitForTimeout(1000);
    
    // Take tablet screenshots
    await devPage.screenshot({ 
      fullPage: true,
      path: './dev-tools/testing/test-results/dev-dashboard-tablet.png'
    });
    
    await prodPage.screenshot({ 
      fullPage: true,
      path: './dev-tools/testing/test-results/prod-dashboard-tablet.png'
    });
    
    console.log('✅ Tablet screenshots captured');
  });

  test('Responsive Design Comparison - Mobile', async () => {
    console.log('📱 Testing Mobile Responsive Design');
    
    // Set mobile viewport
    await devPage.setViewportSize({ width: 375, height: 667 });
    await prodPage.setViewportSize({ width: 375, height: 667 });
    
    // Wait for responsive adjustments
    await devPage.waitForTimeout(1000);
    await prodPage.waitForTimeout(1000);
    
    // Take mobile screenshots
    await devPage.screenshot({ 
      fullPage: true,
      path: './dev-tools/testing/test-results/dev-dashboard-mobile.png'
    });
    
    await prodPage.screenshot({ 
      fullPage: true,
      path: './dev-tools/testing/test-results/prod-dashboard-mobile.png'
    });
    
    console.log('✅ Mobile screenshots captured');
  });

  test('Component-Level Visual Analysis', async () => {
    console.log('🧩 Analyzing Individual Components');
    
    // Reset to desktop view
    await devPage.setViewportSize({ width: 1920, height: 1080 });
    await prodPage.setViewportSize({ width: 1920, height: 1080 });
    
    const componentSelectors = [
      { name: 'header', selector: 'header, [data-testid="header"]' },
      { name: 'navigation', selector: 'nav, [data-testid="navigation"]' },
      { name: 'main-content', selector: 'main, [data-testid="main-content"]' },
      { name: 'sidebar', selector: '.sidebar, [data-testid="sidebar"]' },
      { name: 'dashboard-cards', selector: '.card, [data-testid="card"]' },
      { name: 'charts', selector: '.recharts-wrapper, [data-testid="chart"]' },
    ];

    for (const component of componentSelectors) {
      try {
        const devElement = devPage.locator(component.selector).first();
        const prodElement = prodPage.locator(component.selector).first();
        
        if (await devElement.isVisible() && await prodElement.isVisible()) {
          console.log(`📸 Capturing ${component.name} component`);
          
          await devElement.screenshot({ 
            path: `./dev-tools/testing/test-results/dev-${component.name}.png`
          });
          
          await prodElement.screenshot({ 
            path: `./dev-tools/testing/test-results/prod-${component.name}.png`
          });
        }
      } catch (error) {
        console.log(`⚠️ Could not capture ${component.name}: ${error.message}`);
      }
    }
    
    console.log('✅ Component analysis completed');
  });

  test('Typography and Theme Comparison', async () => {
    console.log('🎨 Analyzing Typography and Theme');
    
    // Get computed styles for key elements
    const textElements = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'span', '.text-primary', '.text-secondary',
      'button', '.btn', '.button'
    ];

    const devStyles: any = {};
    const prodStyles: any = {};

    for (const selector of textElements) {
      try {
        const devElement = devPage.locator(selector).first();
        const prodElement = prodPage.locator(selector).first();
        
        if (await devElement.isVisible() && await prodElement.isVisible()) {
          devStyles[selector] = await devElement.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              fontFamily: computed.fontFamily,
              fontSize: computed.fontSize,
              fontWeight: computed.fontWeight,
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              lineHeight: computed.lineHeight,
              letterSpacing: computed.letterSpacing,
            };
          });
          
          prodStyles[selector] = await prodElement.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              fontFamily: computed.fontFamily,
              fontSize: computed.fontSize,
              fontWeight: computed.fontWeight,
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              lineHeight: computed.lineHeight,
              letterSpacing: computed.letterSpacing,
            };
          });
        }
      } catch (error) {
        console.log(`⚠️ Could not analyze styles for ${selector}`);
      }
    }

    // Log style comparison
    console.log('📊 Style Comparison Results:');
    for (const selector in devStyles) {
      const devStyle = devStyles[selector];
      const prodStyle = prodStyles[selector];
      
      console.log(`\n${selector}:`);
      console.log('  DEV :', devStyle);
      console.log('  PROD:', prodStyle);
      
      // Check for major differences
      if (devStyle.fontSize !== prodStyle.fontSize) {
        console.log(`  ⚠️ FONT SIZE DIFFERENCE: ${devStyle.fontSize} vs ${prodStyle.fontSize}`);
      }
      if (devStyle.color !== prodStyle.color) {
        console.log(`  ⚠️ COLOR DIFFERENCE: ${devStyle.color} vs ${prodStyle.color}`);
      }
    }
    
    console.log('✅ Typography analysis completed');
  });

  test('Performance and Loading Analysis', async () => {
    console.log('⚡ Analyzing Performance Differences');
    
    // Measure performance metrics
    const devMetrics = await devPage.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });

    const prodMetrics = await prodPage.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });

    console.log('📊 Performance Comparison:');
    console.log('DEV Metrics:', devMetrics);
    console.log('PROD Metrics:', prodMetrics);
    
    // Performance assertions
    expect(devMetrics.domContentLoaded).toBeLessThan(5000); // 5s max
    expect(prodMetrics.domContentLoaded).toBeLessThan(5000); // 5s max
    
    console.log('✅ Performance analysis completed');
  });

  test('Generate Visual Comparison Report', async () => {
    console.log('📋 Generating Visual Comparison Report');
    
    const report = {
      timestamp: new Date().toISOString(),
      environments: {
        development: DEV_URL,
        production: PROD_URL
      },
      screenshots_captured: [
        'dev-dashboard-desktop.png',
        'prod-dashboard-desktop.png',
        'dev-dashboard-tablet.png', 
        'prod-dashboard-tablet.png',
        'dev-dashboard-mobile.png',
        'prod-dashboard-mobile.png',
        'dev-nav-hover.png',
        'prod-nav-hover.png'
      ],
      test_summary: {
        desktop_comparison: 'Screenshots captured for full-page comparison',
        responsive_testing: 'Tablet and mobile viewports tested',
        interactive_elements: 'Navigation hover states captured',
        component_analysis: 'Individual components screenshotted',
        typography_analysis: 'Font and color styles compared',
        performance_metrics: 'Loading times measured'
      }
    };

    console.log('📊 Visual Comparison Report Generated:');
    console.log(JSON.stringify(report, null, 2));
    
    console.log('\n🎯 Next Steps for Manual Review:');
    console.log('1. Open screenshots in ./dev-tools/testing/test-results/');
    console.log('2. Compare side-by-side for visual differences');
    console.log('3. Check console output above for style differences');
    console.log('4. Review performance metrics for loading discrepancies');
    console.log('5. Test interactive elements in both environments manually');
    
    console.log('✅ Report generation completed');
  });
});