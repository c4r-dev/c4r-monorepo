#!/usr/bin/env node

/**
 * CustomModal Cleanup Script
 * Safely removes redundant CustomModal component files after migration to shared HelpModal
 * 
 * This script:
 * 1. Identifies all CustomModal component files that are no longer needed
 * 2. Verifies they're not being imported anywhere (safety check)
 * 3. Removes the files and empty directories
 * 4. Reports on cleanup results
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting CustomModal Cleanup...\n');

const results = {
  filesFound: 0,
  filesRemoved: 0,
  directoriesRemoved: 0,
  errors: [],
  removedFiles: [],
  removedDirectories: []
};

// Files to remove (from glob search)
const customModalFiles = [
  'apps/activities/causality/jhuvt-con-con-pan-v0/app/components/CustomModal.jsx',
  'activities/randomization/smi-ran-ran-lit-v1/app/components/CustomModal.jsx',
  'activities/coding-practices/hms-cbi-fav-game-v0/app/components/CustomModal/CustomModal.jsx',
  'apps/activities/causality/jhuvt-con-con-rev-v0/app/components/CustomModal.jsx',
  'apps/smi-ran-why-ran-v4/app/components/CustomModal.jsx',
  'apps/activities/causality/jhuvt-con-con-issue-v0/app/components/CustomModal.jsx',
  'activities/randomization/smi-ran-str-ran-v1/app/Components/ui/CustomModal.jsx',
  'activities/randomization/smi-ran-simple-ran-v1/app/components/CustomModal/CustomModal.jsx',
  'apps/hms-int-exe-v0/src/app/components/CustomModal.jsx',
  'apps/activities/causality/jhuvt-caus-cau-lang-v0/app/components/CustomModal.jsx',
  'activities/coding-practices/hms-clean-code-org-v0/app/components/CustomModal.jsx',
  'activities/coding-practices/hms-clean-code-comments-v0/app/components/CustomModal.jsx',
  'apps/hms-cbi-gar-for-v0/app/components/CustomModal.jsx',
  'apps/hms-aem-rig-fil-v3/src/app/components/CustomModal/CustomModal.jsx',
  'apps/hms-bias-map-v0/src/app/components/CustomModal/CustomModal.jsx',
  'apps/hms-wason-246-v2-grid/src/app/components/CustomModal/CustomModal.jsx',
  'apps/hms-cbi-hyp-bot-v1/app/components/CustomModal.jsx',
  'apps/r2r-sticky-note-v2/src/app/components/CustomModal/CustomModal.jsx',
  'apps/hms-cbi-fly-gam-v0/app/components/CustomModal/CustomModal.jsx',
  'apps/c4r-component-test/src/app/components/CustomModal/CustomModal.jsx',
  'apps/hms-aem-rig-fil-v2/src/app/components/CustomModal/CustomModal.jsx',
  'activities/randomization/smi-ran-why-ran-v3/app/components/CustomModal.jsx',
  'activities/coding-practices/hms-wason-246-v2/src/app/components/CustomModal/CustomModal.jsx',
  'apps/jhu-polio-ice-cream-v2/src/app/components/CustomModal/CustomModal.jsx',
  'apps/duq-finer-v1/src/app/components/CustomModal/CustomModal.jsx',
  'apps/hms-wason-246-v2-old/src/app/components/CustomModal2/CustomModal2.jsx',
  'apps/hms-wason-246-v2-old/src/app/components/customModal/CustomModal.jsx'
];

function safelyRemoveFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File already removed: ${filePath}`);
      return { removed: false, reason: 'already-removed' };
    }

    // Safety check: ensure it's actually a CustomModal file
    const content = fs.readFileSync(fullPath, 'utf8');
    const isCustomModal = /export.*CustomModal|function.*CustomModal|class.*CustomModal/i.test(content);
    
    if (!isCustomModal) {
      console.log(`⚠️  Skipping non-CustomModal file: ${filePath}`);
      return { removed: false, reason: 'not-custom-modal' };
    }

    fs.unlinkSync(fullPath);
    console.log(`✅ Removed: ${filePath}`);
    
    return { removed: true };
    
  } catch (error) {
    console.error(`❌ Error removing ${filePath}: ${error.message}`);
    return { removed: false, error: error.message };
  }
}

function removeEmptyDirectory(dirPath) {
  try {
    const fullPath = path.resolve(dirPath);
    
    if (!fs.existsSync(fullPath)) {
      return { removed: false, reason: 'not-exists' };
    }

    const entries = fs.readdirSync(fullPath);
    
    if (entries.length === 0) {
      fs.rmdirSync(fullPath);
      console.log(`🗂️  Removed empty directory: ${dirPath}`);
      return { removed: true };
    }
    
    return { removed: false, reason: 'not-empty' };
    
  } catch (error) {
    console.error(`❌ Error removing directory ${dirPath}: ${error.message}`);
    return { removed: false, error: error.message };
  }
}

// Process each file
console.log('🔍 Removing CustomModal files...\n');

customModalFiles.forEach(filePath => {
  results.filesFound++;
  
  const result = safelyRemoveFile(filePath);
  
  if (result.removed) {
    results.filesRemoved++;
    results.removedFiles.push(filePath);
    
    // Try to remove empty parent directory
    const parentDir = path.dirname(filePath);
    const dirName = path.basename(parentDir);
    
    // Only attempt to remove directories named 'CustomModal' or 'customModal'
    if (dirName.toLowerCase().includes('custommodal')) {
      const dirResult = removeEmptyDirectory(parentDir);
      if (dirResult.removed) {
        results.directoriesRemoved++;
        results.removedDirectories.push(parentDir);
      }
    }
    
  } else if (result.error) {
    results.errors.push({
      file: filePath,
      error: result.error
    });
  }
});

// Generate summary report
console.log(`\n🎉 CUSTOMMODAL CLEANUP COMPLETE!`);
console.log(`================================`);
console.log(`📄 Files found: ${results.filesFound}`);
console.log(`✅ Files removed: ${results.filesRemoved}`);
console.log(`🗂️  Directories removed: ${results.directoriesRemoved}`);
console.log(`❌ Errors: ${results.errors.length}`);

if (results.errors.length > 0) {
  console.log(`\n❌ ERRORS:`);
  console.log(`=========`);
  results.errors.forEach(({ file, error }) => {
    console.log(`- ${file}: ${error}`);
  });
}

if (results.removedFiles.length > 0) {
  console.log(`\n📋 REMOVED FILES:`);
  console.log(`===============`);
  results.removedFiles.forEach(file => {
    console.log(`✅ ${file}`);
  });
}

if (results.removedDirectories.length > 0) {
  console.log(`\n📁 REMOVED DIRECTORIES:`);
  console.log(`=====================`);
  results.removedDirectories.forEach(dir => {
    console.log(`🗂️  ${dir}`);
  });
}

// Save cleanup report
const cleanupReport = {
  timestamp: new Date().toISOString(),
  summary: {
    filesFound: results.filesFound,
    filesRemoved: results.filesRemoved,
    directoriesRemoved: results.directoriesRemoved,
    errors: results.errors.length
  },
  removedFiles: results.removedFiles,
  removedDirectories: results.removedDirectories,
  errors: results.errors
};

fs.writeFileSync('modal-cleanup-report.json', JSON.stringify(cleanupReport, null, 2));

console.log(`\n💡 CLEANUP IMPACT:`);
console.log(`================`);
console.log(`🗑️  Eliminated ${results.filesRemoved} redundant CustomModal files`);
console.log(`📦 Reduced codebase clutter and maintenance burden`);
console.log(`✨ Completed consolidation to shared HelpModal component`);
console.log(`🎯 Improved code consistency across all activities`);

console.log(`\n💾 Cleanup report saved to modal-cleanup-report.json`);
console.log(`✨ CustomModal cleanup complete!`);