import { chromium } from 'playwright';

const log = (...args) => process.stdout.write(args.join(' ') + '\n');

const viewports = [
  { name: 'Mobile', width: 375, height: 812 },  // iPhone X
  { name: 'Tablet', width: 768, height: 1024 }, // iPad
  { name: 'Desktop', width: 1920, height: 1080 }, // Full HD
];

(async () => {
  log('🚀 Starting VF Theme Responsive Test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  for (const viewport of viewports) {
    log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
    log('='.repeat(50));
    
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });
    
    const page = await context.newPage();
    
    try {
      // Navigate to test page
      await page.goto('http://localhost:5173/test/vf-theme', { waitUntil: 'networkidle' });
      
      // Click VF Theme button
      const vfThemeButton = await page.locator('button:has-text("VF THEME")').first();
      if (await vfThemeButton.count() > 0) {
        await vfThemeButton.click();
        await page.waitForTimeout(500);
      }
      
      // Take screenshot
      await page.screenshot({ 
        path: `screenshots/responsive-${viewport.name.toLowerCase()}.png`, 
        fullPage: true 
      });
      log(`📸 Screenshot saved: responsive-${viewport.name.toLowerCase()}.png`);
      
      // Check if sidebar is visible
      const sidebar = await page.locator('.sidebar, aside, [class*="sidebar"]').first();
      const sidebarVisible = await sidebar.isVisible().catch(() => false);
      log(`Sidebar visible: ${sidebarVisible ? '✅' : '❌'}`);
      
      // Check if mobile menu button exists
      const menuButton = await page.locator('button[aria-label*="menu"], button:has(svg.lucide-menu)').first();
      const hasMenuButton = await menuButton.count() > 0;
      log(`Mobile menu button: ${hasMenuButton ? '✅ Present' : '❌ Not found'}`);
      
      // If mobile, test menu toggle
      if (viewport.name === 'Mobile' && hasMenuButton) {
        log('Testing mobile menu toggle...');
        await menuButton.click();
        await page.waitForTimeout(500);
        
        const sidebarAfterClick = await sidebar.isVisible().catch(() => false);
        log(`Sidebar after menu click: ${sidebarAfterClick ? '✅ Visible' : '❌ Hidden'}`);
        
        await page.screenshot({ 
          path: `screenshots/responsive-mobile-menu-open.png`, 
          fullPage: true 
        });
      }
      
      // Check VF branding visibility
      const vfBranding = await page.locator('text="VELOCITY"').first();
      const brandingVisible = await vfBranding.isVisible().catch(() => false);
      log(`VF Branding visible: ${brandingVisible ? '✅' : '❌'}`);
      
      // Check layout responsiveness
      const mainContent = await page.locator('main, .main-content, [class*="main"]').first();
      if (await mainContent.count() > 0) {
        const box = await mainContent.boundingBox();
        if (box) {
          log(`Main content width: ${box.width}px`);
          const isResponsive = box.width <= viewport.width;
          log(`Content fits viewport: ${isResponsive ? '✅' : '❌'}`);
        }
      }
      
    } catch (error) {
      log(`❌ Error testing ${viewport.name}:`, error.message);
    } finally {
      await context.close();
    }
  }
  
  log('\n' + '='.repeat(50));
  log('📊 RESPONSIVE TEST SUMMARY:');
  log('='.repeat(50));
  log('✅ Tested 3 viewport sizes');
  log('📁 Screenshots saved in screenshots/ folder');
  log('Check screenshots to verify responsive behavior');
  
  await browser.close();
  log('\n✅ Responsive test completed');
})();