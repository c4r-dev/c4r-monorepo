#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need 'use client' directive order fixed
const filesToFix = [
    '/Users/konrad_1/c4r-dev/apps/r2r-feed-back-v1/app/components/FeedbackTool.js',
    '/Users/konrad_1/c4r-dev/apps/r2r-whiteboard-v1/src/components/Activity.js',
    '/Users/konrad_1/c4r-dev/templates/activity-template-v0/app/page.tsx',
    '/Users/konrad_1/c4r-dev/templates/activity-template-v1/app/components/Header/Header.tsx',
    '/Users/konrad_1/c4r-dev/apps/c4r-email-api/src/app/page.js'
];

function fixUseClientOrder(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if file has both logger import and 'use client' in wrong order
        const hasLoggerFirst = content.match(/^const logger = require\([^)]+\);?\s*\n/);
        const hasUseClient = content.includes("'use client'") || content.includes('"use client"');
        
        if (hasLoggerFirst && hasUseClient) {
            console.log(`🔧 Fixing use client order in: ${path.basename(filePath)}`);
            
            // Extract the logger import line
            const loggerImportMatch = content.match(/^(const logger = require\([^)]+\);?\s*\n)/);
            if (loggerImportMatch) {
                const loggerImport = loggerImportMatch[1];
                
                // Remove the logger import from the beginning
                content = content.replace(loggerImportMatch[0], '');
                
                // Find and extract the use client directive
                const useClientMatch = content.match(/(['"])use client\1;?\s*\n/);
                if (useClientMatch) {
                    const useClientDirective = useClientMatch[0];
                    
                    // Remove the use client directive from its current position
                    content = content.replace(useClientDirective, '');
                    
                    // Put use client first, then logger import, then rest
                    content = useClientDirective + '\n' + loggerImport + '\n' + content.trim();
                    
                    fs.writeFileSync(filePath, content);
                    console.log(`✅ Fixed use client order in: ${path.basename(filePath)}`);
                    return true;
                }
            }
        } else {
            console.log(`ℹ️  No fix needed for: ${path.basename(filePath)}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
        return false;
    }
    
    return false;
}

// Also find any other files with this pattern
function findFilesWithWrongOrder() {
    console.log('🔍 Searching for additional files with wrong use client order...');
    
    const { execSync } = require('child_process');
    try {
        // Search for files that start with logger import and have use client somewhere
        const result = execSync(`
            find /Users/konrad_1/c4r-dev -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | 
            xargs grep -l "const logger = require" | 
            xargs grep -l "use client" | 
            head -20
        `, { encoding: 'utf8' });
        
        const additionalFiles = result.trim().split('\n').filter(f => f.length > 0);
        return additionalFiles;
    } catch (error) {
        console.log('Could not search for additional files');
        return [];
    }
}

console.log('🚀 Fixing "use client" directive order issues...\n');

let fixedCount = 0;

// Fix known problematic files
console.log('📋 Fixing known problematic files:');
for (const filePath of filesToFix) {
    if (fixUseClientOrder(filePath)) {
        fixedCount++;
    }
}

// Find and fix additional files
const additionalFiles = findFilesWithWrongOrder();
if (additionalFiles.length > 0) {
    console.log('\n📋 Fixing additional files found:');
    for (const filePath of additionalFiles) {
        if (!filesToFix.includes(filePath)) {
            if (fixUseClientOrder(filePath)) {
                fixedCount++;
            }
        }
    }
}

console.log(`\n🎉 Fixed ${fixedCount} files with wrong use client order`);
console.log('✅ Use client directive order fix completed!');
console.log('\n🔄 Restart your server to see the changes take effect.');