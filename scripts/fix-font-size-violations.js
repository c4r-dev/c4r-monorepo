#!/usr/bin/env node

/**
 * Fix Font Size Violations Script
 * Systematically replaces hardcoded font sizes with approved Tailwind classes
 * Ensures compliance with the C4R 7-size font system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Approved font size mappings
const FONT_SIZE_MAPPINGS = {
  // Pixel sizes
  '12px': 'text-xs',
  '14px': 'text-sm', 
  '16px': 'text-base',
  '18px': 'text-lg',
  '20px': 'text-xl',
  '24px': 'text-2xl',
  '32px': 'text-3xl',
  
  // Rem sizes (convert to closest approved)
  '0.75rem': 'text-xs',   // 12px
  '0.875rem': 'text-sm',  // 14px
  '1rem': 'text-base',    // 16px
  '1.125rem': 'text-lg',  // 18px
  '1.25rem': 'text-xl',   // 20px
  '1.5rem': 'text-2xl',   // 24px
  '2rem': 'text-3xl',     // 32px
  
  // Common violations - map to closest approved
  '0.7rem': 'text-xs',    // 11.2px -> 12px
  '0.8rem': 'text-xs',    // 12.8px -> 12px
  '0.85rem': 'text-sm',   // 13.6px -> 14px
  '0.9rem': 'text-sm',    // 14.4px -> 14px
  '1.1rem': 'text-lg',    // 17.6px -> 18px
  '1.2rem': 'text-xl',    // 19.2px -> 20px
  
  // Em sizes (assuming 16px base)
  '0.75em': 'text-xs',
  '0.875em': 'text-sm',
  '1em': 'text-base',
  '1.125em': 'text-lg',
  '1.25em': 'text-xl',
  '1.5em': 'text-2xl',
  '2em': 'text-3xl',
  
  // Common violations in em
  '0.8em': 'text-xs',
  '0.9em': 'text-sm',
  '1.1em': 'text-lg',
  '1.2em': 'text-xl'
};

class FontSizeFixer {
  constructor() {
    this.violationsFound = 0;
    this.violationsFixed = 0;
    this.filesProcessed = 0;
    this.errors = [];
  }

  log(message, type = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${icons[type]} ${message}`);
  }

  async findViolatingFiles() {
    this.log('Finding files with font size violations...');
    
    try {
      // Find files with font size violations (excluding SVG files and node_modules)
      const command = `find /Users/konrad_1/c4r-dev/activities -name "*.jsx" -o -name "*.js" -o -name "*.css" | grep -v node_modules | grep -v ".svg"`;
      const files = execSync(command, { encoding: 'utf8' }).trim().split('\n').filter(f => f);
      
      const violatingFiles = [];
      
      for (const file of files) {
        if (this.hasViolations(file)) {
          violatingFiles.push(file);
        }
      }
      
      this.log(`Found ${violatingFiles.length} files with font size violations`);
      return violatingFiles;
    } catch (error) {
      this.log(`Error finding files: ${error.message}`, 'error');
      return [];
    }
  }

  hasViolations(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for inline style violations
      const inlineRegex = /fontSize:\s*['"`]([^'"`]+)['"`]/g;
      
      // Check for CSS font-size violations  
      const cssRegex = /font-size:\s*([^;}\s]+)/g;
      
      return inlineRegex.test(content) || cssRegex.test(content);
    } catch (error) {
      return false;
    }
  }

  fixInlineStyles(content) {
    let fixed = false;
    
    // Fix React inline styles: fontSize: '1rem' -> className with Tailwind
    const inlineRegex = /fontSize:\s*['"`]([^'"`]+)['"`]/g;
    
    const newContent = content.replace(inlineRegex, (match, size) => {
      const tailwindClass = FONT_SIZE_MAPPINGS[size];
      if (tailwindClass) {
        this.violationsFound++;
        fixed = true;
        // Note: We can't automatically convert inline styles to className
        // This requires manual intervention, so we'll comment it
        return `/* fontSize: '${size}' */ // TODO: Add '${tailwindClass}' to className`;
      }
      return match;
    });
    
    return { content: newContent, fixed };
  }

  fixCSSStyles(content) {
    let fixed = false;
    
    // Fix CSS font-size declarations
    const cssRegex = /font-size:\s*([^;}\s]+)/g;
    
    const newContent = content.replace(cssRegex, (match, size) => {
      const cleanSize = size.trim();
      const tailwindClass = FONT_SIZE_MAPPINGS[cleanSize];
      if (tailwindClass) {
        this.violationsFound++;
        fixed = true;
        // For CSS files, we'll comment out and suggest Tailwind
        return `/* font-size: ${cleanSize}; */ /* Use Tailwind class: ${tailwindClass} instead */`;
      }
      return match;
    });
    
    return { content: newContent, fixed };
  }

  processFile(filePath) {
    try {
      this.filesProcessed++;
      const content = fs.readFileSync(filePath, 'utf8');
      let newContent = content;
      let hasChanges = false;
      
      // Fix inline styles
      if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        const inlineResult = this.fixInlineStyles(newContent);
        newContent = inlineResult.content;
        if (inlineResult.fixed) hasChanges = true;
      }
      
      // Fix CSS styles
      if (filePath.endsWith('.css')) {
        const cssResult = this.fixCSSStyles(newContent);
        newContent = cssResult.content;
        if (cssResult.fixed) hasChanges = true;
      }
      
      if (hasChanges) {
        fs.writeFileSync(filePath, newContent);
        this.violationsFixed++;
        this.log(`Fixed violations in: ${path.relative('/Users/konrad_1/c4r-dev', filePath)}`, 'success');
      }
      
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
    }
  }

  generateReport() {
    const report = `
# Font Size Violation Fix Report

## Summary
- **Files processed**: ${this.filesProcessed}
- **Violations found**: ${this.violationsFound}
- **Violations fixed**: ${this.violationsFixed}
- **Errors encountered**: ${this.errors.length}

## Font Size Mappings Used
${Object.entries(FONT_SIZE_MAPPINGS).map(([size, className]) => 
  `- \`${size}\` → \`${className}\``
).join('\n')}

## Manual Actions Required
After running this script, you need to:
1. **Review commented violations** in JSX/JS files
2. **Replace inline styles** with proper className usage
3. **Update CSS files** to use Tailwind classes instead
4. **Test all activities** to ensure styling still works

## Common Patterns to Fix Manually:

### React Components:
\`\`\`jsx
// Before:
<div style={{ fontSize: '1.2rem' }}>Text</div>

// After: 
<div className="text-xl">Text</div>
\`\`\`

### Material-UI Components:
\`\`\`jsx
// Before:
<Typography sx={{ fontSize: '0.8rem' }}>Text</Typography>

// After:
<Typography className="text-xs">Text</Typography>
\`\`\`

### CSS Files:
\`\`\`css
/* Before: */
.my-class {
  font-size: 1.2rem;
}

/* After: Use Tailwind class instead */
.my-class {
  @apply text-xl;
}
\`\`\`

${this.errors.length > 0 ? `
## Errors Encountered
${this.errors.map(err => `- **${err.file}**: ${err.error}`).join('\n')}
` : ''}

Generated: ${new Date().toISOString()}
`;

    fs.writeFileSync('/Users/konrad_1/c4r-dev/font-size-violation-report.md', report);
    return report;
  }

  async run() {
    this.log('🔧 Starting font size violation fixes...');
    
    const files = await this.findViolatingFiles();
    
    if (files.length === 0) {
      this.log('No font size violations found!', 'success');
      return;
    }
    
    this.log(`Processing ${files.length} files...`);
    
    files.forEach(file => this.processFile(file));
    
    const report = this.generateReport();
    
    this.log('📊 Font size violation fix completed!', 'success');
    this.log(`📝 Report saved to: font-size-violation-report.md`);
    this.log(`🔍 Found ${this.violationsFound} violations across ${this.filesProcessed} files`);
    
    if (this.violationsFound > 0) {
      this.log('⚠️  Manual review required for proper className integration', 'warning');
    }
  }
}

// Run the script
if (require.main === module) {
  const fixer = new FontSizeFixer();
  fixer.run().catch(console.error);
}

module.exports = FontSizeFixer;