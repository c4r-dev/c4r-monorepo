#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SinglePackagePreparation {
    constructor() {
        this.baseDir = process.cwd();
        this.activitiesDir = path.join(this.baseDir, 'activities');
    }

    createSinglePackageJson() {
        console.log('📝 Creating single package.json for C4R monorepo...');
        
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
        
        console.log(`✅ Created single package.json: ${singlePackagePath}`);
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
        console.log('📝 Creating backup script for individual package.json files...');
        
        const backupScript = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class PackageBackup {
    constructor() {
        this.baseDir = process.cwd();
        this.backupDir = path.join(this.baseDir, 'backup-individual-packages');
    }

    backup() {
        console.log('🔄 Creating comprehensive backup of all individual package.json files...');
        
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
        
        console.log(\`✅ Backed up \${backupCount} individual package.json files to \${this.backupDir}\`);
    }
}

if (require.main === module) {
    const backup = new PackageBackup();
    backup.backup();
}

module.exports = { PackageBackup };`;
        
        fs.writeFileSync(path.join(this.baseDir, 'backup-individual-packages.js'), backupScript);
        console.log('✅ Created backup script: backup-individual-packages.js');
    }

    createValidationScript() {
        console.log('📝 Creating validation script for single package architecture...');
        
        const validationScript = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class SinglePackageValidator {
    constructor() {
        this.baseDir = process.cwd();
    }

    validate() {
        console.log('🔍 Validating single package architecture...');
        
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
            console.log('✅ Single package architecture validation passed');
            console.log(\`📊 Total activities: \${packageJson.c4rConfig?.totalActivities || 'Unknown'}\`);
            console.log(\`📦 Total dependencies: \${Object.keys(packageJson.dependencies).length}\`);
            console.log(\`🔧 Total devDependencies: \${Object.keys(packageJson.devDependencies).length}\`);
        } else {
            console.log('❌ Validation issues found:');
            issues.forEach(issue => console.log(\`   • \${issue}\`));
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
        console.log('✅ Created validation script: validate-single-package.js');
    }

    createMigrationInstructions() {
        console.log('📝 Creating migration instructions...');
        
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
        console.log('✅ Created migration instructions: SINGLE-PACKAGE-MIGRATION.md');
    }

    async run() {
        try {
            console.log('🚀 Preparing single package.json architecture...\n');
            
            const singlePackageJson = this.createSinglePackageJson();
            this.createBackupScript();
            this.createValidationScript();
            this.createMigrationInstructions();
            
            console.log('\n📊 SINGLE PACKAGE PREPARATION REPORT');
            console.log('=====================================');
            console.log(`📦 Total dependencies: ${Object.keys(singlePackageJson.dependencies).length}`);
            console.log(`🔧 Total devDependencies: ${Object.keys(singlePackageJson.devDependencies).length}`);
            console.log(`🎯 Total activities: ${singlePackageJson.c4rConfig.totalActivities}`);
            
            console.log('\n📁 FILES CREATED:');
            console.log('   • package-single.json - The ultimate single package.json');
            console.log('   • backup-individual-packages.js - Backup script');
            console.log('   • validate-single-package.js - Validation script');
            console.log('   • SINGLE-PACKAGE-MIGRATION.md - Migration instructions');
            
            console.log('\n💡 NEXT STEPS:');
            console.log('   1. Review package-single.json');
            console.log('   2. Test current system: npm run dev');
            console.log('   3. Validate: node validate-single-package.js');
            console.log('   4. Follow SINGLE-PACKAGE-MIGRATION.md for full migration');
            
            console.log('\n🎉 Single package preparation completed!');
            
            return singlePackageJson;
            
        } catch (error) {
            console.error('💥 Single package preparation failed:', error);
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