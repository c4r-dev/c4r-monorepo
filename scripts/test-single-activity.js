const puppeteer = require('puppeteer');
const logger = require('../packages/logging/logger.js');

async function testActivity(activityUrl, timeout = 15000) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set a reasonable viewport
    await page.setViewport({ width: 1200, height: 800 });
    
    try {
        logger.app.info(`🧪 Testing: ${activityUrl}`);
        
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
        
        logger.app.info(`✅ Successfully loaded: ${activityUrl}`);
        logger.app.info(`   - React Root: ${hasReactContent.hasReactRoot}`);
        logger.app.info(`   - Interactive Elements: ${hasReactContent.hasInteractive}`);
        logger.app.info(`   - Has Content: ${hasReactContent.hasContent}`);
        logger.app.info(`   - Has Errors: ${hasReactContent.hasErrors}`);
        
        if (hasReactContent.hasErrors) {
            logger.app.info(`❌ Content preview:`, hasReactContent.bodyText);
            return { success: false, error: 'Page contains React errors' };
        }
        
        if (!hasReactContent.hasContent) {
            logger.app.info(`⚠️  Warning: Page has minimal content`);
            logger.app.info(`   Content preview:`, hasReactContent.bodyText);
        }
        
        return { 
            success: true, 
            details: hasReactContent 
        };
        
    } catch (error) {
        logger.app.info(`❌ Failed to load: ${activityUrl}`);
        logger.app.info(`   Error: ${error.message}`);
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
    
    logger.app.info('🧪 Testing Next.js activities with single package.json...\n');
    
    for (const activity of testActivities) {
        const result = await testActivity(`${serverUrl}${activity}`);
        logger.app.info('');
    }
    
    logger.app.info('✅ Testing complete!');
}

main().catch(console.error);