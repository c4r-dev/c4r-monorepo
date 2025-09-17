const puppeteer = require('puppeteer');

async function testActivityStatus() {
    console.log('🧪 Testing current activity status...');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const testUrls = [
        'http://localhost:3333/randomization/smi-ran-blk-ran-v1', // Static CRA - should work
        'http://localhost:3333/randomization/smi-ran-blk-ran-v2', // Static CRA - should work
        'http://localhost:3333/causality/jhu-flu-dag-v1', // Next.js - currently broken
        'http://localhost:3333/tools/observable_plot', // Static - should work
        'http://localhost:3333/coding-practices/hms-aem-rig-fil-v1' // CRA - should work
    ];
    
    for (const url of testUrls) {
        try {
            console.log(`\n🔗 Testing: ${url}`);
            
            const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
            
            if (response && response.status() === 200) {
                // Check if it has React content
                const hasReactContent = await page.evaluate(() => {
                    return document.querySelector('[data-reactroot]') !== null || 
                           document.querySelector('#root') !== null ||
                           document.querySelector('.App') !== null ||
                           document.body.innerHTML.includes('React') ||
                           document.title.includes('React');
                });
                
                const hasContent = await page.evaluate(() => {
                    return document.body.innerText.trim().length > 100;
                });
                
                if (hasReactContent) {
                    console.log(`   ✅ Working React app (200 OK)`);
                } else if (hasContent) {
                    console.log(`   ✅ Working static content (200 OK)`);
                } else {
                    console.log(`   ⚠️  Loading but minimal content (200 OK)`);
                }
            } else {
                console.log(`   ❌ Failed with status: ${response?.status() || 'Unknown'}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
    
    await browser.close();
    console.log('\n✅ Status check complete!');
}

testActivityStatus().catch(console.error);