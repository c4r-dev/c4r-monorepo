#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');

async function getAllActivities() {
    // Fetch the list of activities from the server
    try {
        const response = await fetch('http://localhost:3333/');
        const html = await response.text();
        
        // Extract activity URLs from the HTML - look for href attributes
        const activityMatches = html.match(/href="\/[^"]+"/g) || [];
        const activities = activityMatches
            .map(match => match.replace(/href="/, '').replace(/"$/, ''))
            .filter(url => url.includes('/') && !url.includes('browse') && !url.includes('_next'))
            .filter(url => !url.includes('#'))
            .slice(0, 100); // Limit to 100 as requested
        
        return [...new Set(activities)]; // Remove duplicates
    } catch (error) {
        console.error('Failed to fetch activities list:', error.message);
        
        // Fallback: manually construct common activity patterns
        const domains = ['causality', 'randomization', 'coding-practices', 'apps'];
        const activities = [];
        
        // Add some known activities as fallback
        activities.push('/pages/PositiveControl1');
        activities.push('/causality/jhuvt-pos-con-v1');
        activities.push('/causality/jhuvt-con-neu-jeo-v0');
        activities.push('/causality/jhuvt-dag-for-caus-v0');
        activities.push('/randomization/smi-ran-why-ran-v1');
        
        return activities;
    }
}

async function testActivity(browser, activity, index, total) {
    const page = await browser.newPage();
    const errors = [];
    const warnings = [];
    const networkErrors = [];
    
    console.log(`[${index + 1}/${total}] Testing: ${activity}`);
    
    // Set up listeners
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push({
                type: 'console_error',
                message: msg.text(),
                url: activity
            });
        } else if (msg.type() === 'warning') {
            warnings.push({
                type: 'console_warning', 
                message: msg.text(),
                url: activity
            });
        }
    });
    
    page.on('pageerror', err => {
        errors.push({
            type: 'page_error',
            message: err.message,
            stack: err.stack,
            url: activity
        });
    });
    
    page.on('requestfailed', request => {
        networkErrors.push({
            type: 'network_error',
            url: request.url(),
            failure: request.failure()?.errorText,
            activity: activity
        });
    });
    
    page.on('response', response => {
        if (!response.ok() && response.status() >= 400) {
            networkErrors.push({
                type: 'http_error',
                status: response.status(),
                url: response.url(),
                activity: activity
            });
        }
    });
    
    try {
        const url = `http://localhost:3333${activity}`;
        console.log(`  → Loading: ${url}`);
        
        const response = await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 10000
        });
        
        // Wait for 10 seconds as requested
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        const result = {
            activity,
            url,
            status: response?.status() || 'unknown',
            errors,
            warnings,
            networkErrors,
            timestamp: new Date().toISOString()
        };
        
        console.log(`  ✓ Completed: ${errors.length} errors, ${warnings.length} warnings, ${networkErrors.length} network issues`);
        
        return result;
        
    } catch (error) {
        const result = {
            activity,
            url: `http://localhost:3333${activity}`,
            status: 'failed',
            errors: [{
                type: 'navigation_error',
                message: error.message,
                url: activity
            }],
            warnings,
            networkErrors,
            timestamp: new Date().toISOString()
        };
        
        console.log(`  ✗ Failed: ${error.message}`);
        return result;
        
    } finally {
        await page.close();
    }
}

async function testAllActivities() {
    console.log('🔍 Starting comprehensive activity testing...');
    
    const activities = await getAllActivities();
    console.log(`📊 Found ${activities.length} activities to test`);
    
    if (activities.length === 0) {
        console.error('❌ No activities found to test');
        return;
    }
    
    const browser = await puppeteer.launch({
        headless: true, // Run headless for batch testing
        args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const results = [];
    const startTime = Date.now();
    
    try {
        // Test activities in parallel batches of 5 to avoid overwhelming the server
        const batchSize = 5;
        for (let i = 0; i < activities.length; i += batchSize) {
            const batch = activities.slice(i, i + batchSize);
            console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(activities.length / batchSize)}`);
            
            const batchPromises = batch.map((activity, batchIndex) => 
                testActivity(browser, activity, i + batchIndex, activities.length)
            );
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            
            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
    } finally {
        await browser.close();
    }
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    // Generate report
    const report = {
        summary: {
            total_activities: activities.length,
            duration_seconds: duration,
            timestamp: new Date().toISOString(),
            total_errors: results.reduce((sum, r) => sum + r.errors.length, 0),
            total_warnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
            total_network_errors: results.reduce((sum, r) => sum + r.networkErrors.length, 0),
            failed_activities: results.filter(r => r.status === 'failed' || r.status >= 400).length
        },
        results: results
    };
    
    // Save detailed results
    const filename = `activity-test-results-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    
    // Save error summary
    const errorSummary = results
        .filter(r => r.errors.length > 0 || r.networkErrors.length > 0 || r.status === 'failed')
        .map(r => ({
            activity: r.activity,
            url: r.url,
            status: r.status,
            error_count: r.errors.length,
            network_error_count: r.networkErrors.length,
            first_error: r.errors[0]?.message || r.networkErrors[0]?.failure || 'Navigation failed'
        }));
    
    const errorFilename = `activity-errors-summary-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    const errorContent = [
        `Activity Testing Error Summary`,
        `Generated: ${new Date().toISOString()}`,
        `Total Activities Tested: ${activities.length}`,
        `Activities with Errors: ${errorSummary.length}`,
        `Duration: ${duration} seconds`,
        ``,
        `ERROR DETAILS:`,
        `=============`,
        ...errorSummary.map(e => 
            `${e.activity} (${e.status}): ${e.first_error}`
        )
    ].join('\n');
    
    fs.writeFileSync(errorFilename, errorContent);
    
    console.log(`\n📊 TESTING COMPLETE`);
    console.log(`Duration: ${duration} seconds`);
    console.log(`Activities tested: ${activities.length}`);
    console.log(`Total errors: ${report.summary.total_errors}`);
    console.log(`Total warnings: ${report.summary.total_warnings}`);
    console.log(`Network errors: ${report.summary.total_network_errors}`);
    console.log(`Failed activities: ${report.summary.failed_activities}`);
    console.log(`\n📁 Results saved to:`);
    console.log(`  Detailed: ${filename}`);
    console.log(`  Errors: ${errorFilename}`);
}

testAllActivities().catch(console.error);