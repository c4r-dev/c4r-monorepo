#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// All Header files that need winston imports restored
const headerFilesToRestore = [
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

// Additional client component files that need winston import restoration
const clientComponentFiles = [
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-why-ran-v0/app/page.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-why-ran-v1/app/page.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-clean-code-comments-v0/app/page.js'
];

function getWinstonImportPath(filePath) {
    // Calculate the relative path depth to packages/logging/logger.js
    const parts = filePath.split('/');
    const c4rIndex = parts.indexOf('c4r-dev');
    const pathFromC4R = parts.slice(c4rIndex + 1);
    
    // Count directories needed to go back to c4r-dev root
    const depthFromFile = pathFromC4R.length - 1; // -1 for the file itself
    
    let relativePath = '';
    for (let i = 0; i < depthFromFile; i++) {
        relativePath += '../';
    }
    
    return `${relativePath}packages/logging/logger.js`;
}

function restoreWinstonImport(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if winston import already exists
        if (content.includes('packages/logging/logger.js') || content.includes('const logger =')) {
            console.log(`ℹ️  Winston import already exists in: ${path.basename(filePath)}`);
            return false;
        }

        // Check if logger is being used in the file
        if (!content.includes('logger.')) {
            console.log(`ℹ️  No logger usage found in: ${path.basename(filePath)}`);
            return false;
        }

        console.log(`🔧 Restoring winston import to: ${path.basename(filePath)} in ${path.dirname(filePath)}`);
        
        const winstonImportPath = getWinstonImportPath(filePath);
        const winstonImport = `const logger = require('${winstonImportPath}');\n`;
        
        // Find the best place to insert the import
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Look for existing imports or requires
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('import ') || line.startsWith('const ') || line.startsWith('require(')) {
                insertIndex = i + 1;
            } else if (line === '' || line.startsWith('//') || line.startsWith('*')) {
                continue;
            } else if (line !== '' && !line.startsWith("'use client'") && !line.startsWith('"use client"')) {
                break;
            }
        }
        
        // Insert the winston import
        lines.splice(insertIndex, 0, winstonImport);
        content = lines.join('\n');
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Restored winston import to: ${path.basename(filePath)}`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error restoring winston import to ${filePath}:`, error.message);
        return false;
    }
}

console.log('🚀 Starting winston logger import restoration...\n');

let restoredCount = 0;

console.log('📋 Restoring winston imports to Header components:');
for (const filePath of headerFilesToRestore) {
    if (restoreWinstonImport(filePath)) {
        restoredCount++;
    }
}

console.log('\n📋 Restoring winston imports to client components:');
for (const filePath of clientComponentFiles) {
    if (restoreWinstonImport(filePath)) {
        restoredCount++;
    }
}

console.log(`\n🎉 Restored winston imports to ${restoredCount} files`);
console.log('✅ Winston import restoration completed!');