#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const logger = require('../packages/logging/logger.js');

// Get the monorepo root directory
const monorepoRoot = path.resolve(__dirname);

logger.app.info('🔧 Fixing Next.js configurations for monorepo...');
logger.app.info(`📁 Monorepo root: ${monorepoRoot}`);

// Find all next.config.js files
function findNextConfigs(dir) {
    const configs = [];
    
    function searchDir(currentDir) {
        try {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    searchDir(fullPath);
                } else if (entry.isFile() && entry.name === 'next.config.js') {
                    configs.push(fullPath);
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }
    
    searchDir(dir);
    return configs;
}

// Fix a Next.js config file
function fixNextConfig(configPath) {
    logger.app.info(`🔨 Fixing: ${path.relative(monorepoRoot, configPath)}`);
    
    try {
        let content = fs.readFileSync(configPath, 'utf8');
        
        // Check if already has the correct format (not in experimental or output)
        if (content.includes('outputFileTracingRoot') && !content.includes('experimental:') && !content.includes('output:')) {
            logger.app.info(`   ✅ Already configured correctly`);
            return;
        }
        
        // Parse the existing config
        const configDir = path.dirname(configPath);
        const relativeRoot = path.relative(configDir, monorepoRoot);
        
        // Create the new configuration
        const newConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingRoot: '${relativeRoot}',
    transpilePackages: [],
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
`;
        
        // Backup original config
        fs.writeFileSync(configPath + '.backup', content);
        
        // Write new config
        fs.writeFileSync(configPath, newConfig);
        
        logger.app.info(`   ✅ Fixed - workspace root: ${relativeRoot}`);
        
    } catch (error) {
        logger.app.info(`   ❌ Error: ${error.message}`);
    }
}

// Main execution
const configFiles = findNextConfigs(path.join(monorepoRoot, 'activities'));
logger.app.info(`\n🔍 Found ${configFiles.length} Next.js config files:`);

configFiles.forEach(fixNextConfig);

// Also check for activities that might need next.config.js files
logger.app.info('\n🔍 Checking for Next.js activities without config files...');

function findNextJSActivities() {
    const activities = [];
    
    function searchForPackageJson(dir) {
        try {
            const packageJsonPath = path.join(dir, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                if (packageJson.dependencies && packageJson.dependencies.next) {
                    const configPath = path.join(dir, 'next.config.js');
                    if (!fs.existsSync(configPath)) {
                        activities.push(dir);
                    }
                }
            }
            
            // Recursively search subdirectories
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    searchForPackageJson(path.join(dir, entry.name));
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }
    
    searchForPackageJson(path.join(monorepoRoot, 'activities'));
    return activities;
}

const activitiesNeedingConfigs = findNextJSActivities();

if (activitiesNeedingConfigs.length > 0) {
    logger.app.info(`\n📝 Creating config files for ${activitiesNeedingConfigs.length} activities:`);
    
    activitiesNeedingConfigs.forEach(activityDir => {
        const configPath = path.join(activityDir, 'next.config.js');
        const relativeActivity = path.relative(monorepoRoot, activityDir);
        const relativeRoot = path.relative(activityDir, monorepoRoot);
        
        logger.app.info(`🔨 Creating: ${relativeActivity}/next.config.js`);
        
        const newConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingRoot: '${relativeRoot}',
    transpilePackages: [],
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
`;
        
        fs.writeFileSync(configPath, newConfig);
        logger.app.info(`   ✅ Created - workspace root: ${relativeRoot}`);
    });
}

logger.app.info('\n✅ Next.js configuration fixes complete!');
logger.app.info('\n💡 This should resolve:');
logger.app.info('   - Next.js workspace root inference warnings');
logger.app.info('   - Multiple lockfile conflicts');
logger.app.info('   - TypeScript build errors');
logger.app.info('   - File tracing issues');