#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class StableDependencyFixer {
    constructor() {
        this.baseDir = process.cwd();
        
        // Use the most stable React 18.x + Next.js 15.x combination
        this.stableVersions = {
            // React Ecosystem - Stable React 18 + Next.js 15
            'react': '^18.3.1',
            'react-dom': '^18.3.1',
            'next': '^15.3.1',
            '@types/react': '^18.3.7',
            '@types/react-dom': '^18.3.0',
            
            // Essential Next.js
            'eslint': '^9.0.0',
            'eslint-config-next': '^15.3.1',
            'typescript': '^5.0.0',
            '@types/node': '^20.0.0',
            
            // Build tools
            'autoprefixer': '^10.4.0',
            'postcss': '^8.4.0',
            'tailwindcss': '^3.4.0',
            
            // Keep compatible versions of other packages
            'mongoose': '^8.15.1',
            'mongodb': '^6.17.0',
            '@xyflow/react': '^12.6.0',
            '@mui/material': '^6.4.1', // Use React 18 compatible version
            '@mui/icons-material': '^6.4.1',
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
            'recharts': '^2.15.1' // Use React 18 compatible version
        };
    }

    fixRootPackageJson() {
        console.log('🔧 Fixing root package.json for React 18.x + Next.js 15.x compatibility...');
        
        const rootPackageJsonPath = path.join(this.baseDir, 'package.json');
        const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
        
        // Update to stable React 18.x versions
        rootPackageJson.dependencies.react = this.stableVersions.react;
        rootPackageJson.dependencies['react-dom'] = this.stableVersions['react-dom'];
        rootPackageJson.dependencies.next = this.stableVersions.next;
        
        // Fix MUI to use React 18 compatible versions
        if (rootPackageJson.dependencies['@mui/material']) {
            rootPackageJson.dependencies['@mui/material'] = this.stableVersions['@mui/material'];
        }
        if (rootPackageJson.dependencies['@mui/icons-material']) {
            rootPackageJson.dependencies['@mui/icons-material'] = this.stableVersions['@mui/icons-material'];
        }
        
        // Fix recharts to use React 18 compatible version
        if (rootPackageJson.dependencies.recharts) {
            rootPackageJson.dependencies.recharts = this.stableVersions.recharts;
        }
        
        // Update devDependencies
        rootPackageJson.devDependencies['@types/react'] = this.stableVersions['@types/react'];
        rootPackageJson.devDependencies['@types/react-dom'] = this.stableVersions['@types/react-dom'];
        rootPackageJson.devDependencies.eslint = this.stableVersions.eslint;
        rootPackageJson.devDependencies['eslint-config-next'] = this.stableVersions['eslint-config-next'];
        
        fs.writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));
        console.log('✅ Updated root package.json to stable React 18.x versions');
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

    fixActivityPackageJsons() {
        console.log('🔄 Fixing all activity package.json files...');
        
        const activities = this.findAllActivities();
        let fixedCount = 0;
        
        for (const activity of activities) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(activity.packageJsonPath, 'utf8'));
                let hasChanges = false;
                
                // Fix dependencies
                if (packageJson.dependencies) {
                    for (const [pkg, currentVersion] of Object.entries(packageJson.dependencies)) {
                        if (this.stableVersions[pkg] && this.stableVersions[pkg] !== currentVersion) {
                            packageJson.dependencies[pkg] = this.stableVersions[pkg];
                            hasChanges = true;
                        }
                    }
                }
                
                // Fix devDependencies
                if (packageJson.devDependencies) {
                    for (const [pkg, currentVersion] of Object.entries(packageJson.devDependencies)) {
                        if (this.stableVersions[pkg] && this.stableVersions[pkg] !== currentVersion) {
                            packageJson.devDependencies[pkg] = this.stableVersions[pkg];
                            hasChanges = true;
                        }
                    }
                }
                
                if (hasChanges) {
                    fs.writeFileSync(activity.packageJsonPath, JSON.stringify(packageJson, null, 2));
                    fixedCount++;
                }
                
            } catch (error) {
                console.error(`❌ Error fixing ${activity.route}:`, error.message);
            }
        }
        
        console.log(`✅ Fixed ${fixedCount} activity package.json files`);
        return { activitiesProcessed: activities.length, fixedCount };
    }

    async run() {
        try {
            console.log('🚀 Starting stable dependency fix (React 18.x + Next.js 15.x)...\n');
            
            this.fixRootPackageJson();
            const result = this.fixActivityPackageJsons();
            
            console.log('\n📊 STABLE DEPENDENCY FIX REPORT');
            console.log('=====================================');
            console.log(`✅ Activities processed: ${result.activitiesProcessed}`);
            console.log(`🔧 Activities fixed: ${result.fixedCount}`);
            console.log(`🎯 Target versions:`);
            console.log(`   • React: ${this.stableVersions.react}`);
            console.log(`   • React-DOM: ${this.stableVersions['react-dom']}`);
            console.log(`   • Next.js: ${this.stableVersions.next}`);
            console.log(`   • @types/react: ${this.stableVersions['@types/react']}`);
            console.log(`   • @types/react-dom: ${this.stableVersions['@types/react-dom']}`);
            
            console.log('\n💡 NEXT STEPS:');
            console.log('   1. Run: npm install --legacy-peer-deps');
            console.log('   2. Test activities to verify compatibility');
            console.log('   3. Fix any remaining peer dependency warnings');
            
            console.log('\n🎉 Stable dependency fix completed successfully!');
            
            return result;
            
        } catch (error) {
            console.error('💥 Stable fix failed:', error);
            process.exit(1);
        }
    }
}

async function main() {
    const fixer = new StableDependencyFixer();
    await fixer.run();
}

if (require.main === module) {
    main();
}

module.exports = { StableDependencyFixer };