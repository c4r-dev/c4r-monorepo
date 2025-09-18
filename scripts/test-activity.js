#!/usr/bin/env node

/**
 * Single activity Puppeteer test - accepts activity route as argument
 * Usage: node test-activity.js /tools/c4r-team-nextjs-template
 */

const puppeteer = require('puppeteer');
const logger = require('../packages/logging/logger.js');

async function testSingleActivity(activityRoute, options = {}) {
    const {
        headless = true,
        devtools = false,
        timeout = 30000,
        baseUrl = 'http://localhost:3333',
        screenshot = false
    } = options;
    
    const url = `${baseUrl}${activityRoute}`;
    logger.app.info(`🔍 Testing activity: ${url}`);
    
    const browser = await puppeteer.launch({ 
        headless,
        devtools,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Track network requests and console output
    const failedRequests = [];
    const consoleMessages = [];
    
    page.on('console', msg => {
        const message = `[${msg.type().toUpperCase()}] ${msg.text()}`;
        consoleMessages.push(message);
        logger.app.info(`  ${message}`);
    });
    
    page.on('pageerror', error => {
        const message = `[PAGE ERROR] ${error.message}`;
        consoleMessages.push(message);
        logger.app.info(`  ${message}`);
    });
    
    page.on('request', request => {
        logger.app.info(`  [REQUEST] ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
        const status = response.status();
        const url = response.url();
        if (status >= 400) {
            logger.app.info(`  [❌ ${status}] ${url}`);
            failedRequests.push({ status, url });
        } else {
            logger.app.info(`  [✅ ${status}] ${url}`);
        }
    });
    
    try {
        logger.app.info(`\n🌐 Navigating to ${url}...`);
        await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout 
        });
        
        // Wait for initial render
        await page.waitForTimeout(3000);
        
        // Analyze page content
        const pageAnalysis = await page.evaluate(() => {
            const body = document.body.innerText.toLowerCase();
            const title = document.title;
            
            return {
                title,
                hasError: body.includes('error') || body.includes('failed') || body.includes('404') || body.includes('500'),
                hasActivityContent: body.includes('activity') || body.includes('research') || body.includes('causality') || body.includes('randomization'),
                hasLoadingIndicator: body.includes('loading') || body.includes('initializing'),
                hasFallbackMode: body.includes('this activity is being served in fallback mode'),
                hasNextJSBootstrap: body.includes('loading next.js application'),
                hasReactContent: document.querySelector('#__next') !== null || document.querySelector('[data-reactroot]') !== null,
                bodyLength: body.length,
                bodyPreview: body.substring(0, 300)
            };
        });
        
        logger.app.info(`\n📄 Page Analysis:`);
        logger.app.info(`  Title: "${pageAnalysis.title}"`);
        logger.app.info(`  Has Error: ${pageAnalysis.hasError}`);
        logger.app.info(`  Has Activity Content: ${pageAnalysis.hasActivityContent}`);
        logger.app.info(`  Has Loading Indicator: ${pageAnalysis.hasLoadingIndicator}`);
        logger.app.info(`  Fallback Mode: ${pageAnalysis.hasFallbackMode}`);
        logger.app.info(`  Next.js Bootstrap: ${pageAnalysis.hasNextJSBootstrap}`);
        logger.app.info(`  React Content: ${pageAnalysis.hasReactContent}`);
        logger.app.info(`  Body Length: ${pageAnalysis.bodyLength} chars`);
        
        // Wait longer if loading
        if (pageAnalysis.hasLoadingIndicator) {
            logger.app.info(`⏳ Found loading indicator, waiting longer...`);
            await page.waitForTimeout(5000);
        }
        
        // Take screenshot if requested
        if (screenshot) {
            const screenshotName = `test-${activityRoute.split('/').pop() || 'activity'}.png`;
            await page.screenshot({ 
                path: screenshotName,
                fullPage: true 
            });
            logger.app.info(`📸 Screenshot saved: ${screenshotName}`);
        }
        
        // Final assessment
        const isWorking = failedRequests.length === 0 && !pageAnalysis.hasError;
        const mode = pageAnalysis.hasFallbackMode ? 'fallback' : 
                     pageAnalysis.hasNextJSBootstrap ? 'nextjs-bootstrap' :
                     pageAnalysis.hasReactContent ? 'react' : 'static';
        
        logger.app.info(`\n🎯 RESULT:`);
        logger.app.info(`  Status: ${isWorking ? '✅ Working' : '⚠️  Issues detected'}`);
        logger.app.info(`  Mode: ${mode}`);
        logger.app.info(`  Failed Requests: ${failedRequests.length}`);
        logger.app.info(`  Console Errors: ${consoleMessages.filter(m => m.includes('[ERROR]')).length}`);
        
        if (failedRequests.length > 0) {
            logger.app.info(`\n❌ Failed Requests:`);
            failedRequests.slice(0, 5).forEach(req => {
                logger.app.info(`     ${req.status} ${req.url}`);
            });
            if (failedRequests.length > 5) {
                logger.app.info(`     ... and ${failedRequests.length - 5} more`);
            }
        }
        
        await browser.close();
        
        return {
            url,
            activityRoute,
            isWorking,
            mode,
            failedRequests: failedRequests.length,
            consoleErrors: consoleMessages.filter(m => m.includes('[ERROR]')).length,
            analysis: pageAnalysis
        };
        
    } catch (error) {
        logger.app.error(`\n❌ Test failed: ${error.message}`);
        await browser.close();
        
        return {
            url,
            activityRoute,
            isWorking: false,
            mode: 'error',
            failedRequests: failedRequests.length,
            consoleErrors: consoleMessages.filter(m => m.includes('[ERROR]')).length,
            error: error.message
        };
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        logger.app.info(`
Usage: node test-activity.js <activity-route> [options]

Examples:
  node test-activity.js /tools/c4r-team-nextjs-template
  node test-activity.js /causality/jhu-flu-dag-v1 --headless=false --screenshot
  node test-activity.js /randomization/smi-ran-why-ran-v1 --devtools

Options:
  --headless=false    Run with visible browser
  --devtools          Open Chrome DevTools
  --screenshot        Take a screenshot
  --timeout=30000     Set timeout in milliseconds
  --baseurl=URL       Override base URL (default: http://localhost:3333)
        `);
        process.exit(1);
    }
    
    const activityRoute = args[0];
    
    // Parse options
    const options = {
        headless: !args.includes('--headless=false'),
        devtools: args.includes('--devtools'),
        screenshot: args.includes('--screenshot'),
        timeout: parseInt(args.find(arg => arg.startsWith('--timeout='))?.split('=')[1]) || 30000,
        baseUrl: args.find(arg => arg.startsWith('--baseurl='))?.split('=')[1] || 'http://localhost:3333'
    };
    
    if (!activityRoute.startsWith('/')) {
        logger.app.error('❌ Activity route must start with / (e.g., /tools/c4r-team-nextjs-template)');
        process.exit(1);
    }
    
    logger.app.info(`🧪 C4R Activity Tester`);
    logger.app.info(`🎯 Testing: ${activityRoute}`);
    logger.app.info(`⚙️  Options: ${JSON.stringify(options, null, 2)}\n`);
    
    const result = await testSingleActivity(activityRoute, options);
    
    logger.app.info(`\n🏁 Test complete!`);
    return result;
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testSingleActivity };