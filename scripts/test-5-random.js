const puppeteer = require('puppeteer');

const activities = [
    '/causality/jhu-flu-dag-v1',
    '/causality/jhu-polio-ice-cream-v2', 
    '/randomization/smi-ran-why-ran-v3',
    '/coding-practices/hms-wason-246-v2',
    '/tools/claude-chat'
];

async function testActivities() {
    console.log('🧪 Testing 5 random activities...\n');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        console.log(`[${i+1}/5] Testing: ${activity}`);
        
        try {
            const url = `http://localhost:3333${activity}`;
            const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
            
            if (response.status() === 200) {
                const title = await page.title();
                console.log(`✅ ${activity} - ${response.status()} - "${title}"`);
            } else {
                console.log(`❌ ${activity} - ${response.status()}`);
            }
        } catch (error) {
            console.log(`❌ ${activity} - Error: ${error.message}`);
        }
        
        console.log('');
    }
    
    await browser.close();
    console.log('🎉 Testing complete!');
}

testActivities().catch(console.error);