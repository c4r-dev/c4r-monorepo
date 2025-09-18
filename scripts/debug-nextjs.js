#!/usr/bin/env node

/**
 * Debug script for Next.js activities using Puppeteer
 */

const puppeteer = require('puppeteer');
const logger = require('../packages/logging/logger.js');

async function debugNextJSActivity(url) {
    logger.app.info(`🔍 Debugging: ${url}`);
    
    const browser = await puppeteer.launch({ 
        headless: false, // Run visibly for debugging
        devtools: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Track all network failures
    const failedRequests = [];
    const consoleErrors = [];
    
    // Enable console logging
    page.on('console', msg => {
        const message = `[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`;
        logger.app.info(message);
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });
    
    // Enable error logging
    page.on('pageerror', error => {
        logger.app.info(`[PAGE ERROR] ${error.message}`);
        consoleErrors.push(error.message);
    });
    
    // Enable request/response logging
    page.on('request', request => {
        logger.app.info(`[REQUEST] ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
        const status = response.status();
        const url = response.url();
        if (status >= 400) {
            logger.app.info(`[RESPONSE ERROR] ${status} ${url}`);
            failedRequests.push({ status, url });
        } else {
            logger.app.info(`[RESPONSE OK] ${status} ${url}`);
        }
    });
    
    try {
        logger.app.info(`Navigating to ${url}...`);
        await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        // Wait for initial render
        await page.waitForTimeout(3000);
        
        // Check if page loaded successfully
        const title = await page.title();
        logger.app.info(`Page title: ${title}`);
        
        // Check if we have actual content (not just error pages)
        const hasRealContent = await page.evaluate(() => {
            // Look for signs this is working content vs error pages
            const body = document.body.innerText.toLowerCase();
            const hasError = body.includes('error') || body.includes('failed') || body.includes('404') || body.includes('500');
            const hasActivityContent = body.includes('activity') || body.includes('research') || body.includes('causality') || body.includes('randomization');
            const hasLoadingIndicator = body.includes('loading') || body.includes('initializing');
            
            return {
                hasError,
                hasActivityContent,
                hasLoadingIndicator,
                bodyLength: body.length,
                bodyPreview: body.substring(0, 200)
            };
        });
        
        logger.app.info('Content analysis:', hasRealContent);
        
        // Wait longer if we see loading indicators
        if (hasRealContent.hasLoadingIndicator) {
            logger.app.info('Found loading indicator, waiting longer...');
            await page.waitForTimeout(5000);
        }
        
        // Check for any error messages in DOM
        const errorElements = await page.evaluate(() => {
            const errorSelectors = [
                '[class*="error"]', '[class*="Error"]', 
                '[id*="error"]', '[id*="Error"]',
                '.error-message', '.error-container',
                'h1', 'h2' // Check headers for error messages
            ];
            
            const errors = [];
            errorSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    const text = el.textContent.trim();
                    if (text.toLowerCase().includes('error') || 
                        text.toLowerCase().includes('failed') ||
                        text.toLowerCase().includes('not found')) {
                        errors.push(text);
                    }
                });
            });
            
            return errors;
        });
        
        if (errorElements.length > 0) {
            logger.app.info('Found error messages in DOM:', errorElements);
        }
        
        // Final assessment
        const success = failedRequests.length === 0 && consoleErrors.length === 0 && !hasRealContent.hasError;
        logger.app.info(`\n🎯 ASSESSMENT for ${url}:`);
        logger.app.info(`  ✅ Success: ${success}`);
        logger.app.info(`  📊 Failed requests: ${failedRequests.length}`);
        logger.app.info(`  🚨 Console errors: ${consoleErrors.length}`);
        logger.app.info(`  📄 Has real content: ${hasRealContent.hasActivityContent}`);
        
        if (failedRequests.length > 0) {
            logger.app.info('  🔴 Failed requests:', failedRequests);
        }
        
        // Take a screenshot
        const screenshotName = `debug-${url.split('/').pop() || 'dashboard'}.png`;
        await page.screenshot({ 
            path: screenshotName,
            fullPage: true 
        });
        logger.app.info(`📸 Screenshot saved: ${screenshotName}`);
        
        return {
            url,
            success,
            failedRequests,
            consoleErrors,
            contentAnalysis: hasRealContent,
            title
        };
        
    } catch (error) {
        logger.app.error(`❌ Error debugging ${url}:`, error.message);
        return {
            url,
            success: false,
            error: error.message
        };
    }
    
    await browser.close();
}

async function main() {
    logger.app.info('🧪 Starting limited C4R activity testing (3 random activities)...\n');
    
    const allTestUrls = [
        'http://localhost:3333/',
        'http://localhost:3333/browse',
        'http://localhost:3333/causality/jhu-polio-ice-cream-v1',
        'http://localhost:3333/causality/jhu-flu-dag-v1', 
        'http://localhost:3333/tools/c4r-team-nextjs-template',
        'http://localhost:3333/tools/wason-2-4-6-next-test',
        'http://localhost:3333/coding-practices/hms-wason-246-v1',
        'http://localhost:3333/collaboration/r2r-whiteboard-v1',
        'http://localhost:3333/randomization/smi-ran-why-ran-v1'
    ];
    
    // Randomly select 3 URLs to test
    const shuffled = allTestUrls.sort(() => 0.5 - Math.random());
    const testUrls = shuffled.slice(0, 3);
    
    logger.app.info(`📋 Selected URLs for testing:`);
    testUrls.forEach((url, i) => logger.app.info(`  ${i + 1}. ${url}`));
    logger.app.info('\n');
    
    const results = [];
    
    for (const url of testUrls) {
        const result = await debugNextJSActivity(url);
        results.push(result);
        logger.app.info('=' .repeat(80) + '\n');
        
        // Brief pause between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Generate summary report
    logger.app.info('\n📊 COMPREHENSIVE TEST REPORT');
    logger.app.info('=' .repeat(80));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    logger.app.info(`\n✅ Successful: ${successful.length}/${results.length}`);
    logger.app.info(`❌ Failed: ${failed.length}/${results.length}`);
    
    if (successful.length > 0) {
        logger.app.info('\n🎉 WORKING ACTIVITIES:');
        successful.forEach(r => {
            logger.app.info(`  ✅ ${r.url} - "${r.title}"`);
        });
    }
    
    if (failed.length > 0) {
        logger.app.info('\n🚨 FAILING ACTIVITIES:');
        failed.forEach(r => {
            logger.app.info(`  ❌ ${r.url}`);
            if (r.error) {
                logger.app.info(`     Error: ${r.error}`);
            }
            if (r.failedRequests && r.failedRequests.length > 0) {
                logger.app.info(`     Failed requests: ${r.failedRequests.length}`);
                r.failedRequests.slice(0, 3).forEach(req => {
                    logger.app.info(`       ${req.status} ${req.url}`);
                });
            }
        });
    }
    
    // Specific recommendations
    logger.app.info('\n💡 RECOMMENDATIONS:');
    
    const hasAssetFailures = failed.some(r => 
        r.failedRequests && r.failedRequests.some(req => 
            req.url.includes('/_next/static/') || req.url.includes('/static/')
        )
    );
    
    if (hasAssetFailures) {
        logger.app.info('  🔧 Fix static asset serving for Next.js apps');
    }
    
    const hasNextJSErrors = failed.some(r => 
        r.consoleErrors && r.consoleErrors.some(err => 
            err.includes('webpack') || err.includes('next')
        )
    );
    
    if (hasNextJSErrors) {
        logger.app.info('  🔧 Resolve Next.js runtime conflicts');
        logger.app.info('  💡 Consider switching to static build approach');
    }
    
    const serverErrorCount = failed.filter(r => 
        r.failedRequests && r.failedRequests.some(req => req.status >= 500)
    ).length;
    
    if (serverErrorCount > 0) {
        logger.app.info(`  🔧 Fix ${serverErrorCount} server errors (5xx responses)`);
    }
    
    logger.app.info('\n🏁 Testing complete!');
    
    return {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        successRate: Math.round((successful.length / results.length) * 100),
        results
    };
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { debugNextJSActivity };