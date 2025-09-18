#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class RelativePathFixer {
    constructor() {
        this.baseDir = process.cwd();
        this.fixedCount = 0;
    }

    findActivitiesWithRelativePaths() {
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
                const nextConfigPath = path.join(activityPath, 'next.config.js');
                
                if (fs.existsSync(nextConfigPath)) {
                    const configContent = fs.readFileSync(nextConfigPath, 'utf8');
                    
                    // Check for relative outputFileTracingRoot paths without path.join
                    if (configContent.includes("outputFileTracingRoot: '../../..") ||
                        configContent.includes('outputFileTracingRoot: "../../..') ||
                        configContent.includes("outputFileTracingRoot: '../..") ||
                        configContent.includes('outputFileTracingRoot: "../..')) {
                        
                        activities.push({
                            name: activityName,
                            domain,
                            path: activityPath,
                            nextConfigPath,
                            route: `/${domain}/${activityName}`
                        });
                    }
                }
            }
        }
        
        return activities;
    }

    fixRelativePath(activity) {
        const configPath = activity.nextConfigPath;
        
        try {
            logger.app.info(`🔧 Fixing relative path: ${activity.route}`);
            
            let configContent = fs.readFileSync(configPath, 'utf8');
            
            // Add path import if not present
            if (!configContent.includes('const path = require') && !configContent.includes('import path from')) {
                configContent = configContent.replace(
                    /\/\*\* @type \{import\('next'\)\.NextConfig\} \*\//,
                    `/** @type {import('next').NextConfig} */\nconst path = require('path');\n`
const logger = require('../packages/logging/logger.js');
                );
            }
            
            // Replace relative paths with absolute ones using path.join
            configContent = configContent.replace(
                /outputFileTracingRoot:\s*['"`]\.\.\/\.\.\/\.\.['"`]/g,
                'outputFileTracingRoot: path.join(__dirname, \'../../..\')'
            );
            
            configContent = configContent.replace(
                /outputFileTracingRoot:\s*['"`]\.\.\/\.\.['"`]/g,
                'outputFileTracingRoot: path.join(__dirname, \'../..\')'
            );
            
            fs.writeFileSync(configPath, configContent);
            logger.app.info(`   ✅ Fixed: ${configPath}`);
            this.fixedCount++;
            
        } catch (error) {
            logger.app.error(`   ❌ Error fixing ${activity.route}:`, error.message);
        }
    }

    async fixAllPaths() {
        logger.app.info('🔍 Finding activities with relative outputFileTracingRoot paths...');
        
        const activities = this.findActivitiesWithRelativePaths();
        logger.app.info(`📦 Found ${activities.length} activities with relative path issues\n`);
        
        if (activities.length === 0) {
            logger.app.info('✅ No relative path issues found!');
            return;
        }

        logger.app.info('🔧 Fixing relative paths...\n');
        
        for (const activity of activities) {
            this.fixRelativePath(activity);
        }
        
        logger.app.info(`\n🎉 Fixed ${this.fixedCount} Next.js configurations!`);
        logger.app.info('\n📋 Summary of fixed activities:');
        activities.forEach(activity => {
            logger.app.info(`   • ${activity.route}`);
        });
    }
}

async function main() {
    const fixer = new RelativePathFixer();
    await fixer.fixAllPaths();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { RelativePathFixer };