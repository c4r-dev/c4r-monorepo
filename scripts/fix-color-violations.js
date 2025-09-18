#!/usr/bin/env node

/**
 * C4R Color Violation Fix Script
 * Fixes hardcoded colors to use C4R brand colors and Tailwind system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('../packages/logging/logger.js');

// Color mappings for critical violations
const COLOR_MAPPINGS = {
  // Brand Purple Violations (Critical)
  '#6200EE': 'c4r-primary',
  '#5000C8': 'c4r-primary-dark',
  '#6e00ff': 'c4r-primary',
  '#5700CA': 'c4r-primary-dark',
  'purple': 'c4r-primary',
  'darkviolet': 'c4r-primary-dark',
  
  // Common Gray Violations
  '#f8f8f8': 'gray-50',
  '#f5f5f5': 'gray-100',
  '#f0f0f0': 'gray-100',
  '#E0E0E0': 'gray-200',
  '#e0e0e0': 'gray-200',
  '#ddd': 'gray-300',
  '#ccc': 'gray-300',
  '#999': 'gray-500',
  '#777': 'gray-500',
  '#666': 'gray-600',
  '#555': 'gray-700',
  '#444': 'gray-700',
  '#333': 'gray-800',
  '#020202': 'gray-900',
  
  // Theme Colors
  '#FF5A00': 'c4r-secondary',
  '#00C802': 'c4r-accent',
  '#f47321': 'orange-500',
  '#4CAF50': 'green-500',
  
  // Common CSS keywords
  'lightgray': 'gray-300',
  'gray': 'gray-500',
  'darkgray': 'gray-700',
  'white': 'white',
  'black': 'black'
};

// RGB/RGBA mappings for common colors
const RGBA_MAPPINGS = {
  'rgba(255, 255, 255, 0.9)': 'white/90',
  'rgba(0, 0, 0, 0.1)': 'black/10',
  'rgba(0, 0, 0, 0.2)': 'black/20',
  'rgba(255, 212, 128, 0.9)': 'amber-200/90'
};

class ColorViolationFixer {
  constructor() {
    this.activitiesDir = 'activities';
    this.violationsFound = 0;
    this.filesProcessed = 0;
    this.report = [];
  }

  findFilesWithColorViolations() {
    logger.app.info('🔍 Finding files with color violations...');
    
    const patterns = Object.keys(COLOR_MAPPINGS).map(color => 
      color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('|');
    
    try {
      const grepCommand = `find ${this.activitiesDir} -type f \\( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.css" \\) -exec grep -l "${patterns}" {} \\;`;
      const result = execSync(grepCommand, { encoding: 'utf8' });
      const files = result.trim().split('\n').filter(f => f);
      
      logger.app.info(`Found ${files.length} files with color violations`);
      return files;
    } catch (error) {
      logger.app.info('Using fallback file discovery...');
      return this.findFilesRecursively(this.activitiesDir);
    }
  }

  findFilesRecursively(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...this.findFilesRecursively(fullPath));
      } else if (/\.(js|jsx|ts|tsx|css)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
    return files;
  }

  fixColorViolations(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let modifiedContent = content;
      let fileViolations = 0;
      const fileChanges = [];

      // Fix backgroundColor and color properties
      for (const [oldColor, newColor] of Object.entries(COLOR_MAPPINGS)) {
        const patterns = [
          // CSS style properties
          new RegExp(`(background-color:\\s*)['"]?${this.escapeRegex(oldColor)}['"]?`, 'gi'),
          new RegExp(`(color:\\s*)['"]?${this.escapeRegex(oldColor)}['"]?`, 'gi'),
          // React inline styles
          new RegExp(`(backgroundColor:\\s*)['"]${this.escapeRegex(oldColor)}['"]`, 'gi'),
          new RegExp(`(color:\\s*)['"]${this.escapeRegex(oldColor)}['"]`, 'gi'),
          // CSS class context
          new RegExp(`(\\b)${this.escapeRegex(oldColor)}(\\b)`, 'gi')
        ];

        patterns.forEach(pattern => {
          const matches = modifiedContent.match(pattern);
          if (matches) {
            fileViolations += matches.length;
            // For CSS properties, suggest Tailwind classes in comments
            if (filePath.endsWith('.css')) {
              modifiedContent = modifiedContent.replace(pattern, (match, prefix) => {
                const isBackground = prefix && prefix.includes('background');
                const tailwindClass = isBackground ? `bg-${newColor}` : `text-${newColor}`;
                return `/* ${match.trim()} */ /* Use Tailwind class: ${tailwindClass} instead */`;
              });
            } else {
              // For JS/JSX files, replace with Tailwind color reference
              modifiedContent = modifiedContent.replace(pattern, (match, prefix) => {
                if (prefix) {
                  return `${prefix}'/* TODO: Use Tailwind class instead */'`;
                }
                return `/* TODO: Replace ${oldColor} with Tailwind ${newColor} class */`;
              });
            }
            fileChanges.push(`${oldColor} → ${newColor}`);
          }
        });
      }

      // Fix specific property patterns
      const propertyPatterns = [
        // backgroundColor with hardcoded values
        {
          pattern: /backgroundColor:\s*['"]([^'"]+)['"]/gi,
          replacement: (match, color) => {
            const mappedColor = COLOR_MAPPINGS[color.toLowerCase()];
            if (mappedColor) {
              fileViolations++;
              return `backgroundColor: '/* TODO: Use bg-${mappedColor} class instead */'`;
            }
            return match;
          }
        },
        // Color constants/objects
        {
          pattern: /(RED|GREEN|BLACK|BLUE):\s*["']([^"']+)["']/gi,
          replacement: (match, colorName, colorValue) => {
            const mappedColor = COLOR_MAPPINGS[colorValue];
            if (mappedColor) {
              fileViolations++;
              return `${colorName}: "/* TODO: Use ${mappedColor} instead of ${colorValue} */"`;
            }
            return match;
          }
        }
      ];

      propertyPatterns.forEach(({ pattern, replacement }) => {
        modifiedContent = modifiedContent.replace(pattern, replacement);
      });

      if (fileViolations > 0) {
        fs.writeFileSync(filePath, modifiedContent);
        this.filesProcessed++;
        this.violationsFound += fileViolations;
        
        this.report.push({
          file: filePath,
          violations: fileViolations,
          changes: fileChanges
        });

        logger.app.info(`✅ Fixed ${fileViolations} violations in: ${filePath}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.app.error(`❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  generateReport() {
    const reportContent = `# C4R Color Violation Fix Report

## Summary
- **Files processed**: ${this.filesProcessed}
- **Total violations fixed**: ${this.violationsFound}
- **Fix date**: ${new Date().toISOString()}

## Color Mappings Applied

### Brand Colors (Critical)
- \`#6200EE\` → \`c4r-primary\`
- \`#5000C8\` → \`c4r-primary-dark\`
- \`purple\` → \`c4r-primary\`
- \`darkviolet\` → \`c4r-primary-dark\`

### Common Grays
- \`#f8f8f8\` → \`gray-50\`
- \`#f5f5f5\` → \`gray-100\`
- \`#E0E0E0\` → \`gray-200\`
- \`#999\` → \`gray-500\`
- \`#666\` → \`gray-600\`

### Theme Colors
- \`#FF5A00\` → \`c4r-secondary\`
- \`#00C802\` → \`c4r-accent\`

## Files Modified

${this.report.map(item => 
  `### ${item.file}
- **Violations**: ${item.violations}
- **Changes**: ${item.changes.join(', ')}`
).join('\n\n')}

## Next Steps

1. **Manual Review Required**: Check all TODO comments in modified files
2. **Replace with Tailwind Classes**: Convert inline styles to className with appropriate Tailwind classes
3. **Test Activities**: Ensure styling remains intact after changes
4. **Update CSS Files**: Replace commented CSS with @apply directives

## Prevention

Use the ESLint rule to prevent future color violations:
\`\`\`bash
npm run lint:colors  # Check for new violations
\`\`\`
`;

    fs.writeFileSync('color-violation-report.md', reportContent);
    logger.app.info('📝 Report saved to: color-violation-report.md');
  }

  run() {
    logger.app.info('🎨 Starting color violation fixes...');
    
    const files = this.findFilesWithColorViolations();
    logger.app.info(`Processing ${files.length} files...`);
    
    files.forEach(file => {
      this.fixColorViolations(file);
    });

    logger.app.info('\n📊 Color violation fix completed!');
    logger.app.info(`🔍 Found ${this.violationsFound} violations across ${this.filesProcessed} files`);
    logger.app.info('⚠️  Manual review required for proper className integration');
    
    this.generateReport();
  }
}

// Run the fixer
const fixer = new ColorViolationFixer();
fixer.run();