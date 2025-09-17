const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testAllActivitiesWithScreenshots() {
    console.log('🧪 Testing all 75 activities with screenshots and activity detection...');
    
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'activity-screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }
    
    const browser = await puppeteer.launch({ 
        headless: true,
        defaultViewport: { width: 1280, height: 720 }
    });
    const page = await browser.newPage();
    
    // First, get the list of all activities from the API
    console.log('📋 Fetching activity list from server...');
    try {
        await page.goto('http://localhost:3333/api/activities', { waitUntil: 'networkidle0' });
        const activitiesJson = await page.evaluate(() => document.body.innerText);
        const activities = JSON.parse(activitiesJson);
        console.log(`📦 Found ${activities.length} activities to test`);
        
        let results = {
            working: [],
            partial: [],
            failed: [],
            screenshots: []
        };
        
        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];
            const url = activity.url;
            const activityName = `${activity.domain}-${activity.name}`;
            
            try {
                console.log(`\n🔗 [${i+1}/${activities.length}] Testing: ${activity.route} (${activity.type})`);
                
                const response = await page.goto(url, { 
                    waitUntil: 'domcontentloaded', 
                    timeout: 20000 
                });
                
                // Wait for content to load
                await page.waitForTimeout(3000);
                
                if (response && response.status() === 200) {
                    // Take screenshot
                    const screenshotPath = path.join(screenshotsDir, `${activityName}.png`);
                    await page.screenshot({ 
                        path: screenshotPath, 
                        fullPage: false 
                    });
                    
                    // Analyze the content
                    const analysis = await page.evaluate(() => {
                        const body = document.body;
                        const textContent = body.innerText.trim();
                        
                        // Check for different types of content
                        const hasReactContent = document.querySelector('[data-reactroot]') !== null || 
                               document.querySelector('#root') !== null ||
                               document.querySelector('.App') !== null ||
                               document.querySelector('#__next') !== null;
                        
                        const hasInteractiveElements = document.querySelectorAll('button, input, select, textarea, [onclick], [role="button"]').length > 0;
                        
                        const hasFormElements = document.querySelectorAll('form, input, button[type="submit"]').length > 0;
                        
                        const hasCanvasOrSVG = document.querySelectorAll('canvas, svg').length > 0;
                        
                        const hasSignificantContent = textContent.length > 100;
                        
                        const hasFallbackContent = textContent.includes('This activity is being served in fallback mode') ||
                                                  textContent.includes('Activity Loading...') ||
                                                  textContent.includes('being served seamlessly');
                        
                        const hasErrorContent = textContent.includes('Error') || 
                                               textContent.includes('404') ||
                                               textContent.includes('500') ||
                                               textContent.includes('Cannot') ||
                                               body.innerHTML.includes('error');
                        
                        const hasNextJSAssets = document.querySelectorAll('script[src*="_next"], link[href*="_next"]').length > 0;
                        
                        // Count different types of elements that suggest activity
                        const elementCounts = {
                            buttons: document.querySelectorAll('button').length,
                            inputs: document.querySelectorAll('input').length,
                            forms: document.querySelectorAll('form').length,
                            canvases: document.querySelectorAll('canvas').length,
                            svgs: document.querySelectorAll('svg').length,
                            images: document.querySelectorAll('img').length,
                            links: document.querySelectorAll('a').length
                        };
                        
                        return {
                            textLength: textContent.length,
                            hasReactContent,
                            hasInteractiveElements,
                            hasFormElements,
                            hasCanvasOrSVG,
                            hasSignificantContent,
                            hasFallbackContent,
                            hasErrorContent,
                            hasNextJSAssets,
                            elementCounts,
                            title: document.title,
                            firstWords: textContent.substring(0, 200)
                        };
                    });
                    
                    // Determine activity status
                    let status = 'failed';
                    let statusIcon = '❌';
                    let description = 'Unknown issue';
                    
                    if (analysis.hasErrorContent) {
                        status = 'failed';
                        statusIcon = '❌';
                        description = 'Error content detected';
                    } else if (analysis.hasFallbackContent) {
                        status = 'partial';
                        statusIcon = '⚠️ ';
                        description = 'Fallback mode';
                    } else if (analysis.hasInteractiveElements && analysis.hasSignificantContent) {
                        status = 'working';
                        statusIcon = '✅';
                        description = `Interactive (${analysis.elementCounts.buttons}B, ${analysis.elementCounts.inputs}I)`;
                    } else if (analysis.hasCanvasOrSVG && analysis.hasSignificantContent) {
                        status = 'working';
                        statusIcon = '✅';
                        description = `Visual content (${analysis.elementCounts.canvases}C, ${analysis.elementCounts.svgs}S)`;
                    } else if (analysis.hasReactContent && analysis.hasSignificantContent) {
                        status = 'working';
                        statusIcon = '✅';
                        description = 'React app with content';
                    } else if (analysis.hasSignificantContent) {
                        status = 'partial';
                        statusIcon = '🔄';
                        description = `Content only (${analysis.textLength} chars)`;
                    } else {
                        status = 'partial';
                        statusIcon = '⚠️ ';
                        description = 'Minimal content';
                    }
                    
                    console.log(`   ${statusIcon} ${description} - Screenshot saved`);
                    
                    results[status].push({
                        activity,
                        analysis,
                        screenshotPath,
                        description
                    });
                    
                    results.screenshots.push({
                        name: activityName,
                        path: screenshotPath,
                        status,
                        route: activity.route,
                        type: activity.type,
                        description
                    });
                    
                } else {
                    console.log(`   ❌ HTTP ${response?.status() || 'Unknown'} - No screenshot`);
                    results.failed.push({
                        activity,
                        error: `HTTP ${response?.status() || 'Unknown'}`,
                        screenshotPath: null
                    });
                }
                
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
                results.failed.push({
                    activity,
                    error: error.message,
                    screenshotPath: null
                });
            }
        }
        
        await browser.close();
        
        // Generate summary report
        console.log('\n📊 COMPREHENSIVE ACTIVITY TEST RESULTS:');
        console.log('=' .repeat(60));
        console.log(`✅ Fully Working: ${results.working.length}/${activities.length}`);
        console.log(`🔄 Partially Working: ${results.partial.length}/${activities.length}`);
        console.log(`❌ Failed: ${results.failed.length}/${activities.length}`);
        console.log(`📸 Screenshots taken: ${results.screenshots.length}`);
        
        const totalWorking = results.working.length + results.partial.length;
        const successRate = Math.round(totalWorking/activities.length*100);
        console.log(`\n🎯 Overall Success Rate: ${totalWorking}/${activities.length} (${successRate}%)`);
        
        // Detailed breakdown by type
        console.log('\n📋 BY ACTIVITY TYPE:');
        const byType = {};
        activities.forEach(activity => {
            if (!byType[activity.type]) byType[activity.type] = { working: 0, partial: 0, failed: 0, total: 0 };
            byType[activity.type].total++;
            
            const result = results.working.find(r => r.activity.name === activity.name) ? 'working' :
                          results.partial.find(r => r.activity.name === activity.name) ? 'partial' : 'failed';
            byType[activity.type][result]++;
        });
        
        Object.entries(byType).forEach(([type, counts]) => {
            const typeSuccess = Math.round((counts.working + counts.partial) / counts.total * 100);
            console.log(`  ${type}: ${counts.working + counts.partial}/${counts.total} (${typeSuccess}%) - ✅${counts.working} 🔄${counts.partial} ❌${counts.failed}`);
        });
        
        // Save detailed report
        const reportPath = path.join(__dirname, 'activity-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
                total: activities.length,
                working: results.working.length,
                partial: results.partial.length,
                failed: results.failed.length,
                successRate
            },
            byType,
            details: results
        }, null, 2));
        
        console.log(`\n📄 Detailed report saved: ${reportPath}`);
        console.log(`📁 Screenshots directory: ${screenshotsDir}`);
        
        // Show some examples
        if (results.working.length > 0) {
            console.log(`\n✅ WORKING EXAMPLES:`);
            results.working.slice(0, 3).forEach(r => {
                console.log(`  • ${r.activity.route} - ${r.description}`);
            });
        }
        
        if (results.failed.length > 0) {
            console.log(`\n❌ FAILED ACTIVITIES:`);
            results.failed.slice(0, 5).forEach(r => {
                console.log(`  • ${r.activity.route} - ${r.error || r.description}`);
            });
        }
        
        console.log('\n🎉 Activity testing complete!');
        
    } catch (error) {
        console.error('❌ Failed to fetch activities:', error);
        await browser.close();
    }
}

testAllActivitiesWithScreenshots().catch(console.error);