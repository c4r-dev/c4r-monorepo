#!/usr/bin/env node

const puppeteer = require('puppeteer');
const logger = require('../packages/logging/logger.js');

class SingleActivityDebugger {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async initialize() {
        logger.app.info('🚀 Initializing single activity debugger...');
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
                logger.app.info(`   🔴 Console Error: ${text}`);
            } else if (type === 'warn') {
                logger.app.info(`   🟡 Console Warning: ${text}`);
            } else if (type === 'log' && text.includes('Error')) {
                logger.app.info(`   📋 Console Log: ${text}`);
            }
        });

        // Listen to network failures
        this.page.on('requestfailed', request => {
            logger.app.info(`   ❌ Request Failed: ${request.url()} - ${request.failure().errorText}`);
        });

        // Listen to response issues
        this.page.on('response', response => {
            if (!response.ok() && response.status() !== 304) {
                logger.app.info(`   ⚠️  Response Issue: ${response.url()} - ${response.status()} ${response.statusText()}`);
            }
        });

        logger.app.info('✅ Browser initialized');
    }

    async debugActivity(route) {
        const url = `http://localhost:3333${route}`;
        logger.app.info(`\n🔍 Debugging: ${route}`);
        logger.app.info(`   URL: ${url}`);
        
        try {
            const startTime = Date.now();
            
            // Navigate with increased timeout
            await this.page.goto(url, { 
                waitUntil: 'networkidle0', 
                timeout: 30000 
            });
            
            const loadTime = Date.now() - startTime;
            logger.app.info(`   ⏱️  Load Time: ${loadTime}ms`);
            
            // Wait a bit for dynamic content
            await this.page.waitForTimeout(2000);
            
            // Check for specific elements or errors
            const title = await this.page.title();
            logger.app.info(`   📄 Title: "${title}"`);
            
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
                logger.app.info(`   🚨 React Errors Found:`);
                reactErrors.forEach(error => logger.app.info(`      - ${error}`));
            }
            
            // Get page content snippets
            const bodyText = await this.page.evaluate(() => {
                return document.body.textContent.substring(0, 500);
            });
            
            if (bodyText.includes('Error') || bodyText.includes('Failed') || bodyText.includes('Cannot')) {
                logger.app.info(`   📝 Page Content Preview: ${bodyText.substring(0, 200)}...`);
            }
            
            logger.app.info(`   ✅ Successfully debugged ${route}`);
            
        } catch (error) {
            logger.app.info(`   ❌ Error debugging ${route}: ${error.message}`);
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            logger.app.info('🧹 Browser closed');
        }
    }
}

async function main() {
    const activityRoute = process.argv[2];
    
    if (!activityRoute) {
        logger.app.info('Usage: node debug-single-activity.js <activity-route>');
        logger.app.info('Example: node debug-single-activity.js /causality/jhu-polio-ice-cream-v2');
        process.exit(1);
    }
    
    const activityDebugger = new SingleActivityDebugger();
    
    try {
        await activityDebugger.initialize();
        await activityDebugger.debugActivity(activityRoute);
    } catch (error) {
        logger.app.error('💥 Debugger failed:', error);
    } finally {
        await activityDebugger.cleanup();
    }
}

if (require.main === module) {
    main();
}

module.exports = { SingleActivityDebugger };