#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files that need fixing based on the error messages
const filesToFix = [
    // Use client directive placement issues
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-simple-ran-v1/app/page.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-str-ran-v1/app/page.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-why-ran-v2/app/page.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-why-ran-v3/app/page.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-cbi-fav-game-v0/app/Selection/SelectionClient.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-wason-246-v2/src/app/page.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-clean-code-org-v0/app/page.js'
];

function fixUseClientDirective(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Check if file has winston logger import and 'use client' directive
        const hasLogger = content.includes("require('../../../../packages/logging/logger.js')") ||
                         content.includes("require('../../../../../packages/logging/logger.js')");
        const hasUseClient = content.includes("'use client'") || content.includes('"use client"');
        
        if (hasLogger && hasUseClient) {
            console.log(`🔧 Fixing both logger and use client in: ${path.basename(filePath)}`);
            
            // Remove winston logger import from client components (causes fs module error)
            content = content.replace(/const logger = require\(['"][^'"]*packages\/logging\/logger\.js['"]\);?\s*\n?/g, '');
            modified = true;
            
            // Fix use client directive placement
            const useClientRegex = /(['"])use client\1/g;
            const matches = content.match(useClientRegex);
            if (matches) {
                // Remove all existing use client directives
                content = content.replace(useClientRegex, '');
                // Add use client at the very beginning
                content = `'use client'\n\n${content.trim()}`;
                modified = true;
            }
        } else if (hasUseClient) {
            console.log(`🔧 Fixing use client directive in: ${path.basename(filePath)}`);
            
            // Fix use client directive placement only
            const useClientRegex = /(['"])use client\1/g;
            const matches = content.match(useClientRegex);
            if (matches) {
                // Remove all existing use client directives
                content = content.replace(useClientRegex, '');
                // Add use client at the very beginning
                content = `'use client'\n\n${content.trim()}`;
                modified = true;
            }
        } else if (hasLogger) {
            console.log(`🔧 Removing winston logger from client component: ${path.basename(filePath)}`);
            
            // Remove winston logger import from client components
            content = content.replace(/const logger = require\(['"][^'"]*packages\/logging\/logger\.js['"]\);?\s*\n?/g, '');
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`✅ Fixed: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`ℹ️  No changes needed: ${path.basename(filePath)}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

// Additional files to remove winston logger from (these are client components)
const clientComponentsWithLogger = [
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-why-ran-v0/app/page.js',
    '/Users/konrad_1/c4r-dev/activities/randomization/smi-ran-why-ran-v1/app/page.js',
    '/Users/konrad_1/c4r-dev/activities/coding-practices/hms-clean-code-comments-v0/app/page.js'
];

function removeLoggerFromClientComponent(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        const hasLogger = content.includes("require('../../../../packages/logging/logger.js')") ||
                         content.includes("require('../../../../../packages/logging/logger.js')");
        
        if (hasLogger) {
            console.log(`🔧 Removing winston logger from: ${path.basename(filePath)}`);
            content = content.replace(/const logger = require\(['"][^'"]*packages\/logging\/logger\.js['"]\);?\s*\n?/g, '');
            fs.writeFileSync(filePath, content);
            console.log(`✅ Removed logger from: ${path.basename(filePath)}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error removing logger from ${filePath}:`, error.message);
        return false;
    }
}

console.log('🚀 Starting fix for client component issues...\n');

let fixedCount = 0;

// Fix use client directive placement issues
console.log('📋 Fixing use client directive placement issues:');
for (const filePath of filesToFix) {
    if (fixUseClientDirective(filePath)) {
        fixedCount++;
    }
}

console.log('\n📋 Removing winston logger from additional client components:');
for (const filePath of clientComponentsWithLogger) {
    if (removeLoggerFromClientComponent(filePath)) {
        fixedCount++;
    }
}

console.log(`\n🎉 Fixed ${fixedCount} files total`);
console.log('✅ Client component fixes completed!');