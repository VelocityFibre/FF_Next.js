import { chromium, firefox, webkit } from 'playwright';
import fs from 'fs';

const ROUTES = [
    { path: '/', name: 'Home_Dashboard' },
    { path: '/projects', name: 'Projects' },
    { path: '/procurement', name: 'Procurement' },
    { path: '/staff', name: 'Staff' },
    { path: '/contractors', name: 'Contractors' }
];

const VIEWPORTS = [
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 375, height: 667, name: 'Mobile' }
];

async function measurePagePerformance(browser, url, viewport) {
    const context = await browser.newContext({
        viewport,
        permissions: []
    });
    
    const page = await context.newPage();
    
    try {
        console.log(`Testing ${url} on ${viewport.name} (${viewport.width}x${viewport.height})`);
        
        const startTime = Date.now();
        
        // Navigate and wait for page to load
        await page.goto(url, { 
            waitUntil: 'networkidle',
            timeout: 15000 
        });
        
        const loadTime = Date.now() - startTime;
        
        // Get performance metrics
        const metrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paintEntries = performance.getEntriesByType('paint');
            
            return {
                domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.fetchStart || 0,
                loadComplete: navigation?.loadEventEnd - navigation?.fetchStart || 0,
                firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
                transferSize: navigation?.transferSize || 0,
                encodedBodySize: navigation?.encodedBodySize || 0
            };
        });
        
        // Get memory usage if available
        const memoryInfo = await page.evaluate(() => {
            if ('memory' in performance) {
                return {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) // MB
                };
            }
            return null;
        });
        
        // Count network requests
        let requestCount = 0;
        let totalTransferSize = 0;
        
        page.on('response', (response) => {
            requestCount++;
            const headers = response.headers();
            if (headers['content-length']) {
                totalTransferSize += parseInt(headers['content-length']);
            }
        });
        
        // Wait for any additional resources
        await page.waitForTimeout(2000);
        
        // Check for errors
        const jsErrors = [];
        page.on('pageerror', error => {
            jsErrors.push(error.message);
        });
        
        return {
            url,
            viewport: viewport.name,
            loadTime,
            metrics: {
                ...metrics,
                requests: requestCount,
                totalTransferSize: Math.round(totalTransferSize / 1024), // KB
                memoryUsage: memoryInfo
            },
            errors: jsErrors,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error(`Error testing ${url}: ${error.message}`);
        return {
            url,
            viewport: viewport.name,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    } finally {
        await context.close();
    }
}

async function runPerformanceTest() {
    console.log('🚀 Starting FibreFlow Performance Testing...');
    
    const results = {
        timestamp: new Date().toISOString(),
        browserResults: []
    };
    
    const browsers = [
        { name: 'chromium', launcher: chromium },
        { name: 'firefox', launcher: firefox }
        // Skip webkit for now as it might have issues on Windows
    ];
    
    for (const browserConfig of browsers) {
        console.log(`\n🌐 Testing with ${browserConfig.name.toUpperCase()}`);
        
        const browser = await browserConfig.launcher.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-dev-shm-usage']
        });
        
        const browserResults = [];
        
        for (const viewport of VIEWPORTS) {
            for (const route of ROUTES) {
                const url = `http://localhost:5173${route.path}`;
                const result = await measurePagePerformance(browser, url, viewport);
                browserResults.push(result);
                
                // Small delay between tests
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        await browser.close();
        
        results.browserResults.push({
            browser: browserConfig.name,
            results: browserResults
        });
    }
    
    // Save results
    const reportPath = `performance-report-simple-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    console.log(`\n✅ Performance testing completed!`);
    console.log(`📊 Report saved to: ${reportPath}`);
    
    // Generate summary
    generateSummary(results);
    
    return results;
}

function generateSummary(results) {
    console.log('\n📊 PERFORMANCE SUMMARY');
    console.log('========================');
    
    let allResults = [];
    results.browserResults.forEach(browserResult => {
        allResults = allResults.concat(browserResult.results.filter(r => !r.error));
    });
    
    if (allResults.length === 0) {
        console.log('❌ No successful test results');
        return;
    }
    
    const avgLoadTime = allResults.reduce((sum, r) => sum + r.loadTime, 0) / allResults.length;
    const avgFCP = allResults.reduce((sum, r) => sum + (r.metrics?.firstContentfulPaint || 0), 0) / allResults.length;
    const avgDCL = allResults.reduce((sum, r) => sum + (r.metrics?.domContentLoaded || 0), 0) / allResults.length;
    
    console.log(`Average Load Time: ${Math.round(avgLoadTime)}ms`);
    console.log(`Average First Contentful Paint: ${Math.round(avgFCP)}ms`);
    console.log(`Average DOM Content Loaded: ${Math.round(avgDCL)}ms`);
    
    // Performance analysis
    console.log('\n🎯 PERFORMANCE ANALYSIS');
    console.log('========================');
    
    if (avgLoadTime > 3000) {
        console.log('⚠️  ISSUE: Slow page load times detected');
        console.log('   Recommendation: Implement code splitting and optimize bundle size');
    }
    
    if (avgFCP > 1800) {
        console.log('⚠️  ISSUE: Poor First Contentful Paint performance');
        console.log('   Recommendation: Optimize critical rendering path and preload key resources');
    }
    
    if (avgLoadTime <= 1500 && avgFCP <= 1000) {
        console.log('✅ EXCELLENT: Performance metrics meet target thresholds');
    }
    
    // Error summary
    const errors = allResults.filter(r => r.errors && r.errors.length > 0);
    if (errors.length > 0) {
        console.log('\n🚨 ERRORS DETECTED');
        console.log('==================');
        errors.forEach(result => {
            console.log(`${result.url} (${result.viewport}): ${result.errors.join(', ')}`);
        });
    }
}

// Run the test
runPerformanceTest().catch(console.error);