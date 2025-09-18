const puppeteer = require('puppeteer');
const logger = require('../packages/logging/logger.js');

// 4 random activities for detailed problem analysis
const testActivities = [
    '/tools/neuroserpin_v0',
    '/causality/jhu-flu-dag-v1', 
    '/randomization/smi-ran-simple-ran-v1',
    '/collaboration/r2r-stats-wizard-v1'
];

async function testRandomActivitiesDetailed() {
    logger.app.info('🔍 Testing 4 random activities for detailed problem analysis...\n');
    
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
        logger.app.info(`\n[${i+1}/${testActivities.length}] Testing: ${activity}`);
        logger.app.info('='.repeat(60));
        
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
            
            logger.app.info(`✅ ${activity} - Status: ${response.status()}`);
            logger.app.info(`   Title: "${title}"`);
            logger.app.info(`   Body content: ${bodyContent} characters`);
            logger.app.info(`   Font: ${fontFamily}`);
            logger.app.info(`   Total requests: ${allRequests.length}`);
            logger.app.info(`   Failed requests: ${failedRequests.length}`);
            logger.app.info(`   Network errors (4xx/5xx): ${networkErrors.length}`);
            logger.app.info(`   Console errors: ${consoleErrors.length}`);
            
            if (networkErrors.length > 0) {
                logger.app.info(`\n   🚨 Network Errors:`);
                networkErrors.forEach(err => {
                    logger.app.info(`     - ${err.status} ${err.url} (${err.resourceType})`);
                });
            }
            
            if (consoleErrors.length > 0) {
                logger.app.info(`\n   🚨 Console Errors:`);
                consoleErrors.slice(0, 3).forEach(err => {
                    logger.app.info(`     - ${err.text}`);
                });
                if (consoleErrors.length > 3) {
                    logger.app.info(`     ... and ${consoleErrors.length - 3} more`);
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
            
            logger.app.info(`❌ ${activity} - Error: ${error.message}`);
        }
    }
    
    await browser.close();
    
    // Comprehensive problem analysis
    logger.app.info('\n' + '='.repeat(80));
    logger.app.info('📊 COMPREHENSIVE PROBLEM ANALYSIS');
    logger.app.info('='.repeat(80));
    
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
    
    logger.app.info(`\n🚨 404 ERRORS (${notFoundErrors.length} total):`);
    Object.entries(notFoundPatterns).forEach(([pattern, count]) => {
        logger.app.info(`   ${count}x ${pattern}`);
    });
    
    if (notFoundErrors.length > 0) {
        logger.app.info(`\n   Specific 404s:`);
        notFoundErrors.slice(0, 10).forEach(err => {
            logger.app.info(`     - ${err.url} (${err.activity})`);
        });
        if (notFoundErrors.length > 10) {
            logger.app.info(`     ... and ${notFoundErrors.length - 10} more`);
        }
    }
    
    logger.app.info(`\n🚨 OTHER HTTP ERRORS:`);
    const otherErrors = allNetworkErrors.filter(err => err.status !== 404);
    otherErrors.forEach(err => {
        logger.app.info(`   ${err.status} - ${err.url} (${err.activity})`);
    });
    
    logger.app.info(`\n🚨 CONSOLE ERRORS:`);
    const uniqueConsoleErrors = [...new Set(allConsoleErrors.map(err => err.text))];
    uniqueConsoleErrors.slice(0, 5).forEach(error => {
        logger.app.info(`   - ${error}`);
    });
    if (uniqueConsoleErrors.length > 5) {
        logger.app.info(`   ... and ${uniqueConsoleErrors.length - 5} more unique errors`);
    }
    
    logger.app.info(`\n🎨 FONT ISSUES:`);
    if (fontIssues.length === 0) {
        logger.app.info(`   ✅ All activities using correct fonts`);
    } else {
        fontIssues.forEach(issue => {
            logger.app.info(`   - ${issue.activity}: ${issue.fontFamily}`);
        });
    }
    
    logger.app.info(`\n⚡ PERFORMANCE ISSUES:`);
    if (performanceIssues.length === 0) {
        logger.app.info(`   ✅ No major performance issues detected`);
    } else {
        performanceIssues.forEach(issue => {
            logger.app.info(`   - ${issue.activity}: ${issue.issue} (${issue.totalRequests} requests)`);
        });
    }
    
    logger.app.info(`\n📈 SUMMARY:`);
    logger.app.info(`   Activities tested: ${testActivities.length}`);
    logger.app.info(`   Total 404 errors: ${notFoundErrors.length}`);
    logger.app.info(`   Total other HTTP errors: ${otherErrors.length}`);
    logger.app.info(`   Unique console errors: ${uniqueConsoleErrors.length}`);
    logger.app.info(`   Font issues: ${fontIssues.length}`);
    logger.app.info(`   Performance issues: ${performanceIssues.length}`);
}

testRandomActivitiesDetailed().catch(console.error);