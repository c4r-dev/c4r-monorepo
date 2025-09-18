#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// All Header files with winston imports
const headerFilesToFix = [
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-pos-con-v1/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/smi-ran-why-ran-v4/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/r2r-sticky-note-v2/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/neuroserpin_v0/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/jhu-polio-ice-cream-v2/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/hms-wason-246-v2-grid/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/hms-cbi-hyp-bot-v1/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/hms-cbi-fly-gam-v0/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/hms-bias-map-v0/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/hms-aem-rig-fil-v3/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/hms-aem-rig-fil-v2/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/duq-finer-v1/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/c4r-template-test/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/c4r-component-test/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-fix-bia-v1/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-dag-for-caus-v0/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-pos-con-v0/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-neu-jeo-v0/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-fix-bias-v0/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-con-rev-v0/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-con-pan-v0/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-con-con-issue-v0/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/apps/activities/causality/jhuvt-caus-cau-lang-v0/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-str-ran-v1/app/Components/ui/Header/Header.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-simple-ran-v1/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-ran-lit-v1/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-ran-lab-v0/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-wason-246-v2/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-int-exe-v0/src/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-clean-code-org-v0/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-clean-code-comments-v0/app/components/Header/Header.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-cbi-fav-game-v0/app/components/Header/Header.js'
];

function removeWinstonLogger(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        const hasLogger = content.includes("require('../../../../packages/logging/logger.js')") ||
                         content.includes("require('../../../../../packages/logging/logger.js')") ||
                         content.includes("require('../../../../../../packages/logging/logger.js')") ||
                         content.includes("require('../../../../../../../packages/logging/logger.js')") ||
                         content.includes("require('../../../../../../../../packages/logging/logger.js')") ||
                         content.includes("require('../../../packages/logging/logger.js')");
        
        if (hasLogger) {
            console.log(`🔧 Removing winston logger from: ${path.basename(filePath)} in ${path.dirname(filePath)}`);
            
            // Remove winston logger import lines with various path depths
            content = content.replace(/const logger = require\(['"](\.\.\/)*packages\/logging\/logger\.js['"]\);?\s*\n?/g, '');
            
            fs.writeFileSync(filePath, content);
            console.log(`✅ Removed logger from: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`ℹ️  No winston logger found in: ${path.basename(filePath)}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

console.log('🚀 Starting comprehensive winston logger removal...\n');

let fixedCount = 0;

console.log('📋 Removing winston logger from Header components:');
for (const filePath of headerFilesToFix) {
    if (removeWinstonLogger(filePath)) {
        fixedCount++;
    }
}

console.log(`\n🎉 Fixed ${fixedCount} files total`);
console.log('✅ Winston logger removal completed!');