#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function debugIndividualClick() {
    console.log('🔍 Starting Puppeteer debug for "as an individual" click...');
    
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
        } else if (response.url().includes('customFlowchartAPI') || response.url().includes('PositiveControl')) {
            console.log(`✅ API RESPONSE: ${response.status()} ${response.url()}`);
        }
    });
    
    try {
        console.log('📍 Navigating to initial URL...');
        const url = 'http://localhost:3333/pages/PositiveControl1?sessionID=individual1&flowId=6842fc7d81fa9b6e13bda8ab';
        
        const response = await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        console.log(`📊 Page loaded with status: ${response.status()}`);
        
        // Wait for React to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Look for "as an individual" button/link
        console.log('🔎 Looking for "as an individual" button...');
        
        const individualButton = await page.$('text/as an individual');
        if (!individualButton) {
            // Try other selectors
            const buttons = await page.$$eval('button, a, [role="button"]', elements => {
                return elements
                    .filter(el => el.textContent && el.textContent.toLowerCase().includes('individual'))
                    .map(el => ({
                        tagName: el.tagName,
                        textContent: el.textContent.trim(),
                        className: el.className,
                        id: el.id
                    }));
            });
            
            console.log('🔍 Found buttons with "individual":', buttons);
            
            if (buttons.length === 0) {
                // Look for any clickable elements
                const allClickable = await page.$$eval('button, a, [role="button"], [onclick]', elements => {
                    return elements.map(el => ({
                        tagName: el.tagName,
                        textContent: el.textContent.trim().substring(0, 50),
                        className: el.className
                    }));
                });
                console.log('🔍 All clickable elements found:', allClickable);
            }
        }
        
        // Try to click "as an individual" or similar
        try {
            console.log('🖱️ Attempting to click "as an individual"...');
            
            // Try multiple selectors
            const selectors = [
                'text/as an individual',
                'text/individual',
                '[data-testid*="individual"]',
                'button:has-text("individual")',
                'a:has-text("individual")'
            ];
            
            let clicked = false;
            for (const selector of selectors) {
                try {
                    const element = await page.$(selector);
                    if (element) {
                        await element.click();
                        console.log(`✅ Clicked element with selector: ${selector}`);
                        clicked = true;
                        break;
                    }
                } catch (err) {
                    // Try next selector
                }
            }
            
            if (!clicked) {
                // Try clicking any element containing "individual"
                await page.evaluate(() => {
                    const elements = Array.from(document.querySelectorAll('*'));
                    const individualElement = elements.find(el => 
                        el.textContent && 
                        el.textContent.toLowerCase().includes('individual') &&
                        (el.tagName === 'BUTTON' || el.tagName === 'A' || el.onclick || el.getAttribute('role') === 'button')
                    );
                    if (individualElement) {
                        individualElement.click();
                        return true;
                    }
                    return false;
                });
                console.log('🖱️ Attempted to click individual element via evaluate');
            }
            
            // Wait for any navigation or changes
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('📍 Current URL after click:', page.url());
            
            // Check for error messages after click
            const errorElements = await page.$$eval('*', elements => {
                return elements
                    .filter(el => el.textContent && (
                        el.textContent.includes('not found') ||
                        el.textContent.includes('error') ||
                        el.textContent.includes('failed')
                    ))
                    .map(el => ({
                        tagName: el.tagName,
                        textContent: el.textContent.trim(),
                        className: el.className
                    }));
            });
            
            if (errorElements.length > 0) {
                console.log('🚨 Found error messages after click:', errorElements);
            } else {
                console.log('✅ No error messages detected after click');
            }
            
        } catch (clickError) {
            console.error('💥 Error clicking individual button:', clickError.message);
        }
        
        // Take a screenshot after interaction
        await page.screenshot({ path: 'debug-individual-click-screenshot.png', fullPage: true });
        console.log('📸 Screenshot saved as debug-individual-click-screenshot.png');
        
        // Keep browser open for manual inspection
        console.log('⏱️ Keeping browser open for 10 seconds for manual inspection...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
    } catch (error) {
        console.error('💥 Error during debugging:', error.message);
    } finally {
        await browser.close();
        console.log('🏁 Debug session completed');
    }
}

debugIndividualClick().catch(console.error);