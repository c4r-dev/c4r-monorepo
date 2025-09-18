#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const logger = require('../packages/logging/logger.js');

// Get all activity routes from the server logs or discover them
const ACTIVITY_ROUTES = [
    // CAUSALITY
    '/causality/jhu-flu-dag-v1',
    '/causality/jhu-polio-ice-cream-v1',
    '/causality/jhu-polio-ice-cream-v2',
    
    // RANDOMIZATION
    '/randomization/smi-ran-all-seqa-v1',
    '/randomization/smi-ran-all-seqb-v1',
    '/randomization/smi-ran-blk-ran-v1',
    '/randomization/smi-ran-blk-ran-v2',
    '/randomization/smi-ran-blk-ran-v3',
    '/randomization/smi-ran-blk-ran-v4',
    '/randomization/smi-ran-ran-flo-v1',
    '/randomization/smi-ran-ran-flo-v2',
    '/randomization/smi-ran-ran-lab-v0',
    '/randomization/smi-ran-ran-lit-v0',
    '/randomization/smi-ran-ran-lit-v1',
    '/randomization/smi-ran-rou-whe-v0',
    '/randomization/smi-ran-simple-ran-v1',
    '/randomization/smi-ran-str-ran-v1',
    '/randomization/smi-ran-why-ran-v0',
    '/randomization/smi-ran-why-ran-v1',
    '/randomization/smi-ran-why-ran-v2',
    '/randomization/smi-ran-why-ran-v3',
    '/randomization/smi-ran-why-ran-v4',
    
    // CODING-PRACTICES
    '/coding-practices/hms-aem-rig-fil-v1',
    '/coding-practices/hms-aem-rig-fil-v2',
    '/coding-practices/hms-aem-rig-fil-v3',
    '/coding-practices/hms-bias-map-v0',
    '/coding-practices/hms-cbi-dat-hld-v0',
    '/coding-practices/hms-cbi-dat-hld-v1',
    '/coding-practices/hms-cbi-fav-game-v0',
    '/coding-practices/hms-cbi-fly-gam-v0',
    '/coding-practices/hms-cbi-gar-for-v0',
    '/coding-practices/hms-cbi-hyp-bot-v1',
    '/coding-practices/hms-cbi-pub-bia-v0',
    '/coding-practices/hms-clean-code-comments-v0',
    '/coding-practices/hms-clean-code-org-v0',
    '/coding-practices/hms-cln-cod-cor.v0',
    '/coding-practices/hms-cln-fib-tst-v0',
    '/coding-practices/hms-cln-res-sug-v0',
    '/coding-practices/hms-fun-bld-v0',
    '/coding-practices/hms-int-exe-v0',
    '/coding-practices/hms-wason-246-v1',
    '/coding-practices/hms-wason-246-v2',
    '/coding-practices/hms-wason-246-v2-grid',
    '/coding-practices/hms-wason-246-v2-old',
    
    // COLLABORATION
    '/collaboration/r2r-audience-prompting-v1',
    '/collaboration/r2r-feed-back-v1',
    '/collaboration/r2r-stats-wizard-v1',
    '/collaboration/r2r-sticky-note-v2',
    '/collaboration/r2r-whiteboard-v1',
    
    // TOOLS
    '/tools/D3Plots',
    '/tools/DAG-generator',
    '/tools/c4r-component-test',
    '/tools/c4r-email-api',
    '/tools/c4r-team-nextjs-template',
    '/tools/c4r-template-test',
    '/tools/c4r-useqrcode',
    '/tools/c4r-v0',
    '/tools/claude-chat',
    '/tools/clip-repository-v0',
    '/tools/duq-4ws-eva-res-que-v1',
    '/tools/duq-eva-res-que-v1',
    '/tools/duq-finer-v1',
    '/tools/neuroserpin_v0',
    '/tools/observable_plot',
    '/tools/open-ai-testing',
    '/tools/p-hack-v0',
    '/tools/phackingdemo',
    '/tools/wason-2-4-6-next-test',
    '/tools/wason-2-4-6-v0',
    '/tools/activity-template-v0',
    '/tools/activity-template-v1'
];

class ActivityTester {
    constructor() {
        this.baseUrl = 'http://localhost:3333';
        this.results = [];
        this.browser = null;
        this.timeout = 30000; // 30 seconds per activity
    }

    async initialize() {
        logger.app.info('🚀 Initializing comprehensive activity tester...');
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            timeout: this.timeout
        });
        logger.app.info('✅ Browser initialized');
    }

    async testActivity(route) {
        const activityName = route.split('/').pop();
        logger.app.info(`\n🧪 Testing: ${route}`);
        
        const page = await this.browser.newPage();
        const result = {
            route,
            name: activityName,
            status: 'unknown',
            errors: [],
            warnings: [],
            loadTime: 0,
            hasContent: false,
            mode: 'unknown',
            failedRequests: [],
            consoleErrors: []
        };

        try {
            // Set up request monitoring
            page.on('response', response => {
                if (!response.ok() && response.status() !== 304) {
                    result.failedRequests.push({
                        url: response.url(),
                        status: response.status()
                    });
                }
            });

            // Set up console monitoring
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    result.consoleErrors.push(msg.text());
                }
            });

            // Navigate to activity
            const startTime = Date.now();
            await page.goto(`${this.baseUrl}${route}`, {
                waitUntil: 'networkidle0',
                timeout: this.timeout
            });
            result.loadTime = Date.now() - startTime;

            // Wait a bit for dynamic content
            await page.waitForTimeout(2000);

            // Analyze page content
            const pageAnalysis = await page.evaluate(() => {
                const title = document.title;
                const body = document.body.innerHTML;
                const hasErrorText = body.includes('error') || body.includes('Error') || body.includes('ERROR');
                const hasLoadingText = body.includes('Loading') || body.includes('loading');
                const hasFallbackText = body.includes('Activity Loading') || body.includes('served seamlessly');
                const hasNextBootstrap = body.includes('Loading Next.js application');
                const hasReactContent = body.includes('__next') || body.includes('react');
                const bodyLength = body.length;

                return {
                    title,
                    hasError: hasErrorText,
                    hasLoading: hasLoadingText,
                    hasFallback: hasFallbackText,
                    hasNextBootstrap: hasNextBootstrap,
                    hasReactContent: hasReactContent,
                    bodyLength,
                    hasContent: bodyLength > 500 && !hasLoadingText && !hasFallbackText
                };
            });

            // Determine activity mode and status
            result.hasContent = pageAnalysis.hasContent;
            
            if (pageAnalysis.hasError) {
                result.status = 'error';
                result.mode = 'error';
            } else if (pageAnalysis.hasFallback) {
                result.status = 'fallback';
                result.mode = 'fallback';
            } else if (pageAnalysis.hasNextBootstrap) {
                result.status = 'bootstrap';
                result.mode = 'bootstrap';
            } else if (pageAnalysis.hasReactContent && pageAnalysis.hasContent) {
                result.status = 'working';
                result.mode = 'nextjs';
            } else if (pageAnalysis.hasContent) {
                result.status = 'working';
                result.mode = 'static';
            } else {
                result.status = 'broken';
                result.mode = 'unknown';
            }

            // Add warnings for common issues
            if (result.failedRequests.length > 0) {
                result.warnings.push(`${result.failedRequests.length} failed requests`);
            }
            if (result.consoleErrors.length > 0) {
                result.warnings.push(`${result.consoleErrors.length} console errors`);
            }
            if (result.loadTime > 10000) {
                result.warnings.push('Slow loading (>10s)');
            }

            logger.app.info(`   Status: ${this.getStatusEmoji(result.status)} ${result.status} (${result.mode})`);
            logger.app.info(`   Load time: ${result.loadTime}ms`);
            if (result.warnings.length > 0) {
                logger.app.info(`   Warnings: ${result.warnings.join(', ')}`);
            }

        } catch (error) {
            result.status = 'error';
            result.errors.push(error.message);
            logger.app.info(`   Status: ❌ ERROR - ${error.message}`);
        } finally {
            await page.close();
        }

        return result;
    }

    getStatusEmoji(status) {
        const emojis = {
            'working': '✅',
            'fallback': '⚠️',
            'bootstrap': '🔄',
            'broken': '❌',
            'error': '💥',
            'unknown': '❓'
        };
        return emojis[status] || '❓';
    }

    async testAllActivities() {
        logger.app.info(`\n🎯 Testing ${ACTIVITY_ROUTES.length} activities...\n`);
        
        for (const route of ACTIVITY_ROUTES) {
            const result = await this.testActivity(route);
            this.results.push(result);
            
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    generateReport() {
        logger.app.info('\n' + '='.repeat(80));
        logger.app.info('📊 COMPREHENSIVE ACTIVITY TEST RESULTS');
        logger.app.info('='.repeat(80));

        // Group by status
        const grouped = {};
        this.results.forEach(result => {
            if (!grouped[result.status]) grouped[result.status] = [];
            grouped[result.status].push(result);
        });

        // Summary stats
        logger.app.info('\n📈 SUMMARY:');
        Object.keys(grouped).forEach(status => {
            const count = grouped[status].length;
            const emoji = this.getStatusEmoji(status);
            logger.app.info(`   ${emoji} ${status.toUpperCase()}: ${count} activities`);
        });

        // Detailed breakdown by category
        logger.app.info('\n📋 BY CATEGORY:');
        const categories = ['causality', 'randomization', 'coding-practices', 'collaboration', 'tools'];
        
        categories.forEach(category => {
            const categoryResults = this.results.filter(r => r.route.includes(category));
            logger.app.info(`\n📁 ${category.toUpperCase()} (${categoryResults.length} activities):`);
            
            categoryResults.forEach(result => {
                const emoji = this.getStatusEmoji(result.status);
                const warnings = result.warnings.length > 0 ? ` (${result.warnings.join(', ')})` : '';
                logger.app.info(`   ${emoji} ${result.route} - ${result.status}${warnings}`);
            });
        });

        // Problems that need fixing
        logger.app.info('\n🔧 NEEDS ATTENTION:');
        const problemResults = this.results.filter(r => 
            r.status === 'error' || r.status === 'broken' || r.status === 'fallback'
        );
        
        if (problemResults.length === 0) {
            logger.app.info('   🎉 All activities are working properly!');
        } else {
            problemResults.forEach(result => {
                logger.app.info(`   ❌ ${result.route}`);
                logger.app.info(`      Status: ${result.status} (${result.mode})`);
                if (result.errors.length > 0) {
                    logger.app.info(`      Errors: ${result.errors.join(', ')}`);
                }
                if (result.warnings.length > 0) {
                    logger.app.info(`      Warnings: ${result.warnings.join(', ')}`);
                }
                if (result.failedRequests.length > 0) {
                    logger.app.info(`      Failed requests: ${result.failedRequests.length}`);
                }
            });
        }

        // Save detailed results to file
        const reportPath = path.join(__dirname, 'activity-test-results.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        logger.app.info(`\n💾 Detailed results saved to: ${reportPath}`);

        return this.results;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            logger.app.info('\n🧹 Browser closed');
        }
    }
}

async function main() {
    const tester = new ActivityTester();
    
    try {
        await tester.initialize();
        await tester.testAllActivities();
        const results = tester.generateReport();
        
        // Exit with error code if there are broken activities
        const brokenCount = results.filter(r => r.status === 'error' || r.status === 'broken').length;
        if (brokenCount > 0) {
            logger.app.info(`\n❌ Testing complete: ${brokenCount} activities need fixes`);
            process.exit(1);
        } else {
            logger.app.info('\n✅ Testing complete: All activities working!');
            process.exit(0);
        }
        
    } catch (error) {
        logger.app.error('💥 Test runner failed:', error);
        process.exit(1);
    } finally {
        await tester.cleanup();
    }
}

if (require.main === module) {
    main();
}

module.exports = { ActivityTester, ACTIVITY_ROUTES };