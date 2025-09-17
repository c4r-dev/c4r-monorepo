const puppeteer = require('puppeteer');

async function testActivity(activityUrl, timeout = 15000) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set a reasonable viewport
    await page.setViewport({ width: 1200, height: 800 });
    
    try {
        console.log(`🧪 Testing: ${activityUrl}`);
        
        // Navigate to the activity
        const response = await page.goto(activityUrl, { 
            waitUntil: 'networkidle0',
            timeout: timeout 
        });
        
        if (!response.ok()) {
            throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
        }
        
        // Wait a moment for React to render
        await page.waitForTimeout(2000);
        
        // Check for React content (look for common React indicators)
        const hasReactContent = await page.evaluate(() => {
            // Check for React root
            const hasReactRoot = document.querySelector('[data-reactroot]') || 
                                document.querySelector('#root') ||
                                document.querySelector('#__next');
            
            // Check for any interactive elements
            const hasInteractive = document.querySelectorAll('button, input, select').length > 0;
            
            // Check for non-empty content
            const hasContent = document.body.innerText.trim().length > 100;
            
            // Check for errors
            const hasErrors = document.body.innerText.includes('Error') ||
                             document.body.innerText.includes('Cannot read properties') ||
                             document.body.innerText.includes('useReducer');
            
            return {
                hasReactRoot: !!hasReactRoot,
                hasInteractive,
                hasContent,
                hasErrors,
                bodyText: document.body.innerText.substring(0, 500)
            };
        });
        
        console.log(`✅ Successfully loaded: ${activityUrl}`);
        console.log(`   - React Root: ${hasReactContent.hasReactRoot}`);
        console.log(`   - Interactive Elements: ${hasReactContent.hasInteractive}`);
        console.log(`   - Has Content: ${hasReactContent.hasContent}`);
        console.log(`   - Has Errors: ${hasReactContent.hasErrors}`);
        
        if (hasReactContent.hasErrors) {
            console.log(`❌ Content preview:`, hasReactContent.bodyText);
            return { success: false, error: 'Page contains React errors' };
        }
        
        if (!hasReactContent.hasContent) {
            console.log(`⚠️  Warning: Page has minimal content`);
            console.log(`   Content preview:`, hasReactContent.bodyText);
        }
        
        return { 
            success: true, 
            details: hasReactContent 
        };
        
    } catch (error) {
        console.log(`❌ Failed to load: ${activityUrl}`);
        console.log(`   Error: ${error.message}`);
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
}

async function main() {
    const serverUrl = 'http://localhost:3333';
    
    // Test a few specific activities
    const testActivities = [
        '/causality/jhu-flu-dag-v1',
        '/randomization/smi-ran-all-seqa-v1',
        '/tools/claude-chat'
    ];
    
    console.log('🧪 Testing Next.js activities with single package.json...\n');
    
    for (const activity of testActivities) {
        const result = await testActivity(`${serverUrl}${activity}`);
        console.log('');
    }
    
    console.log('✅ Testing complete!');
}

main().catch(console.error);