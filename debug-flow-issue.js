#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function debugFlowIssue() {
    console.log('🔍 Starting Puppeteer debug for flow issue...');
    
    const browser = await puppeteer.launch({ 
        headless: false, // Show browser for debugging
        devtools: true   // Open DevTools
    });
    
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
        console.log(`🔥 BROWSER CONSOLE [${msg.type()}]:`, msg.text());
    });
    
    // Listen for errors
    page.on('error', err => {
        console.error('🚨 PAGE ERROR:', err.message);
    });
    
    page.on('pageerror', err => {
        console.error('🚨 PAGE ERROR:', err.message);
    });
    
    // Listen for failed requests
    page.on('requestfailed', request => {
        console.error(`🚨 REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
    });
    
    // Listen for responses
    page.on('response', response => {
        if (!response.ok()) {
            console.error(`🚨 HTTP ERROR: ${response.status()} ${response.url()}`);
        } else if (response.url().includes('customFlowchartAPI')) {
            console.log(`✅ API RESPONSE: ${response.status()} ${response.url()}`);
        }
    });
    
    try {
        console.log('📍 Navigating to problematic URL...');
        const url = 'http://localhost:3333/pages/PositiveControl1?sessionID=individual1&flowId=6842fc7d81fa9b6e13bda8ab';
        
        const response = await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        console.log(`📊 Page loaded with status: ${response.status()}`);
        
        // Wait a bit for React to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check for error messages in the page
        console.log('🔎 Checking for error messages...');
        
        const errorElements = await page.$$eval('*', elements => {
            return elements
                .filter(el => el.textContent && el.textContent.includes('not found'))
                .map(el => ({
                    tagName: el.tagName,
                    textContent: el.textContent.trim(),
                    className: el.className
                }));
        });
        
        if (errorElements.length > 0) {
            console.log('🚨 Found error messages:', errorElements);
        } else {
            console.log('✅ No "not found" errors detected in page content');
        }
        
        // Check if flow data is loaded
        const flowData = await page.evaluate(() => {
            // Look for flow-related data in window or React components
            return {
                windowKeys: Object.keys(window).filter(key => key.toLowerCase().includes('flow')),
                hasReactRoot: !!document.querySelector('[data-reactroot]'),
                bodyText: document.body.innerText.substring(0, 500)
            };
        });
        
        console.log('📋 Flow data check:', flowData);
        
        // Take a screenshot
        await page.screenshot({ path: 'debug-flow-screenshot.png', fullPage: true });
        console.log('📸 Screenshot saved as debug-flow-screenshot.png');
        
        // Keep browser open for 5 seconds to inspect manually
        console.log('⏱️  Keeping browser open for 5 seconds for manual inspection...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
    } catch (error) {
        console.error('💥 Error during debugging:', error.message);
    } finally {
        await browser.close();
        console.log('🏁 Debug session completed');
    }
}

debugFlowIssue().catch(console.error);