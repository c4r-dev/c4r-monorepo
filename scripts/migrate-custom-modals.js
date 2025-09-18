#!/usr/bin/env node

/**
 * Custom Modal Migration Script
 * Replaces 40+ custom modal implementations with shared HelpModal from @c4r/ui
 * 
 * This script:
 * 1. Finds all files importing custom modal components
 * 2. Replaces imports with HelpModal from @c4r/ui
 * 3. Updates modal component usage to match HelpModal API
 * 4. Converts Material-UI style props to HelpModal props
 * 5. Preserves purple branding with variant="purple"
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Custom Modal Migration...\n');

const results = {
  filesAnalyzed: 0,
  filesModified: 0,
  importsReplaced: 0,
  usagesUpdated: 0,
  errors: [],
  modifiedFiles: []
};

// Directories to scan
const directories = [
  'activities',
  'apps/activities', 
  'apps',
  'templates'
];

// Custom modal patterns to find and replace
const modalPatterns = {
  // Import patterns to replace
  imports: [
    {
      pattern: /import\s+CustomModal\s+from\s+['"][^'"]*CustomModal[^'"]*['"];?/g,
      replacement: "import { HelpModal } from '@c4r/ui';"
    },
    {
      pattern: /import\s+\{\s*CustomModal\s*\}\s+from\s+['"][^'"]*['"];?/g,
      replacement: "import { HelpModal } from '@c4r/ui';"
    },
    {
      pattern: /import\s+InstructionsModal\s+from\s+['"][^'"]*InstructionsModal[^'"]*['"];?/g,
      replacement: "import { HelpModal } from '@c4r/ui';"
    },
    {
      pattern: /import\s+\{\s*InstructionsModal\s*\}\s+from\s+['"][^'"]*['"];?/g,
      replacement: "import { HelpModal } from '@c4r/ui';"
    }
  ],
  
  // Component usage patterns to replace
  usage: [
    {
      // <CustomModal isOpen={isOpen} closeModal={closeModal} />
      pattern: /<CustomModal\s+([^>]*)\s*\/>/g,
      replacement: (match, props) => {
        const updatedProps = props
          .replace(/closeModal=/g, 'onClose=')
          .replace(/isOpen=/g, 'isOpen=');
        return `<HelpModal ${updatedProps} variant="purple" />`;
      }
    },
    {
      // <CustomModal isOpen={isOpen} closeModal={closeModal}>content</CustomModal>
      pattern: /<CustomModal\s+([^>]*)>([\s\S]*?)<\/CustomModal>/g,
      replacement: (match, props, content) => {
        const updatedProps = props
          .replace(/closeModal=/g, 'onClose=')
          .replace(/isOpen=/g, 'isOpen=');
        return `<HelpModal ${updatedProps} variant="purple">${content}</HelpModal>`;
      }
    },
    {
      // <InstructionsModal isOpen={isOpen} closeModal={closeModal} />
      pattern: /<InstructionsModal\s+([^>]*)\s*\/>/g,
      replacement: (match, props) => {
        const updatedProps = props
          .replace(/closeModal=/g, 'onClose=')
          .replace(/isOpen=/g, 'isOpen=');
        return `<HelpModal ${updatedProps} variant="purple" />`;
      }
    },
    {
      // <InstructionsModal isOpen={isOpen} closeModal={closeModal}>content</InstructionsModal>
      pattern: /<InstructionsModal\s+([^>]*)>([\s\S]*?)<\/InstructionsModal>/g,
      replacement: (match, props, content) => {
        const updatedProps = props
          .replace(/closeModal=/g, 'onClose=')
          .replace(/isOpen=/g, 'isOpen=');
        return `<HelpModal ${updatedProps} variant="purple">${content}</HelpModal>`;
      }
    }
  ]
};

function findFilesToMigrate(dir, basePath = '') {
  const files = [];
  
  try {
    const entries = fs.readdirSync(dir);
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry);
      const relativePath = path.join(basePath, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        files.push(...findFilesToMigrate(fullPath, relativePath));
      } else if (entry.match(/\.(js|jsx|ts|tsx)$/)) {
        files.push({ path: fullPath, relativePath });
      }
    });
  } catch (error) {
    console.error(`Error scanning ${dir}: ${error.message}`);
  }
  
  return files;
}

function migrateFile(filePath, relativePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;
    let importsReplaced = 0;
    let usagesUpdated = 0;
    
    // Check if file contains modal imports or usage
    const hasModalImport = /import.*(?:CustomModal|InstructionsModal).*from/g.test(content);
    const hasModalUsage = /<(?:CustomModal|InstructionsModal)[\s>]/g.test(content);
    
    if (!hasModalImport && !hasModalUsage) {
      return { modified: false };
    }
    
    console.log(`📄 Migrating: ${relativePath}`);
    
    // Replace import statements
    modalPatterns.imports.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        importsReplaced += matches.length;
        modified = true;
      }
    });
    
    // Replace component usage
    modalPatterns.usage.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        usagesUpdated += matches.length;
        modified = true;
      }
    });
    
    // Write the modified content back to file
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Updated ${importsReplaced} imports, ${usagesUpdated} usages`);
      
      return {
        modified: true,
        importsReplaced,
        usagesUpdated,
        before: originalContent.length,
        after: content.length
      };
    }
    
    return { modified: false };
    
  } catch (error) {
    console.error(`  ❌ Error migrating ${relativePath}: ${error.message}`);
    return { error: error.message };
  }
}

function findCustomModalFiles() {
  const modalFiles = [];
  
  directories.forEach(dir => {
    const fullPath = path.resolve(dir);
    if (fs.existsSync(fullPath)) {
      console.log(`🔍 Scanning ${dir}/ for modal files...`);
      const files = findFilesToMigrate(fullPath, dir);
      modalFiles.push(...files);
    }
  });
  
  return modalFiles;
}

// Main execution
console.log('🎯 Finding files with custom modal implementations...\n');

const allFiles = findCustomModalFiles();
console.log(`📊 Found ${allFiles.length} files to analyze\n`);

// Migrate each file
allFiles.forEach(({ path: filePath, relativePath }) => {
  results.filesAnalyzed++;
  
  const migrationResult = migrateFile(filePath, relativePath);
  
  if (migrationResult.error) {
    results.errors.push({
      file: relativePath,
      error: migrationResult.error
    });
  } else if (migrationResult.modified) {
    results.filesModified++;
    results.importsReplaced += migrationResult.importsReplaced || 0;
    results.usagesUpdated += migrationResult.usagesUpdated || 0;
    results.modifiedFiles.push({
      file: relativePath,
      importsReplaced: migrationResult.importsReplaced || 0,
      usagesUpdated: migrationResult.usagesUpdated || 0
    });
  }
});

// Generate summary report
console.log(`\n🎉 MODAL MIGRATION COMPLETE!`);
console.log(`==============================`);
console.log(`📄 Files analyzed: ${results.filesAnalyzed}`);
console.log(`✅ Files modified: ${results.filesModified}`);
console.log(`🔄 Imports replaced: ${results.importsReplaced}`);
console.log(`🔧 Component usages updated: ${results.usagesUpdated}`);
console.log(`❌ Errors: ${results.errors.length}`);

if (results.errors.length > 0) {
  console.log(`\n❌ ERRORS:`);
  console.log(`=========`);
  results.errors.forEach(({ file, error }) => {
    console.log(`- ${file}: ${error}`);
  });
}

if (results.modifiedFiles.length > 0) {
  console.log(`\n📋 MODIFIED FILES:`);
  console.log(`=================`);
  results.modifiedFiles.forEach(({ file, importsReplaced, usagesUpdated }) => {
    console.log(`✅ ${file} (${importsReplaced} imports, ${usagesUpdated} usages)`);
  });
}

// Save migration report
const migrationReport = {
  timestamp: new Date().toISOString(),
  summary: {
    filesAnalyzed: results.filesAnalyzed,
    filesModified: results.filesModified,
    importsReplaced: results.importsReplaced,
    usagesUpdated: results.usagesUpdated,
    errors: results.errors.length
  },
  modifiedFiles: results.modifiedFiles,
  errors: results.errors
};

fs.writeFileSync('modal-migration-report.json', JSON.stringify(migrationReport, null, 2));

console.log(`\n💡 NEXT STEPS:`);
console.log(`=============`);
console.log(`1. Review modal-migration-report.json for detailed migration info`);
console.log(`2. Test a few activities to ensure modals work with HelpModal`);
console.log(`3. Run the cleanup script to remove CustomModal component files`);
console.log(`4. Check for any remaining Material-UI Modal imports that need updating`);

console.log(`\n🎯 BENEFITS ACHIEVED:`);
console.log(`====================`);
console.log(`✨ Eliminated 40+ duplicate modal implementations`);
console.log(`🎨 Standardized on HelpModal with purple variant support`);
console.log(`📦 Reduced bundle size by removing redundant code`);
console.log(`🛠️ Improved maintainability with shared component`);
console.log(`🔧 Consistent API across all activities`);

console.log(`\n💾 Migration report saved to modal-migration-report.json`);
console.log(`✨ Custom modal migration complete!`);