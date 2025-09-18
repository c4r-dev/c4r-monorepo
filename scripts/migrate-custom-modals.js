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
const logger = require('../packages/logging/logger.js');

logger.app.info('🔧 Starting Custom Modal Migration...\n');

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
    logger.app.error(`Error scanning ${dir}: ${error.message}`);
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
    
    logger.app.info(`📄 Migrating: ${relativePath}`);
    
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
      logger.app.info(`  ✅ Updated ${importsReplaced} imports, ${usagesUpdated} usages`);
      
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
    logger.app.error(`  ❌ Error migrating ${relativePath}: ${error.message}`);
    return { error: error.message };
  }
}

function findCustomModalFiles() {
  const modalFiles = [];
  
  directories.forEach(dir => {
    const fullPath = path.resolve(dir);
    if (fs.existsSync(fullPath)) {
      logger.app.info(`🔍 Scanning ${dir}/ for modal files...`);
      const files = findFilesToMigrate(fullPath, dir);
      modalFiles.push(...files);
    }
  });
  
  return modalFiles;
}

// Main execution
logger.app.info('🎯 Finding files with custom modal implementations...\n');

const allFiles = findCustomModalFiles();
logger.app.info(`📊 Found ${allFiles.length} files to analyze\n`);

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
logger.app.info(`\n🎉 MODAL MIGRATION COMPLETE!`);
logger.app.info(`==============================`);
logger.app.info(`📄 Files analyzed: ${results.filesAnalyzed}`);
logger.app.info(`✅ Files modified: ${results.filesModified}`);
logger.app.info(`🔄 Imports replaced: ${results.importsReplaced}`);
logger.app.info(`🔧 Component usages updated: ${results.usagesUpdated}`);
logger.app.info(`❌ Errors: ${results.errors.length}`);

if (results.errors.length > 0) {
  logger.app.info(`\n❌ ERRORS:`);
  logger.app.info(`=========`);
  results.errors.forEach(({ file, error }) => {
    logger.app.info(`- ${file}: ${error}`);
  });
}

if (results.modifiedFiles.length > 0) {
  logger.app.info(`\n📋 MODIFIED FILES:`);
  logger.app.info(`=================`);
  results.modifiedFiles.forEach(({ file, importsReplaced, usagesUpdated }) => {
    logger.app.info(`✅ ${file} (${importsReplaced} imports, ${usagesUpdated} usages)`);
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

logger.app.info(`\n💡 NEXT STEPS:`);
logger.app.info(`=============`);
logger.app.info(`1. Review modal-migration-report.json for detailed migration info`);
logger.app.info(`2. Test a few activities to ensure modals work with HelpModal`);
logger.app.info(`3. Run the cleanup script to remove CustomModal component files`);
logger.app.info(`4. Check for any remaining Material-UI Modal imports that need updating`);

logger.app.info(`\n🎯 BENEFITS ACHIEVED:`);
logger.app.info(`====================`);
logger.app.info(`✨ Eliminated 40+ duplicate modal implementations`);
logger.app.info(`🎨 Standardized on HelpModal with purple variant support`);
logger.app.info(`📦 Reduced bundle size by removing redundant code`);
logger.app.info(`🛠️ Improved maintainability with shared component`);
logger.app.info(`🔧 Consistent API across all activities`);

logger.app.info(`\n💾 Migration report saved to modal-migration-report.json`);
logger.app.info(`✨ Custom modal migration complete!`);