const puppeteer = require('puppeteer');
const logger = require('../packages/logging/logger.js');

// Test activities that were updated to use standardized Inter font
const testActivities = [
    '/tools/open-ai-testing',
    '/coding-practices/hms-wason-246-v2-grid'
];

async function testDesignSystem() {
    logger.app.info('🎨 Testing standardized design system implementation...\n');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < testActivities.length; i++) {
        const activity = testActivities[i];
        logger.app.info(`[${i+1}/${testActivities.length}] Testing: ${activity}`);
        
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
                
                logger.app.info(`✅ ${activity} - ${response.status()} - "${title}"`);
                logger.app.info(`   Font: ${fontFamily}`);
                logger.app.info(`   Inter loaded: ${hasInter ? '✅ Yes' : '❌ No'}`);
                
                if (hasInter) {
                    successCount++;
                } else {
                    errorCount++;
                    errors.push({ activity, issue: 'Inter font not detected', fontFamily });
                }
            } else {
                logger.app.info(`❌ ${activity} - ${response.status()}`);
                errorCount++;
                errors.push({ activity, status: response.status(), type: 'HTTP_ERROR' });
            }
        } catch (error) {
            logger.app.info(`❌ ${activity} - Error: ${error.message}`);
            errorCount++;
            errors.push({ activity, error: error.message, type: 'EXCEPTION' });
        }
        
        logger.app.info('');
    }
    
    await browser.close();
    
    logger.app.info('🎉 Design system testing complete!');
    logger.app.info(`📊 Results: ${successCount} success, ${errorCount} errors`);
    
    if (errors.length > 0) {
        logger.app.info('\n❌ Issues found:');
        errors.forEach(err => {
            if (err.type === 'HTTP_ERROR') {
                logger.app.info(`  - ${err.activity}: HTTP ${err.status}`);
            } else if (err.issue) {
                logger.app.info(`  - ${err.activity}: ${err.issue} (Font: ${err.fontFamily})`);
            } else {
                logger.app.info(`  - ${err.activity}: ${err.error}`);
            }
        });
    } else {
        logger.app.info('\n✅ All activities are using the standardized Inter font!');
    }
    
    const successRate = ((successCount / testActivities.length) * 100).toFixed(1);
    logger.app.info(`\n📈 Design system adoption rate: ${successRate}%`);
}

testDesignSystem().catch(console.error);