#!/usr/bin/env node

/**
 * C4R Color Migration Script
 * Migrates hardcoded colors to use the new C4R Tailwind color system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('../packages/logging/logger.js');

// Color mappings from hardcoded to C4R Tailwind classes
const COLOR_MIGRATIONS = {
  // Purple Brand Colors
  '#6E00FF': { 
    bg: 'bg-c4r-primary', 
    text: 'text-c4r-primary', 
    css: 'var(--c4r-primary)',
    description: 'C4R Primary Purple'
  },
  '#6200EE': { 
    bg: 'bg-c4r-primary', 
    text: 'text-c4r-primary', 
    css: 'var(--c4r-primary)',
    description: 'C4R Primary Purple'
  },
  '#6200E4': { 
    bg: 'bg-c4r-primary-hover', 
    text: 'text-c4r-primary-hover', 
    css: 'var(--c4r-primary-hover)',
    description: 'C4R Primary Hover'
  },
  '#5700CA': { 
    bg: 'bg-c4r-primary-dark', 
    text: 'text-c4r-primary-dark', 
    css: 'var(--c4r-primary-dark)',
    description: 'C4R Primary Dark'
  },
  '#5000C8': { 
    bg: 'bg-c4r-primary-dark', 
    text: 'text-c4r-primary-dark', 
    css: 'var(--c4r-primary-dark)',
    description: 'C4R Primary Dark'
  },
  '#5e00da': { 
    bg: 'bg-c4r-primary-disabled', 
    text: 'text-c4r-primary-disabled', 
    css: 'var(--c4r-primary-disabled)',
    description: 'C4R Primary Disabled'
  },
  
  // Orange Colors
  '#FF5A00': { 
    bg: 'bg-c4r-secondary', 
    text: 'text-c4r-secondary', 
    css: 'var(--c4r-secondary)',
    description: 'C4R Secondary Orange'
  },
  '#f47321': { 
    bg: 'bg-c4r-secondary-alt', 
    text: 'text-c4r-secondary-alt', 
    css: 'var(--c4r-secondary-alt)',
    description: 'C4R Secondary Alt Orange'
  },
  
  // Green Colors
  '#00C802': { 
    bg: 'bg-c4r-accent', 
    text: 'text-c4r-accent', 
    css: 'var(--c4r-accent)',
    description: 'C4R Accent Green'
  },
  '#4CAF50': { 
    bg: 'bg-c4r-accent-alt', 
    text: 'text-c4r-accent-alt', 
    css: 'var(--c4r-accent-alt)',
    description: 'C4R Accent Alt Green'
  },
  
  // Color keywords
  'purple': { 
    bg: 'bg-c4r-primary', 
    text: 'text-c4r-primary', 
    css: 'var(--c4r-primary)',
    description: 'C4R Primary Purple'
  },
  'darkviolet': { 
    bg: 'bg-c4r-primary-dark', 
    text: 'text-c4r-primary-dark', 
    css: 'var(--c4r-primary-dark)',
    description: 'C4R Primary Dark'
  }
};

class C4RColorMigrator {
  constructor() {
    this.activitiesDir = 'activities';
    this.migrationsApplied = 0;
    this.filesProcessed = 0;
    this.report = [];
  }

  findFilesWithTargetColors() {
    logger.app.info('🔍 Finding files with target colors...');
    
    const targetColors = Object.keys(COLOR_MIGRATIONS).map(color => 
      color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('|');
    
    try {
      // Search for files containing our target colors
      const grepCommand = `find ${this.activitiesDir} -type f \\( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.css" \\) -exec grep -l "${targetColors}" {} \\;`;
      const result = execSync(grepCommand, { encoding: 'utf8' });
      const files = result.trim().split('\n').filter(f => f);
      
      logger.app.info(`Found ${files.length} files with target colors`);
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

  migrateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let modifiedContent = content;
      let fileMigrations = 0;
      const fileChanges = [];

      for (const [oldColor, migration] of Object.entries(COLOR_MIGRATIONS)) {
        const patterns = this.createPatternsForColor(oldColor, migration, filePath.endsWith('.css'));
        
        patterns.forEach(({ pattern, replacement, description }) => {
          const matches = modifiedContent.match(pattern);
          if (matches) {
            fileMigrations += matches.length;
            modifiedContent = modifiedContent.replace(pattern, replacement);
            fileChanges.push(`${oldColor} → ${description}`);
          }
        });
      }

      if (fileMigrations > 0) {
        fs.writeFileSync(filePath, modifiedContent);
        this.filesProcessed++;
        this.migrationsApplied += fileMigrations;
        
        this.report.push({
          file: filePath,
          migrations: fileMigrations,
          changes: [...new Set(fileChanges)] // Remove duplicates
        });

        logger.app.info(`✅ Migrated ${fileMigrations} colors in: ${filePath}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.app.error(`❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  createPatternsForColor(oldColor, migration, isCSSFile) {
    const patterns = [];

    if (isCSSFile) {
      // CSS file patterns
      patterns.push({
        pattern: new RegExp(`background-color:\\s*['"]?${this.escapeRegex(oldColor)}['"]?`, 'gi'),
        replacement: `/* background-color: ${oldColor}; */ /* Use Tailwind class: ${migration.bg} instead */`,
        description: migration.description
      });
      
      patterns.push({
        pattern: new RegExp(`color:\\s*['"]?${this.escapeRegex(oldColor)}['"]?`, 'gi'),
        replacement: `/* color: ${oldColor}; */ /* Use Tailwind class: ${migration.text} instead */`,
        description: migration.description
      });
    } else {
      // JavaScript/JSX file patterns
      patterns.push({
        pattern: new RegExp(`backgroundColor:\\s*['"]${this.escapeRegex(oldColor)}['"]`, 'gi'),
        replacement: `className="${migration.bg}"`,
        description: migration.description
      });
      
      patterns.push({
        pattern: new RegExp(`color:\\s*['"]${this.escapeRegex(oldColor)}['"]`, 'gi'),
        replacement: `color: '${migration.css}'`,
        description: migration.description
      });

      // Style prop patterns
      patterns.push({
        pattern: new RegExp(`style={{[^}]*backgroundColor:\\s*['"]${this.escapeRegex(oldColor)}['"][^}]*}}`, 'gi'),
        replacement: (match) => {
          return `className="${migration.bg}" /* Migrated from inline style */`;
        },
        description: migration.description
      });
    }

    return patterns;
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  generateReport() {
    const reportContent = `# C4R Color Migration Report

## Summary
- **Files processed**: ${this.filesProcessed}
- **Total migrations applied**: ${this.migrationsApplied}
- **Migration date**: ${new Date().toISOString()}

## Color Mappings Applied

### Purple Brand Colors
- \`#6E00FF\` → \`bg-c4r-primary\` / \`text-c4r-primary\`
- \`#6200EE\` → \`bg-c4r-primary\` / \`text-c4r-primary\`
- \`#6200E4\` → \`bg-c4r-primary-hover\` / \`text-c4r-primary-hover\`
- \`#5700CA\` → \`bg-c4r-primary-dark\` / \`text-c4r-primary-dark\`

### Orange Colors
- \`#FF5A00\` → \`bg-c4r-secondary\` / \`text-c4r-secondary\`
- \`#f47321\` → \`bg-c4r-secondary-alt\` / \`text-c4r-secondary-alt\`

### Green Colors
- \`#00C802\` → \`bg-c4r-accent\` / \`text-c4r-accent\`
- \`#4CAF50\` → \`bg-c4r-accent-alt\` / \`text-c4r-accent-alt\`

## Files Modified

${this.report.map(item => 
  `### ${item.file}
- **Migrations**: ${item.migrations}
- **Changes**: ${item.changes.join(', ')}`
).join('\n\n')}

## Usage

Now you can use these C4R colors in your activities:

\`\`\`jsx
// Background colors
className="bg-c4r-primary"        // Purple
className="bg-c4r-secondary"      // Orange  
className="bg-c4r-accent"         // Green

// Text colors
className="text-c4r-primary"      // Purple text
className="text-c4r-secondary"    // Orange text
className="text-c4r-accent"       // Green text

// CSS custom properties
color: var(--c4r-primary);
background-color: var(--c4r-secondary);
\`\`\`

## Component Classes Available

- \`.c4r-button\` - Primary purple button
- \`.c4r-button-secondary\` - Orange button
- \`.c4r-button-accent\` - Green button
- \`.c4r-button-outline\` - Outlined purple button
`;

    fs.writeFileSync('c4r-color-migration-report.md', reportContent);
    logger.app.info('📝 Migration report saved to: c4r-color-migration-report.md');
  }

  run() {
    logger.app.info('🎨 Starting C4R color migration...');
    
    const files = this.findFilesWithTargetColors();
    logger.app.info(`Processing ${files.length} files...`);
    
    files.forEach(file => {
      this.migrateFile(file);
    });

    logger.app.info('\n📊 C4R color migration completed!');
    logger.app.info(`🔄 Applied ${this.migrationsApplied} migrations across ${this.filesProcessed} files`);
    
    this.generateReport();
  }
}

// Run the migrator
const migrator = new C4RColorMigrator();
migrator.run();