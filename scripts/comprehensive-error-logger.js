const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ComprehensiveErrorLogger {
    constructor() {
        this.logDir = path.join(__dirname, 'error-logs');
        this.timestampedLogDir = path.join(this.logDir, this.getTimestamp());
        this.setupDirectories();
        
        this.allErrors = {
            serverErrors: [],
            browserErrors: [],
            networkErrors: [],
            jsErrors: [],
            cssErrors: [],
            pageErrors: [],
            httpErrors: [],
            contentErrors: []
        };
        
        this.logFiles = {
            master: path.join(this.timestampedLogDir, 'master-error-log.txt'),
            json: path.join(this.timestampedLogDir, 'all-errors.json'),
            browser: path.join(this.timestampedLogDir, 'browser-errors.txt'),
            network: path.join(this.timestampedLogDir, 'network-errors.txt'),
            content: path.join(this.timestampedLogDir, 'content-errors.txt'),
            summary: path.join(this.timestampedLogDir, 'error-summary.txt')
        };
        
        this.setupLogFiles();
    }
    
    getTimestamp() {
        return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    }
    
    setupDirectories() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }
        if (!fs.existsSync(this.timestampedLogDir)) {
            fs.mkdirSync(this.timestampedLogDir);
        }
        
        // Create screenshots directory
        const screenshotsDir = path.join(this.timestampedLogDir, 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir);
        }
    }
    
    setupLogFiles() {
        // Create all log files with headers
        this.writeToFile(this.logFiles.master, `🔍 COMPREHENSIVE ERROR LOG - ${new Date().toISOString()}\n${'='.repeat(80)}\n`);
        this.writeToFile(this.logFiles.browser, `🖥️  BROWSER ERRORS LOG - ${new Date().toISOString()}\n${'='.repeat(60)}\n`);
        this.writeToFile(this.logFiles.network, `🌐 NETWORK ERRORS LOG - ${new Date().toISOString()}\n${'='.repeat(60)}\n`);
        this.writeToFile(this.logFiles.content, `📄 CONTENT ERRORS LOG - ${new Date().toISOString()}\n${'='.repeat(60)}\n`);
        this.writeToFile(this.logFiles.summary, `📊 ERROR SUMMARY - ${new Date().toISOString()}\n${'='.repeat(50)}\n`);
    }
    
    writeToFile(filePath, content) {
        fs.appendFileSync(filePath, content);
    }
    
    logError(category, type, message, context = {}) {
        const timestamp = new Date().toISOString();
        const errorEntry = {
            timestamp,
            category,
            type,
            message,
            context
        };
        
        // Add to appropriate category
        this.allErrors[category] = this.allErrors[category] || [];
        this.allErrors[category].push(errorEntry);
        
        // Format for display
        const displayMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
        const contextStr = Object.keys(context).length > 0 ? `\n  Context: ${JSON.stringify(context, null, 2)}` : '';
        const fullMessage = `${displayMessage}${contextStr}\n`;
        
        // Write to master log
        this.writeToFile(this.logFiles.master, fullMessage);
        
        // Write to category-specific logs
        switch (category) {
            case 'browserErrors':
            case 'jsErrors':
            case 'pageErrors':
                this.writeToFile(this.logFiles.browser, fullMessage);
                break;
            case 'networkErrors':
            case 'httpErrors':
                this.writeToFile(this.logFiles.network, fullMessage);
                break;
            case 'contentErrors':
            case 'cssErrors':
                this.writeToFile(this.logFiles.content, fullMessage);
                break;
        }
        
        // Console output with colors
        console.log(this.colorizeMessage(category, type, displayMessage));
        if (contextStr) {
            console.log(`  📋 ${JSON.stringify(context)}`);
        }
    }
    
    colorizeMessage(category, type, message) {
        const icons = {
            browserErrors: '🖥️ ',
            jsErrors: '⚠️ ',
            networkErrors: '🌐',
            httpErrors: '📡',
            contentErrors: '📄',
            cssErrors: '🎨',
            pageErrors: '💥',
            serverErrors: '🔧'
        };
        
        const icon = icons[category] || '🔴';
        return `${icon} ${message}`;
    }
    
    async testActivityWithFullLogging(activity, browser) {
        const page = await browser.newPage();
        const activityName = `${activity.domain}-${activity.name}`;
        const url = activity.url;
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🧪 TESTING: ${activity.route}`);
        console.log(`📍 URL: ${url}`);
        console.log(`📂 Type: ${activity.type} | Domain: ${activity.domain}`);
        console.log(`${'='.repeat(60)}`);
        
        // Set up error listeners
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            
            if (type === 'error') {
                this.logError('browserErrors', 'console_error', text, { 
                    activity: activity.route, 
                    url,
                    source: 'browser_console' 
                });
            } else if (type === 'warn' && (text.includes('error') || text.includes('failed'))) {
                this.logError('browserErrors', 'console_warning', text, { 
                    activity: activity.route, 
                    url,
                    source: 'browser_console' 
                });
            }
        });
        
        page.on('pageerror', error => {
            this.logError('pageErrors', 'page_error', error.message, { 
                activity: activity.route, 
                url,
                stack: error.stack,
                source: 'page_runtime' 
            });
        });
        
        page.on('response', response => {
            const status = response.status();
            const responseUrl = response.url();
            
            if (status >= 400) {
                this.logError('httpErrors', `http_${status}`, `${status} ${response.statusText()}`, { 
                    activity: activity.route, 
                    requestUrl: responseUrl,
                    activityUrl: url,
                    source: 'http_response' 
                });
            }
        });
        
        page.on('requestfailed', request => {
            const requestUrl = request.url();
            const errorText = request.failure().errorText;
            
            this.logError('networkErrors', 'request_failed', errorText, { 
                activity: activity.route, 
                requestUrl,
                activityUrl: url,
                source: 'network_request' 
            });
        });
        
        try {
            // Navigate to page
            const response = await page.goto(url, { 
                waitUntil: 'domcontentloaded', 
                timeout: 15000 
            });
            
            // Wait for content to load
            await page.waitForTimeout(3000);
            
            // Take screenshot
            const screenshotPath = path.join(this.timestampedLogDir, 'screenshots', `${activityName}.png`);
            await page.screenshot({ 
                path: screenshotPath, 
                fullPage: true 
            });
            
            // Analyze page content
            const analysis = await page.evaluate(() => {
                const body = document.body;
                const textContent = body.innerText.toLowerCase();
                const htmlContent = body.innerHTML;
                
                // Comprehensive error detection
                const errors = {
                    jsErrors: [],
                    cssErrors: [],
                    contentErrors: [],
                    missingElements: []
                };
                
                // JavaScript errors in content
                if (textContent.includes('error') || textContent.includes('uncaught') || textContent.includes('cannot read')) {
                    const errorMatches = document.body.innerText.match(/(error[^\\n]{0,100}|uncaught[^\\n]{0,100}|cannot[^\\n]{0,100})/gi);
                    if (errorMatches) {
                        errors.jsErrors = errorMatches.slice(0, 5);
                    }
                }
                
                // CSS/styling errors
                const brokenImages = document.querySelectorAll('img[src]');
                const missingImages = [];
                brokenImages.forEach(img => {
                    if (img.naturalWidth === 0 && img.naturalHeight === 0) {
                        missingImages.push(img.src);
                    }
                });
                errors.missingElements.push(...missingImages);
                
                // Check for missing CSS
                const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
                const brokenStylesheets = [];
                stylesheets.forEach(link => {
                    if (!link.sheet) {
                        brokenStylesheets.push(link.href);
                    }
                });
                errors.cssErrors.push(...brokenStylesheets);
                
                // Content analysis
                const indicators = {
                    hasContent: textContent.length > 100,
                    isWhiteScreen: textContent.trim().length < 50,
                    hasJSFramework: document.querySelector('#root, #__next, [data-reactroot]') !== null,
                    hasErrorOverlay: document.querySelector('[data-nextjs-dialog-overlay], .error-overlay') !== null,
                    loadingStuck: textContent.includes('loading') && textContent.length < 200
                };
                
                return {
                    errors,
                    indicators,
                    textLength: document.body.innerText.length,
                    title: document.title || 'No title',
                    firstContent: document.body.innerText.substring(0, 200)
                };
            });
            
            // Log content-based errors
            if (analysis.errors.jsErrors.length > 0) {
                analysis.errors.jsErrors.forEach(error => {
                    this.logError('contentErrors', 'js_content_error', error, { 
                        activity: activity.route, 
                        url,
                        source: 'page_content' 
                    });
                });
            }
            
            if (analysis.errors.cssErrors.length > 0) {
                analysis.errors.cssErrors.forEach(error => {
                    this.logError('cssErrors', 'broken_stylesheet', error, { 
                        activity: activity.route, 
                        url,
                        source: 'page_content' 
                    });
                });
            }
            
            if (analysis.errors.missingElements.length > 0) {
                analysis.errors.missingElements.forEach(element => {
                    this.logError('contentErrors', 'missing_element', element, { 
                        activity: activity.route, 
                        url,
                        source: 'page_content' 
                    });
                });
            }
            
            // Log page status
            const status = response?.status() || 0;
            const hasErrors = analysis.errors.jsErrors.length > 0 || 
                             analysis.errors.cssErrors.length > 0 || 
                             analysis.errors.missingElements.length > 0 ||
                             analysis.indicators.isWhiteScreen ||
                             analysis.indicators.hasErrorOverlay;
            
            if (hasErrors) {
                console.log(`❌ Activity has errors - Screenshot: ${screenshotPath}`);
                
                // Log summary for this activity
                const errorSummary = `\nACTIVITY: ${activity.route} (${status})\n` +
                    `JS Errors: ${analysis.errors.jsErrors.length}\n` +
                    `CSS Errors: ${analysis.errors.cssErrors.length}\n` +
                    `Missing Elements: ${analysis.errors.missingElements.length}\n` +
                    `White Screen: ${analysis.indicators.isWhiteScreen}\n` +
                    `Error Overlay: ${analysis.indicators.hasErrorOverlay}\n` +
                    `Screenshot: ${screenshotPath}\n` +
                    `-`.repeat(40) + '\n';
                
                this.writeToFile(this.logFiles.summary, errorSummary);
            } else {
                console.log(`✅ Activity working properly`);
            }
            
        } catch (error) {
            this.logError('pageErrors', 'navigation_error', error.message, { 
                activity: activity.route, 
                url,
                stack: error.stack,
                source: 'page_navigation' 
            });
        } finally {
            await page.close();
        }
    }
    
    async generateFinalReport() {
        console.log(`\n${'='.repeat(80)}`);
        console.log('📊 GENERATING COMPREHENSIVE ERROR REPORT');
        console.log(`${'='.repeat(80)}`);
        
        // Save JSON data
        fs.writeFileSync(this.logFiles.json, JSON.stringify(this.allErrors, null, 2));
        
        // Generate summary stats
        const stats = {};
        Object.keys(this.allErrors).forEach(category => {
            stats[category] = this.allErrors[category].length;
        });
        
        const totalErrors = Object.values(stats).reduce((sum, count) => sum + count, 0);
        
        const reportSummary = `\n${'='.repeat(60)}\n` +
            `📊 FINAL ERROR SUMMARY\n` +
            `${'='.repeat(60)}\n` +
            `Total Errors Detected: ${totalErrors}\n\n` +
            `By Category:\n` +
            Object.entries(stats).map(([category, count]) => 
                `  ${category}: ${count} errors`
            ).join('\n') + '\n\n' +
            `📁 All logs saved to: ${this.timestampedLogDir}\n` +
            `📄 JSON data: ${this.logFiles.json}\n` +
            `📸 Screenshots: ${path.join(this.timestampedLogDir, 'screenshots')}\n` +
            `📋 Master log: ${this.logFiles.master}\n` +
            `${'='.repeat(60)}\n`;
        
        this.writeToFile(this.logFiles.summary, reportSummary);
        console.log(reportSummary);
        
        // Create latest symlink
        const latestLink = path.join(this.logDir, 'latest');
        if (fs.existsSync(latestLink)) {
            fs.unlinkSync(latestLink);
        }
        fs.symlinkSync(this.timestampedLogDir, latestLink);
        
        return {
            totalErrors,
            stats,
            logDir: this.timestampedLogDir,
            allErrors: this.allErrors
        };
    }
}

async function runComprehensiveErrorLogging() {
    console.log('🚀 Starting Comprehensive Error Logging System...');
    
    const logger = new ComprehensiveErrorLogger();
    
    const browser = await puppeteer.launch({ 
        headless: false,  // Show browser for debugging
        defaultViewport: { width: 1280, height: 720 },
        devtools: false   // Keep DevTools closed for cleaner screenshots
    });
    
    try {
        // Get activities
        const page = await browser.newPage();
        await page.goto('http://localhost:3333/api/activities', { waitUntil: 'networkidle0' });
        const activitiesJson = await page.evaluate(() => document.body.innerText);
        const activities = JSON.parse(activitiesJson);
        await page.close();
        
        console.log(`📦 Found ${activities.length} activities to test with comprehensive logging`);
        
        // Test first 10 activities for demonstration (you can change this)
        const testCount = Math.min(10, activities.length);
        console.log(`🧪 Testing first ${testCount} activities...`);
        
        for (let i = 0; i < testCount; i++) {
            const activity = activities[i];
            console.log(`\n[${i+1}/${testCount}] Testing: ${activity.route}`);
            await logger.testActivityWithFullLogging(activity, browser);
        }
        
        // Generate final report
        const report = await logger.generateFinalReport();
        
        console.log(`\n🎉 Comprehensive error logging complete!`);
        console.log(`📁 All error logs saved to: ${report.logDir}`);
        console.log(`📊 Total errors detected: ${report.totalErrors}`);
        
    } catch (error) {
        console.error('❌ Error during comprehensive logging:', error);
        logger.logError('serverErrors', 'system_error', error.message, { 
            stack: error.stack,
            source: 'logging_system' 
        });
    } finally {
        await browser.close();
    }
}

runComprehensiveErrorLogging().catch(console.error);