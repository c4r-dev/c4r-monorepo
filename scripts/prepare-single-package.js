#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SinglePackagePreparation {
    constructor() {
        this.baseDir = process.cwd();
        this.activitiesDir = path.join(this.baseDir, 'activities');
    }

    createSinglePackageJson() {
        logger.app.info('📝 Creating single package.json for C4R monorepo...');
        
        const rootPackageJson = JSON.parse(fs.readFileSync(path.join(this.baseDir, 'package.json'), 'utf8'));
        
        // Create the ultimate single package.json
        const singlePackageJson = {
            name: 'c4r-monorepo-single',
            version: rootPackageJson.version,
            description: 'C4R Monorepo - Single Package Architecture (All activities share this package.json)',
            private: true,
            
            // Scripts for the unified architecture
            scripts: {
                // Core development
                "dev": "node server/seamless-activity-server.js",
                "dev:unified": "node server/unified-dev-server.js",
                "start": "node server/seamless-activity-server.js",
                
                // Build and test (Turbo will handle multi-activity builds)
                "build": "turbo run build",
                "build:all": "echo 'Building all activities with shared dependencies'",
                "test": "turbo run test",
                "lint": "turbo run lint",
                "type-check": "turbo run type-check",
                
                // Utilities
                "browse": "open activity-browser.html",
                "clean": "turbo run clean",
                "deps:analyze": "node analyze-dependencies.js",
                "deps:sync": "node synchronize-dependencies.js",
                
                // Single package architecture scripts
                "pkg:validate": "node validate-single-package.js",
                "pkg:test": "node test-all-activities.js",
                "pkg:backup": "node backup-individual-packages.js"
            },
            
            // All dependencies consolidated
            dependencies: rootPackageJson.dependencies,
            devDependencies: rootPackageJson.devDependencies,
            
            // Engine requirements
            engines: rootPackageJson.engines,
            
            // Repository info
            repository: rootPackageJson.repository,
            author: rootPackageJson.author,
            license: rootPackageJson.license,
            
            // Metadata for single package architecture
            "c4rConfig": {
                "architecture": "single-package",
                "activitiesPath": "activities",
                "sharedDependencies": true,
                "totalActivities": this.countActivities(),
                "lastUpdated": new Date().toISOString()
            },
            
            // Turbo configuration
            "turbo": {
                "tasks": {
                    "build": {
                        "dependsOn": ["^build"],
                        "outputs": [".next/**", "build/**", "dist/**", "out/**"]
                    },
                    "test": {
                        "dependsOn": ["^build"]
                    },
                    "lint": {},
                    "type-check": {}
                }
            }
        };
        
        // Save the single package.json
        const singlePackagePath = path.join(this.baseDir, 'package-single.json');
        fs.writeFileSync(singlePackagePath, JSON.stringify(singlePackageJson, null, 2));
        
        logger.app.info(`✅ Created single package.json: ${singlePackagePath}`);
        return singlePackageJson;
    }

    countActivities() {
        let count = 0;
        const domains = fs.readdirSync(this.activitiesDir).filter(item => 
            fs.statSync(path.join(this.activitiesDir, item)).isDirectory()
        );
        
        for (const domain of domains) {
            const domainPath = path.join(this.activitiesDir, domain);
            const activities = fs.readdirSync(domainPath).filter(item => 
                fs.statSync(path.join(domainPath, item)).isDirectory()
            );
            count += activities.length;
        }
        
        return count;
    }

    createBackupScript() {
        logger.app.info('📝 Creating backup script for individual package.json files...');
        
        const backupScript = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class PackageBackup {
    constructor() {
        this.baseDir = process.cwd();
        this.backupDir = path.join(this.baseDir, 'backup-individual-packages');
    }

    backup() {
        logger.app.info('🔄 Creating comprehensive backup of all individual package.json files...');
        
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }

        const activitiesDir = path.join(this.baseDir, 'activities');
        const domains = fs.readdirSync(activitiesDir).filter(item => 
            fs.statSync(path.join(activitiesDir, item)).isDirectory()
        );
        
        let backupCount = 0;
        
        for (const domain of domains) {
            const domainPath = path.join(activitiesDir, domain);
            const activities = fs.readdirSync(domainPath).filter(item => 
                fs.statSync(path.join(domainPath, item)).isDirectory()
            );
            
            for (const activity of activities) {
                const packageJsonPath = path.join(domainPath, activity, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    const backupPath = path.join(this.backupDir, \`\${domain}__\${activity}__package.json\`);
                    fs.copyFileSync(packageJsonPath, backupPath);
                    backupCount++;
                }
            }
        }
        
        logger.app.info(\`✅ Backed up \${backupCount} individual package.json files to \${this.backupDir}\`);
    }
}

if (require.main === module) {
    const backup = new PackageBackup();
    backup.backup();
}

module.exports = { PackageBackup };`;
        
        fs.writeFileSync(path.join(this.baseDir, 'backup-individual-packages.js'), backupScript);
        logger.app.info('✅ Created backup script: backup-individual-packages.js');
    }

    createValidationScript() {
        logger.app.info('📝 Creating validation script for single package architecture...');
        
        const validationScript = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const logger = require('../packages/logging/logger.js');

class SinglePackageValidator {
    constructor() {
        this.baseDir = process.cwd();
    }

    validate() {
        logger.app.info('🔍 Validating single package architecture...');
        
        const packageJsonPath = path.join(this.baseDir, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        const issues = [];
        
        // Check if it's configured as single package
        if (!packageJson.c4rConfig || packageJson.c4rConfig.architecture !== 'single-package') {
            issues.push('Package.json not configured for single-package architecture');
        }
        
        // Check for essential dependencies
        const criticalDeps = ['react', 'react-dom', 'next', 'express'];
        for (const dep of criticalDeps) {
            if (!packageJson.dependencies[dep]) {
                issues.push(\`Missing critical dependency: \${dep}\`);
            }
        }
        
        // Check activities directory
        const activitiesDir = path.join(this.baseDir, 'activities');
        if (!fs.existsSync(activitiesDir)) {
            issues.push('Activities directory not found');
        }
        
        if (issues.length === 0) {
            logger.app.info('✅ Single package architecture validation passed');
            logger.app.info(\`📊 Total activities: \${packageJson.c4rConfig?.totalActivities || 'Unknown'}\`);
            logger.app.info(\`📦 Total dependencies: \${Object.keys(packageJson.dependencies).length}\`);
            logger.app.info(\`🔧 Total devDependencies: \${Object.keys(packageJson.devDependencies).length}\`);
        } else {
            logger.app.info('❌ Validation issues found:');
            issues.forEach(issue => logger.app.info(\`   • \${issue}\`));
        }
        
        return issues.length === 0;
    }
}

if (require.main === module) {
    const validator = new SinglePackageValidator();
    validator.validate();
}

module.exports = { SinglePackageValidator };`;
        
        fs.writeFileSync(path.join(this.baseDir, 'validate-single-package.js'), validationScript);
        logger.app.info('✅ Created validation script: validate-single-package.js');
    }

    createMigrationInstructions() {
        logger.app.info('📝 Creating migration instructions...');
        
        const instructions = `# C4R Monorepo: Single Package.json Migration

## Current Status
✅ All dependencies synchronized to stable versions (React 18.x + Next.js 15.x)
✅ Individual activity package.json files updated
✅ Root package.json contains all consolidated dependencies
✅ package-lock.json regenerated successfully

## Migration to Single Package Architecture

### Phase 1: Validation (CURRENT)
\`\`\`bash
# Test current system
npm run dev
node test-all-activities.js

# Validate dependencies
node validate-single-package.js
\`\`\`

### Phase 2: Backup and Prepare
\`\`\`bash
# Create comprehensive backup
node backup-individual-packages.js

# Replace root package.json with single package version
cp package-single.json package.json
npm install --legacy-peer-deps
\`\`\`

### Phase 3: Remove Individual Package Files
\`\`\`bash
# Remove all individual package.json files (CAREFUL!)
find activities -name "package.json" -delete

# Update .gitignore to ignore any new package.json in activities
echo "activities/**/package.json" >> .gitignore
\`\`\`

### Phase 4: Update Seamless Server
Update \`server/seamless-activity-server.js\` to skip package.json discovery:
- Remove package.json file existence checks
- Use shared node_modules for all activities
- Simplify activity detection logic

### Phase 5: Test and Validate
\`\`\`bash
# Test the new architecture
npm run dev
npm run pkg:test
npm run pkg:validate
\`\`\`

## Benefits of Single Package Architecture
- **Simplified Dependency Management**: One package.json for all 71+ activities
- **Faster Installs**: No duplicate dependencies across activities
- **Version Consistency**: Guaranteed compatible versions across all activities
- **Easier Maintenance**: Single point of dependency updates
- **Reduced Disk Usage**: Shared node_modules instead of 69+ individual ones

## Rollback Plan
If issues occur:
1. Restore from backup-individual-packages/
2. Revert to backup-package-jsons/
3. Run \`npm install --legacy-peer-deps\`

## Key Files Created
- \`package-single.json\` - The consolidated single package.json
- \`backup-individual-packages.js\` - Backup script
- \`validate-single-package.js\` - Validation script
- \`SINGLE-PACKAGE-MIGRATION.md\` - This instruction file
`;
        
        fs.writeFileSync(path.join(this.baseDir, 'SINGLE-PACKAGE-MIGRATION.md'), instructions);
        logger.app.info('✅ Created migration instructions: SINGLE-PACKAGE-MIGRATION.md');
    }

    async run() {
        try {
            logger.app.info('🚀 Preparing single package.json architecture...\n');
            
            const singlePackageJson = this.createSinglePackageJson();
            this.createBackupScript();
            this.createValidationScript();
            this.createMigrationInstructions();
            
            logger.app.info('\n📊 SINGLE PACKAGE PREPARATION REPORT');
            logger.app.info('=====================================');
            logger.app.info(`📦 Total dependencies: ${Object.keys(singlePackageJson.dependencies).length}`);
            logger.app.info(`🔧 Total devDependencies: ${Object.keys(singlePackageJson.devDependencies).length}`);
            logger.app.info(`🎯 Total activities: ${singlePackageJson.c4rConfig.totalActivities}`);
            
            logger.app.info('\n📁 FILES CREATED:');
            logger.app.info('   • package-single.json - The ultimate single package.json');
            logger.app.info('   • backup-individual-packages.js - Backup script');
            logger.app.info('   • validate-single-package.js - Validation script');
            logger.app.info('   • SINGLE-PACKAGE-MIGRATION.md - Migration instructions');
            
            logger.app.info('\n💡 NEXT STEPS:');
            logger.app.info('   1. Review package-single.json');
            logger.app.info('   2. Test current system: npm run dev');
            logger.app.info('   3. Validate: node validate-single-package.js');
            logger.app.info('   4. Follow SINGLE-PACKAGE-MIGRATION.md for full migration');
            
            logger.app.info('\n🎉 Single package preparation completed!');
            
            return singlePackageJson;
            
        } catch (error) {
            logger.app.error('💥 Single package preparation failed:', error);
            process.exit(1);
        }
    }
}

async function main() {
    const preparation = new SinglePackagePreparation();
    await preparation.run();
}

if (require.main === module) {
    main();
}

module.exports = { SinglePackagePreparation };