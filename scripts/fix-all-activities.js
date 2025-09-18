#!/usr/bin/env node

/**
 * Automated Activity Fixes Script
 * Applies common fixes to all C4R activities to resolve navigation timeouts and 404 errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ActivityFixer {
    constructor() {
        this.stats = {
            packageJsonRestored: 0,
            publicUrlFixed: 0,
            symlinksCreated: 0,
            errors: 0,
            totalActivities: 0
        };
        
        this.activityDirectories = [
            'activities/causality',
            'activities/randomization', 
            'activities/coding-practices',
            'activities/collaboration',
            'activities/tools',
            'apps',
            'templates'
        ];
    }

    // Get all activity directories
    getAllActivities() {
        const activities = [];
        
        this.activityDirectories.forEach(baseDir => {
            if (!fs.existsSync(baseDir)) {
                console.log(`⚠️  Directory ${baseDir} does not exist, skipping...`);
                return;
            }
            
            try {
                const items = fs.readdirSync(baseDir);
                items.forEach(item => {
                    const fullPath = path.join(baseDir, item);
                    const stat = fs.lstatSync(fullPath);
                    
                    if (stat.isDirectory() && !stat.isSymbolicLink()) {
                        activities.push({
                            path: fullPath,
                            name: item,
                            baseDir: baseDir
                        });
                    }
                });
            } catch (error) {
                console.log(`⚠️  Error reading ${baseDir}: ${error.message}`);
            }
        });
        
        return activities;
    }

    // Fix 1: Restore missing package.json files from backups
    restorePackageJson(activity) {
        const packageJsonPath = path.join(activity.path, 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
            return false; // Already exists
        }
        
        // Look for backup in backup-package-jsons or backup-individual-packages
        const backupPatterns = [
            `backup-package-jsons/*${activity.name}*package.json`,
            `backup-individual-packages/*${activity.name}*package.json`
        ];
        
        for (const pattern of backupPatterns) {
            try {
                const matches = execSync(`find . -path "./${pattern}" | head -1`, { encoding: 'utf8' }).trim();
                if (matches) {
                    fs.copyFileSync(matches, packageJsonPath);
                    console.log(`✅ Restored package.json for ${activity.path}`);
                    return true;
                }
            } catch (error) {
                // Continue trying other patterns
            }
        }
        
        // Create basic package.json if no backup found
        if (this.needsPackageJson(activity)) {
            this.createBasicPackageJson(activity);
            return true;
        }
        
        return false;
    }

    needsPackageJson(activity) {
        // Check if it looks like a Next.js or React app
        const indicators = [
            'app/layout.js',
            'app/layout.tsx', 
            'pages/_app.js',
            'pages/_app.tsx',
            'src/index.js',
            'src/index.tsx',
            'next.config.js',
            'src/app/layout.js'
        ];
        
        return indicators.some(indicator => 
            fs.existsSync(path.join(activity.path, indicator))
        );
    }

    createBasicPackageJson(activity) {
        const isNextJs = fs.existsSync(path.join(activity.path, 'next.config.js')) ||
                        fs.existsSync(path.join(activity.path, 'app')) ||
                        fs.existsSync(path.join(activity.path, 'src/app'));
                        
        const packageJson = {
            name: activity.name,
            version: "0.1.0",
            private: true,
            scripts: isNextJs ? {
                dev: "next dev",
                build: "next build", 
                start: "next start"
            } : {
                start: "react-scripts start",
                build: "react-scripts build",
                test: "react-scripts test"
            },
            dependencies: isNextJs ? {
                next: "^14.0.0",
                react: "^18.0.0",
                "react-dom": "^18.0.0"
            } : {
                react: "^18.0.0",
                "react-dom": "^18.0.0",
                "react-scripts": "^5.0.0"
            }
        };
        
        fs.writeFileSync(
            path.join(activity.path, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );
        
        console.log(`✅ Created basic package.json for ${activity.path}`);
    }

    // Fix 2: Fix %PUBLIC_URL% placeholders in index.html files
    fixPublicUrlPlaceholders(activity) {
        const indexHtmlPath = path.join(activity.path, 'public/index.html');
        
        if (!fs.existsSync(indexHtmlPath)) {
            return false;
        }
        
        const content = fs.readFileSync(indexHtmlPath, 'utf8');
        
        if (!content.includes('%PUBLIC_URL%')) {
            return false; // No placeholders to fix
        }
        
        // Determine the correct URL prefix based on path
        let urlPrefix;
        if (activity.path.startsWith('apps/')) {
            urlPrefix = `/${activity.path}`;
        } else {
            // Convert path like "activities/coding-practices/activity-name" to "/coding-practices/activity-name"
            const pathParts = activity.path.split('/');
            if (pathParts[0] === 'activities') {
                urlPrefix = `/${pathParts.slice(1).join('/')}`;
            } else {
                urlPrefix = `/${activity.path}`;
            }
        }
        
        // Replace all %PUBLIC_URL% with the correct prefix
        const fixedContent = content.replace(/%PUBLIC_URL%/g, urlPrefix);
        
        fs.writeFileSync(indexHtmlPath, fixedContent);
        console.log(`✅ Fixed %PUBLIC_URL% placeholders in ${activity.path}`);
        
        return true;
    }

    // Fix 3: Create missing directory symlinks for routing issues
    createRoutingSymlinks() {
        const symlinkConfigs = [
            // Collaboration activities moved to apps
            {
                source: 'apps/r2r-feed-back-v1',
                target: 'activities/collaboration/r2r-feed-back-v1'
            },
            {
                source: 'apps/r2r-sticky-note-v2', 
                target: 'activities/collaboration/r2r-sticky-note-v2'
            },
            {
                source: 'apps/r2r-whiteboard-v1',
                target: 'activities/collaboration/r2r-whiteboard-v1'
            },
            // Tools routing
            {
                source: 'apps/c4r-team-nextjs-template',
                target: 'tools/c4r-team-nextjs-template'
            },
            {
                source: 'templates/activity-template-v0',
                target: 'tools/activity-template-v0'
            },
            {
                source: 'templates/activity-template-v1', 
                target: 'tools/activity-template-v1'
            }
        ];
        
        let created = 0;
        
        symlinkConfigs.forEach(config => {
            try {
                // Ensure target directory exists
                const targetDir = path.dirname(config.target);
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }
                
                // Remove existing target if it exists
                if (fs.existsSync(config.target)) {
                    const stat = fs.lstatSync(config.target);
                    if (stat.isSymbolicLink()) {
                        fs.unlinkSync(config.target);
                    } else if (stat.isDirectory()) {
                        // Only remove if empty
                        const files = fs.readdirSync(config.target);
                        if (files.length === 0) {
                            fs.rmdirSync(config.target);
                        } else {
                            console.log(`⚠️  Cannot create symlink, target directory not empty: ${config.target}`);
                            return;
                        }
                    }
                }
                
                // Create relative symlink
                const relativePath = path.relative(path.dirname(config.target), config.source);
                fs.symlinkSync(relativePath, config.target);
                console.log(`✅ Created symlink: ${config.target} -> ${config.source}`);
                created++;
                
            } catch (error) {
                console.log(`⚠️  Error creating symlink ${config.target}: ${error.message}`);
            }
        });
        
        return created;
    }

    // Fix 4: Ensure directories structure exists
    ensureDirectoryStructure() {
        const requiredDirs = [
            'activities/collaboration',
            'activities/tools',
            'tools'
        ];
        
        requiredDirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`✅ Created directory: ${dir}`);
            }
        });
    }

    // Main execution
    run() {
        console.log('🚀 Starting automated activity fixes...\n');
        
        this.ensureDirectoryStructure();
        
        const activities = this.getAllActivities();
        this.stats.totalActivities = activities.length;
        
        console.log(`📁 Found ${activities.length} activities to process\n`);
        
        console.log('🔧 Phase 1: Restoring missing package.json files...');
        activities.forEach(activity => {
            try {
                if (this.restorePackageJson(activity)) {
                    this.stats.packageJsonRestored++;
                }
            } catch (error) {
                console.log(`❌ Error restoring package.json for ${activity.path}: ${error.message}`);
                this.stats.errors++;
            }
        });
        
        console.log('\n🔧 Phase 2: Fixing %PUBLIC_URL% placeholders...');
        activities.forEach(activity => {
            try {
                if (this.fixPublicUrlPlaceholders(activity)) {
                    this.stats.publicUrlFixed++;
                }
            } catch (error) {
                console.log(`❌ Error fixing %PUBLIC_URL% for ${activity.path}: ${error.message}`);
                this.stats.errors++;
            }
        });
        
        console.log('\n🔧 Phase 3: Creating routing symlinks...');
        this.stats.symlinksCreated = this.createRoutingSymlinks();
        
        this.printSummary();
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 AUTOMATED FIXES SUMMARY');
        console.log('='.repeat(60));
        console.log(`📁 Total activities processed: ${this.stats.totalActivities}`);
        console.log(`📦 Package.json files restored: ${this.stats.packageJsonRestored}`);
        console.log(`🔗 %PUBLIC_URL% fixes applied: ${this.stats.publicUrlFixed}`);
        console.log(`🔗 Routing symlinks created: ${this.stats.symlinksCreated}`);
        console.log(`❌ Errors encountered: ${this.stats.errors}`);
        console.log('='.repeat(60));
        
        if (this.stats.packageJsonRestored > 0 || this.stats.publicUrlFixed > 0 || this.stats.symlinksCreated > 0) {
            console.log('\n🎉 Automated fixes completed successfully!');
            console.log('📝 Next steps:');
            console.log('   1. Test activities to ensure they load properly');
            console.log('   2. Run activity test suite to verify fixes');
            console.log('   3. Commit changes if everything works correctly');
        } else {
            console.log('\n✅ All activities already properly configured!');
        }
    }
}

// CLI interface
if (require.main === module) {
    const fixer = new ActivityFixer();
    const args = process.argv.slice(2);
    
    if (args.includes('--help')) {
        console.log(`
🔧 Automated Activity Fixes Tool

Usage:
  node scripts/fix-all-activities.js

This tool automatically applies common fixes:
1. Restores missing package.json files from backups
2. Fixes %PUBLIC_URL% placeholders in index.html files  
3. Creates necessary routing symlinks
4. Ensures proper directory structure

Fixes the most common causes of:
- Navigation timeouts (missing package.json)
- 404 resource errors (%PUBLIC_URL% issues)
- Routing failures (missing symlinks)
        `);
        process.exit(0);
    }
    
    fixer.run();
}

module.exports = ActivityFixer;