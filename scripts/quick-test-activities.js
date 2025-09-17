#!/usr/bin/env node

const { ActivityTester } = require('./test-all-activities.js');

// Sample activities from each category
const SAMPLE_ROUTES = [
    // CAUSALITY (1/3)
    '/causality/jhu-polio-ice-cream-v2',
    
    // RANDOMIZATION (3/19)
    '/randomization/smi-ran-blk-ran-v1',
    '/randomization/smi-ran-ran-lit-v1', 
    '/randomization/smi-ran-why-ran-v1',
    
    // CODING-PRACTICES (3/22)
    '/coding-practices/hms-aem-rig-fil-v2',
    '/coding-practices/hms-cbi-hyp-bot-v1',
    '/coding-practices/hms-wason-246-v2',
    
    // COLLABORATION (2/5)
    '/collaboration/r2r-whiteboard-v1',
    '/collaboration/r2r-stats-wizard-v1',
    
    // TOOLS (3/22)
    '/tools/c4r-team-nextjs-template',
    '/tools/observable_plot',
    '/tools/wason-2-4-6-next-test'
];

class QuickActivityTester extends ActivityTester {
    constructor() {
        super();
        this.timeout = 15000; // Shorter timeout for quick test
    }

    async quickTest() {
        console.log(`🎯 Quick testing ${SAMPLE_ROUTES.length} sample activities...\n`);
        
        for (const route of SAMPLE_ROUTES) {
            const result = await this.testActivity(route);
            this.results.push(result);
            
            // Very short delay between tests
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        return this.results;
    }

    generateQuickReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 QUICK TEST RESULTS');
        console.log('='.repeat(60));

        // Group by status
        const grouped = {};
        this.results.forEach(result => {
            if (!grouped[result.status]) grouped[result.status] = [];
            grouped[result.status].push(result);
        });

        // Summary stats
        console.log('\n📈 SUMMARY:');
        Object.keys(grouped).forEach(status => {
            const count = grouped[status].length;
            const emoji = this.getStatusEmoji(status);
            console.log(`   ${emoji} ${status.toUpperCase()}: ${count} activities`);
        });

        // Issues needing attention
        const problemResults = this.results.filter(r => 
            r.status === 'error' || r.status === 'broken' || r.status === 'fallback'
        );
        
        if (problemResults.length === 0) {
            console.log('\n✅ All sample activities working!');
        } else {
            console.log(`\n🔧 ${problemResults.length} activities need attention:`);
            problemResults.forEach(result => {
                console.log(`   ❌ ${result.route} - ${result.status}`);
            });
        }

        return this.results;
    }
}

async function main() {
    const tester = new QuickActivityTester();
    
    try {
        await tester.initialize();
        const results = await tester.quickTest();
        tester.generateQuickReport();
        
        const issues = results.filter(r => r.status === 'error' || r.status === 'broken').length;
        console.log(`\n🏁 Quick test complete: ${results.length - issues}/${results.length} working`);
        
    } catch (error) {
        console.error('💥 Quick test failed:', error);
    } finally {
        await tester.cleanup();
    }
}

if (require.main === module) {
    main();
}