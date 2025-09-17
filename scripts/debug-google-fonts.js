const puppeteer = require('puppeteer');

async function debugGoogleFonts() {
    console.log('🔍 Debugging Google Fonts loading in seamless server...\n');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Enable request interception to monitor network requests
    await page.setRequestInterception(true);
    const requests = [];
    
    page.on('request', (request) => {
        requests.push({
            url: request.url(),
            method: request.method(),
            resourceType: request.resourceType()
        });
        request.continue();
    });
    
    page.on('response', (response) => {
        if (response.url().includes('fonts.googleapis.com') || response.url().includes('fonts.gstatic.com')) {
            console.log(`📡 Font Request: ${response.url()} - Status: ${response.status()}`);
        }
    });
    
    console.log('Testing: /tools/open-ai-testing (Updated to use Inter)');
    
    try {
        const url = 'http://localhost:3333/tools/open-ai-testing';
        const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
        
        // Check the HTML source
        const htmlContent = await page.content();
        
        // Look for Google Fonts links in the HTML
        const googleFontsLinks = htmlContent.match(/fonts\.googleapis\.com[^"']*/g) || [];
        
        // Check computed styles
        const bodyFont = await page.evaluate(() => {
            const body = document.querySelector('body');
            return window.getComputedStyle(body).fontFamily;
        });
        
        // Check if Inter is in the document fonts
        const availableFonts = await page.evaluate(() => {
            return document.fonts ? Array.from(document.fonts).map(f => f.family) : 'FontFaceSet not available';
        });
        
        console.log(`\n📊 Results for ${url}:`);
        console.log(`Status: ${response.status()}`);
        console.log(`Body font: ${bodyFont}`);
        console.log(`Google Fonts links found: ${googleFontsLinks.length}`);
        googleFontsLinks.forEach(link => console.log(`  - ${link}`));
        console.log(`Available fonts:`, availableFonts);
        
        // Check network requests for fonts
        const fontRequests = requests.filter(req => 
            req.url.includes('fonts.googleapis.com') || 
            req.url.includes('fonts.gstatic.com') ||
            req.resourceType === 'font'
        );
        
        console.log(`\n🌐 Font-related network requests: ${fontRequests.length}`);
        fontRequests.forEach(req => {
            console.log(`  - ${req.method} ${req.url} (${req.resourceType})`);
        });
        
        // Check if the layout.js file is properly imported
        const nextData = await page.evaluate(() => {
            return window.__NEXT_DATA__ ? 'Next.js loaded' : 'Next.js not detected';
        });
        console.log(`\n⚛️ Next.js status: ${nextData}`);
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
    
    await browser.close();
}

debugGoogleFonts().catch(console.error);