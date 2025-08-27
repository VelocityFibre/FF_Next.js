import { chromium, firefox, webkit } from 'playwright';
import fs from 'fs';
import path from 'path';

class FibreFlowPerformanceTester {
    constructor(baseUrl = 'http://localhost:5173') {
        this.baseUrl = baseUrl;
        this.results = {
            summary: {},
            detailed: {},
            recommendations: []
        };
        
        // Test configurations
        this.browsers = [
            { name: 'chromium', launcher: chromium },
            { name: 'firefox', launcher: firefox },
            { name: 'webkit', launcher: webkit }
        ];
        
        this.viewports = [
            { width: 1920, height: 1080, name: 'Desktop_Large' },
            { width: 1440, height: 900, name: 'Desktop_Medium' },
            { width: 1024, height: 768, name: 'Tablet_Landscape' },
            { width: 768, height: 1024, name: 'Tablet_Portrait' },
            { width: 414, height: 736, name: 'Mobile_Large' },
            { width: 375, height: 667, name: 'Mobile_Medium' },
            { width: 360, height: 640, name: 'Mobile_Small' }
        ];
        
        // Critical routes to test
        this.testRoutes = [
            { path: '/', name: 'Dashboard_Home' },
            { path: '/projects', name: 'Projects_List' },
            { path: '/procurement', name: 'Procurement_Dashboard' },
            { path: '/procurement/stock', name: 'Stock_Management' },
            { path: '/procurement/suppliers', name: 'Supplier_Portal' },
            { path: '/procurement/reports', name: 'Reports_Analytics' },
            { path: '/staff', name: 'Staff_Management' },
            { path: '/contractors', name: 'Contractors_Dashboard' },
            { path: '/sow', name: 'SOW_Management' }
        ];
    }
    
    async getCoreWebVitals(page) {
        return await page.evaluate(() => {
            return new Promise((resolve) => {
                const metrics = {
                    fcp: 0,
                    lcp: 0,
                    cls: 0,
                    fid: 0,
                    tti: 0,
                    loadTime: 0
                };
                
                // Get navigation timing
                const navigationEntry = performance.getEntriesByType('navigation')[0];
                if (navigationEntry) {
                    metrics.loadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
                }
                
                // Get paint timing
                const paintEntries = performance.getEntriesByType('paint');
                const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
                if (fcpEntry) {
                    metrics.fcp = fcpEntry.startTime;
                }
                
                // Set up performance observers
                let lcpValue = 0;
                let clsValue = 0;
                
                try {
                    // LCP Observer
                    const lcpObserver = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        if (entries.length > 0) {
                            lcpValue = entries[entries.length - 1].startTime;
                        }
                    });
                    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                    
                    // CLS Observer
                    const clsObserver = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (!entry.hadRecentInput) {
                                clsValue += entry.value;
                            }
                        }
                    });
                    clsObserver.observe({ entryTypes: ['layout-shift'] });
                    
                    // Wait for metrics collection
                    setTimeout(() => {
                        metrics.lcp = lcpValue;
                        metrics.cls = clsValue;
                        metrics.tti = navigationEntry ? navigationEntry.domInteractive - navigationEntry.fetchStart : 0;
                        resolve(metrics);
                    }, 3000);
                } catch (error) {
                    console.log('Performance Observer error:', error);
                    resolve(metrics);
                }
            });
        });
    }
    
    async getMemoryUsage(page) {
        return await page.evaluate(() => {
            if ('memory' in performance) {
                return {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) // MB
                };
            }
            return { used: 0, total: 0, limit: 0 };
        });
    }
    
    async analyzeNetworkRequests(page) {
        const requests = [];
        let totalSize = 0;
        let cachedCount = 0;
        
        page.on('request', request => {
            requests.push({
                url: request.url(),
                method: request.method(),
                resourceType: request.resourceType()
            });
        });
        
        page.on('response', async response => {
            try {
                const headers = response.headers();
                if (response.status() === 304 || headers['cache-control']) {
                    cachedCount++;
                }
                
                // Estimate response size
                const contentLength = headers['content-length'];
                if (contentLength) {
                    totalSize += parseInt(contentLength);
                }
            } catch (error) {
                // Ignore errors in network analysis
            }
        });
        
        return {
            totalRequests: requests.length,
            cachedRequests: cachedCount,
            totalSize: Math.round(totalSize / 1024), // KB
            requestsByType: requests.reduce((acc, req) => {
                acc[req.resourceType] = (acc[req.resourceType] || 0) + 1;
                return acc;
            }, {})
        };
    }
    
    async testPagePerformance(browser, viewport, route) {
        const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height }
        });
        
        const page = await context.newPage();
        
        try {
            console.log(`Testing ${route.name} on ${viewport.name}...`);
            
            const startTime = Date.now();
            
            // Navigate to page
            await page.goto(`${this.baseUrl}${route.path}`, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            const loadTime = Date.now() - startTime;
            
            // Wait for page to stabilize
            await page.waitForTimeout(2000);
            
            // Get performance metrics
            const webVitals = await this.getCoreWebVitals(page);
            const memoryUsage = await this.getMemoryUsage(page);
            const networkStats = await this.analyzeNetworkRequests(page);
            
            // Check for JavaScript errors
            const jsErrors = [];
            page.on('pageerror', error => {
                jsErrors.push(error.message);
            });
            
            // Take screenshot for visual validation
            await page.screenshot({ 
                path: `performance-screenshots/${route.name}_${viewport.name}.png`,
                fullPage: false 
            });
            
            return {
                route: route.name,
                viewport: viewport.name,
                loadTime,
                webVitals,
                memoryUsage,
                networkStats,
                jsErrors: [...jsErrors],
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error(`Error testing ${route.name}: ${error.message}`);
            return {
                route: route.name,
                viewport: viewport.name,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        } finally {
            await context.close();
        }
    }
    
    async runBrowserTests(browserConfig) {
        console.log(`\n🌐 Testing with ${browserConfig.name.toUpperCase()}`);
        const browser = await browserConfig.launcher.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-dev-shm-usage']
        });
        
        const browserResults = [];
        
        try {
            for (const viewport of this.viewports) {
                for (const route of this.testRoutes) {
                    const result = await this.testPagePerformance(browser, viewport, route);
                    browserResults.push(result);
                    
                    // Small delay between tests
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } finally {
            await browser.close();
        }
        
        return {
            browser: browserConfig.name,
            results: browserResults,
            summary: this.calculateBrowserSummary(browserResults)
        };
    }
    
    calculateBrowserSummary(results) {
        const validResults = results.filter(r => !r.error);
        if (validResults.length === 0) return {};
        
        const metrics = {
            avgLoadTime: 0,
            avgFCP: 0,
            avgLCP: 0,
            avgCLS: 0,
            avgMemoryUsage: 0,
            totalRequests: 0,
            errorCount: results.filter(r => r.error).length
        };
        
        validResults.forEach(result => {
            metrics.avgLoadTime += result.loadTime || 0;
            metrics.avgFCP += result.webVitals?.fcp || 0;
            metrics.avgLCP += result.webVitals?.lcp || 0;
            metrics.avgCLS += result.webVitals?.cls || 0;
            metrics.avgMemoryUsage += result.memoryUsage?.used || 0;
            metrics.totalRequests += result.networkStats?.totalRequests || 0;
        });
        
        const count = validResults.length;
        metrics.avgLoadTime = Math.round(metrics.avgLoadTime / count);
        metrics.avgFCP = Math.round(metrics.avgFCP / count);
        metrics.avgLCP = Math.round(metrics.avgLCP / count);
        metrics.avgCLS = Number((metrics.avgCLS / count).toFixed(3));
        metrics.avgMemoryUsage = Math.round(metrics.avgMemoryUsage / count);
        metrics.totalRequests = Math.round(metrics.totalRequests / count);
        
        return metrics;
    }
    
    generateRecommendations(allResults) {
        const recommendations = [];
        
        // Analyze load times
        const avgLoadTimes = allResults.map(br => br.summary.avgLoadTime).filter(t => t > 0);
        const maxLoadTime = Math.max(...avgLoadTimes);
        if (maxLoadTime > 3000) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Performance',
                issue: `Slow page load times detected (max: ${maxLoadTime}ms)`,
                recommendation: 'Implement code splitting, optimize bundle size, enable compression'
            });
        }
        
        // Analyze LCP
        const avgLCP = allResults.reduce((sum, br) => sum + (br.summary.avgLCP || 0), 0) / allResults.length;
        if (avgLCP > 2500) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Core Web Vitals',
                issue: `Poor Largest Contentful Paint (${Math.round(avgLCP)}ms)`,
                recommendation: 'Optimize images, implement lazy loading, improve server response time'
            });
        }
        
        // Analyze CLS
        const avgCLS = allResults.reduce((sum, br) => sum + (br.summary.avgCLS || 0), 0) / allResults.length;
        if (avgCLS > 0.1) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Core Web Vitals',
                issue: `Layout shifts detected (CLS: ${avgCLS.toFixed(3)})`,
                recommendation: 'Set explicit dimensions for images and ads, avoid inserting content above existing content'
            });
        }
        
        // Analyze memory usage
        const avgMemory = allResults.reduce((sum, br) => sum + (br.summary.avgMemoryUsage || 0), 0) / allResults.length;
        if (avgMemory > 50) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Memory',
                issue: `High memory usage detected (${Math.round(avgMemory)}MB)`,
                recommendation: 'Implement proper cleanup, optimize data structures, remove unused dependencies'
            });
        }
        
        return recommendations;
    }
    
    async runComprehensiveTest() {
        console.log('🚀 Starting FibreFlow Performance Testing...');
        console.log(`Base URL: ${this.baseUrl}`);
        console.log(`Testing ${this.testRoutes.length} routes across ${this.viewports.length} viewports`);
        
        // Create screenshots directory
        if (!fs.existsSync('performance-screenshots')) {
            fs.mkdirSync('performance-screenshots');
        }
        
        const allResults = [];
        
        for (const browserConfig of this.browsers) {
            try {
                const browserResults = await this.runBrowserTests(browserConfig);
                allResults.push(browserResults);
            } catch (error) {
                console.error(`Failed to test ${browserConfig.name}: ${error.message}`);
            }
        }
        
        // Generate comprehensive report
        this.results = {
            testConfig: {
                baseUrl: this.baseUrl,
                timestamp: new Date().toISOString(),
                routes: this.testRoutes.length,
                viewports: this.viewports.length,
                browsers: this.browsers.length
            },
            browserResults: allResults,
            recommendations: this.generateRecommendations(allResults),
            summary: {
                totalTests: allResults.reduce((sum, br) => sum + br.results.length, 0),
                passedTests: allResults.reduce((sum, br) => sum + br.results.filter(r => !r.error).length, 0),
                failedTests: allResults.reduce((sum, br) => sum + br.results.filter(r => r.error).length, 0)
            }
        };
        
        // Save results
        const reportPath = `performance-report-${Date.now()}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        
        console.log(`\n✅ Performance testing completed!`);
        console.log(`📊 Report saved to: ${reportPath}`);
        
        return this.results;
    }
}

// Export for use
export default FibreFlowPerformanceTester;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        const tester = new FibreFlowPerformanceTester();
        await tester.runComprehensiveTest();
    })();
}