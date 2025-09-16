#!/usr/bin/env node

/**
 * Check which activities are falling back to static serving
 */

const http = require('http');

async function checkActivity(url) {
    return new Promise((resolve) => {
        const req = http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const isFallback = data.includes('⚠️ This activity is being served in fallback mode');
                const isBootstrap = data.includes('Loading Next.js application...');
                resolve({
                    url,
                    isFallback,
                    isBootstrap,
                    status: res.statusCode
                });
            });
        }).on('error', () => {
            resolve({
                url,
                isFallback: false,
                isBootstrap: false,
                status: 'ERROR'
            });
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            resolve({
                url,
                isFallback: false,
                isBootstrap: false,
                status: 'TIMEOUT'
            });
        });
    });
}

async function main() {
    console.log('📋 Checking activity serving modes...\n');
    
    const activities = [
        '/causality/jhu-flu-dag-v1',
        '/causality/jhu-polio-ice-cream-v1',
        '/causality/jhu-polio-ice-cream-v2',
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
        '/collaboration/r2r-audience-prompting-v1',
        '/collaboration/r2r-feed-back-v1',
        '/collaboration/r2r-stats-wizard-v1',
        '/collaboration/r2r-sticky-note-v2',
        '/collaboration/r2r-whiteboard-v1',
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
    
    const results = [];
    
    // Process activities in batches to avoid overwhelming the server
    const batchSize = 10;
    for (let i = 0; i < activities.length; i += batchSize) {
        const batch = activities.slice(i, i + batchSize);
        const promises = batch.map(route => checkActivity(`http://localhost:3333${route}`));
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
        
        console.log(`✅ Checked ${Math.min(i + batchSize, activities.length)}/${activities.length} activities`);
        
        // Brief pause between batches
        if (i + batchSize < activities.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    // Categorize results
    const fallbackActivities = results.filter(r => r.isFallback);
    const bootstrapActivities = results.filter(r => r.isBootstrap);
    const errorActivities = results.filter(r => r.status === 'ERROR' || r.status === 'TIMEOUT');
    const otherActivities = results.filter(r => !r.isFallback && !r.isBootstrap && r.status === 200);
    
    console.log('\n📊 ACTIVITY SERVING REPORT');
    console.log('=' .repeat(80));
    
    console.log(`\n✅ Next.js Bootstrap Mode: ${bootstrapActivities.length}`);
    if (bootstrapActivities.length > 0) {
        bootstrapActivities.forEach(r => {
            console.log(`   ${r.url.replace('http://localhost:3333', '')}`);
        });
    }
    
    console.log(`\n⚠️  Static Fallback Mode: ${fallbackActivities.length}`);
    if (fallbackActivities.length > 0) {
        fallbackActivities.forEach(r => {
            console.log(`   ${r.url.replace('http://localhost:3333', '')}`);
        });
    }
    
    console.log(`\n📄 Other Serving Mode: ${otherActivities.length}`);
    if (otherActivities.length > 0) {
        otherActivities.forEach(r => {
            console.log(`   ${r.url.replace('http://localhost:3333', '')}`);
        });
    }
    
    console.log(`\n❌ Errors/Timeouts: ${errorActivities.length}`);
    if (errorActivities.length > 0) {
        errorActivities.forEach(r => {
            console.log(`   ${r.url.replace('http://localhost:3333', '')} (${r.status})`);
        });
    }
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total: ${results.length}`);
    console.log(`   Next.js Bootstrap: ${bootstrapActivities.length}`);
    console.log(`   Static Fallback: ${fallbackActivities.length}`);
    console.log(`   Other: ${otherActivities.length}`);
    console.log(`   Errors: ${errorActivities.length}`);
    
    return {
        fallback: fallbackActivities.map(r => r.url.replace('http://localhost:3333', '')),
        bootstrap: bootstrapActivities.map(r => r.url.replace('http://localhost:3333', '')),
        other: otherActivities.map(r => r.url.replace('http://localhost:3333', '')),
        errors: errorActivities.map(r => r.url.replace('http://localhost:3333', ''))
    };
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { checkActivity };