#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function debugFreshStart() {
    console.log('🔍 Starting fresh debug without session parameters...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        devtools: true
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
        }
    });
    
    try {
        console.log('📍 Navigating to base URL without session...');
        const url = 'http://localhost:3333/pages/PositiveControl1';
        
        const response = await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        console.log(`📊 Page loaded with status: ${response.status()}`);
        
        // Wait for React to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Look for session selection buttons
        console.log('🔎 Looking for session selection buttons...');
        
        const buttons = await page.$$eval('button, a, [role="button"]', elements => {
            return elements.map(el => ({
                tagName: el.tagName,
                textContent: el.textContent.trim(),
                className: el.className,
                id: el.id
            }));
        });
        
        console.log('🔍 All buttons found:', buttons);
        
        // Look specifically for individual-related buttons
        const individualButtons = buttons.filter(btn => 
            btn.textContent.toLowerCase().includes('individual')
        );
        
        if (individualButtons.length > 0) {
            console.log('✅ Found individual buttons:', individualButtons);
            
            // Try to click the individual button
            const individualText = individualButtons[0].textContent;
            console.log(`🖱️ Attempting to click: "${individualText}"`);
            
            await page.evaluate((text) => {
                const elements = Array.from(document.querySelectorAll('button, a, [role="button"]'));
                const target = elements.find(el => el.textContent.trim() === text);
                if (target) {
                    target.click();
                    return true;
                }
                return false;
            }, individualText);
            
            // Wait for navigation/changes
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            console.log('📍 URL after click:', page.url());
            
            // Check for errors after click
            const errorElements = await page.$$eval('*', elements => {
                return elements
                    .filter(el => el.textContent && (
                        el.textContent.includes('not found') ||
                        el.textContent.includes('error') ||
                        el.textContent.includes('failed') ||
                        el.textContent.includes('404')
                    ))
                    .map(el => ({
                        tagName: el.tagName,
                        textContent: el.textContent.trim().substring(0, 100),
                        className: el.className
                    }));
            });
            
            if (errorElements.length > 0) {
                console.log('🚨 Found error messages after individual click:', errorElements);
            } else {
                console.log('✅ No error messages detected after individual click');
            }
            
        } else {
            console.log('❌ No individual buttons found');
        }
        
        // Take a screenshot
        await page.screenshot({ path: 'debug-fresh-start-screenshot.png', fullPage: true });
        console.log('📸 Screenshot saved');
        
        // Keep browser open for inspection
        console.log('⏱️ Keeping browser open for 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
    } catch (error) {
        console.error('💥 Error during debugging:', error.message);
    } finally {
        await browser.close();
        console.log('🏁 Debug session completed');
    }
}

debugFreshStart().catch(console.error);