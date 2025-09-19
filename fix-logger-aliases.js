#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need logger alias configuration
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
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-ran-lit-v1/next.config.js',
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

function addLoggerAlias(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if alias is already configured
        if (content.includes('config.resolve.alias') && content.includes('browser-logger.js')) {
            console.log(`ℹ️  Logger alias already configured: ${path.basename(filePath)}`);
            return false;
        }
        
        // Check if we have a webpack configuration
        const hasWebpackConfig = content.includes('webpack: (config)');
        
        if (hasWebpackConfig) {
            console.log(`🔧 Adding logger alias to: ${path.basename(filePath)}`);
            
            // Insert alias configuration right after the webpack function starts
            const aliasConfig = `    // Add alias to redirect logger to browser-compatible version for client-side code
    config.resolve.alias = {
      ...config.resolve.alias,
      '../../../../packages/logging/logger.js': require.resolve('../../../../packages/logging/browser-logger.js'),
      '../../../packages/logging/logger.js': require.resolve('../../../packages/logging/browser-logger.js'),
      '../../packages/logging/logger.js': require.resolve('../../packages/logging/browser-logger.js'),
      '../packages/logging/logger.js': require.resolve('../packages/logging/browser-logger.js'),
    };

    `;
            
            // Find the webpack function and insert alias config after it
            content = content.replace(
                /webpack: \(config\) => \{(\s*)/,
                `webpack: (config) => {$1${aliasConfig}`
            );
            
            fs.writeFileSync(filePath, content);
            console.log(`✅ Added logger alias to: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`ℹ️  No webpack config found: ${path.basename(filePath)}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

console.log('🚀 Adding logger aliases to webpack configurations...\n');

let fixedCount = 0;

console.log('📋 Processing webpack configs:');
for (const filePath of filesToFix) {
    if (addLoggerAlias(filePath)) {
        fixedCount++;
    }
}

console.log(`\n🎉 Added logger aliases to ${fixedCount} webpack configurations`);
console.log('✅ Logger alias configuration completed!');
console.log('\n🔄 Restart your server to see the changes take effect.');