#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');

// Test a variety of Next.js activities to see what's actually broken
const testActivities = [
    'http://localhost:3333/randomization/smi-ran-ran-lit-v1',
    'http://localhost:3333/coding-practices/hms-cbi-fav-game-v0',
    'http://localhost:3333/apps/c4r-component-test',
    'http://localhost:3333/causality/jhuvt-pos-con-v1',
    'http://localhost:3333/apps/hms-cbi-hyp-bot-v1',
    'http://localhost:3333/randomization/smi-ran-simple-ran-v1',
    'http://localhost:3333/coding-practices/hms-clean-code-org-v0',
    'http://localhost:3333/apps/duq-finer-v1',
    'http://localhost:3333/causality/jhuvt-caus-cau-lang-v0',
    'http://localhost:3333/coding-practices/hms-wason-246-v2'
];

async function diagnosePage(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const allMessages = [];
    const errors = [];
    const warnings = [];
    const networkFailures = [];
    
    // Capture ALL console messages
    page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        allMessages.push({ type, text });
        
        if (type === 'error') {
            errors.push(text);
        } else if (type === 'warning') {
            warnings.push(text);
        }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
        errors.push(`PAGE ERROR: ${error.message}`);
    });
    
    // Capture failed network requests
    page.on('response', response => {
        if (!response.ok()) {
            networkFailures.push(`${response.status()} ${response.url()}`);
        }
    });
    
    try {
        console.log(`\n🔍 Diagnosing: ${url}`);
        
        await page.goto(url, { 
            waitUntil: 'networkidle0', 
            timeout: 15000 
        });
        
        // Wait for potential React hydration
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const title = await page.title();
        const bodyText = await page.evaluate(() => document.body.innerText);
        
        // Check for specific error patterns
        const hasCompilationError = bodyText.includes('Failed to compile') || 
                                   bodyText.includes('Application error') ||
                                   bodyText.includes('Internal Server Error');
        
        const hasContent = bodyText.length > 200;
        
        // Check DOM structure
        const domInfo = await page.evaluate(() => {
            return {
                hasReactRoot: !!document.querySelector('#__next') || !!document.querySelector('[data-reactroot]'),
                hasHeader: !!document.querySelector('header') || !!document.querySelector('.header') || !!document.querySelector('[class*="header"]'),
                hasMain: !!document.querySelector('main') || !!document.querySelector('#main') || !!document.querySelector('.main'),
                totalElements: document.querySelectorAll('*').length,
                bodyClasses: document.body.className,
                scripts: Array.from(document.querySelectorAll('script')).length
            };
        });
        
        console.log(`   Title: ${title}`);
        console.log(`   Content length: ${bodyText.length} chars`);
        console.log(`   DOM elements: ${domInfo.totalElements}`);
        console.log(`   React root: ${domInfo.hasReactRoot}`);
        console.log(`   Has header: ${domInfo.hasHeader}`);
        console.log(`   Scripts: ${domInfo.scripts}`);
        
        if (hasCompilationError) {
            console.log(`   ❌ Compilation error detected`);
        }
        
        if (errors.length > 0) {
            console.log(`   ❌ Console errors: ${errors.length}`);
            errors.slice(0, 3).forEach(err => console.log(`      - ${err.substring(0, 100)}...`));
        }
        
        if (networkFailures.length > 0) {
            console.log(`   ⚠️  Network failures: ${networkFailures.length}`);
            networkFailures.slice(0, 3).forEach(fail => console.log(`      - ${fail}`));
        }
        
        return {
            url,
            title,
            status: hasCompilationError ? 'COMPILATION_ERROR' : 
                   errors.length > 5 ? 'HIGH_ERRORS' :
                   !hasContent ? 'NO_CONTENT' :
                   !domInfo.hasReactRoot ? 'NO_REACT' : 'WORKING',
            errors: errors.slice(0, 5),
            warnings: warnings.slice(0, 3),
            networkFailures: networkFailures.slice(0, 3),
            domInfo,
            contentLength: bodyText.length,
            hasCompilationError,
            bodySnippet: bodyText.substring(0, 500)
        };
        
    } catch (error) {
        console.log(`   ❌ Failed to load: ${error.message}`);
        return {
            url,
            status: 'LOAD_ERROR',
            error: error.message,
            errors: [],
            warnings: [],
            networkFailures: []
        };
    } finally {
        await browser.close();
    }
}

async function runDiagnosis() {
    console.log('🚀 Running comprehensive Next.js activity diagnosis...\n');
    
    const results = [];
    
    for (const url of testActivities) {
        const result = await diagnosePage(url);
        results.push(result);
    }
    
    console.log('\n📊 Diagnosis Summary:');
    console.log('====================');
    
    const working = results.filter(r => r.status === 'WORKING');
    const compilationErrors = results.filter(r => r.status === 'COMPILATION_ERROR');
    const highErrors = results.filter(r => r.status === 'HIGH_ERRORS');
    const noContent = results.filter(r => r.status === 'NO_CONTENT');
    const noReact = results.filter(r => r.status === 'NO_REACT');
    const loadErrors = results.filter(r => r.status === 'LOAD_ERROR');
    
    console.log(`✅ Working: ${working.length}/10`);
    console.log(`❌ Compilation errors: ${compilationErrors.length}/10`);
    console.log(`⚠️  High errors: ${highErrors.length}/10`);
    console.log(`📄 No content: ${noContent.length}/10`);
    console.log(`⚛️  No React: ${noReact.length}/10`);
    console.log(`🚫 Load errors: ${loadErrors.length}/10`);
    
    if (compilationErrors.length > 0) {
        console.log('\n❌ Compilation Error Activities:');
        compilationErrors.forEach(result => {
            console.log(`   ${result.url}`);
            console.log(`      Error snippet: ${result.bodySnippet.substring(0, 200)}...`);
        });
    }
    
    if (highErrors.length > 0) {
        console.log('\n⚠️  High Error Activities:');
        highErrors.forEach(result => {
            console.log(`   ${result.url}`);
            result.errors.forEach(error => console.log(`      - ${error.substring(0, 100)}...`));
        });
    }
    
    // Save detailed results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = `activity-diagnosis-${timestamp}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n📁 Detailed diagnosis saved to: ${resultsFile}`);
    
    console.log(`\n🔍 Key Issues Found:`);
    
    // Analyze common error patterns
    const allErrors = results.flatMap(r => r.errors || []);
    const errorPatterns = {};
    
    allErrors.forEach(error => {
        if (error.includes('Module not found')) {
            errorPatterns['Module Resolution'] = (errorPatterns['Module Resolution'] || 0) + 1;
        } else if (error.includes('Hydration')) {
            errorPatterns['React Hydration'] = (errorPatterns['React Hydration'] || 0) + 1;
        } else if (error.includes('TypeError')) {
            errorPatterns['JavaScript Errors'] = (errorPatterns['JavaScript Errors'] || 0) + 1;
        } else if (error.includes('fetch')) {
            errorPatterns['Network/API'] = (errorPatterns['Network/API'] || 0) + 1;
        }
    });
    
    Object.entries(errorPatterns).forEach(([pattern, count]) => {
        console.log(`   ${pattern}: ${count} occurrences`);
    });
}

runDiagnosis().catch(console.error);