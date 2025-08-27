import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
import fs from 'fs';

const URLS = [
    { url: 'http://localhost:5173/', name: 'Home_Dashboard' },
    { url: 'http://localhost:5173/projects', name: 'Projects' },
    { url: 'http://localhost:5173/procurement', name: 'Procurement' },
    { url: 'http://localhost:5173/staff', name: 'Staff' }
];

async function runLighthouseTests() {
    console.log('🔍 Starting Lighthouse Performance Analysis...');
    
    const browser = await chromium.launch({
        headless: true,
        args: ['--remote-debugging-port=9222', '--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const results = [];
    
    for (const { url, name } of URLS) {
        try {
            console.log(`Testing ${name}: ${url}`);
            
            const runnerResult = await lighthouse(url, {
                port: 9222,
                onlyCategories: ['performance'],
                settings: {
                    maxWaitForFcp: 15 * 1000,
                    maxWaitForLoad: 35 * 1000,
                    formFactor: 'desktop',
                    throttling: {
                        rttMs: 40,
                        throughputKbps: 10240,
                        cpuSlowdownMultiplier: 1
                    }
                }
            });
            
            const { lhr } = runnerResult;
            
            results.push({
                name,
                url,
                performance: {
                    score: Math.round(lhr.categories.performance.score * 100),
                    metrics: {
                        fcp: lhr.audits['first-contentful-paint']?.numericValue || 0,
                        lcp: lhr.audits['largest-contentful-paint']?.numericValue || 0,
                        cls: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
                        tti: lhr.audits['interactive']?.numericValue || 0,
                        si: lhr.audits['speed-index']?.numericValue || 0,
                        tbt: lhr.audits['total-blocking-time']?.numericValue || 0
                    },
                    opportunities: lhr.audits['unused-javascript']?.details?.items?.length || 0,
                    diagnostics: {
                        mainThreadWork: lhr.audits['mainthread-work-breakdown']?.numericValue || 0,
                        bootupTime: lhr.audits['bootup-time']?.numericValue || 0
                    }
                }
            });
            
            console.log(`✅ ${name}: Performance Score ${Math.round(lhr.categories.performance.score * 100)}/100`);
            
        } catch (error) {
            console.error(`❌ Failed to test ${name}: ${error.message}`);
            results.push({
                name,
                url,
                error: error.message
            });
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    await browser.close();
    
    // Save results
    const reportPath = `lighthouse-results-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    console.log(`\n📊 Lighthouse report saved to: ${reportPath}`);
    
    return results;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runLighthouseTests().catch(console.error);
}