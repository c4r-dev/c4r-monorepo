const puppeteer = require('puppeteer');
const logger = require('../packages/logging/logger.js');

// Test a broader set of activities to validate font fixes and identify any other issues
const testActivities = [
    // Activities that were previously fixed
    '/coding-practices/hms-cbi-hyp-bot-v1',
    '/randomization/smi-ran-str-ran-v1',
    
    // Activities that likely had Geist fonts (from the replacement list)
    '/tools/c4r-component-test',
    '/tools/c4r-email-api',
    '/coding-practices/hms-bias-map-v0',
    '/coding-practices/hms-fun-bld-v0',
    '/coding-practices/hms-int-exe-v0',
    '/tools/neuroserpin_v0',
    '/randomization/smi-ran-simple-ran-v1',
    '/coding-practices/hms-cbi-fav-game-v0',
    
    // Random selection to ensure overall health
    '/causality/jhu-flu-dag-v1',
    '/collaboration/r2r-stats-wizard-v1',
    '/tools/DAG-generator',
    '/randomization/smi-ran-blk-ran-v2',
    '/coding-practices/hms-wason-246-v2'
];

async function testComprehensive() {
    logger.app.info('🧪 Running comprehensive test of font fixes and system health...\n');
    
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
                logger.app.info(`✅ ${activity} - ${response.status()} - "${title}"`);
                successCount++;
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
    
    logger.app.info('🎉 Comprehensive testing complete!');
    logger.app.info(`📊 Results: ${successCount} success, ${errorCount} errors`);
    
    if (errors.length > 0) {
        logger.app.info('\n❌ Issues found:');
        errors.forEach(err => {
            if (err.type === 'HTTP_ERROR') {
                logger.app.info(`  - ${err.activity}: HTTP ${err.status}`);
            } else {
                logger.app.info(`  - ${err.activity}: ${err.error}`);
            }
        });
    } else {
        logger.app.info('\n✅ All activities are working correctly!');
    }
    
    const successRate = ((successCount / testActivities.length) * 100).toFixed(1);
    logger.app.info(`\n📈 Success rate: ${successRate}%`);
}

testComprehensive().catch(console.error);