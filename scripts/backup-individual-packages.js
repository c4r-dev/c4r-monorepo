#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const logger = require('../packages/logging/logger.js');

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
                    const backupPath = path.join(this.backupDir, `${domain}__${activity}__package.json`);
                    fs.copyFileSync(packageJsonPath, backupPath);
                    backupCount++;
                }
            }
        }
        
        logger.app.info(`✅ Backed up ${backupCount} individual package.json files to ${this.backupDir}`);
    }
}

if (require.main === module) {
    const backup = new PackageBackup();
    backup.backup();
}

module.exports = { PackageBackup };