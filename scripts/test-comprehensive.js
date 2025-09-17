const puppeteer = require('puppeteer');

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
    console.log('🧪 Running comprehensive test of font fixes and system health...\n');
    
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
                console.log(`✅ ${activity} - ${response.status()} - "${title}"`);
                successCount++;
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
    
    console.log('🎉 Comprehensive testing complete!');
    console.log(`📊 Results: ${successCount} success, ${errorCount} errors`);
    
    if (errors.length > 0) {
        console.log('\n❌ Issues found:');
        errors.forEach(err => {
            if (err.type === 'HTTP_ERROR') {
                console.log(`  - ${err.activity}: HTTP ${err.status}`);
            } else {
                console.log(`  - ${err.activity}: ${err.error}`);
            }
        });
    } else {
        console.log('\n✅ All activities are working correctly!');
    }
    
    const successRate = ((successCount / testActivities.length) * 100).toFixed(1);
    console.log(`\n📈 Success rate: ${successRate}%`);
}

testComprehensive().catch(console.error);