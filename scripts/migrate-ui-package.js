#!/usr/bin/env node

/**
 * UI Package TypeScript to JavaScript Migration Script
 * 
 * Converts .ts/.tsx files to .js/.jsx in the UI package only
 */

const fs = require('fs');
const path = require('path');

class UIPackageMigrator {
  constructor() {
    this.processedFiles = [];
    this.errors = [];
    this.dryRun = process.argv.includes('--dry-run');
    
    console.log('🚀 UI Package TypeScript to JavaScript Migration');
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
    console.log('='.repeat(50));
  }

  // Convert TypeScript file content to JavaScript
  convertTypeScriptToJavaScript(content, filePath) {
    let jsContent = content;
    
    // 1. Remove type imports
    jsContent = jsContent.replace(/import\s+type\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?\s*/g, '');
    jsContent = jsContent.replace(/import\s+\{[^}]*type\s+[^}]*\}\s+from\s+['"][^'"]+['"];?\s*/g, '');
    
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
    jsContent = jsContent.replace(/([\w$]+)\s*:\s*[^,)=]+/g, '$1');
    
    // 4. Remove return type annotations
    jsContent = jsContent.replace(/\)\s*:\s*[^{]+\s*\{/g, ') {');
    
    // 5. Remove generic type parameters
    jsContent = jsContent.replace(/<[^>]+>/g, '');
    
    // 6. Remove 'as' type assertions
    jsContent = jsContent.replace(/\s+as\s+\w+/g, '');
    
    // 7. Remove optional property operators (keep the property)
    jsContent = jsContent.replace(/([\w$]+)\?\s*:/g, '$1:');
    
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

  // Main migration process for UI package
  migrate() {
    console.log('\n🔍 Finding TypeScript files in UI package...');
    
    const uiDirectory = '/Users/konrad_1/c4r-dev/packages/ui';
    
    if (!fs.existsSync(uiDirectory)) {
      console.error(`❌ UI package directory not found: ${uiDirectory}`);
      return;
    }
    
    console.log(`\n📁 Processing directory: ${uiDirectory}`);
    
    const tsFiles = this.findFiles(uiDirectory, /\.(ts|tsx)$/);
    console.log(`Found ${tsFiles.length} TypeScript files`);
    
    if (tsFiles.length === 0) {
      console.log('No TypeScript files found in UI package');
      return;
    }
    
    // Migrate TypeScript files to JavaScript
    tsFiles.forEach(filePath => this.migrateFile(filePath));
    
    // Update imports in the same directory
    this.updateImports(uiDirectory);
    
    // Summary
    console.log('\n📊 UI Package Migration Summary');
    console.log('='.repeat(30));
    console.log(`Files processed: ${this.processedFiles.length}`);
    console.log(`Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.errors.forEach(error => {
        console.log(`  ${error.file}: ${error.error}`);
      });
    }
    
    if (!this.dryRun) {
      console.log('\n✅ UI Package migration completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('1. Test the UI package imports');
      console.log('2. Verify activities still load correctly');
      console.log('3. Continue with templates and activities');
    } else {
      console.log('\n📝 This was a dry run. Remove --dry-run to perform actual migration.');
    }
  }
}

// Run migration
const migrator = new UIPackageMigrator();
migrator.migrate();