#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const fallbackActivities = [
    'activities/coding-practices/hms-aem-rig-fil-v1',
    'activities/coding-practices/hms-aem-rig-fil-v2', 
    'activities/coding-practices/hms-aem-rig-fil-v3',
    'activities/coding-practices/hms-bias-map-v0',
    'activities/coding-practices/hms-cbi-dat-hld-v0',
    'activities/coding-practices/hms-cbi-dat-hld-v1', 
    'activities/coding-practices/hms-cbi-fav-game-v0',
    'activities/coding-practices/hms-cbi-fly-gam-v0',
    'activities/coding-practices/hms-cbi-gar-for-v0'
];

async function testBuild(activityPath) {
    return new Promise((resolve) => {
        console.log(`\n🔧 Testing build: ${activityPath}`);
        
        const child = spawn('npm', ['run', 'build'], {
            cwd: path.resolve(activityPath),
            stdio: 'pipe'
        });
        
        let stderr = '';
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${activityPath} - Build successful`);
                resolve({ path: activityPath, success: true });
            } else {
                console.log(`❌ ${activityPath} - Build failed`);
                // Extract missing modules
                const missingModules = [];
                const moduleRegex = /Can't resolve '([^']+)'/g;
                let match;
                while ((match = moduleRegex.exec(stderr)) !== null) {
                    missingModules.push(match[1]);
                }
                resolve({ path: activityPath, success: false, missingModules, error: stderr });
            }
        });
    });
}

async function main() {
    console.log('🧪 Testing builds for fallback activities...\n');
    
    const results = [];
    for (const activity of fallbackActivities) {
        const result = await testBuild(activity);
        results.push(result);
    }
    
    console.log('\n📊 SUMMARY:');
    console.log('=' .repeat(60));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`\n✅ Successful builds: ${successful.length}`);
    successful.forEach(r => console.log(`   ${r.path}`));
    
    console.log(`\n❌ Failed builds: ${failed.length}`);
    const allMissingModules = new Set();
    failed.forEach(r => {
        console.log(`   ${r.path}`);
        if (r.missingModules && r.missingModules.length > 0) {
            console.log(`     Missing: ${r.missingModules.join(', ')}`);
            r.missingModules.forEach(mod => allMissingModules.add(mod));
        }
    });
    
    if (allMissingModules.size > 0) {
        console.log(`\n📦 All missing modules (add to package.json):`);
        console.log([...allMissingModules].map(mod => `"${mod}": "^1.0.0"`).join(',\n'));
    }
}

main().catch(console.error);