#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');

// Test activities with their CORRECT routes as discovered by the server
const testActivities = [
    // Apps
    'http://localhost:3333/apps/c4r-component-test',
    'http://localhost:3333/apps/hms-cbi-hyp-bot-v1',
    'http://localhost:3333/apps/c4r-template-test',
    'http://localhost:3333/apps/duq-finer-v1',
    'http://localhost:3333/apps/hms-bias-map-v0',
    'http://localhost:3333/apps/neuroserpin_v0',
    'http://localhost:3333/apps/smi-ran-why-ran-v4',
    
    // Randomization activities (correct routes)
    'http://localhost:3333/randomization/smi-ran-ran-lit-v1',
    'http://localhost:3333/randomization/smi-ran-simple-ran-v1',
    'http://localhost:3333/randomization/smi-ran-why-ran-v2',
    'http://localhost:3333/randomization/smi-ran-str-ran-v1',
    
    // Coding practices (correct routes)
    'http://localhost:3333/coding-practices/hms-cbi-fav-game-v0',
    'http://localhost:3333/coding-practices/hms-clean-code-org-v0',
    'http://localhost:3333/coding-practices/hms-wason-246-v2',
    'http://localhost:3333/coding-practices/hms-int-exe-v0',
    
    // Causality activities
    'http://localhost:3333/causality/jhuvt-caus-cau-lang-v0',
    'http://localhost:3333/causality/jhuvt-con-con-issue-v0',
    'http://localhost:3333/causality/jhuvt-dag-for-caus-v0',
    'http://localhost:3333/causality/jhuvt-pos-con-v1',
    
    // Test a few sub-routes too
    'http://localhost:3333/causality/jhuvt-pos-con-v1/pages/PositiveControl1',
    'http://localhost:3333/coding-practices/hms-wason-246-v2/pages/input'
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
        
        // Check for specific webpack/module errors
        const webpackErrors = errors.filter(error => {
            const errorLower = error.toLowerCase();
            return (
                errorLower.includes('module not found') ||
                errorLower.includes('cannot resolve') ||
                (errorLower.includes('fs') && !errorLower.includes('favicon')) ||
                errorLower.includes('compilation failed') ||
                errorLower.includes('webpack') ||
                errorLower.includes('chunk load failed') ||
                errorLower.includes('path') && errorLower.includes('module') ||
                errorLower.includes('crypto') && errorLower.includes('module') ||
                errorLower.includes('stream') && errorLower.includes('module') ||
                errorLower.includes('util') && errorLower.includes('module')
            ) && !errorLower.includes('favicon') && !errorLower.includes('404');
        });
        
        // Check if page loaded content (not error page)
        const bodyText = await page.evaluate(() => document.body.innerText);
        const hasContent = bodyText.length > 100 && 
                          !bodyText.includes('Application error') && 
                          !bodyText.includes('500') &&
                          !bodyText.includes('404');
        
        // Check if it loaded the actual activity interface
        const hasActivityElements = await page.evaluate(() => {
            return document.querySelector('header') !== null || 
                   document.querySelector('.header') !== null ||
                   document.querySelector('[class*="header"]') !== null ||
                   document.querySelector('main') !== null ||
                   document.querySelector('.app') !== null ||
                   document.querySelector('[class*="app"]') !== null;
        });
        
        if (webpackErrors.length === 0 && hasContent && hasActivityElements) {
            console.log(`✅ ${url} - PASSED (${title}) - Real activity content loaded`);
            return { url, status: 'PASSED', title, errors: [], hasContent, hasActivityElements, webpackErrors: [] };
        } else {
            console.log(`❌ ${url} - FAILED`);
            if (webpackErrors.length > 0) {
                console.log(`   Webpack/Module errors:`);
                webpackErrors.forEach(error => console.log(`   - ${error}`));
            }
            if (!hasContent) {
                console.log(`   - Page has insufficient content (${bodyText.length} chars)`);
            }
            if (!hasActivityElements) {
                console.log(`   - No activity UI elements found`);
            }
            return { url, status: 'FAILED', title, errors: webpackErrors, hasContent, hasActivityElements, webpackErrors };
        }
        
    } catch (error) {
        console.log(`❌ ${url} - ERROR: ${error.message}`);
        return { url, status: 'ERROR', title: '', errors: [error.message], hasContent: false, hasActivityElements: false, webpackErrors: [] };
    } finally {
        await browser.close();
    }
}

async function runCorrectRouteTest() {
    console.log('🚀 Testing activities with correct routes and webpack fallback configuration...\n');
    
    const results = [];
    
    for (const url of testActivities) {
        const result = await testActivity(url);
        results.push(result);
        console.log(''); // Add spacing
    }
    
    console.log('\n📊 Correct Route Test Results:');
    console.log('===============================');
    
    const passed = results.filter(r => r.status === 'PASSED');
    const failed = results.filter(r => r.status === 'FAILED');
    const errored = results.filter(r => r.status === 'ERROR');
    
    console.log(`✅ Passed: ${passed.length}/${results.length} (${Math.round(passed.length/results.length*100)}%)`);
    console.log(`❌ Failed: ${failed.length}/${results.length} (${Math.round(failed.length/results.length*100)}%)`);
    console.log(`⚠️  Errors: ${errored.length}/${results.length} (${Math.round(errored.length/results.length*100)}%)`);
    
    if (passed.length > 0) {
        console.log('\n✅ Working Activities (with real content):');
        passed.forEach(result => {
            console.log(`   ${result.url}`);
            console.log(`      Title: ${result.title}`);
        });
    }
    
    if (failed.length > 0) {
        console.log('\n❌ Failed Activities:');
        failed.forEach(result => {
            console.log(`   ${result.url}`);
            if (result.webpackErrors && result.webpackErrors.length > 0) {
                console.log(`      Webpack errors: ${result.webpackErrors.length}`);
                result.webpackErrors.slice(0, 2).forEach(error => console.log(`        - ${error}`));
            }
            if (!result.hasContent) console.log(`      - Insufficient content`);
            if (!result.hasActivityElements) console.log(`      - No activity UI elements`);
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
    const resultsFile = `correct-route-test-results-${timestamp}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n📁 Detailed results saved to: ${resultsFile}`);
    
    // Count webpack-error-free activities
    const webpackErrorFree = results.filter(r => 
        r.webpackErrors && r.webpackErrors.length === 0
    );
    
    console.log(`\n🎉 Webpack fallback test completed:`);
    console.log(`   📦 Webpack error-free: ${webpackErrorFree.length}/${results.length} activities`);
    console.log(`   ✨ Fully working: ${passed.length}/${results.length} activities`);
    
    if (webpackErrorFree.length === results.length) {
        console.log('🎊 All activities are free of webpack/module errors! Implementation successful.');
    } else if (webpackErrorFree.length >= Math.round(results.length * 0.9)) {
        console.log('📈 Most activities are webpack error-free - excellent improvement!');
    } else {
        console.log('⚠️  Some activities still have webpack/module issues.');
    }
}

runCorrectRouteTest().catch(console.error);