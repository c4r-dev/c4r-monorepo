#!/usr/bin/env node

/**
 * Migrate hardcoded MongoDB credentials to environment variables
 * Security-focused script to eliminate credential exposure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CredentialMigrator {
    constructor() {
        this.stats = {
            filesProcessed: 0,
            credentialsFound: 0,
            errors: 0
        };
        
        this.mongoUrlPattern = /mongodb\+srv:\/\/[^'"`\s]+/g;
        this.hardcodedMongo = 'mongodb+srv://c4rdfischer4623:df4623DF!@serverlessaws.onx2ah0.mongodb.net/c4r?retryWrites=true&w=majority&appName=ServerlessAWS';
        
        // Files to process
        this.processExtensions = ['.js', '.jsx', '.ts', '.tsx'];
    }

    shouldProcessFile(filePath) {
        const ext = path.extname(filePath);
        return this.processExtensions.includes(ext);
    }

    // Convert hardcoded MongoDB URI to environment variable usage
    secureMongoDB(content, filePath) {
        let newContent = content;
        let hasChanges = false;
        let needsDotenv = false;

        // Check if file contains hardcoded MongoDB URI
        if (this.mongoUrlPattern.test(content)) {
            this.stats.credentialsFound++;
            
            // Replace hardcoded URI with environment variable
            newContent = newContent.replace(
                this.mongoUrlPattern,
                'process.env.MONGODB_URI'
            );
            
            // Remove quotes around the new environment variable if present
            newContent = newContent.replace(
                /['"`]process\.env\.MONGODB_URI['"`]/g,
                'process.env.MONGODB_URI'
            );
            
            hasChanges = true;
            needsDotenv = true;
        }

        // Add dotenv import if needed and not already present
        if (needsDotenv && hasChanges && !newContent.includes('require(\'dotenv\')') && !newContent.includes('dotenv')) {
            // Add dotenv requirement at the top
            if (newContent.includes('const') || newContent.includes('import')) {
                const lines = newContent.split('\n');
                const insertIndex = lines.findIndex(line => 
                    line.includes('const') || line.includes('import')
                );
                
                if (insertIndex >= 0) {
                    lines.splice(insertIndex, 0, 'require(\'dotenv\').config();');
                    newContent = lines.join('\n');
                } else {
                    newContent = 'require(\'dotenv\').config();\n' + newContent;
                }
            } else {
                newContent = 'require(\'dotenv\').config();\n' + newContent;
            }
        }

        return { content: newContent, hasChanges };
    }

    // Process a single file
    processFile(filePath) {
        try {
            if (!this.shouldProcessFile(filePath)) {
                return;
            }

            const content = fs.readFileSync(filePath, 'utf8');
            
            // Skip files that don't have MongoDB credentials
            if (!this.mongoUrlPattern.test(content)) {
                return;
            }

            console.log(`🔒 Securing credentials in: ${filePath}`);
            
            const { content: newContent, hasChanges } = this.secureMongoDB(content, filePath);
            
            if (hasChanges) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`✅ Secured: ${filePath}`);
                this.stats.filesProcessed++;
            }

        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error.message);
            this.stats.errors++;
        }
    }

    // Get all files recursively
    getAllFiles(dir, fileList = []) {
        try {
            const files = fs.readdirSync(dir);
            
            files.forEach(file => {
                const filePath = path.join(dir, file);
                try {
                    const stat = fs.lstatSync(filePath); // Use lstatSync to handle symlinks
                    
                    if (stat.isSymbolicLink()) {
                        // Skip symbolic links to avoid infinite loops
                        return;
                    }
                    
                    if (stat.isDirectory()) {
                        // Skip node_modules, .git, .next, etc.
                        if (!['node_modules', '.git', '.next', 'build', 'dist', 'out', 'logs', 'error-logs'].includes(file)) {
                            this.getAllFiles(filePath, fileList);
                        }
                    } else if (stat.isFile()) {
                        fileList.push(filePath);
                    }
                } catch (statError) {
                    // Skip files/directories that can't be accessed
                    console.log(`⚠️  Skipping inaccessible path: ${filePath}`);
                }
            });
        } catch (readError) {
            console.log(`⚠️  Cannot read directory: ${dir}`);
        }
        
        return fileList;
    }

    // Install dotenv if not already installed
    ensureDotenv() {
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            if (!packageJson.dependencies?.dotenv && !packageJson.devDependencies?.dotenv) {
                console.log('📦 Installing dotenv...');
                execSync('npm install dotenv', { stdio: 'inherit' });
            }
        } catch (error) {
            console.error('Error installing dotenv:', error.message);
        }
    }

    // Run migration on entire codebase
    migrate(targetDir = '.') {
        console.log('🔐 Starting credential security migration...\n');
        
        // Ensure dotenv is installed
        this.ensureDotenv();
        
        const allFiles = this.getAllFiles(targetDir);
        const totalFiles = allFiles.length;
        
        console.log(`📁 Found ${totalFiles} files to examine`);
        console.log('🔍 Scanning for hardcoded credentials...\n');
        
        allFiles.forEach(filePath => {
            this.processFile(filePath);
        });
        
        this.printSummary();
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('🔐 CREDENTIAL SECURITY SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Files secured: ${this.stats.filesProcessed}`);
        console.log(`🔍 Credentials found: ${this.stats.credentialsFound}`);
        console.log(`❌ Errors: ${this.stats.errors}`);
        console.log('='.repeat(60));
        
        if (this.stats.credentialsFound > 0) {
            console.log('\n🎉 Credential migration completed successfully!');
            console.log('📝 Next steps:');
            console.log('   1. Verify .env file contains MONGODB_URI');
            console.log('   2. Ensure .env is in .gitignore (already done)');
            console.log('   3. Test database connections');
            console.log('   4. Never commit .env to git!');
            console.log('\n⚠️  CRITICAL: Change MongoDB password immediately!');
            console.log('   Credentials were exposed in git history.');
        } else {
            console.log('\n✅ No hardcoded credentials found.');
        }
    }
}

// CLI interface
if (require.main === module) {
    const migrator = new CredentialMigrator();
    const args = process.argv.slice(2);
    
    if (args.includes('--help')) {
        console.log(`
🔐 Credential Security Migration Tool

Usage:
  node scripts/migrate-credentials-to-env.js [options]

Options:
  --help               Show this help
  
This tool will:
1. Find all hardcoded MongoDB URIs
2. Replace them with process.env.MONGODB_URI
3. Add dotenv configuration where needed
4. Install dotenv dependency if missing

⚠️  IMPORTANT: After running this, change your MongoDB password!
        `);
        process.exit(0);
    }
    
    migrator.migrate('.');
}

module.exports = CredentialMigrator;