const puppeteer = require('puppeteer');

// Test activities that were updated to use standardized Inter font
const testActivities = [
    '/tools/open-ai-testing',
    '/coding-practices/hms-wason-246-v2-grid'
];

async function testDesignSystem() {
    console.log('🎨 Testing standardized design system implementation...\n');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < testActivities.length; i++) {
        const activity = testActivities[i];
        console.log(`[${i+1}/${testActivities.length}] Testing: ${activity}`);
        
        try {
            const url = `http://localhost:3333${activity}`;
            const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
            
            if (response.status() === 200) {
                const title = await page.title();
                
                // Check if Inter font is loaded
                const fontFamily = await page.evaluate(() => {
                    const bodyElement = document.querySelector('body');
                    return window.getComputedStyle(bodyElement).fontFamily;
                });
                
                const hasInter = fontFamily.includes('Inter');
                
                console.log(`✅ ${activity} - ${response.status()} - "${title}"`);
                console.log(`   Font: ${fontFamily}`);
                console.log(`   Inter loaded: ${hasInter ? '✅ Yes' : '❌ No'}`);
                
                if (hasInter) {
                    successCount++;
                } else {
                    errorCount++;
                    errors.push({ activity, issue: 'Inter font not detected', fontFamily });
                }
            } else {
                console.log(`❌ ${activity} - ${response.status()}`);
                errorCount++;
                errors.push({ activity, status: response.status(), type: 'HTTP_ERROR' });
            }
        } catch (error) {
            console.log(`❌ ${activity} - Error: ${error.message}`);
            errorCount++;
            errors.push({ activity, error: error.message, type: 'EXCEPTION' });
        }
        
        console.log('');
    }
    
    await browser.close();
    
    console.log('🎉 Design system testing complete!');
    console.log(`📊 Results: ${successCount} success, ${errorCount} errors`);
    
    if (errors.length > 0) {
        console.log('\n❌ Issues found:');
        errors.forEach(err => {
            if (err.type === 'HTTP_ERROR') {
                console.log(`  - ${err.activity}: HTTP ${err.status}`);
            } else if (err.issue) {
                console.log(`  - ${err.activity}: ${err.issue} (Font: ${err.fontFamily})`);
            } else {
                console.log(`  - ${err.activity}: ${err.error}`);
            }
        });
    } else {
        console.log('\n✅ All activities are using the standardized Inter font!');
    }
    
    const successRate = ((successCount / testActivities.length) * 100).toFixed(1);
    console.log(`\n📈 Design system adoption rate: ${successRate}%`);
}

testDesignSystem().catch(console.error);