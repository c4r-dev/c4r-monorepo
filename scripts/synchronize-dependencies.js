#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const logger = require('../packages/logging/logger.js');

class DependencySynchronizer {
    constructor() {
        this.baseDir = process.cwd();
        this.activities = [];
        this.allDependencies = new Map();
        this.standardVersions = new Map();
        this.backupDir = path.join(this.baseDir, 'backup-package-jsons');
        
        // Define the standard versions we want to use
        this.targetVersions = new Map(Object.entries({
            // React Ecosystem - Latest stable versions
            'react': '^19.0.0',
            'react-dom': '^19.0.0',
            'next': '^15.3.1',
            '@types/react': '^19.1.13',
            '@types/react-dom': '^19.1.13',
            
            // Essential Next.js
            'eslint': '^9.0.0',
            'eslint-config-next': '^15.3.1',
            'typescript': '^5.0.0',
            '@types/node': '^20.0.0',
            
            // Build tools
            'autoprefixer': '^10.4.0',
            'postcss': '^8.4.0',
            'tailwindcss': '^3.4.0',
            
            // Common libraries (keep latest compatible versions)
            'mongoose': '^8.15.1',
            'mongodb': '^6.17.0',
            '@xyflow/react': '^12.6.0',
            '@mui/material': '^7.2.0',
            '@mui/icons-material': '^7.2.0',
            '@emotion/react': '^11.14.0',
            '@emotion/styled': '^11.14.1',
            'chart.js': '^4.4.8',
            'react-chartjs-2': '^5.3.0',
            'openai': '^5.8.4',
            'axios': '^1.7.9',
            'dotenv': '^16.4.5',
            'jsonwebtoken': '^9.0.2',
            'bcrypt': '^5.1.0',
            'next-qrcode': '^2.5.1',
            'qrcode.react': '^4.2.0',
            'jspdf': '^3.0.1',
            'react-scripts': '^5.0.1',
            'd3': '^7.9.0',
            'uuid': '^11.1.0',
            'recharts': '^3.1.0'
        }));
    }

    createBackup() {
        logger.app.info('🔄 Creating backup of all package.json files...');
        
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }

        // Backup root package.json
        const rootPackageJson = path.join(this.baseDir, 'package.json');
        const rootBackup = path.join(this.backupDir, 'root-package.json');
        fs.copyFileSync(rootPackageJson, rootBackup);

        // Backup all activity package.json files
        this.activities.forEach((activity, index) => {
            const backupPath = path.join(this.backupDir, `activity-${index}-${activity.name}-package.json`);
            fs.copyFileSync(activity.packageJsonPath, backupPath);
        });

        logger.app.info(`✅ Backed up ${this.activities.length + 1} package.json files to ${this.backupDir}`);
    }

    findAllActivities() {
        const activitiesDir = path.join(this.baseDir, 'activities');
        const activities = [];
        
        const domains = fs.readdirSync(activitiesDir).filter(item => 
            fs.statSync(path.join(activitiesDir, item)).isDirectory()
        );
        
        for (const domain of domains) {
            const domainPath = path.join(activitiesDir, domain);
            const activityNames = fs.readdirSync(domainPath).filter(item => 
                fs.statSync(path.join(domainPath, item)).isDirectory()
            );
            
            for (const activityName of activityNames) {
                const activityPath = path.join(domainPath, activityName);
                const packageJsonPath = path.join(activityPath, 'package.json');
                
                if (fs.existsSync(packageJsonPath)) {
                    activities.push({
                        name: activityName,
                        domain,
                        path: activityPath,
                        packageJsonPath,
                        route: `/${domain}/${activityName}`
                    });
                }
            }
        }
        
        return activities;
    }

    collectAllDependencies() {
        logger.app.info('🔍 Collecting all dependencies from activities...');
        
        this.activities = this.findAllActivities();
        logger.app.info(`📦 Found ${this.activities.length} activities with package.json files`);

        // Collect all unique dependencies and their versions
        for (const activity of this.activities) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(activity.packageJsonPath, 'utf8'));
                const deps = { 
                    ...packageJson.dependencies, 
                    ...packageJson.devDependencies 
                };
                
                activity.dependencies = deps;
                
                // Track all dependency versions
                Object.entries(deps).forEach(([pkg, version]) => {
                    if (!this.allDependencies.has(pkg)) {
                        this.allDependencies.set(pkg, new Set());
                    }
                    this.allDependencies.get(pkg).add(version);
                });
                
            } catch (error) {
                logger.app.error(`❌ Error reading package.json for ${activity.route}:`, error.message);
                activity.dependencies = {};
            }
        }

        logger.app.info(`📊 Found ${this.allDependencies.size} unique packages across all activities`);
    }

    determineStandardVersions() {
        logger.app.info('🎯 Determining standard versions...');

        // For each dependency, determine the standard version to use
        for (const [pkg, versions] of this.allDependencies.entries()) {
            if (this.targetVersions.has(pkg)) {
                // Use our predefined target version
                this.standardVersions.set(pkg, this.targetVersions.get(pkg));
            } else {
                // Use the most common version, or latest if tied
                const versionArray = Array.from(versions);
                if (versionArray.length === 1) {
                    this.standardVersions.set(pkg, versionArray[0]);
                } else {
                    // Use the latest semantic version
                    const latestVersion = versionArray.sort().reverse()[0];
                    this.standardVersions.set(pkg, latestVersion);
                }
            }
        }

        logger.app.info(`✅ Determined standard versions for ${this.standardVersions.size} packages`);
    }

    updateRootPackageJson() {
        logger.app.info('🔧 Updating root package.json...');
        
        const rootPackageJsonPath = path.join(this.baseDir, 'package.json');
        const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
        
        // Update React ecosystem to latest
        rootPackageJson.dependencies.react = this.targetVersions.get('react');
        rootPackageJson.dependencies['react-dom'] = this.targetVersions.get('react-dom');
        rootPackageJson.dependencies.next = this.targetVersions.get('next');
        
        // Add all dependencies that activities need
        for (const [pkg, version] of this.standardVersions.entries()) {
            if (pkg.startsWith('@types/') || 
                ['eslint', 'typescript', 'autoprefixer', 'postcss', 'tailwindcss'].includes(pkg)) {
                // Put type definitions and build tools in devDependencies
                rootPackageJson.devDependencies = rootPackageJson.devDependencies || {};
                rootPackageJson.devDependencies[pkg] = version;
            } else {
                // Everything else in dependencies
                rootPackageJson.dependencies[pkg] = version;
            }
        }
        
        // Update devDependencies
        rootPackageJson.devDependencies['@types/node'] = this.targetVersions.get('@types/node');
        rootPackageJson.devDependencies['@types/react'] = this.targetVersions.get('@types/react');
        rootPackageJson.devDependencies['@types/react-dom'] = this.targetVersions.get('@types/react-dom');
        rootPackageJson.devDependencies.typescript = this.targetVersions.get('typescript');
        rootPackageJson.devDependencies.eslint = this.targetVersions.get('eslint');
        
        fs.writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));
        logger.app.info('✅ Updated root package.json with standardized dependencies');
    }

    generateConsolidatedPackageJson() {
        logger.app.info('📝 Generating consolidated package.json for future single-package architecture...');
        
        const rootPackageJsonPath = path.join(this.baseDir, 'package.json');
        const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
        
        // Create a consolidated version that includes ALL dependencies
        const consolidatedPackageJson = {
            ...rootPackageJson,
            name: 'c4r-monorepo-consolidated',
            description: 'Consolidated C4R Monorepo with all activity dependencies',
            dependencies: {},
            devDependencies: {}
        };

        // Add all standardized dependencies
        for (const [pkg, version] of this.standardVersions.entries()) {
            if (pkg.startsWith('@types/') || 
                ['eslint', 'eslint-config-next', 'typescript', 'autoprefixer', 'postcss', 'tailwindcss'].includes(pkg)) {
                consolidatedPackageJson.devDependencies[pkg] = version;
            } else {
                consolidatedPackageJson.dependencies[pkg] = version;
            }
        }

        // Sort dependencies alphabetically
        const sortedDeps = {};
        Object.keys(consolidatedPackageJson.dependencies).sort().forEach(key => {
            sortedDeps[key] = consolidatedPackageJson.dependencies[key];
        });
        consolidatedPackageJson.dependencies = sortedDeps;

        const sortedDevDeps = {};
        Object.keys(consolidatedPackageJson.devDependencies).sort().forEach(key => {
            sortedDevDeps[key] = consolidatedPackageJson.devDependencies[key];
        });
        consolidatedPackageJson.devDependencies = sortedDevDeps;

        // Save the consolidated package.json
        const consolidatedPath = path.join(this.baseDir, 'package-consolidated.json');
        fs.writeFileSync(consolidatedPath, JSON.stringify(consolidatedPackageJson, null, 2));
        
        logger.app.info(`📄 Generated consolidated package.json: ${consolidatedPath}`);
        logger.app.info(`📊 Total dependencies: ${Object.keys(consolidatedPackageJson.dependencies).length}`);
        logger.app.info(`📊 Total devDependencies: ${Object.keys(consolidatedPackageJson.devDependencies).length}`);
    }

    updateActivityPackageJsons() {
        logger.app.info('🔄 Updating all activity package.json files...');
        
        let updatedCount = 0;
        
        for (const activity of this.activities) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(activity.packageJsonPath, 'utf8'));
                let hasChanges = false;
                
                // Update dependencies
                if (packageJson.dependencies) {
                    for (const [pkg, currentVersion] of Object.entries(packageJson.dependencies)) {
                        const standardVersion = this.standardVersions.get(pkg);
                        if (standardVersion && standardVersion !== currentVersion) {
                            packageJson.dependencies[pkg] = standardVersion;
                            hasChanges = true;
                        }
                    }
                }
                
                // Update devDependencies
                if (packageJson.devDependencies) {
                    for (const [pkg, currentVersion] of Object.entries(packageJson.devDependencies)) {
                        const standardVersion = this.standardVersions.get(pkg);
                        if (standardVersion && standardVersion !== currentVersion) {
                            packageJson.devDependencies[pkg] = standardVersion;
                            hasChanges = true;
                        }
                    }
                }
                
                if (hasChanges) {
                    fs.writeFileSync(activity.packageJsonPath, JSON.stringify(packageJson, null, 2));
                    updatedCount++;
                }
                
            } catch (error) {
                logger.app.error(`❌ Error updating ${activity.route}:`, error.message);
            }
        }
        
        logger.app.info(`✅ Updated ${updatedCount} activity package.json files`);
    }

    generateReport() {
        logger.app.info('\n' + '='.repeat(80));
        logger.app.info('📊 DEPENDENCY SYNCHRONIZATION REPORT');
        logger.app.info('='.repeat(80));
        
        logger.app.info(`\n📈 SUMMARY:`);
        logger.app.info(`   • Activities processed: ${this.activities.length}`);
        logger.app.info(`   • Unique packages found: ${this.allDependencies.size}`);
        logger.app.info(`   • Standard versions defined: ${this.standardVersions.size}`);
        
        logger.app.info('\n🎯 KEY STANDARDIZATIONS:');
        const criticalPackages = ['react', 'react-dom', 'next', '@types/react', 'eslint', 'typescript'];
        criticalPackages.forEach(pkg => {
            if (this.standardVersions.has(pkg)) {
                logger.app.info(`   • ${pkg}: ${this.standardVersions.get(pkg)}`);
            }
        });
        
        logger.app.info('\n📁 FILES CREATED:');
        logger.app.info(`   • Backup directory: ${this.backupDir}`);
        logger.app.info(`   • Consolidated package.json: package-consolidated.json`);
        
        logger.app.info('\n💡 NEXT STEPS FOR SINGLE PACKAGE.JSON:');
        logger.app.info('   1. Test the updated dependencies with: npm install');
        logger.app.info('   2. Run activity tests to verify compatibility');
        logger.app.info('   3. Replace root package.json with package-consolidated.json');
        logger.app.info('   4. Remove all individual activity package.json files');
        logger.app.info('   5. Update seamless server to skip package.json discovery');
        
        return {
            activitiesProcessed: this.activities.length,
            packagesFound: this.allDependencies.size,
            standardVersions: this.standardVersions.size,
            backupDir: this.backupDir
        };
    }

    async run() {
        try {
            logger.app.info('🚀 Starting dependency synchronization...\n');
            
            this.collectAllDependencies();
            this.createBackup();
            this.determineStandardVersions();
            this.updateRootPackageJson();
            this.generateConsolidatedPackageJson();
            this.updateActivityPackageJsons();
            
            const report = this.generateReport();
            
            logger.app.info('\n🎉 Dependency synchronization completed successfully!');
            logger.app.info('\n⚠️  IMPORTANT: Run "npm install" to update package-lock.json');
            
            return report;
            
        } catch (error) {
            logger.app.error('💥 Synchronization failed:', error);
            process.exit(1);
        }
    }
}

async function main() {
    const synchronizer = new DependencySynchronizer();
    await synchronizer.run();
}

if (require.main === module) {
    main();
}

module.exports = { DependencySynchronizer };