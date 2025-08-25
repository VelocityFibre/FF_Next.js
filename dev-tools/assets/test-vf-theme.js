import { chromium } from 'playwright';

const log = (...args) => process.stdout.write(args.join(' ') + '\n');

(async () => {
  log('🚀 Starting VF Theme UI Test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate directly to VF theme test page (no auth required)
    log('📍 Navigating to VF Theme Test Page...');
    await page.goto('http://localhost:5173/test/vf-theme', { waitUntil: 'networkidle' });
    
    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/01-initial-load.png', fullPage: true });
    log('📸 Screenshot: Initial page load\n');
    
    // Check if we're on the test page
    const testPageTitle = await page.locator('h1:has-text("VF Theme Test Page")').count();
    if (testPageTitle > 0) {
      log('✅ VF Theme Test Page loaded successfully\n');
    }
    
    // Click on VF Theme button
    log('🎨 Clicking VF Theme button...');
    
    const vfThemeButton = await page.locator('button:has-text("VF THEME")').first();
    
    if (await vfThemeButton.count() > 0) {
      await vfThemeButton.click();
      await page.waitForTimeout(1000);
      
      log('✅ VF Theme activated');
      await page.screenshot({ path: 'screenshots/02-vf-theme-active.png', fullPage: true });
      log('📸 Screenshot: VF theme activated\n');
    } else {
      log('❌ VF Theme button not found');
    }
    
    // Check sidebar for VF branding
    log('🔍 Checking sidebar for VELOCITY FIBRE branding...');
    
    const sidebarBranding = await page.locator('text="VELOCITY FIBRE", text="VELOCITY"').first();
    if (await sidebarBranding.count() > 0) {
      log('✅ VELOCITY FIBRE branding found in sidebar!');
      const brandingBox = await sidebarBranding.boundingBox();
      if (brandingBox) {
        await page.screenshot({ 
          path: 'screenshots/03-vf-branding.png',
          clip: {
            x: Math.max(0, brandingBox.x - 20),
            y: Math.max(0, brandingBox.y - 20),
            width: brandingBox.width + 40,
            height: brandingBox.height + 40
          }
        });
        log('📸 Screenshot: VF branding close-up\n');
      }
    } else {
      log('❌ VELOCITY FIBRE branding not found in sidebar');
    }
    
    // Check sidebar styling
    log('🎨 Checking sidebar dark theme styling...');
    const sidebar = await page.locator('aside, nav, [class*="sidebar" i], [class*="sidenav" i]').first();
    
    if (await sidebar.count() > 0) {
      const sidebarStyles = await sidebar.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          borderColor: computed.borderColor
        };
      });
      
      log('Sidebar styles:', JSON.stringify(sidebarStyles));
      
      // Check if background is dark (slate-800/900)
      if (sidebarStyles.backgroundColor.includes('30, 41, 59') || // slate-800
          sidebarStyles.backgroundColor.includes('15, 23, 42')) { // slate-900
        log('✅ Sidebar has correct dark background');
      } else {
        log(`⚠️ Sidebar background may not be correct: ${sidebarStyles.backgroundColor}`);
      }
    }
    
    // Check navigation items
    log('\n📋 Checking navigation menu items...');
    const menuItems = [
      'Dashboard',
      'Projects', 
      'SOW Data Management',
      'Pole Tracker',
      'Task Management',
      'Daily Progress',
      'Enhanced KPIs',
      'KPI Dashboard',
      'Reports',
      'Meetings',
      'Action Items'
    ];
    
    let foundItems = [];
    let missingItems = [];
    
    for (const item of menuItems) {
      const menuItem = await page.locator(`text="${item}"`).first();
      if (await menuItem.count() > 0) {
        foundItems.push(item);
      } else {
        missingItems.push(item);
      }
    }
    
    log(`✅ Found menu items (${foundItems.length}): ${foundItems.join(', ')}`);
    if (missingItems.length > 0) {
      log(`❌ Missing menu items (${missingItems.length}): ${missingItems.join(', ')}`);
    }
    
    // Take final full page screenshot
    await page.screenshot({ path: 'screenshots/04-final-state.png', fullPage: true });
    log('\n📸 Screenshot: Final state captured');
    
    // Summary
    log('\n' + '='.repeat(50));
    log('📊 TEST SUMMARY:');
    log('='.repeat(50));
    log(`✅ Page loaded successfully`);
    log(`${await vfThemeButton.count() > 0 ? '✅' : '❌'} VF Theme button found`);
    log(`${await sidebarBranding.count() > 0 ? '✅' : '❌'} VELOCITY FIBRE branding visible`);
    log(`✅ Found ${foundItems.length}/${menuItems.length} navigation items`);
    log('\n📁 Screenshots saved in screenshots/ folder');
    
  } catch (error) {
    log('❌ Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/error-state.png', fullPage: true });
  } finally {
    await page.waitForTimeout(3000); // Keep browser open for 3 seconds to view
    await browser.close();
    log('\n✅ Test completed');
  }
})();