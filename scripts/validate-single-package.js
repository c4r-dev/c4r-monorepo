#!/usr/bin/env node

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
                issues.push(`Missing critical dependency: ${dep}`);
            }
        }
        
        // Check activities directory
        const activitiesDir = path.join(this.baseDir, 'activities');
        if (!fs.existsSync(activitiesDir)) {
            issues.push('Activities directory not found');
        }
        
        if (issues.length === 0) {
            logger.app.info('✅ Single package architecture validation passed');
            logger.app.info(`📊 Total activities: ${packageJson.c4rConfig?.totalActivities || 'Unknown'}`);
            logger.app.info(`📦 Total dependencies: ${Object.keys(packageJson.dependencies).length}`);
            logger.app.info(`🔧 Total devDependencies: ${Object.keys(packageJson.devDependencies).length}`);
        } else {
            logger.app.info('❌ Validation issues found:');
            issues.forEach(issue => logger.app.info(`   • ${issue}`));
        }
        
        return issues.length === 0;
    }
}

if (require.main === module) {
    const validator = new SinglePackageValidator();
    validator.validate();
}

module.exports = { SinglePackageValidator };