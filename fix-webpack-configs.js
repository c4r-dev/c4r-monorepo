#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need webpack configuration fixed
const filesToFix = [
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-int-exe-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-clean-code-comments-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-clean-code-org-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-cbi-fav-game-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-wason-246-v2/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-why-ran-v2/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-ran-lab-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-why-ran-v3/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-str-ran-v1/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-why-ran-v1/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-why-ran-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-simple-ran-v1/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/smi-ran-why-ran-v4/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/c4r-template-test/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/hms-cbi-fly-gam-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/hms-cbi-gar-for-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/neuroserpin_v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/c4r-component-test/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/hms-wason-246-v2-grid/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/hms-aem-rig-fil-v2/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/hms-cbi-hyp-bot-v1/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/hms-aem-rig-fil-v3/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/hms-bias-map-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/jhu-polio-ice-cream-v2/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/r2r-sticky-note-v2/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-fix-bias-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-pos-con-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-con-pan-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-con-issue-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-neu-jeo-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-dag-for-caus-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-fix-bia-v1/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-caus-cau-lang-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-con-rev-v0/next.config.js',
    '/Users/konrad_1/c4r-dev/apps/duq-finer-v1/next.config.js'
];

function fixWebpackConfig(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if file has the wrong webpack config pattern
        const hasWrongPattern = content.includes('config.webpack.ProvidePlugin');
        
        if (hasWrongPattern) {
            console.log(`🔧 Fixing webpack config in: ${path.basename(filePath)}`);
            
            // Add webpack import at the top if not already present
            if (!content.includes('const webpack = require(\'webpack\');') && !content.includes('import webpack from \'webpack\'')) {
                // Insert webpack import before the first export or const declaration
                const lines = content.split('\n');
                let insertIndex = 0;
                
                // Find the first meaningful line (not comments)
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*')) {
                        insertIndex = i;
                        break;
                    }
                }
                
                lines.splice(insertIndex, 0, 'const webpack = require(\'webpack\');', '');
                content = lines.join('\n');
            }
            
            // Fix the ProvidePlugin reference
            content = content.replace(/new config\.webpack\.ProvidePlugin\(/g, 'new webpack.ProvidePlugin(');
            
            fs.writeFileSync(filePath, content);
            console.log(`✅ Fixed webpack config in: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`ℹ️  No fix needed for: ${path.basename(filePath)}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

console.log('🚀 Fixing webpack configuration issues...\n');

let fixedCount = 0;

console.log('📋 Fixing webpack configs:');
for (const filePath of filesToFix) {
    if (fixWebpackConfig(filePath)) {
        fixedCount++;
    }
}

console.log(`\n🎉 Fixed ${fixedCount} webpack configurations`);
console.log('✅ Webpack configuration fix completed!');
console.log('\n🔄 Restart your server to see the changes take effect.');