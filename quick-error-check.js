#!/usr/bin/env node

const puppeteer = require('puppeteer');

// Quick test of 10 activities that previously had fs errors
const quickTestActivities = [
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

async function quickErrorCheck() {
    console.log('🚀 Quick error check on 10 key activities...\n');
    
    const results = [];
    
    for (const url of quickTestActivities) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        const errors = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        page.on('pageerror', error => {
            errors.push(error.message);
        });
        
        try {
            console.log(`Testing: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 8000 });
            
            // Check for specific webpack/fs errors
            const fsErrors = errors.filter(error => 
                error.toLowerCase().includes('module not found') ||
                error.toLowerCase().includes("can't resolve 'fs'") ||
                error.toLowerCase().includes("can't resolve 'path'") ||
                error.toLowerCase().includes("can't resolve 'crypto'")
            );
            
            const title = await page.title();
            
            if (fsErrors.length === 0) {
                console.log(`✅ ${title} - No webpack/fs errors`);
                results.push({ url, status: 'SUCCESS', errors: [] });
            } else {
                console.log(`❌ ${title} - ${fsErrors.length} webpack errors`);
                fsErrors.forEach(err => console.log(`   - ${err}`));
                results.push({ url, status: 'WEBPACK_ERROR', errors: fsErrors });
            }
            
        } catch (error) {
            console.log(`⚠️  ${url} - ${error.message}`);
            results.push({ url, status: 'TIMEOUT', errors: [error.message] });
        }
        
        await browser.close();
    }
    
    console.log('\n📊 Quick Error Check Results:');
    console.log('=============================');
    
    const success = results.filter(r => r.status === 'SUCCESS');
    const webpackErrors = results.filter(r => r.status === 'WEBPACK_ERROR');
    const timeouts = results.filter(r => r.status === 'TIMEOUT');
    
    console.log(`✅ No webpack errors: ${success.length}/10`);
    console.log(`❌ Webpack errors: ${webpackErrors.length}/10`);
    console.log(`⚠️  Timeouts: ${timeouts.length}/10`);
    
    if (webpackErrors.length === 0) {
        console.log('🎊 Perfect! All tested activities are free of webpack/fs module errors!');
    } else {
        console.log('⚠️  Some activities still have webpack errors that need fixing.');
    }
}

quickErrorCheck().catch(console.error);