import { chromium } from 'playwright';

async function scriptAnalysisTest() {
  console.log('🔍 Analyzing script loading and module issues...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const loadedScripts = [];
  const failedRequests = [];
  const moduleErrors = [];
  
  // Track all requests
  page.on('request', request => {
    if (request.url().includes('.js')) {
      console.log(`📡 Loading: ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('.js')) {
      loadedScripts.push({
        url: response.url(),
        status: response.status(),
        headers: response.headers()
      });
      console.log(`✅ Loaded: ${response.url()} (${response.status()})`);
    }
  });
  
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      method: request.method(),
      error: request.failure().errorText
    });
    console.log(`❌ Failed: ${request.method()} ${request.url()} - ${request.failure().errorText}`);
  });
  
  // Capture console errors with more detail
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[ERROR] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    moduleErrors.push({
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    console.log(`\n❌ MODULE ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  });
  
  try {
    console.log('📍 Loading main page...');
    await page.goto('https://fibreflow-292c7.web.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Analyze the module loading after page load
    const moduleInfo = await page.evaluate(() => {
      try {
        // Check what React-related globals are available
        const reactGlobals = {
          React: typeof window.React,
          ReactDOM: typeof window.ReactDOM,
          reactDevtools: typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__
        };
        
        // Check if any modules failed to load
        const moduleScripts = Array.from(document.querySelectorAll('script[type="module"]'));
        
        // Look for any error indicators in the DOM
        const hasErrorBoundary = document.querySelector('[data-testid="error-boundary"]') !== null;
        const hasErrorMessage = document.body.innerText.includes('error') || document.body.innerText.includes('Error');
        
        return {
          reactGlobals,
          moduleScriptsCount: moduleScripts.length,
          hasErrorBoundary,
          hasErrorMessage,
          bodyText: document.body.innerText.slice(0, 500)
        };
      } catch (e) {
        return { evaluationError: e.message };
      }
    });
    
    console.log('\n📊 Module Analysis:');
    console.log(JSON.stringify(moduleInfo, null, 2));
    
    // Give time for any lazy-loaded modules
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Navigation error:', error.message);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📋 SCRIPT LOADING ANALYSIS');
  console.log('='.repeat(80));
  
  console.log(`\n✅ Successfully loaded scripts: ${loadedScripts.length}`);
  loadedScripts.forEach((script, index) => {
    console.log(`${index + 1}. ${script.url} (${script.status})`);
  });
  
  if (failedRequests.length > 0) {
    console.log(`\n❌ Failed requests: ${failedRequests.length}`);
    failedRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url} - ${req.error}`);
    });
  } else {
    console.log('\n✅ No failed requests');
  }
  
  if (moduleErrors.length > 0) {
    console.log(`\n🐛 Module errors: ${moduleErrors.length}`);
    moduleErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.name}: ${error.message}`);
    });
  }
  
  await browser.close();
  
  return {
    loadedScripts: loadedScripts.length,
    failedRequests: failedRequests.length,
    moduleErrors: moduleErrors.length,
    details: { loadedScripts, failedRequests, moduleErrors }
  };
}

scriptAnalysisTest()
  .then(results => {
    console.log('\n🏁 Script analysis completed!');
    console.log(`Scripts loaded: ${results.loadedScripts}, Failed: ${results.failedRequests}, Errors: ${results.moduleErrors}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  });