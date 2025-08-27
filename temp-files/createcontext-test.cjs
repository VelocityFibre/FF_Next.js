const puppeteer = require('puppeteer');

async function testCreateContextError() {
  console.log('🔍 Testing for createContext errors specifically...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Clear cache first
    await page.setCacheEnabled(false);
    
    const errors = [];
    const logs = [];

    // Capture all console messages
    page.on('console', (msg) => {
      const text = msg.text();
      logs.push({
        type: msg.type(),
        text: text,
        location: msg.location()
      });
      
      console.log(`[${msg.type().toUpperCase()}] ${text}`);
      if (msg.location() && msg.location().url) {
        console.log(`   └─ ${msg.location().url}:${msg.location().lineNumber}:${msg.location().columnNumber}`);
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      errors.push({
        message: error.message,
        stack: error.stack
      });
      console.log(`❌ PAGE ERROR: ${error.message}`);
      console.log(`Stack trace: ${error.stack}`);
    });

    console.log('📍 Navigating to main page...');
    
    // Force refresh with cache bypass
    const response = await page.goto('https://fibreflow-292c7.web.app/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log(`Response status: ${response.status()}`);

    // Wait a bit for any async errors
    await page.waitForTimeout(3000);

    // Try navigating to specific routes that might trigger contexts
    const routes = [
      '/',
      '/app/dashboard', 
      '/app/projects',
      '/app/staff'
    ];

    for (const route of routes) {
      console.log(`\n🔍 Testing route: ${route}`);
      
      try {
        await page.goto(`https://fibreflow-292c7.web.app${route}`, {
          waitUntil: 'networkidle2',
          timeout: 10000
        });
        
        await page.waitForTimeout(2000);
        console.log(`✅ Route ${route} loaded successfully`);
        
      } catch (routeError) {
        console.log(`❌ Route ${route} failed: ${routeError.message}`);
      }
    }

    // Check what's actually loaded
    const bundleInfo = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return {
        scripts: scripts.map(s => s.src),
        hasReact: typeof window.React !== 'undefined',
        hasReactDOM: typeof window.ReactDOM !== 'undefined',
        contextErrors: window.contextErrors || []
      };
    });

    console.log('\n📊 Bundle Analysis:');
    console.log(JSON.stringify(bundleInfo, null, 2));

    console.log('\n================================================================================');
    console.log('📋 CREATECONTEXT ERROR ANALYSIS');
    console.log('================================================================================');

    console.log(`\n📝 Total logs captured: ${logs.length}`);
    console.log(`❌ Total errors: ${errors.length}`);

    const createContextErrors = [
      ...logs.filter(log => log.text.includes('createContext')),
      ...errors.filter(error => error.message.includes('createContext'))
    ];

    if (createContextErrors.length > 0) {
      console.log('\n🚨 CREATECONTEXT ERRORS FOUND:');
      createContextErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message || error.text}`);
        if (error.stack) {
          console.log(`   Stack: ${error.stack}`);
        }
      });
    } else {
      console.log('\n✅ NO CREATECONTEXT ERRORS DETECTED');
    }

    console.log('\n🔍 ALL ERRORS:');
    if (errors.length === 0) {
      console.log('✅ No page errors detected');
    } else {
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
      });
    }

    console.log(`\n🏁 CreateContext analysis completed!`);
    console.log(`Results: ${createContextErrors.length} createContext errors, ${errors.length} total errors`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCreateContextError().catch(console.error);