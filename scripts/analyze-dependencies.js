#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class DependencyAnalyzer {
    constructor() {
        this.baseDir = process.cwd();
        this.activities = [];
        this.allDependencies = new Map();
        this.conflictingDependencies = new Map();
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

    analyzeDependencies() {
        console.log('🔍 Analyzing dependencies across all activities...');
        
        this.activities = this.findAllActivities();
        console.log(`📦 Found ${this.activities.length} activities with package.json files\n`);
        
        // Read root dependencies
        const rootPackageJson = JSON.parse(fs.readFileSync(path.join(this.baseDir, 'package.json'), 'utf8'));
        const rootDeps = { ...rootPackageJson.dependencies, ...rootPackageJson.devDependencies };
        
        console.log('📋 Root package.json dependencies:');
        Object.entries(rootDeps).forEach(([pkg, version]) => {
            console.log(`   ${pkg}: ${version}`);
        });
        console.log('');
        
        // Analyze each activity
        for (const activity of this.activities) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(activity.packageJsonPath, 'utf8'));
                const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
                
                activity.dependencies = deps;
                
                // Track all dependency versions
                Object.entries(deps).forEach(([pkg, version]) => {
                    if (!this.allDependencies.has(pkg)) {
                        this.allDependencies.set(pkg, new Set());
                    }
                    this.allDependencies.get(pkg).add(`${version} (${activity.route})`);
                });
                
            } catch (error) {
                console.error(`❌ Error reading package.json for ${activity.route}:`, error.message);
                activity.dependencies = {};
            }
        }
    }

    findConflicts() {
        console.log('🔍 Identifying dependency version conflicts...\n');
        
        // Find packages with multiple versions
        for (const [pkg, versions] of this.allDependencies.entries()) {
            if (versions.size > 1) {
                this.conflictingDependencies.set(pkg, versions);
            }
        }
        
        console.log(`⚠️ Found ${this.conflictingDependencies.size} packages with version conflicts:`);
        
        for (const [pkg, versions] of this.conflictingDependencies.entries()) {
            console.log(`\n📦 ${pkg}:`);
            for (const versionInfo of versions) {
                console.log(`   ${versionInfo}`);
            }
        }
    }

    findCriticalConflicts() {
        console.log('\n🚨 Critical React/Next.js ecosystem conflicts:\n');
        
        const criticalPackages = ['react', 'react-dom', 'next', '@types/react', '@types/react-dom'];
        const criticalConflicts = [];
        
        for (const pkg of criticalPackages) {
            if (this.conflictingDependencies.has(pkg)) {
                criticalConflicts.push([pkg, this.conflictingDependencies.get(pkg)]);
            }
        }
        
        if (criticalConflicts.length === 0) {
            console.log('✅ No critical React/Next.js version conflicts found');
        } else {
            for (const [pkg, versions] of criticalConflicts) {
                console.log(`🔥 CRITICAL: ${pkg}`);
                for (const versionInfo of versions) {
                    console.log(`   ${versionInfo}`);
                }
                console.log('');
            }
        }
        
        return criticalConflicts;
    }

    generateReport(failingActivities = []) {
        console.log('\n' + '='.repeat(80));
        console.log('📊 DEPENDENCY ANALYSIS REPORT');
        console.log('='.repeat(80));
        
        console.log(`\n📈 SUMMARY:`);
        console.log(`   • Total activities analyzed: ${this.activities.length}`);
        console.log(`   • Unique packages found: ${this.allDependencies.size}`);
        console.log(`   • Packages with conflicts: ${this.conflictingDependencies.size}`);
        
        if (failingActivities.length > 0) {
            console.log(`   • Failing activities provided: ${failingActivities.length}`);
            
            console.log('\n🔍 FAILING ACTIVITIES DEPENDENCY ANALYSIS:\n');
            
            const failingActivityData = this.activities.filter(activity => 
                failingActivities.some(failing => 
                    failing.route === activity.route || 
                    failing.name === activity.name ||
                    failing === activity.route ||
                    failing === activity.name
                )
            );
            
            if (failingActivityData.length === 0) {
                console.log('⚠️ No matching failing activities found in dependency data');
            } else {
                for (const activity of failingActivityData) {
                    console.log(`📋 ${activity.route}:`);
                    
                    if (Object.keys(activity.dependencies).length === 0) {
                        console.log('   No dependencies found');
                    } else {
                        Object.entries(activity.dependencies).forEach(([pkg, version]) => {
                            const hasConflict = this.conflictingDependencies.has(pkg);
                            const marker = hasConflict ? '⚠️' : '✅';
                            console.log(`   ${marker} ${pkg}: ${version}`);
                        });
                    }
                    console.log('');
                }
            }
        }
        
        const criticalConflicts = this.findCriticalConflicts();
        
        console.log('\n💡 RECOMMENDATIONS:');
        
        if (criticalConflicts.length > 0) {
            console.log('   1. 🔥 URGENT: Resolve React/Next.js version conflicts first');
            console.log('   2. 📦 Consider upgrading all activities to use consistent React/Next.js versions');
            console.log('   3. 🔧 Update root package.json to enforce compatible versions');
        } else {
            console.log('   1. ✅ React/Next.js versions appear compatible');
            console.log('   2. 🔍 Focus on other dependency conflicts for specific failing activities');
        }
        
        console.log('   4. 🧪 Test activities individually after dependency updates');
        console.log('   5. 📋 Consider using exact versions (no ^ or ~) for critical packages');
        
        return {
            totalActivities: this.activities.length,
            totalPackages: this.allDependencies.size,
            conflictingPackages: this.conflictingDependencies.size,
            criticalConflicts: criticalConflicts.length,
            conflicts: Object.fromEntries(this.conflictingDependencies),
            failingActivitiesAnalyzed: failingActivities.length
        };
    }
}

async function main() {
    const analyzer = new DependencyAnalyzer();
    
    try {
        analyzer.analyzeDependencies();
        analyzer.findConflicts();
        
        // If failing activities are provided as command line arguments
        const failingActivities = process.argv.slice(2);
        
        const report = analyzer.generateReport(failingActivities);
        
        // Save detailed report to file
        const reportPath = path.join(analyzer.baseDir, 'dependency-analysis-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            ...report,
            detailedConflicts: Object.fromEntries(analyzer.conflictingDependencies),
            allActivities: analyzer.activities.map(a => ({
                route: a.route,
                dependencies: a.dependencies
            }))
        }, null, 2));
        
        console.log(`\n💾 Detailed report saved to: ${reportPath}`);
        
    } catch (error) {
        console.error('💥 Analysis failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { DependencyAnalyzer };