const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const logger = require('../packages/logging/logger.js');

async function testActivitiesWithErrorDetection() {
    logger.app.info('🔍 Testing activities with comprehensive error detection...');
    
    // Create error screenshots directory
    const errorScreenshotsDir = path.join(__dirname, 'error-screenshots');
    if (!fs.existsSync(errorScreenshotsDir)) {
        fs.mkdirSync(errorScreenshotsDir);
    }
    
    const browser = await puppeteer.launch({ 
        headless: false,  // Show browser for visual debugging
        defaultViewport: { width: 1280, height: 720 },
        devtools: true   // Open DevTools automatically
    });
    
    const page = await browser.newPage();
    
    // Enable console logging from the page
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        const icon = type === 'error' ? '🔴' : type === 'warn' ? '🟡' : '🔵';
        logger.app.info(`   ${icon} [BROWSER ${type.toUpperCase()}]: ${text}`);
    });
    
    // Enable error detection
    page.on('pageerror', error => {
        logger.app.info(`   💥 [PAGE ERROR]: ${error.message}`);
    });
    
    // Enable response monitoring
    page.on('response', response => {
        const status = response.status();
        const url = response.url();
        if (status >= 400) {
            logger.app.info(`   ⚠️  [HTTP ${status}]: ${url}`);
        }
    });
    
    // Enable request failure monitoring
    page.on('requestfailed', request => {
        logger.app.info(`   ❌ [REQUEST FAILED]: ${request.url()} - ${request.failure().errorText}`);
    });
    
    try {
        // Get activities from API
        logger.app.info('📋 Fetching activity list...');
        await page.goto('http://localhost:3333/api/activities', { waitUntil: 'networkidle0' });
        const activitiesJson = await page.evaluate(() => document.body.innerText);
        const activities = JSON.parse(activitiesJson);
        logger.app.info(`📦 Testing ${activities.length} activities with error detection\n`);
        
        let results = {
            working: [],
            errorsDetected: [],
            failed: []
        };
        
        for (let i = 0; i < Math.min(activities.length, 10); i++) { // Test first 10 for detailed analysis
            const activity = activities[i];
            const url = activity.url;
            const activityName = `${activity.domain}-${activity.name}`;
            
            logger.app.info(`\n🔗 [${i+1}/10] Testing: ${activity.route}`);
            logger.app.info(`   URL: ${url}`);
            
            try {
                // Clear console and error logs
                let pageErrors = [];
                let consoleErrors = [];
                let httpErrors = [];
                let requestFailures = [];
                
                // Set up error collectors for this specific test
                const errorHandler = (error) => pageErrors.push(error.message);
                const consoleHandler = (msg) => {
                    if (msg.type() === 'error') {
                        consoleErrors.push(msg.text());
                    }
                };
                const responseHandler = (response) => {
                    if (response.status() >= 400) {
                        httpErrors.push(`${response.status()}: ${response.url()}`);
                    }
                };
                const requestFailHandler = (request) => {
                    requestFailures.push(`${request.url()}: ${request.failure().errorText}`);
                };
                
                page.on('pageerror', errorHandler);
                page.on('console', consoleHandler);
                page.on('response', responseHandler);
                page.on('requestfailed', requestFailHandler);
                
                const response = await page.goto(url, { 
                    waitUntil: 'domcontentloaded', 
                    timeout: 15000 
                });
                
                // Wait for content to load
                await page.waitForTimeout(3000);
                
                // Take screenshot regardless of status
                const screenshotPath = path.join(errorScreenshotsDir, `${activityName}.png`);
                await page.screenshot({ 
                    path: screenshotPath, 
                    fullPage: true 
                });
                
                // Analyze page content for errors
                const errorAnalysis = await page.evaluate(() => {
                    const body = document.body;
                    const textContent = body.innerText.toLowerCase();
                    const htmlContent = body.innerHTML.toLowerCase();
                    
                    // Look for various error indicators
                    const errorIndicators = {
                        jsErrors: textContent.includes('error') || 
                                 textContent.includes('uncaught') ||
                                 textContent.includes('cannot read') ||
                                 textContent.includes('undefined'),
                        
                        httpErrors: textContent.includes('404') || 
                                   textContent.includes('500') || 
                                   textContent.includes('502') ||
                                   textContent.includes('503'),
                        
                        buildErrors: textContent.includes('compilation failed') ||
                                    textContent.includes('build failed') ||
                                    textContent.includes('webpack') ||
                                    textContent.includes('module not found'),
                        
                        reactErrors: textContent.includes('react') && textContent.includes('error') ||
                                    textContent.includes('jsx') ||
                                    textContent.includes('component'),
                        
                        nextjsErrors: textContent.includes('next.js') && textContent.includes('error') ||
                                     textContent.includes('_next') && textContent.includes('error'),
                        
                        cssErrors: textContent.includes('css') && textContent.includes('error') ||
                                  textContent.includes('stylesheet'),
                        
                        networkErrors: textContent.includes('network') && textContent.includes('error') ||
                                      textContent.includes('fetch') && textContent.includes('failed'),
                        
                        fallbackMode: textContent.includes('fallback mode') ||
                                     textContent.includes('being served seamlessly'),
                        
                        whiteScreen: textContent.trim().length < 50,
                        
                        loadingStuck: textContent.includes('loading') && textContent.length < 200
                    };
                    
                    // Extract visible error messages
                    const errorElements = document.querySelectorAll('*');
                    const visibleErrors = [];
                    
                    errorElements.forEach(el => {
                        const text = el.textContent;
                        if (text && (
                            text.includes('Error:') ||
                            text.includes('TypeError:') ||
                            text.includes('ReferenceError:') ||
                            text.includes('SyntaxError:') ||
                            text.includes('Failed to') ||
                            text.includes('Cannot')
                        )) {
                            visibleErrors.push(text.substring(0, 200));
                        }
                    });
                    
                    // Check for dev tools indicators
                    const hasDevOverlay = document.querySelector('[data-nextjs-dialog-overlay]') !== null ||
                                         document.querySelector('.react-dev-overlay') !== null ||
                                         document.querySelector('.webpack-dev-server-client-overlay') !== null;
                    
                    return {
                        errorIndicators,
                        visibleErrors: [...new Set(visibleErrors)], // Remove duplicates
                        hasDevOverlay,
                        textLength: document.body.innerText.length,
                        title: document.title || 'No title',
                        firstContent: document.body.innerText.substring(0, 300)
                    };
                });
                
                // Clean up event listeners
                page.off('pageerror', errorHandler);
                page.off('console', consoleHandler);
                page.off('response', responseHandler);
                page.off('requestfailed', requestFailHandler);
                
                // Categorize the result
                const hasAnyErrors = pageErrors.length > 0 || 
                                   consoleErrors.length > 0 || 
                                   httpErrors.length > 0 || 
                                   requestFailures.length > 0 ||
                                   Object.values(errorAnalysis.errorIndicators).some(Boolean) ||
                                   errorAnalysis.visibleErrors.length > 0;
                
                const status = response?.status() || 0;
                
                if (hasAnyErrors || status >= 400) {
                    logger.app.info(`   ❌ ERRORS DETECTED`);
                    
                    const errorDetails = {
                        activity,
                        screenshotPath,
                        status,
                        pageErrors,
                        consoleErrors,
                        httpErrors,
                        requestFailures,
                        errorAnalysis,
                        timestamp: new Date().toISOString()
                    };
                    
                    results.errorsDetected.push(errorDetails);
                    
                    // Log detailed error information
                    if (pageErrors.length > 0) {
                        logger.app.info(`   📄 Page Errors (${pageErrors.length}):`);
                        pageErrors.forEach(err => logger.app.info(`     • ${err}`));
                    }
                    
                    if (consoleErrors.length > 0) {
                        logger.app.info(`   🖥️  Console Errors (${consoleErrors.length}):`);
                        consoleErrors.forEach(err => logger.app.info(`     • ${err}`));
                    }
                    
                    if (httpErrors.length > 0) {
                        logger.app.info(`   🌐 HTTP Errors (${httpErrors.length}):`);
                        httpErrors.forEach(err => logger.app.info(`     • ${err}`));
                    }
                    
                    if (errorAnalysis.visibleErrors.length > 0) {
                        logger.app.info(`   👁️  Visible Errors (${errorAnalysis.visibleErrors.length}):`);
                        errorAnalysis.visibleErrors.forEach(err => logger.app.info(`     • ${err.substring(0, 100)}...`));
                    }
                    
                    // Log detected error indicators
                    const activeIndicators = Object.entries(errorAnalysis.errorIndicators)
                        .filter(([key, value]) => value)
                        .map(([key]) => key);
                    
                    if (activeIndicators.length > 0) {
                        logger.app.info(`   🚨 Error Indicators: ${activeIndicators.join(', ')}`);
                    }
                    
                } else if (status === 200 && errorAnalysis.textLength > 50) {
                    logger.app.info(`   ✅ Working properly`);
                    results.working.push({
                        activity,
                        screenshotPath,
                        errorAnalysis
                    });
                } else {
                    logger.app.info(`   ⚠️  Status ${status}, minimal content`);
                    results.failed.push({
                        activity,
                        screenshotPath,
                        status,
                        errorAnalysis
                    });
                }
                
                logger.app.info(`   📸 Screenshot saved: ${screenshotPath}`);
                
            } catch (error) {
                logger.app.info(`   💥 Test failed: ${error.message}`);
                results.failed.push({
                    activity,
                    error: error.message,
                    screenshotPath: null
                });
            }
        }
        
        // Generate detailed error report
        logger.app.info('\n' + '='.repeat(80));
        logger.app.info('📊 ERROR DETECTION SUMMARY');
        logger.app.info('='.repeat(80));
        logger.app.info(`✅ Working properly: ${results.working.length}/10`);
        logger.app.info(`❌ Errors detected: ${results.errorsDetected.length}/10`);
        logger.app.info(`⚠️  Failed to test: ${results.failed.length}/10`);
        
        if (results.errorsDetected.length > 0) {
            logger.app.info('\n🔍 DETAILED ERROR ANALYSIS:');
            results.errorsDetected.forEach((result, index) => {
                logger.app.info(`\n${index + 1}. ${result.activity.route}:`);
                logger.app.info(`   Status: ${result.status}`);
                logger.app.info(`   Page Errors: ${result.pageErrors.length}`);
                logger.app.info(`   Console Errors: ${result.consoleErrors.length}`);
                logger.app.info(`   HTTP Errors: ${result.httpErrors.length}`);
                logger.app.info(`   Screenshot: ${result.screenshotPath}`);
                
                const indicators = Object.entries(result.errorAnalysis.errorIndicators)
                    .filter(([key, value]) => value)
                    .map(([key]) => key);
                if (indicators.length > 0) {
                    logger.app.info(`   Error Types: ${indicators.join(', ')}`);
                }
            });
        }
        
        // Save detailed report
        const reportPath = path.join(__dirname, 'error-detection-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
                tested: 10,
                working: results.working.length,
                errorsDetected: results.errorsDetected.length,
                failed: results.failed.length
            },
            results
        }, null, 2));
        
        logger.app.info(`\n📄 Detailed error report saved: ${reportPath}`);
        logger.app.info(`📁 Error screenshots directory: ${errorScreenshotsDir}`);
        logger.app.info('\n🎯 Use the screenshots to visually inspect any errors detected!');
        
    } catch (error) {
        logger.app.error('❌ Failed to run error detection:', error);
    } finally {
        // Keep browser open for manual inspection
        logger.app.info('\n🔍 Browser left open for manual inspection. Close when done.');
        // await browser.close();
    }
}

testActivitiesWithErrorDetection().catch(console.error);