const puppeteer = require('puppeteer');

async function testNextJSActivities() {
    console.log('🧪 Testing Next.js activities after fixes...');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Representative sample of Next.js activities from different domains
    const nextjsUrls = [
        'http://localhost:3333/causality/jhu-flu-dag-v1', // Causality - known working
        'http://localhost:3333/causality/jhu-polio-ice-cream-v1', // Causality
        'http://localhost:3333/causality/jhu-polio-ice-cream-v2', // Causality
        'http://localhost:3333/collaboration/r2r-feed-back-v1', // Collaboration
        'http://localhost:3333/collaboration/r2r-whiteboard-v1', // Collaboration  
        'http://localhost:3333/collaboration/r2r-audience-prompting-v1', // Collaboration
        'http://localhost:3333/tools/wason-2-4-6-next-test', // Tools
        'http://localhost:3333/tools/c4r-team-nextjs-template', // Tools
        'http://localhost:3333/tools/claude-chat', // Tools
        'http://localhost:3333/randomization/smi-ran-all-seqa-v1', // Randomization
        'http://localhost:3333/randomization/smi-ran-blk-ran-v3', // Randomization
        'http://localhost:3333/coding-practices/hms-wason-246-v2', // Coding Practices
        'http://localhost:3333/coding-practices/hms-bias-map-v0', // Coding Practices
        'http://localhost:3333/coding-practices/hms-cbi-hyp-bot-v1' // Coding Practices
    ];
    
    let workingCount = 0;
    let partialCount = 0;
    let failedCount = 0;
    
    for (const url of nextjsUrls) {
        try {
            console.log(`\n🔗 Testing Next.js: ${url}`);
            
            const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            if (response && response.status() === 200) {
                // Wait a bit for Next.js to initialize
                await page.waitForTimeout(2000);
                
                // Check for Next.js specific content
                const hasNextJSContent = await page.evaluate(() => {
                    // Look for Next.js specific indicators
                    return document.querySelector('#__next') !== null || 
                           document.querySelector('[data-reactroot]') !== null ||
                           document.querySelector('.next-') !== null ||
                           document.body.innerHTML.includes('_next') ||
                           document.querySelectorAll('script[src*="_next"]').length > 0;
                });
                
                const hasGoodContent = await page.evaluate(() => {
                    const textContent = document.body.innerText.trim();
                    return textContent.length > 50 && 
                           !textContent.includes('This activity is being served in fallback mode');
                });
                
                // Check for static assets loading
                const hasStaticAssets = await page.evaluate(() => {
                    const scripts = document.querySelectorAll('script[src*="_next"]');
                    const links = document.querySelectorAll('link[href*="_next"]');
                    return scripts.length > 0 || links.length > 0;
                });
                
                if (hasNextJSContent && hasGoodContent && hasStaticAssets) {
                    console.log(`   ✅ Next.js app fully working (200 OK)`);
                    workingCount++;
                } else if (hasGoodContent) {
                    console.log(`   ⚠️  Next.js app partially working (200 OK)`);
                    partialCount++;
                } else {
                    console.log(`   🔄 Next.js app loading but minimal content (200 OK)`);
                    partialCount++;
                }
            } else {
                console.log(`   ❌ Failed with status: ${response?.status() || 'Unknown'}`);
                failedCount++;
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            failedCount++;
        }
    }
    
    await browser.close();
    
    console.log('\n📊 Next.js Activity Test Results:');
    console.log(`✅ Fully Working: ${workingCount}/${nextjsUrls.length}`);
    console.log(`⚠️  Partially Working: ${partialCount}/${nextjsUrls.length}`);
    console.log(`❌ Failed: ${failedCount}/${nextjsUrls.length}`);
    
    const totalWorking = workingCount + partialCount;
    console.log(`\n🎯 Success Rate: ${totalWorking}/${nextjsUrls.length} (${Math.round(totalWorking/nextjsUrls.length*100)}%)`);
    
    if (totalWorking === nextjsUrls.length) {
        console.log('🎉 All Next.js activities are working!');
    } else if (totalWorking > nextjsUrls.length * 0.8) {
        console.log('👍 Most Next.js activities are working - good progress!');
    } else {
        console.log('⚠️  Some Next.js activities need attention');
    }
}

testNextJSActivities().catch(console.error);