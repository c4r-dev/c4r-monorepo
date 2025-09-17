const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function liveErrorMonitor() {
    console.log('🔍 Starting Live Error Monitor...');
    console.log('This will open a browser window to visually inspect activities');
    console.log('Press Ctrl+C to stop monitoring\n');
    
    const browser = await puppeteer.launch({ 
        headless: false,  // Show browser for visual debugging
        defaultViewport: { width: 1280, height: 720 },
        devtools: true,   // Open DevTools automatically
        slowMo: 100       // Slow down for better visibility
    });
    
    const page = await browser.newPage();
    
    // Create error log file
    const errorLogPath = path.join(__dirname, 'live-error-log.txt');
    const logStream = fs.createWriteStream(errorLogPath, { flags: 'a' });
    
    function logError(type, message, activityUrl = '') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${type}: ${message} ${activityUrl ? `(${activityUrl})` : ''}\n`;
        console.log(`🔴 ${logEntry.trim()}`);
        logStream.write(logEntry);
    }
    
    // Set up comprehensive error monitoring
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        const url = page.url();
        
        if (type === 'error') {
            logError('CONSOLE_ERROR', text, url);
        } else if (type === 'warn' && (text.includes('error') || text.includes('failed'))) {
            logError('CONSOLE_WARNING', text, url);
        }
    });
    
    page.on('pageerror', error => {
        logError('PAGE_ERROR', error.message, page.url());
    });
    
    page.on('response', response => {
        const status = response.status();
        const url = response.url();
        
        if (status >= 400) {
            logError('HTTP_ERROR', `${status} ${response.statusText()}`, url);
        }
    });
    
    page.on('requestfailed', request => {
        const url = request.url();
        const error = request.failure().errorText;
        logError('REQUEST_FAILED', error, url);
    });
    
    // Get activities list
    try {
        await page.goto('http://localhost:3333/api/activities', { waitUntil: 'networkidle0' });
        const activitiesJson = await page.evaluate(() => document.body.innerText);
        const activities = JSON.parse(activitiesJson);
        
        console.log(`📋 Found ${activities.length} activities to monitor`);
        console.log('🔍 Starting activity monitoring...\n');
        
        // Test activities one by one with detailed monitoring
        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];
            const url = activity.url;
            
            console.log(`\n🔗 [${i+1}/${activities.length}] Monitoring: ${activity.route}`);
            console.log(`   Type: ${activity.type} | Domain: ${activity.domain}`);
            console.log(`   URL: ${url}`);
            
            try {
                const response = await page.goto(url, { 
                    waitUntil: 'domcontentloaded', 
                    timeout: 10000 
                });
                
                // Wait for content and JavaScript to execute
                await page.waitForTimeout(2000);
                
                // Check page status
                const status = response?.status() || 0;
                console.log(`   📊 HTTP Status: ${status}`);
                
                // Analyze page content for error indicators
                const errorAnalysis = await page.evaluate(() => {
                    const textContent = document.body.innerText.toLowerCase();
                    const title = document.title;
                    
                    // Check for error indicators
                    const indicators = {
                        hasJSError: textContent.includes('error') || textContent.includes('uncaught'),
                        hasHTTPError: textContent.includes('404') || textContent.includes('500'),
                        hasBuildError: textContent.includes('compilation failed') || textContent.includes('webpack'),
                        hasNetworkError: textContent.includes('network error') || textContent.includes('fetch failed'),
                        isWhiteScreen: textContent.trim().length < 50,
                        isFallbackMode: textContent.includes('fallback mode'),
                        hasContent: textContent.length > 100
                    };
                    
                    // Look for visible error messages
                    const errorElements = document.querySelectorAll('*');
                    const visibleErrors = [];
                    
                    errorElements.forEach(el => {
                        const text = el.textContent;
                        if (text && text.length < 500 && (
                            text.includes('Error:') ||
                            text.includes('TypeError:') ||
                            text.includes('Failed to') ||
                            text.includes('Cannot ')
                        )) {
                            visibleErrors.push(text.trim());
                        }
                    });
                    
                    return {
                        indicators,
                        visibleErrors: [...new Set(visibleErrors)],
                        title,
                        contentLength: textContent.length,
                        firstContent: document.body.innerText.substring(0, 200)
                    };
                });
                
                // Determine status and log accordingly
                if (status >= 400) {
                    console.log(`   ❌ HTTP Error: ${status}`);
                    logError('ACTIVITY_HTTP_ERROR', `Status ${status}`, url);
                } else if (errorAnalysis.visibleErrors.length > 0) {
                    console.log(`   ⚠️  Visible Errors Found:`);
                    errorAnalysis.visibleErrors.forEach(err => {
                        console.log(`      • ${err.substring(0, 100)}...`);
                        logError('VISIBLE_ERROR', err, url);
                    });
                } else if (Object.values(errorAnalysis.indicators).some(Boolean)) {
                    const activeIndicators = Object.entries(errorAnalysis.indicators)
                        .filter(([key, value]) => value && key !== 'hasContent')
                        .map(([key]) => key);
                    
                    if (activeIndicators.length > 0) {
                        console.log(`   ⚠️  Error Indicators: ${activeIndicators.join(', ')}`);
                        logError('ERROR_INDICATORS', activeIndicators.join(', '), url);
                    }
                } else if (errorAnalysis.indicators.hasContent) {
                    console.log(`   ✅ Working (${errorAnalysis.contentLength} chars)`);
                } else {
                    console.log(`   ⚠️  Minimal content (${errorAnalysis.contentLength} chars)`);
                    logError('MINIMAL_CONTENT', `Only ${errorAnalysis.contentLength} characters`, url);
                }
                
                // Show first bit of content for context
                if (errorAnalysis.firstContent) {
                    console.log(`   📄 Preview: ${errorAnalysis.firstContent.substring(0, 80).replace(/\n/g, ' ')}...`);
                }
                
            } catch (error) {
                console.log(`   💥 Test Error: ${error.message}`);
                logError('TEST_ERROR', error.message, url);
            }
            
            // Small delay between tests
            await page.waitForTimeout(1000);
        }
        
        console.log('\n✅ Monitoring complete!');
        console.log(`📄 Error log saved to: ${errorLogPath}`);
        
    } catch (error) {
        console.error('❌ Failed to start monitoring:', error);
        logError('MONITOR_ERROR', error.message);
    } finally {
        logStream.end();
        console.log('\n🔍 Browser window left open for manual inspection.');
        console.log('🔴 Check the DevTools console for additional error details.');
        console.log('📄 Check live-error-log.txt for complete error history.');
        // Don't close browser automatically - let user inspect
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down monitor...');
    process.exit(0);
});

liveErrorMonitor().catch(console.error);