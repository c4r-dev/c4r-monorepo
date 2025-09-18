const puppeteer = require('puppeteer');
const logger = require('../packages/logging/logger.js');

// Compare font loading between different activities
const testActivities = [
    '/tools/open-ai-testing', // Updated to use Inter
    '/tools/c4r-component-test', // Already using Inter 
    '/coding-practices/hms-bias-map-v0' // Already using Inter
];

async function testFontComparison() {
    logger.app.info('🔍 Comparing font loading across activities...\n');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    for (let i = 0; i < testActivities.length; i++) {
        const activity = testActivities[i];
        logger.app.info(`[${i+1}/${testActivities.length}] Testing: ${activity}`);
        
        try {
            const url = `http://localhost:3333${activity}`;
            const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
            
            if (response.status() === 200) {
                const title = await page.title();
                
                // Check font family and network requests
                const fontFamily = await page.evaluate(() => {
                    const bodyElement = document.querySelector('body');
                    return window.getComputedStyle(bodyElement).fontFamily;
                });
                
                // Check if Google Fonts link is present
                const googleFontsLink = await page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('link[href*="fonts.googleapis.com"]'));
                    return links.length > 0 ? links[0].href : 'Not found';
                });
                
                logger.app.info(`✅ ${activity} - ${response.status()} - "${title}"`);
                logger.app.info(`   Font Family: ${fontFamily}`);
                logger.app.info(`   Google Fonts: ${googleFontsLink}`);
                logger.app.info('');
            } else {
                logger.app.info(`❌ ${activity} - ${response.status()}\n`);
            }
        } catch (error) {
            logger.app.info(`❌ ${activity} - Error: ${error.message}\n`);
        }
    }
    
    await browser.close();
}

testFontComparison().catch(console.error);