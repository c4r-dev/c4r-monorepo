const puppeteer = require('puppeteer');

// 4 random activities for detailed problem analysis
const testActivities = [
    '/tools/neuroserpin_v0',
    '/causality/jhu-flu-dag-v1', 
    '/randomization/smi-ran-simple-ran-v1',
    '/collaboration/r2r-stats-wizard-v1'
];

async function testRandomActivitiesDetailed() {
    console.log('🔍 Testing 4 random activities for detailed problem analysis...\n');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Track all network requests and responses
    const allRequests = [];
    const failedRequests = [];
    const consoleErrors = [];
    const networkErrors = [];
    
    // Enable request interception
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
        allRequests.push({
            url: request.url(),
            method: request.method(),
            resourceType: request.resourceType()
        });
        request.continue();
    });
    
    page.on('requestfailed', (request) => {
        failedRequests.push({
            url: request.url(),
            failure: request.failure(),
            resourceType: request.resourceType()
        });
    });
    
    page.on('response', (response) => {
        if (response.status() >= 400) {
            networkErrors.push({
                url: response.url(),
                status: response.status(),
                statusText: response.statusText(),
                resourceType: response.request().resourceType()
            });
        }
    });
    
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            consoleErrors.push({
                text: msg.text(),
                location: msg.location()
            });
        }
    });
    
    const activityResults = [];
    
    for (let i = 0; i < testActivities.length; i++) {
        const activity = testActivities[i];
        console.log(`\n[${i+1}/${testActivities.length}] Testing: ${activity}`);
        console.log('='.repeat(60));
        
        // Reset tracking arrays for this activity
        allRequests.length = 0;
        failedRequests.length = 0;
        consoleErrors.length = 0;
        networkErrors.length = 0;
        
        try {
            const url = `http://localhost:3333${activity}`;
            const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
            
            // Wait a bit more for any delayed requests
            await page.waitForTimeout(2000);
            
            const title = await page.title();
            const bodyContent = await page.evaluate(() => document.body.innerText.length);
            
            // Check for specific error indicators
            const hasErrorPage = await page.evaluate(() => {
                const text = document.body.innerText.toLowerCase();
                return text.includes('error') || text.includes('not found') || text.includes('500') || text.includes('404');
            });
            
            // Analyze font loading
            const fontFamily = await page.evaluate(() => {
                const body = document.querySelector('body');
                return window.getComputedStyle(body).fontFamily;
            });
            
            const result = {
                activity,
                status: response.status(),
                title,
                bodyContentLength: bodyContent,
                hasErrorPage,
                fontFamily,
                totalRequests: allRequests.length,
                failedRequests: [...failedRequests],
                networkErrors: [...networkErrors],
                consoleErrors: [...consoleErrors],
                requestsByType: {}
            };
            
            // Categorize requests by type
            const requestTypes = {};
            allRequests.forEach(req => {
                requestTypes[req.resourceType] = (requestTypes[req.resourceType] || 0) + 1;
            });
            result.requestsByType = requestTypes;
            
            activityResults.push(result);
            
            console.log(`✅ ${activity} - Status: ${response.status()}`);
            console.log(`   Title: "${title}"`);
            console.log(`   Body content: ${bodyContent} characters`);
            console.log(`   Font: ${fontFamily}`);
            console.log(`   Total requests: ${allRequests.length}`);
            console.log(`   Failed requests: ${failedRequests.length}`);
            console.log(`   Network errors (4xx/5xx): ${networkErrors.length}`);
            console.log(`   Console errors: ${consoleErrors.length}`);
            
            if (networkErrors.length > 0) {
                console.log(`\n   🚨 Network Errors:`);
                networkErrors.forEach(err => {
                    console.log(`     - ${err.status} ${err.url} (${err.resourceType})`);
                });
            }
            
            if (consoleErrors.length > 0) {
                console.log(`\n   🚨 Console Errors:`);
                consoleErrors.slice(0, 3).forEach(err => {
                    console.log(`     - ${err.text}`);
                });
                if (consoleErrors.length > 3) {
                    console.log(`     ... and ${consoleErrors.length - 3} more`);
                }
            }
            
        } catch (error) {
            const result = {
                activity,
                error: error.message,
                failedRequests: [...failedRequests],
                networkErrors: [...networkErrors],
                consoleErrors: [...consoleErrors]
            };
            activityResults.push(result);
            
            console.log(`❌ ${activity} - Error: ${error.message}`);
        }
    }
    
    await browser.close();
    
    // Comprehensive problem analysis
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE PROBLEM ANALYSIS');
    console.log('='.repeat(80));
    
    // Collect all unique problems
    const allNetworkErrors = [];
    const allConsoleErrors = [];
    const allFailedRequests = [];
    const fontIssues = [];
    const performanceIssues = [];
    
    activityResults.forEach(result => {
        if (result.networkErrors) {
            allNetworkErrors.push(...result.networkErrors.map(err => ({...err, activity: result.activity})));
        }
        if (result.consoleErrors) {
            allConsoleErrors.push(...result.consoleErrors.map(err => ({...err, activity: result.activity})));
        }
        if (result.failedRequests) {
            allFailedRequests.push(...result.failedRequests.map(req => ({...req, activity: result.activity})));
        }
        
        // Check font issues
        if (result.fontFamily && !result.fontFamily.includes('Inter')) {
            fontIssues.push({
                activity: result.activity,
                fontFamily: result.fontFamily
            });
        }
        
        // Check performance issues
        if (result.totalRequests > 50) {
            performanceIssues.push({
                activity: result.activity,
                totalRequests: result.totalRequests,
                issue: 'High request count'
            });
        }
    });
    
    // Group 404s by pattern
    const notFoundErrors = allNetworkErrors.filter(err => err.status === 404);
    const notFoundPatterns = {};
    notFoundErrors.forEach(err => {
        const url = new URL(err.url);
        const pattern = url.pathname.split('/').slice(0, -1).join('/') + '/*';
        notFoundPatterns[pattern] = (notFoundPatterns[pattern] || 0) + 1;
    });
    
    console.log(`\n🚨 404 ERRORS (${notFoundErrors.length} total):`);
    Object.entries(notFoundPatterns).forEach(([pattern, count]) => {
        console.log(`   ${count}x ${pattern}`);
    });
    
    if (notFoundErrors.length > 0) {
        console.log(`\n   Specific 404s:`);
        notFoundErrors.slice(0, 10).forEach(err => {
            console.log(`     - ${err.url} (${err.activity})`);
        });
        if (notFoundErrors.length > 10) {
            console.log(`     ... and ${notFoundErrors.length - 10} more`);
        }
    }
    
    console.log(`\n🚨 OTHER HTTP ERRORS:`);
    const otherErrors = allNetworkErrors.filter(err => err.status !== 404);
    otherErrors.forEach(err => {
        console.log(`   ${err.status} - ${err.url} (${err.activity})`);
    });
    
    console.log(`\n🚨 CONSOLE ERRORS:`);
    const uniqueConsoleErrors = [...new Set(allConsoleErrors.map(err => err.text))];
    uniqueConsoleErrors.slice(0, 5).forEach(error => {
        console.log(`   - ${error}`);
    });
    if (uniqueConsoleErrors.length > 5) {
        console.log(`   ... and ${uniqueConsoleErrors.length - 5} more unique errors`);
    }
    
    console.log(`\n🎨 FONT ISSUES:`);
    if (fontIssues.length === 0) {
        console.log(`   ✅ All activities using correct fonts`);
    } else {
        fontIssues.forEach(issue => {
            console.log(`   - ${issue.activity}: ${issue.fontFamily}`);
        });
    }
    
    console.log(`\n⚡ PERFORMANCE ISSUES:`);
    if (performanceIssues.length === 0) {
        console.log(`   ✅ No major performance issues detected`);
    } else {
        performanceIssues.forEach(issue => {
            console.log(`   - ${issue.activity}: ${issue.issue} (${issue.totalRequests} requests)`);
        });
    }
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Activities tested: ${testActivities.length}`);
    console.log(`   Total 404 errors: ${notFoundErrors.length}`);
    console.log(`   Total other HTTP errors: ${otherErrors.length}`);
    console.log(`   Unique console errors: ${uniqueConsoleErrors.length}`);
    console.log(`   Font issues: ${fontIssues.length}`);
    console.log(`   Performance issues: ${performanceIssues.length}`);
}

testRandomActivitiesDetailed().catch(console.error);