#!/usr/bin/env node

/**
 * CustomButton Migration Script
 * 
 * This script migrates local CustomButton implementations to use the shared component from @c4r/ui.
 * It handles both Material-UI and Tailwind-based implementations, updating imports and removing
 * redundant local component files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('../packages/logging/logger.js');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  logger.app.info(`${colors[color]}${message}${colors.reset}`);
}

// Find all CustomButton component files
function findCustomButtonFiles() {
  const customButtonFiles = [];
  
  function searchDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and build directories
        if (!['node_modules', '.next', 'build', 'dist', '.git'].includes(item)) {
          searchDirectory(fullPath);
        }
      } else if (item === 'CustomButton.jsx' || item === 'CustomButton.js' || item === 'CustomButton.tsx') {
        // Skip the shared component itself
        if (!fullPath.includes('packages/ui/src/components/CustomButton')) {
          customButtonFiles.push(fullPath);
        }
      }
    }
  }
  
  // Search in activities and apps directories
  searchDirectory('./activities');
  searchDirectory('./apps');
  searchDirectory('./templates');
  
  return customButtonFiles;
}

// Find files that import CustomButton
function findFilesImportingCustomButton(customButtonPath) {
  const importingFiles = [];
  const componentDir = path.dirname(customButtonPath);
  const activityRoot = findActivityRoot(componentDir);
  
  if (!activityRoot) return importingFiles;
  
  function searchForImports(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.next', 'build', 'dist'].includes(item)) {
          searchForImports(fullPath);
        }
      } else if (/\.(js|jsx|ts|tsx)$/.test(item)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Check for various import patterns
          const importPatterns = [
            /import\s+.*CustomButton.*from\s+['"]\.[^'"]*CustomButton[^'"]*['"]/,
            /import\s+.*CustomButton.*from\s+['"]\.\.\//,
            /import.*\{[^}]*CustomButton[^}]*\}.*from/,
            /require\(['"]\.[^'"]*CustomButton[^'"]*['"]\)/
          ];
          
          if (importPatterns.some(pattern => pattern.test(content))) {
            importingFiles.push(fullPath);
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
  }
  
  searchForImports(activityRoot);
  return importingFiles;
}

// Find the root directory of an activity
function findActivityRoot(dir) {
  let current = dir;
  
  while (current !== '/' && current !== '.') {
    const packageJsonPath = path.join(current, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return current;
    }
    current = path.dirname(current);
  }
  
  return null;
}

// Update import statements to use shared component
function updateImports(filePath, customButtonPath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Get relative path from customButton to determine import pattern
    const relativePathToCustomButton = path.relative(path.dirname(filePath), path.dirname(customButtonPath));
    
    // Replace various import patterns with shared component import
    const replacements = [
      {
        pattern: /import\s+(\w+)\s+from\s+['"]\.[^'"]*CustomButton[^'"]*['"]/g,
        replacement: "import { CustomButton } from '@c4r/ui'"
      },
      {
        pattern: /import\s+\{\s*(\w+)\s*\}\s+from\s+['"]\.[^'"]*CustomButton[^'"]*['"]/g,
        replacement: "import { CustomButton } from '@c4r/ui'"
      },
      {
        pattern: /import\s+\{\s*default\s+as\s+(\w+)\s*\}\s+from\s+['"]\.[^'"]*CustomButton[^'"]*['"]/g,
        replacement: "import { CustomButton } from '@c4r/ui'"
      }
    ];
    
    replacements.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });
    
    // Also handle cases where CustomButton is used with a different name
    // Replace component usage to use CustomButton consistently
    const componentNameMatches = content.match(/import\s+(\w+)\s+from.*CustomButton/);
    if (componentNameMatches && componentNameMatches[1] !== 'CustomButton') {
      const oldName = componentNameMatches[1];
      content = content.replace(new RegExp(`<${oldName}`, 'g'), '<CustomButton');
      content = content.replace(new RegExp(`</${oldName}>`, 'g'), '</CustomButton>');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    log('red', `Error updating imports in ${filePath}: ${error.message}`);
    return false;
  }
}

// Add @c4r/ui dependency to package.json if needed
function ensureDependency(activityRoot) {
  const packageJsonPath = path.join(activityRoot, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    if (!packageJson.dependencies['@c4r/ui']) {
      packageJson.dependencies['@c4r/ui'] = 'workspace:*';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    log('red', `Error updating package.json in ${activityRoot}: ${error.message}`);
    return false;
  }
}

// Remove the local CustomButton component file and its directory if empty
function removeCustomButtonFile(filePath) {
  try {
    // Remove the component file
    fs.unlinkSync(filePath);
    
    // Check if the CustomButton directory is empty and remove it
    const dir = path.dirname(filePath);
    const dirName = path.basename(dir);
    
    if (dirName === 'CustomButton') {
      const items = fs.readdirSync(dir);
      if (items.length === 0) {
        fs.rmdirSync(dir);
        log('yellow', `Removed empty directory: ${dir}`);
      }
    }
    
    return true;
  } catch (error) {
    log('red', `Error removing file ${filePath}: ${error.message}`);
    return false;
  }
}

// Main migration function
async function migrateCustomButtons() {
  log('blue', '🔄 Starting CustomButton migration...\n');
  
  const customButtonFiles = findCustomButtonFiles();
  
  if (customButtonFiles.length === 0) {
    log('green', '✅ No CustomButton files found to migrate.');
    return;
  }
  
  log('blue', `Found ${customButtonFiles.length} CustomButton components to migrate:`);
  customButtonFiles.forEach(file => log('yellow', `  - ${file}`));
  logger.app.info();
  
  let migrationStats = {
    filesUpdated: 0,
    importsUpdated: 0,
    dependenciesAdded: 0,
    componentsRemoved: 0,
    errors: 0
  };
  
  for (const customButtonPath of customButtonFiles) {
    try {
      log('blue', `\n📦 Processing: ${customButtonPath}`);
      
      // Find files that import this CustomButton
      const importingFiles = findFilesImportingCustomButton(customButtonPath);
      log('yellow', `  Found ${importingFiles.length} files importing this component`);
      
      // Update imports in each file
      for (const importingFile of importingFiles) {
        const updated = updateImports(importingFile, customButtonPath);
        if (updated) {
          log('green', `  ✅ Updated imports in: ${path.relative('.', importingFile)}`);
          migrationStats.importsUpdated++;
        }
      }
      
      // Ensure @c4r/ui dependency is added to package.json
      const activityRoot = findActivityRoot(customButtonPath);
      if (activityRoot) {
        const dependencyAdded = ensureDependency(activityRoot);
        if (dependencyAdded) {
          log('green', `  ✅ Added @c4r/ui dependency to: ${path.relative('.', activityRoot)}/package.json`);
          migrationStats.dependenciesAdded++;
        }
      }
      
      // Remove the local CustomButton component
      const removed = removeCustomButtonFile(customButtonPath);
      if (removed) {
        log('green', `  ✅ Removed local component: ${path.relative('.', customButtonPath)}`);
        migrationStats.componentsRemoved++;
      }
      
      migrationStats.filesUpdated++;
      
    } catch (error) {
      log('red', `  ❌ Error processing ${customButtonPath}: ${error.message}`);
      migrationStats.errors++;
    }
  }
  
  // Print migration summary
  logger.app.info('\n' + '='.repeat(60));
  log('bold', '📊 Migration Summary:');
  log('green', `  ✅ Activities processed: ${migrationStats.filesUpdated}`);
  log('green', `  ✅ Import statements updated: ${migrationStats.importsUpdated}`);
  log('green', `  ✅ Dependencies added: ${migrationStats.dependenciesAdded}`);
  log('green', `  ✅ Components removed: ${migrationStats.componentsRemoved}`);
  
  if (migrationStats.errors > 0) {
    log('red', `  ❌ Errors encountered: ${migrationStats.errors}`);
  }
  
  logger.app.info('\n' + '='.repeat(60));
  
  if (migrationStats.errors === 0) {
    log('green', '🎉 CustomButton migration completed successfully!');
    log('blue', '\n📝 Next steps:');
    log('yellow', '  1. Run the test script to verify all buttons work correctly');
    log('yellow', '  2. Check for any TypeScript errors');
    log('yellow', '  3. Test a few activities manually to ensure proper functionality');
  } else {
    log('yellow', '⚠️  Migration completed with some errors. Please review the error messages above.');
  }
}

// Run the migration
if (require.main === module) {
  migrateCustomButtons().catch(error => {
    log('red', `Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { migrateCustomButtons };