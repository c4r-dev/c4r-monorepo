#!/usr/bin/env node

const puppeteer = require('puppeteer');

// Test a sample of activities that previously failed
const testActivities = [
    'http://localhost:3333/apps/c4r-component-test',
    'http://localhost:3333/apps/activities/causality/jhuvt-pos-con-v1',
    'http://localhost:3333/activities/randomization/smi-ran-ran-lit-v1',
    'http://localhost:3333/activities/coding-practices/hms-cbi-fav-game-v0',
    'http://localhost:3333/apps/hms-cbi-hyp-bot-v1'
];

async function testActivity(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const errors = [];
    
    // Capture console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
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
            timeout: 10000 
        });
        
        // Wait a bit for React to render
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const title = await page.title();
        
        // Filter out non-critical errors
        const criticalErrors = errors.filter(error => 
            !error.includes('favicon') && 
            !error.includes('404') &&
            !error.includes('net::ERR_') &&
            error.includes('Module not found') || 
            error.includes('Cannot resolve') ||
            error.includes('fs') ||
            error.includes('path') ||
            error.includes('crypto')
        );
        
        if (criticalErrors.length === 0) {
            console.log(`✅ ${url} - PASSED (${title})`);
            return { url, status: 'PASSED', title, errors: [] };
        } else {
            console.log(`❌ ${url} - FAILED`);
            criticalErrors.forEach(error => console.log(`   ${error}`));
            return { url, status: 'FAILED', title, errors: criticalErrors };
        }
        
    } catch (error) {
        console.log(`❌ ${url} - ERROR: ${error.message}`);
        return { url, status: 'ERROR', title: '', errors: [error.message] };
    } finally {
        await browser.close();
    }
}

async function runTests() {
    console.log('🚀 Testing activities with webpack fallback configuration...\n');
    
    const results = [];
    
    for (const url of testActivities) {
        const result = await testActivity(url);
        results.push(result);
        console.log(''); // Add spacing
    }
    
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = results.filter(r => r.status === 'PASSED');
    const failed = results.filter(r => r.status === 'FAILED');
    const errored = results.filter(r => r.status === 'ERROR');
    
    console.log(`✅ Passed: ${passed.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`⚠️  Errors: ${errored.length}`);
    
    if (failed.length > 0) {
        console.log('\n❌ Failed Activities:');
        failed.forEach(result => {
            console.log(`   ${result.url}`);
            result.errors.forEach(error => console.log(`      - ${error}`));
        });
    }
    
    if (errored.length > 0) {
        console.log('\n⚠️  Error Activities:');
        errored.forEach(result => {
            console.log(`   ${result.url}`);
            result.errors.forEach(error => console.log(`      - ${error}`));
        });
    }
    
    console.log(`\n🎉 Webpack fallback test completed: ${passed.length}/${results.length} activities working`);
}

runTests().catch(console.error);