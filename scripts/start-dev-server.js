#!/usr/bin/env node

/**
 * C4R Development Server Manager
 * Automatically starts development servers for activities with dynamic port assignment
 */

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class C4RDevManager {
    constructor() {
        this.runningServers = new Map();
        this.portCounter = 3001;
        this.baseDir = process.cwd();
    }

    async findActivityDirs() {
        const activityDirs = [];
        const searchDirs = [
            'activities/causality',
            'activities/randomization', 
            'activities/coding-practices',
            'activities/collaboration',
            'activities/tools',
            'templates'
        ];

        for (const searchDir of searchDirs) {
            const fullPath = path.join(this.baseDir, searchDir);
            if (fs.existsSync(fullPath)) {
                const subdirs = fs.readdirSync(fullPath);
                for (const subdir of subdirs) {
                    const activityPath = path.join(fullPath, subdir);
                    const packageJsonPath = path.join(activityPath, 'package.json');
                    
                    if (fs.existsSync(packageJsonPath)) {
                        activityDirs.push({
                            name: subdir,
                            path: activityPath,
                            domain: searchDir.split('/')[1] || 'tools'
                        });
                    }
                }
            }
        }

        return activityDirs;
    }

    async startActivity(activityPath, activityName, port) {
        return new Promise((resolve, reject) => {
            console.log(`🚀 Starting ${activityName} on port ${port}...`);
            
            // First install dependencies if needed
            const installProcess = spawn('npm', ['install'], {
                cwd: activityPath,
                stdio: 'pipe'
            });

            installProcess.on('close', (code) => {
                if (code === 0) {
                    // Start the dev server
                    const devProcess = spawn('npm', ['run', 'dev'], {
                        cwd: activityPath,
                        stdio: 'pipe',
                        env: { ...process.env, PORT: port.toString() }
                    });

                    this.runningServers.set(activityName, {
                        process: devProcess,
                        port: port,
                        path: activityPath
                    });

                    devProcess.stdout.on('data', (data) => {
                        console.log(`[${activityName}:${port}] ${data.toString().trim()}`);
                    });

                    devProcess.stderr.on('data', (data) => {
                        const output = data.toString().trim();
                        if (!output.includes('warn') && !output.includes('ready')) {
                            console.error(`[${activityName}:${port}] ${output}`);
                        }
                    });

                    devProcess.on('close', (code) => {
                        console.log(`❌ ${activityName} stopped (code ${code})`);
                        this.runningServers.delete(activityName);
                    });

                    setTimeout(() => {
                        resolve({ port, url: `http://localhost:${port}` });
                    }, 3000);
                } else {
                    reject(new Error(`Failed to install dependencies for ${activityName}`));
                }
            });
        });
    }

    async startAllActivities() {
        const activities = await this.findActivityDirs();
        console.log(`📦 Found ${activities.length} activities to start`);
        
        const startPromises = activities.map(async (activity) => {
            const port = this.portCounter++;
            try {
                await this.startActivity(activity.path, activity.name, port);
                return {
                    name: activity.name,
                    domain: activity.domain,
                    port: port,
                    url: `http://localhost:${port}`,
                    status: 'running'
                };
            } catch (error) {
                console.error(`❌ Failed to start ${activity.name}: ${error.message}`);
                return {
                    name: activity.name,
                    domain: activity.domain,
                    port: port,
                    status: 'failed',
                    error: error.message
                };
            }
        });

        const results = await Promise.all(startPromises);
        
        console.log('\n🎉 C4R Development Environment Ready!');
        console.log('=' .repeat(60));
        
        const byDomain = results.reduce((acc, activity) => {
            if (!acc[activity.domain]) acc[activity.domain] = [];
            acc[activity.domain].push(activity);
            return acc;
        }, {});

        Object.entries(byDomain).forEach(([domain, activities]) => {
            console.log(`\n📁 ${domain.toUpperCase()}`);
            activities.forEach(activity => {
                if (activity.status === 'running') {
                    console.log(`  ✅ ${activity.name.padEnd(30)} → ${activity.url}`);
                } else {
                    console.log(`  ❌ ${activity.name.padEnd(30)} → Failed: ${activity.error}`);
                }
            });
        });

        console.log(`\n🌐 Activity Browser: file://${path.join(this.baseDir, 'activity-browser.html')}`);
        console.log('\n💡 Press Ctrl+C to stop all servers');

        return results;
    }

    async stopAllActivities() {
        console.log('\n🛑 Stopping all activities...');
        
        for (const [name, server] of this.runningServers) {
            console.log(`  ⏹️  Stopping ${name}...`);
            server.process.kill();
        }
        
        this.runningServers.clear();
        console.log('✅ All activities stopped');
    }
}

// CLI interface
if (require.main === module) {
    const manager = new C4RDevManager();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'start':
        case 'dev':
            manager.startAllActivities().catch(console.error);
            break;
            
        case 'stop':
            manager.stopAllActivities().then(() => process.exit(0));
            break;
            
        case 'list':
            manager.findActivityDirs().then(activities => {
                console.log('\n📦 Available Activities:');
                activities.forEach((activity, index) => {
                    console.log(`  ${index + 1}. ${activity.name} (${activity.domain})`);
                });
            });
            break;
            
        default:
            console.log(`
🎓 C4R Development Server Manager

Usage:
  node scripts/start-dev-server.js <command>

Commands:
  start, dev    Start all activities with auto-assigned ports
  stop          Stop all running activities
  list          List all available activities

Examples:
  npm run dev:all          # Start all activities
  npm run dev:stop         # Stop all activities
  npm run dev:list         # List activities
            `);
    }

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        manager.stopAllActivities().then(() => {
            console.log('\n👋 Goodbye!');
            process.exit(0);
        });
    });
}

module.exports = C4RDevManager;