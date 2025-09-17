#!/usr/bin/env node

const { ActivityTester } = require('./test-all-activities.js');

// Next 10 random activities to test
const NEXT_10_ROUTES = [
    // Pick different ones from the previous 12
    '/causality/jhu-flu-dag-v1',
    '/causality/jhu-polio-ice-cream-v1',
    '/randomization/smi-ran-all-seqa-v1',
    '/randomization/smi-ran-blk-ran-v2',
    '/randomization/smi-ran-ran-flo-v1',
    '/coding-practices/hms-aem-rig-fil-v1',
    '/coding-practices/hms-bias-map-v0',
    '/coding-practices/hms-wason-246-v1',
    '/collaboration/r2r-audience-prompting-v1',
    '/tools/D3Plots'
];

class Next10ActivityTester extends ActivityTester {
    constructor() {
        super();
        this.timeout = 15000; // Shorter timeout for quick test
    }

    async testNext10() {
        console.log(`🎯 Testing next 10 activities...\\n`);
        
        for (const route of NEXT_10_ROUTES) {
            const result = await this.testActivity(route);
            this.results.push(result);
            
            // Very short delay between tests
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        return this.results;
    }

    generateNext10Report() {
        console.log('\\n' + '='.repeat(60));
        console.log('📊 NEXT 10 TEST RESULTS');
        console.log('='.repeat(60));

        // Group by status
        const grouped = {};
        this.results.forEach(result => {
            if (!grouped[result.status]) grouped[result.status] = [];
            grouped[result.status].push(result);
        });

        // Summary stats
        console.log('\\n📈 SUMMARY:');
        Object.keys(grouped).forEach(status => {
            const count = grouped[status].length;
            const emoji = this.getStatusEmoji(status);
            console.log(`   ${emoji} ${status.toUpperCase()}: ${count} activities`);
        });

        // Working activities
        const workingResults = this.results.filter(r => r.status === 'working');
        if (workingResults.length > 0) {
            console.log('\\n✅ Working activities:');
            workingResults.forEach(result => {
                console.log(`   ✅ ${result.route} - ${result.type}`);
            });
        }

        // Issues needing attention
        const problemResults = this.results.filter(r => 
            r.status === 'error' || r.status === 'broken' || r.status === 'fallback'
        );
        
        if (problemResults.length === 0) {
            console.log('\\n✅ All activities working!');
        } else {
            console.log(`\\n🔧 ${problemResults.length} activities need attention:`);
            problemResults.forEach(result => {
                console.log(`   ❌ ${result.route} - ${result.status}`);
            });
        }

        return this.results;
    }
}

async function main() {
    const tester = new Next10ActivityTester();
    
    try {
        await tester.initialize();
        const results = await tester.testNext10();
        tester.generateNext10Report();
        
        const issues = results.filter(r => r.status === 'error' || r.status === 'broken').length;
        const working = results.filter(r => r.status === 'working').length;
        console.log(`\\n🏁 Next 10 test complete: ${working}/${results.length} working (${Math.round(working/results.length*100)}%)`);
        
    } catch (error) {
        console.error('💥 Next 10 test failed:', error);
    } finally {
        await tester.cleanup();
    }
}

if (require.main === module) {
    main();
}