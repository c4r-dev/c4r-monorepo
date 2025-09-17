#!/usr/bin/env node

const puppeteer = require('puppeteer');

class SingleActivityDebugger {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async initialize() {
        console.log('🚀 Initializing single activity debugger...');
        this.browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        this.page = await this.browser.newPage();
        
        // Listen to console messages
        this.page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error') {
                console.log(`   🔴 Console Error: ${text}`);
            } else if (type === 'warn') {
                console.log(`   🟡 Console Warning: ${text}`);
            } else if (type === 'log' && text.includes('Error')) {
                console.log(`   📋 Console Log: ${text}`);
            }
        });

        // Listen to network failures
        this.page.on('requestfailed', request => {
            console.log(`   ❌ Request Failed: ${request.url()} - ${request.failure().errorText}`);
        });

        // Listen to response issues
        this.page.on('response', response => {
            if (!response.ok() && response.status() !== 304) {
                console.log(`   ⚠️  Response Issue: ${response.url()} - ${response.status()} ${response.statusText()}`);
            }
        });

        console.log('✅ Browser initialized');
    }

    async debugActivity(route) {
        const url = `http://localhost:3333${route}`;
        console.log(`\n🔍 Debugging: ${route}`);
        console.log(`   URL: ${url}`);
        
        try {
            const startTime = Date.now();
            
            // Navigate with increased timeout
            await this.page.goto(url, { 
                waitUntil: 'networkidle0', 
                timeout: 30000 
            });
            
            const loadTime = Date.now() - startTime;
            console.log(`   ⏱️  Load Time: ${loadTime}ms`);
            
            // Wait a bit for dynamic content
            await this.page.waitForTimeout(2000);
            
            // Check for specific elements or errors
            const title = await this.page.title();
            console.log(`   📄 Title: "${title}"`);
            
            // Check if React errors are present
            const reactErrors = await this.page.evaluate(() => {
                const errors = [];
                
                // Check for React error boundaries
                const errorBoundaries = document.querySelectorAll('[data-reactroot] *');
                for (let element of errorBoundaries) {
                    if (element.textContent && element.textContent.includes('Error')) {
                        errors.push(element.textContent.substring(0, 200));
                    }
                }
                
                // Check for Next.js specific errors
                if (window.__NEXT_DATA__) {
                    if (window.__NEXT_DATA__.buildId === 'development' || window.__NEXT_DATA__.err) {
                        errors.push('Next.js development error detected');
                    }
                }
                
                return errors;
            });
            
            if (reactErrors.length > 0) {
                console.log(`   🚨 React Errors Found:`);
                reactErrors.forEach(error => console.log(`      - ${error}`));
            }
            
            // Get page content snippets
            const bodyText = await this.page.evaluate(() => {
                return document.body.textContent.substring(0, 500);
            });
            
            if (bodyText.includes('Error') || bodyText.includes('Failed') || bodyText.includes('Cannot')) {
                console.log(`   📝 Page Content Preview: ${bodyText.substring(0, 200)}...`);
            }
            
            console.log(`   ✅ Successfully debugged ${route}`);
            
        } catch (error) {
            console.log(`   ❌ Error debugging ${route}: ${error.message}`);
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🧹 Browser closed');
        }
    }
}

async function main() {
    const activityRoute = process.argv[2];
    
    if (!activityRoute) {
        console.log('Usage: node debug-single-activity.js <activity-route>');
        console.log('Example: node debug-single-activity.js /causality/jhu-polio-ice-cream-v2');
        process.exit(1);
    }
    
    const activityDebugger = new SingleActivityDebugger();
    
    try {
        await activityDebugger.initialize();
        await activityDebugger.debugActivity(activityRoute);
    } catch (error) {
        console.error('💥 Debugger failed:', error);
    } finally {
        await activityDebugger.cleanup();
    }
}

if (require.main === module) {
    main();
}

module.exports = { SingleActivityDebugger };