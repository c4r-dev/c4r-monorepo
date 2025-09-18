#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');

// Test a comprehensive sample of different activity types
const testActivities = [
    // Apps - Next.js activities
    'http://localhost:3333/apps/c4r-component-test',
    'http://localhost:3333/apps/activities/causality/jhuvt-pos-con-v1',
    'http://localhost:3333/apps/hms-cbi-hyp-bot-v1',
    'http://localhost:3333/apps/c4r-template-test',
    'http://localhost:3333/apps/duq-finer-v1',
    
    // Activities - Next.js
    'http://localhost:3333/activities/randomization/smi-ran-ran-lit-v1',
    'http://localhost:3333/activities/coding-practices/hms-cbi-fav-game-v0',
    'http://localhost:3333/activities/coding-practices/hms-clean-code-org-v0',
    'http://localhost:3333/activities/randomization/smi-ran-simple-ran-v1',
    'http://localhost:3333/activities/coding-practices/hms-wason-246-v2',
    
    // Causality activities
    'http://localhost:3333/causality/jhuvt-caus-cau-lang-v0',
    'http://localhost:3333/causality/jhuvt-con-con-issue-v0',
    'http://localhost:3333/causality/jhuvt-dag-for-caus-v0',
    
    // Random selection of other activities
    'http://localhost:3333/apps/hms-bias-map-v0',
    'http://localhost:3333/apps/neuroserpin_v0',
    'http://localhost:3333/activities/randomization/smi-ran-why-ran-v2',
    'http://localhost:3333/activities/coding-practices/hms-int-exe-v0'
];

async function testActivity(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const errors = [];
    const consoleMessages = [];
    
    // Capture console messages
    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push(`${msg.type()}: ${text}`);
        if (msg.type() === 'error') {
            errors.push(text);
        }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
        errors.push(error.message);
    });
    
    try {
        console.log(`🧪 Testing: ${url}`);
        
        await page.goto(url, { 
            waitUntil: 'networkidle0', 
            timeout: 15000 
        });
        
        // Wait for React to render
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const title = await page.title();
        
        // Filter critical errors (Node.js module issues, webpack compilation errors)
        const criticalErrors = errors.filter(error => {
            const errorLower = error.toLowerCase();
            return (
                errorLower.includes('module not found') ||
                errorLower.includes('cannot resolve') ||
                errorLower.includes('fs') && !errorLower.includes('favicon') ||
                errorLower.includes('compilation failed') ||
                errorLower.includes('webpack') ||
                errorLower.includes('chunk load failed') ||
                errorLower.includes('loading chunk') ||
                errorLower.includes('unexpected token') ||
                errorLower.includes('syntaxerror')
            ) && !errorLower.includes('favicon') && !errorLower.includes('404');
        });
        
        // Check if page actually loaded content (not just error page)
        const bodyText = await page.evaluate(() => document.body.innerText);
        const hasContent = bodyText.length > 100 && !bodyText.includes('Application error');
        
        if (criticalErrors.length === 0 && hasContent) {
            console.log(`✅ ${url} - PASSED (${title})`);
            return { url, status: 'PASSED', title, errors: [], hasContent };
        } else {
            console.log(`❌ ${url} - FAILED`);
            if (criticalErrors.length > 0) {
                console.log(`   Critical errors:`);
                criticalErrors.forEach(error => console.log(`   - ${error}`));
            }
            if (!hasContent) {
                console.log(`   - Page did not load proper content (${bodyText.length} chars)`);
            }
            return { url, status: 'FAILED', title, errors: criticalErrors, hasContent };
        }
        
    } catch (error) {
        console.log(`❌ ${url} - ERROR: ${error.message}`);
        return { url, status: 'ERROR', title: '', errors: [error.message], hasContent: false };
    } finally {
        await browser.close();
    }
}

async function runComprehensiveTest() {
    console.log('🚀 Testing comprehensive activity sample with webpack fallback configuration...\n');
    
    const results = [];
    
    for (const url of testActivities) {
        const result = await testActivity(url);
        results.push(result);
        console.log(''); // Add spacing
    }
    
    console.log('\n📊 Comprehensive Test Results:');
    console.log('===============================');
    
    const passed = results.filter(r => r.status === 'PASSED');
    const failed = results.filter(r => r.status === 'FAILED');
    const errored = results.filter(r => r.status === 'ERROR');
    
    console.log(`✅ Passed: ${passed.length}/${results.length} (${Math.round(passed.length/results.length*100)}%)`);
    console.log(`❌ Failed: ${failed.length}/${results.length} (${Math.round(failed.length/results.length*100)}%)`);
    console.log(`⚠️  Errors: ${errored.length}/${results.length} (${Math.round(errored.length/results.length*100)}%)`);
    
    if (passed.length > 0) {
        console.log('\n✅ Working Activities:');
        passed.forEach(result => {
            console.log(`   ${result.url} - ${result.title}`);
        });
    }
    
    if (failed.length > 0) {
        console.log('\n❌ Failed Activities:');
        failed.forEach(result => {
            console.log(`   ${result.url}`);
            if (result.errors.length > 0) {
                result.errors.forEach(error => console.log(`      - ${error}`));
            }
        });
    }
    
    if (errored.length > 0) {
        console.log('\n⚠️  Error Activities:');
        errored.forEach(result => {
            console.log(`   ${result.url}`);
            result.errors.forEach(error => console.log(`      - ${error}`));
        });
    }
    
    // Save detailed results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = `comprehensive-test-results-${timestamp}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n📁 Detailed results saved to: ${resultsFile}`);
    
    console.log(`\n🎉 Webpack fallback test completed: ${passed.length}/${results.length} activities working properly`);
    
    if (passed.length === results.length) {
        console.log('🎊 All tested activities are working! Webpack fallback implementation successful.');
    } else if (passed.length >= Math.round(results.length * 0.8)) {
        console.log('📈 Most activities working - significant improvement achieved.');
    } else {
        console.log('⚠️  Some activities still need attention.');
    }
}

runComprehensiveTest().catch(console.error);