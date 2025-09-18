#!/usr/bin/env node

/**
 * Migrate console.* calls to structured logging
 * Automatically converts console.log, console.error, etc. to logger calls
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('../packages/logging/logger');

class ConsoleToLoggerMigrator {
    constructor() {
        this.stats = {
            filesProcessed: 0,
            replacements: 0,
            skippedFiles: 0,
            errors: 0
        };
        
        // Patterns to skip (files that should keep console.*)
        this.skipPatterns = [
            /node_modules/,
            /\.git/,
            /\.next/,
            /build/,
            /dist/,
            /out/,
            /logs/,
            /pyodide\.js$/,
            /pyodide\.asm\.js$/,
            /browser-logger\.js$/  // Our browser logger needs console for fallback
        ];

        // File extensions to process
        this.processExtensions = ['.js', '.jsx', '.ts', '.tsx'];
    }

    shouldSkipFile(filePath) {
        return this.skipPatterns.some(pattern => pattern.test(filePath));
    }

    shouldProcessFile(filePath) {
        const ext = path.extname(filePath);
        return this.processExtensions.includes(ext);
    }

    // Convert console.* calls to appropriate logger calls
    convertConsoleToLogger(content, filePath) {
        let newContent = content;
        let hasChanges = false;
        let needsLoggerImport = false;

        // Patterns for different console methods
        const patterns = [
            {
                // logger.app.info(...) -> logger.app.info(...)
                regex: /console\.log\(/g,
                replacement: 'logger.app.info(',
                needsImport: true
            },
            {
                // logger.app.info(...) -> logger.app.info(...)
                regex: /console\.info\(/g,
                replacement: 'logger.app.info(',
                needsImport: true
            },
            {
                // logger.app.warn(...) -> logger.app.warn(...)
                regex: /console\.warn\(/g,
                replacement: 'logger.app.warn(',
                needsImport: true
            },
            {
                // logger.app.error(...) -> logger.app.error(...)
                regex: /console\.error\(/g,
                replacement: 'logger.app.error(',
                needsImport: true
            },
            {
                // logger.dev.debug(...) -> logger.dev.debug(...)
                regex: /console\.debug\(/g,
                replacement: 'logger.dev.debug(',
                needsImport: true
            }
        ];

        // Apply replacements
        patterns.forEach(pattern => {
            const matches = newContent.match(pattern.regex);
            if (matches) {
                newContent = newContent.replace(pattern.regex, pattern.replacement);
                hasChanges = true;
                needsLoggerImport = pattern.needsImport;
                this.stats.replacements += matches.length;
            }
        });

        // Add logger import if needed and not already present
        if (needsLoggerImport && hasChanges && !newContent.includes('require(') && !newContent.includes('from ')) {
            // This is likely a browser-side file, use window.logger or fetch API
            if (filePath.includes('/app/') || filePath.includes('/src/') || filePath.includes('/components/')) {
                // Browser context - convert to browser logging
                newContent = this.convertToBrowserLogging(newContent);
            }
        } else if (needsLoggerImport && hasChanges && !newContent.includes("require('../packages/logging/logger')") && !newContent.includes("require('./packages/logging/logger')")) {
            // Server-side file - add logger import
            const relativePath = this.getLoggerPath(filePath);
            const importStatement = `const logger = require('${relativePath}');\n`;
            
            // Add import after existing requires or at the top
            if (newContent.includes('require(')) {
                // Find last require statement
                const requireLines = newContent.split('\n');
                let lastRequireIndex = -1;
                requireLines.forEach((line, index) => {
                    if (line.includes('require(') && !line.includes('//')) {
                        lastRequireIndex = index;
                    }
                });
                
                if (lastRequireIndex >= 0) {
                    requireLines.splice(lastRequireIndex + 1, 0, importStatement.trim());
                    newContent = requireLines.join('\n');
                } else {
                    newContent = importStatement + newContent;
                }
            } else {
                newContent = importStatement + newContent;
            }
        }

        return { content: newContent, hasChanges };
    }

    // Convert logger calls to browser logging for client-side files
    convertToBrowserLogging(content) {
        const browserPatterns = [
            {
                regex: /logger\.app\.info\(/g,
                replacement: "window.c4rLogger ? window.c4rLogger.info('app_log', "
            },
            {
                regex: /logger\.app\.warn\(/g,
                replacement: "window.c4rLogger ? window.c4rLogger.warn('app_warning', "
            },
            {
                regex: /logger\.app\.error\(/g,
                replacement: "window.c4rLogger ? window.c4rLogger.error('app_error', "
            },
            {
                regex: /logger\.dev\.debug\(/g,
                replacement: "window.c4rLogger ? window.c4rLogger.debug('dev_debug', "
            }
        ];

        let newContent = content;
        browserPatterns.forEach(pattern => {
            if (pattern.regex.test(newContent)) {
                newContent = newContent.replace(pattern.regex, pattern.replacement);
                // Add fallback for when logger isn't available
                newContent = newContent.replace(/window\.c4rLogger \? window\.c4rLogger\.(info|warn|error|debug)\('([^']+)', /g, 
                    'window.c4rLogger ? window.c4rLogger.$1(\'$2\', ') + ' : console.$1(';
            }
        });

        return newContent;
    }

    // Calculate relative path to logger from given file
    getLoggerPath(filePath) {
        const relativePath = path.relative(path.dirname(filePath), 'packages/logging/logger.js');
        return relativePath.startsWith('.') ? relativePath : './' + relativePath;
    }

    // Process a single file
    processFile(filePath) {
        try {
            if (!this.shouldProcessFile(filePath) || this.shouldSkipFile(filePath)) {
                this.stats.skippedFiles++;
                return;
            }

            const content = fs.readFileSync(filePath, 'utf8');
            
            // Skip files that don't have console.* calls
            if (!/console\.(log|info|warn|error|debug)\s*\(/.test(content)) {
                this.stats.skippedFiles++;
                return;
            }

            const { content: newContent, hasChanges } = this.convertConsoleToLogger(content, filePath);
            
            if (hasChanges) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                logger.app.info(`✅ Migrated: ${filePath}`);
                this.stats.filesProcessed++;
            } else {
                this.stats.skippedFiles++;
            }

        } catch (error) {
            logger.app.error(`❌ Error processing ${filePath}:`, error.message);
            this.stats.errors++;
        }
    }

    // Get all files recursively
    getAllFiles(dir, fileList = []) {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                if (!this.shouldSkipFile(filePath)) {
                    this.getAllFiles(filePath, fileList);
                }
            } else {
                fileList.push(filePath);
            }
        });
        
        return fileList;
    }

    // Run migration on entire codebase
    migrate(targetDir = '.') {
        logger.app.info('🚀 Starting console.* to logger migration...\n');
        
        const allFiles = this.getAllFiles(targetDir);
        const totalFiles = allFiles.length;
        
        logger.app.info(`📁 Found ${totalFiles} files to examine`);
        logger.app.info('🔄 Processing files...\n');
        
        allFiles.forEach(filePath => {
            this.processFile(filePath);
        });
        
        this.printSummary();
    }

    // Migrate specific files/patterns
    migrateFiles(patterns) {
        logger.app.info('🚀 Starting targeted console.* to logger migration...\n');
        
        patterns.forEach(pattern => {
            try {
                // Use glob pattern to find files
                const files = execSync(`find . -name "${pattern}" -type f`, { encoding: 'utf8' })
                    .split('\n')
                    .filter(f => f.trim());
                
                logger.app.info(`📁 Found ${files.length} files matching "${pattern}"`);
                
                files.forEach(filePath => {
                    this.processFile(filePath.trim());
                });
                
            } catch (error) {
                logger.app.error(`❌ Error finding files for pattern "${pattern}":`, error.message);
            }
        });
        
        this.printSummary();
    }

    printSummary() {
        logger.app.info('\n' + '='.repeat(60));
        logger.app.info('📊 MIGRATION SUMMARY');
        logger.app.info('='.repeat(60));
        logger.app.info(`✅ Files processed: ${this.stats.filesProcessed}`);
        logger.app.info(`🔄 Total replacements: ${this.stats.replacements}`);
        logger.app.info(`⏭️  Files skipped: ${this.stats.skippedFiles}`);
        logger.app.info(`❌ Errors: ${this.stats.errors}`);
        logger.app.info('='.repeat(60));
        
        if (this.stats.replacements > 0) {
            logger.app.info('\n🎉 Migration completed successfully!');
            logger.app.info('📝 Next steps:');
            logger.app.info('   1. Test your application to ensure everything works');
            logger.app.info('   2. Start the enhanced logging server:');
            logger.app.info('      node server/seamless-activity-server-with-logging.js');
            logger.app.info('   3. Check logs in the logs/ directory');
        } else {
            logger.app.info('\n🤷 No console.* calls found to migrate.');
        }
    }
}

// CLI interface
if (require.main === module) {
    const migrator = new ConsoleToLoggerMigrator();
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        logger.app.info(`
📊 Console to Logger Migration Tool

Usage:
  node scripts/migrate-console-to-logger.js [options]

Options:
  --all                 Migrate all files in current directory
  --server             Migrate only server files (server/, scripts/)
  --activities         Migrate only activity files (activities/, apps/)
  --files "pattern"    Migrate files matching pattern (e.g., "*.js")
  --help               Show this help

Examples:
  node scripts/migrate-console-to-logger.js --all
  node scripts/migrate-console-to-logger.js --server
  node scripts/migrate-console-to-logger.js --files "server/*.js"
        `);
        process.exit(0);
    }
    
    if (args.includes('--help')) {
        logger.app.info('📖 See usage above');
        process.exit(0);
    }
    
    if (args.includes('--all')) {
        migrator.migrate('.');
    } else if (args.includes('--server')) {
        migrator.migrate('server');
        migrator.migrate('scripts');
    } else if (args.includes('--activities')) {
        migrator.migrate('activities');
        migrator.migrate('apps');
    } else if (args.includes('--files')) {
        const patternIndex = args.indexOf('--files') + 1;
        const patterns = args.slice(patternIndex);
        migrator.migrateFiles(patterns);
    } else {
        logger.app.info('❌ Invalid arguments. Use --help for usage information.');
        process.exit(1);
    }
}

module.exports = ConsoleToLoggerMigrator;