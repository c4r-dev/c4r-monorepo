const puppeteer = require('puppeteer');

// Compare font loading between different activities
const testActivities = [
    '/tools/open-ai-testing', // Updated to use Inter
    '/tools/c4r-component-test', // Already using Inter 
    '/coding-practices/hms-bias-map-v0' // Already using Inter
];

async function testFontComparison() {
    console.log('🔍 Comparing font loading across activities...\n');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    for (let i = 0; i < testActivities.length; i++) {
        const activity = testActivities[i];
        console.log(`[${i+1}/${testActivities.length}] Testing: ${activity}`);
        
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
                
                console.log(`✅ ${activity} - ${response.status()} - "${title}"`);
                console.log(`   Font Family: ${fontFamily}`);
                console.log(`   Google Fonts: ${googleFontsLink}`);
                console.log('');
            } else {
                console.log(`❌ ${activity} - ${response.status()}\n`);
            }
        } catch (error) {
            console.log(`❌ ${activity} - Error: ${error.message}\n`);
        }
    }
    
    await browser.close();
}

testFontComparison().catch(console.error);