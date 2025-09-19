#!/usr/bin/env node

/**
 * TypeScript to JavaScript Migration Script
 * 
 * Converts .ts/.tsx files to .js/.jsx by:
 * 1. Removing TypeScript-specific syntax
 * 2. Converting interfaces to JSDoc comments
 * 3. Removing type annotations
 * 4. Updating imports/exports
 * 5. Removing tsconfig.json files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TypeScriptMigrator {
  constructor() {
    this.processedFiles = [];
    this.errors = [];
    this.dryRun = process.argv.includes('--dry-run');
    
    console.log('🚀 TypeScript to JavaScript Migration Tool');
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
    console.log('=' * 50);
  }

  // Convert TypeScript file content to JavaScript
  convertTypeScriptToJavaScript(content, filePath) {
    let jsContent = content;
    
    // 1. Remove type imports
    jsContent = jsContent.replace(/import\s+type\s+\{[^}]+\}\s+from\s+['"'][^'"]+['"];?\s*/g, '');
    jsContent = jsContent.replace(/import\s+\{[^}]*type\s+[^}]*\}\s+from\s+['"'][^'"]+['"];?\s*/g, '');
    
    // 2. Convert interface declarations to JSDoc comments
    jsContent = jsContent.replace(/interface\s+(\w+)\s*\{([^}]+)\}/g, (match, interfaceName, body) => {
      const fields = body.split(';')
        .map(field => field.trim())
        .filter(field => field)
        .map(field => ` * @property {*} ${field.replace(/:\s*[^;]+/, '')}`)
        .join('\n');
      
      return `/**\n * @typedef {Object} ${interfaceName}\n${fields}\n */`;
    });
    
    // 3. Remove type annotations from function parameters
    jsContent = jsContent.replace(/(\w+)\s*:\s*[^,)=]+/g, '$1');
    
    // 4. Remove return type annotations
    jsContent = jsContent.replace(/\)\s*:\s*[^{]+\s*\{/g, ') {');
    
    // 5. Remove generic type parameters
    jsContent = jsContent.replace(/<[^>]+>/g, '');
    
    // 6. Remove 'as' type assertions
    jsContent = jsContent.replace(/\s+as\s+\w+/g, '');
    
    // 7. Remove optional property operators (keep the property)
    jsContent = jsContent.replace(/(\w+)\?\s*:/g, '$1:');
    
    // 8. Convert const assertions
    jsContent = jsContent.replace(/as\s+const/g, '');
    
    // 9. Remove declare statements
    jsContent = jsContent.replace(/declare\s+/g, '');
    
    // 10. Clean up multiple newlines
    jsContent = jsContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return jsContent;
  }

  // Get new file path with .js/.jsx extension
  getJavaScriptPath(tsPath) {
    if (tsPath.endsWith('.tsx')) {
      return tsPath.replace('.tsx', '.jsx');
    } else if (tsPath.endsWith('.ts')) {
      return tsPath.replace('.ts', '.js');
    }
    return tsPath;
  }

  // Migrate a single TypeScript file
  migrateFile(filePath) {
    try {
      console.log(`📄 Processing: ${filePath}`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      const jsContent = this.convertTypeScriptToJavaScript(content, filePath);
      const jsPath = this.getJavaScriptPath(filePath);
      
      if (!this.dryRun) {
        // Write new JavaScript file
        fs.writeFileSync(jsPath, jsContent);
        
        // Remove original TypeScript file if different path
        if (jsPath !== filePath) {
          fs.unlinkSync(filePath);
        }
      }
      
      this.processedFiles.push({
        from: filePath,
        to: jsPath,
        size: content.length
      });
      
      console.log(`  ✅ ${filePath} → ${jsPath}`);
      
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  // Update import statements in JavaScript files to point to new paths
  updateImports(directory) {
    console.log(`\n🔄 Updating imports in ${directory}...`);
    
    const jsFiles = this.findFiles(directory, /\.(js|jsx)$/);
    
    jsFiles.forEach(filePath => {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Update relative imports from .ts/.tsx to .js/.jsx
        content = content.replace(/(from\s+['"])([^'"]+)\.tsx?(['"])/g, (match, prefix, path, suffix) => {
          modified = true;
          const newExt = path.includes('component') || path.includes('Component') ? '.jsx' : '.js';
          return `${prefix}${path}${newExt}${suffix}`;
        });
        
        if (modified && !this.dryRun) {
          fs.writeFileSync(filePath, content);
          console.log(`  ✅ Updated imports in ${filePath}`);
        } else if (modified) {
          console.log(`  📝 Would update imports in ${filePath}`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error updating imports in ${filePath}:`, error.message);
      }
    });
  }

  // Find files matching pattern
  findFiles(directory, pattern) {
    const files = [];
    
    function searchDirectory(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
          searchDirectory(fullPath);
        } else if (entry.isFile() && pattern.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
    
    searchDirectory(directory);
    return files;
  }

  // Remove TypeScript configuration files
  removeTypeScriptConfigs() {
    console.log('\n🗑️  Removing TypeScript configuration files...');
    
    const configFiles = this.findFiles('/Users/konrad_1/c4r-dev', /^tsconfig.*\.json$/);
    
    configFiles.forEach(configPath => {
      console.log(`  📄 Found: ${configPath}`);
      
      if (!this.dryRun) {
        fs.unlinkSync(configPath);
        console.log(`  ✅ Removed: ${configPath}`);
      } else {
        console.log(`  📝 Would remove: ${configPath}`);
      }
    });
  }

  // Update package.json files to remove TypeScript dependencies
  updatePackageJsonFiles() {
    console.log('\n📦 Updating package.json files...');
    
    const packageFiles = this.findFiles('/Users/konrad_1/c4r-dev', /^package\.json$/);
    
    packageFiles.forEach(packagePath => {
      try {
        const packageContent = fs.readFileSync(packagePath, 'utf8');
        const packageData = JSON.parse(packageContent);
        let modified = false;
        
        // Remove TypeScript dependencies
        const tsPackages = [
          'typescript',
          '@types/node',
          '@types/react',
          '@types/react-dom',
          'ts-node',
          'ts-loader',
          '@typescript-eslint/eslint-plugin',
          '@typescript-eslint/parser'
        ];
        
        ['dependencies', 'devDependencies'].forEach(depType => {
          if (packageData[depType]) {
            tsPackages.forEach(pkg => {
              if (packageData[depType][pkg]) {
                delete packageData[depType][pkg];
                modified = true;
                console.log(`  ✅ Removed ${pkg} from ${packagePath}`);
              }
            });
          }
        });
        
        // Remove TypeScript scripts
        if (packageData.scripts) {
          Object.keys(packageData.scripts).forEach(scriptName => {
            if (packageData.scripts[scriptName].includes('tsc') || 
                packageData.scripts[scriptName].includes('typescript')) {
              delete packageData.scripts[scriptName];
              modified = true;
              console.log(`  ✅ Removed TypeScript script "${scriptName}" from ${packagePath}`);
            }
          });
        }
        
        if (modified && !this.dryRun) {
          fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
          console.log(`  ✅ Updated ${packagePath}`);
        } else if (modified) {
          console.log(`  📝 Would update ${packagePath}`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error updating ${packagePath}:`, error.message);
      }
    });
  }

  // Main migration process
  migrate() {
    console.log('\n🔍 Finding TypeScript files...');
    
    // Priority order: UI package first, then templates, then activities
    const directories = [
      '/Users/konrad_1/c4r-dev/packages/ui',
      '/Users/konrad_1/c4r-dev/templates',
      '/Users/konrad_1/c4r-dev/activities',
      '/Users/konrad_1/c4r-dev/apps'
    ];
    
    for (const directory of directories) {
      if (fs.existsSync(directory)) {
        console.log(`\n📁 Processing directory: ${directory}`);
        
        const tsFiles = this.findFiles(directory, /\.(ts|tsx)$/);
        console.log(`Found ${tsFiles.length} TypeScript files`);
        
        // Migrate TypeScript files to JavaScript
        tsFiles.forEach(filePath => this.migrateFile(filePath));
        
        // Update imports in the same directory
        this.updateImports(directory);
      }
    }
    
    // Remove TypeScript configurations
    this.removeTypeScriptConfigs();
    
    // Update package.json files
    this.updatePackageJsonFiles();
    
    // Summary
    console.log('\n📊 Migration Summary');
    console.log('=' * 30);
    console.log(`Files processed: ${this.processedFiles.length}`);
    console.log(`Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.errors.forEach(error => {
        console.log(`  ${error.file}: ${error.error}`);
      });
    }
    
    if (!this.dryRun) {
      console.log('\n✅ Migration completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('1. Run: npm install (to clean up TypeScript dependencies)');
      console.log('2. Test your applications');
      console.log('3. Update any remaining import paths manually');
      console.log('4. Remove any remaining TypeScript references');
    } else {
      console.log('\n📝 This was a dry run. Add --live to perform actual migration.');
    }
  }
}

// Run migration
const migrator = new TypeScriptMigrator();
migrator.migrate();