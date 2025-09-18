#!/usr/bin/env node

/**
 * C4R Unified Development Server
 * Serves all 91+ activities from a single Express server with shared dependencies
 * No more npm install hell!
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const chokidar = require('chokidar');
const next = require('next');
const logger = require('../packages/logging/logger.js');

class UnifiedC4RServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3333;
        this.activities = new Map();
        this.nextApps = new Map();
        this.baseDir = process.cwd();
        this.isReady = false;
    }

    async initialize() {
        logger.app.info('🚀 Initializing C4R Unified Development Server...');
        
        // Discover all activities
        await this.discoverActivities();
        
        // Set up middleware
        this.setupMiddleware();
        
        // Set up routes
        this.setupRoutes();
        
        // Start server
        await this.startServer();
        
        logger.app.info('\n🎉 C4R Unified Server Ready!');
        logger.app.info('=' .repeat(60));
        logger.app.info(`🌐 Main Dashboard: http://localhost:${this.port}`);
        logger.app.info(`📋 Activity Browser: http://localhost:${this.port}/browse`);
        logger.app.info('=' .repeat(60));
        
        this.printActivityMap();
    }

    async discoverActivities() {
        logger.app.info('🔍 Discovering activities...');
        
        const searchDirs = [
            'activities/causality',
            'activities/randomization', 
            'activities/coding-practices',
            'activities/collaboration',
            'activities/tools',
            'templates'
        ];

        let count = 0;
        for (const searchDir of searchDirs) {
            const fullPath = path.join(this.baseDir, searchDir);
            if (fs.existsSync(fullPath)) {
                const subdirs = fs.readdirSync(fullPath);
                for (const subdir of subdirs) {
                    const activityPath = path.join(fullPath, subdir);
                    const packageJsonPath = path.join(activityPath, 'package.json');
                    
                    if (fs.existsSync(packageJsonPath)) {
                        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                        const domain = searchDir.split('/')[1] || 'tools';
                        const route = `/${domain}/${subdir}`;
                        
                        this.activities.set(route, {
                            name: subdir,
                            path: activityPath,
                            domain: domain,
                            packageJson: packageJson,
                            type: this.detectFramework(packageJson),
                            route: route
                        });
                        count++;
                    }
                }
            }
        }
        
        logger.app.info(`📦 Found ${count} activities`);
    }

    detectFramework(packageJson) {
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (deps.next) return 'nextjs';
        if (deps['react-scripts']) return 'cra';
        if (deps.react) return 'react';
        if (deps.express) return 'express';
        return 'static';
    }

    setupMiddleware() {
        // Serve static files
        this.app.use('/assets', express.static(path.join(this.baseDir, 'assets')));
        
        // CORS for development
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });

        // Logging
        this.app.use((req, res, next) => {
            logger.app.info(`${new Date().toISOString()} ${req.method} ${req.url}`);
            next();
        });
    }

    setupRoutes() {
        // Main dashboard
        this.app.get('/', (req, res) => {
            res.send(this.generateDashboard());
        });

        // Activity browser
        this.app.get('/browse', (req, res) => {
            const browserPath = path.join(this.baseDir, 'activity-browser.html');
            if (fs.existsSync(browserPath)) {
                res.sendFile(browserPath);
            } else {
                res.send(this.generateSimpleBrowser());
            }
        });

        // API for activity list
        this.app.get('/api/activities', (req, res) => {
            const activitiesList = Array.from(this.activities.values()).map(activity => ({
                name: activity.name,
                domain: activity.domain,
                route: activity.route,
                type: activity.type,
                url: `http://localhost:${this.port}${activity.route}`
            }));
            res.json(activitiesList);
        });

        // Dynamic activity routes
        for (const [route, activity] of this.activities) {
            this.setupActivityRoute(route, activity);
        }

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).send(this.generate404Page(req.url));
        });
    }

    setupActivityRoute(route, activity) {
        if (activity.type === 'nextjs') {
            // For Next.js apps, create a proxy or serve build output
            this.app.use(route, (req, res, next) => {
                this.serveNextJSActivity(activity, req, res, next);
            });
        } else if (activity.type === 'cra') {
            // For Create React Apps, serve the build directory
            this.app.use(route, express.static(path.join(activity.path, 'build')));
        } else if (activity.type === 'static') {
            // For static apps, serve the directory
            this.app.use(route, express.static(activity.path));
        } else {
            // Generic handler
            this.app.use(route, express.static(activity.path));
        }
    }

    async serveNextJSActivity(activity, req, res, next) {
        try {
            // For now, serve a simple fallback instead of trying to run Next.js
            // This avoids the complex Next.js setup issues
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${activity.name}</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', sans-serif; 
                            max-width: 800px; 
                            margin: 2rem auto; 
                            padding: 2rem;
                            background: #f8f9fa;
                        }
                        .container { 
                            background: white; 
                            padding: 2rem; 
                            border-radius: 12px; 
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .title { color: #2c3e50; margin-bottom: 1rem; }
                        .info { background: #e3f2fd; padding: 1rem; border-radius: 6px; margin: 1rem 0; }
                        .actions { display: flex; gap: 1rem; margin-top: 2rem; }
                        .btn { 
                            padding: 10px 20px; 
                            border: none; 
                            border-radius: 6px; 
                            cursor: pointer; 
                            text-decoration: none;
                            display: inline-block;
                        }
                        .btn-primary { background: #3498db; color: white; }
                        .btn-secondary { background: #95a5a6; color: white; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="title">📱 ${activity.name}</h1>
                        <div class="info">
                            <strong>🔧 Development Mode</strong><br>
                            This Next.js activity is being served in simplified mode for the unified server.
                            For full functionality, you can run it individually.
                        </div>
                        
                        <p><strong>Path:</strong> <code>${activity.path}</code></p>
                        <p><strong>Type:</strong> ${activity.type}</p>
                        <p><strong>Domain:</strong> ${activity.domain}</p>
                        
                        <div class="info">
                            <strong>💡 To run this activity with full Next.js functionality:</strong><br>
                            <code>cd ${activity.path}</code><br>
                            <code>npm install</code><br>
                            <code>npm run dev</code>
                        </div>
                        
                        <div class="actions">
                            <a href="/" class="btn btn-primary">← Back to Dashboard</a>
                            <a href="/browse" class="btn btn-secondary">📋 Activity Browser</a>
                        </div>
                    </div>
                </body>
                </html>
            `);
            
        } catch (error) {
            logger.app.error(`❌ Error serving ${activity.name}:`, error.message);
            res.status(500).send(`
                <h1>Error Loading ${activity.name}</h1>
                <p>Error: ${error.message}</p>
                <p><a href="/">← Back to Dashboard</a></p>
            `);
        }
    }

    generateDashboard() {
        const activitiesByDomain = {};
        for (const activity of this.activities.values()) {
            if (!activitiesByDomain[activity.domain]) {
                activitiesByDomain[activity.domain] = [];
            }
            activitiesByDomain[activity.domain].push(activity);
        }

        const domainCards = Object.entries(activitiesByDomain).map(([domain, activities]) => {
            const domainInfo = this.getDomainInfo(domain);
            const activityList = activities.map(activity => 
                `<li><a href="${activity.route}" class="activity-link">${activity.name}</a> <span class="type-badge">${activity.type}</span></li>`
            ).join('');

            return `
                <div class="domain-card">
                    <h3>${domainInfo.icon} ${domainInfo.name}</h3>
                    <p>${activities.length} activities</p>
                    <ul class="activity-list">${activityList}</ul>
                </div>
            `;
        }).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>C4R Unified Development Server</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #f5f7fa; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; }
                    .container { max-width: 1200px; margin: 2rem auto; padding: 0 2rem; }
                    .domains { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
                    .domain-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .domain-card h3 { margin: 0 0 1rem 0; color: #2c3e50; }
                    .activity-list { list-style: none; padding: 0; margin: 0; }
                    .activity-list li { margin: 0.5rem 0; display: flex; justify-content: space-between; align-items: center; }
                    .activity-link { text-decoration: none; color: #3498db; font-weight: 500; }
                    .activity-link:hover { color: #2980b9; }
                    .type-badge { background: #ecf0f1; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
                    .stats { display: flex; gap: 2rem; justify-content: center; margin: 1rem 0; }
                    .stat { text-align: center; }
                    .stat-number { font-size: 2rem; font-weight: bold; display: block; }
                    .quick-actions { text-align: center; margin: 2rem 0; }
                    .btn { display: inline-block; padding: 12px 24px; margin: 0 1rem; background: #3498db; color: white; text-decoration: none; border-radius: 6px; }
                    .btn:hover { background: #2980b9; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎓 C4R Unified Development Server</h1>
                    <p>All ${this.activities.size} activities running from a single server!</p>
                    <div class="stats">
                        <div class="stat">
                            <span class="stat-number">${this.activities.size}</span>
                            <span>Activities</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${Object.keys(activitiesByDomain).length}</span>
                            <span>Domains</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">1</span>
                            <span>Server</span>
                        </div>
                    </div>
                </div>
                
                <div class="container">
                    <div class="quick-actions">
                        <a href="/browse" class="btn">📋 Activity Browser</a>
                        <a href="/api/activities" class="btn">🔗 API</a>
                    </div>
                    
                    <div class="domains">
                        ${domainCards}
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    generate404Page(url) {
        const suggestions = Array.from(this.activities.keys())
            .filter(route => route.includes(url.split('/')[1] || ''))
            .slice(0, 5);

        const suggestionList = suggestions.length > 0 
            ? suggestions.map(route => `<li><a href="${route}">${route}</a></li>`).join('')
            : '<li>No similar routes found</li>';

        return `
            <!DOCTYPE html>
            <html>
            <head><title>404 - Activity Not Found</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 2rem;">
                <h1>🔍 Activity Not Found</h1>
                <p>The route <code>${url}</code> doesn't exist.</p>
                <h3>Did you mean:</h3>
                <ul style="list-style: none; padding: 0;">${suggestionList}</ul>
                <p><a href="/">← Back to Dashboard</a></p>
            </body>
            </html>
        `;
    }

    getDomainInfo(domain) {
        const domainMap = {
            'causality': { name: 'Causality & Reasoning', icon: '🧠' },
            'randomization': { name: 'Randomization & Statistics', icon: '🎲' },
            'coding-practices': { name: 'Coding Practices', icon: '💻' },
            'collaboration': { name: 'Collaboration Tools', icon: '🤝' },
            'tools': { name: 'Tools & Utilities', icon: '🛠️' }
        };
        return domainMap[domain] || { name: domain, icon: '📁' };
    }

    printActivityMap() {
        const byDomain = {};
        for (const activity of this.activities.values()) {
            if (!byDomain[activity.domain]) byDomain[activity.domain] = [];
            byDomain[activity.domain].push(activity);
        }

        Object.entries(byDomain).forEach(([domain, activities]) => {
            logger.app.info(`\n📁 ${domain.toUpperCase()}`);
            activities.forEach(activity => {
                logger.app.info(`  → ${activity.route.padEnd(40)} (${activity.type})`);
            });
        });

        logger.app.info(`\n💡 All activities accessible via: http://localhost:${this.port}/[domain]/[activity-name]`);
        logger.app.info(`📱 Example: http://localhost:${this.port}/causality/jhu-flu-dag-v1`);
    }

    async startServer() {
        return new Promise((resolve) => {
            this.app.listen(this.port, () => {
                this.isReady = true;
                resolve();
            });
        });
    }

    async shutdown() {
        logger.app.info('\n🛑 Shutting down unified server...');
        
        // Close all Next.js apps
        for (const [route, nextApp] of this.nextApps) {
            try {
                await nextApp.close();
                logger.app.info(`  ✅ Closed ${route}`);
            } catch (error) {
                logger.app.info(`  ❌ Error closing ${route}: ${error.message}`);
            }
        }
        
        logger.app.info('👋 Server stopped');
        process.exit(0);
    }
}

// CLI interface
if (require.main === module) {
    const server = new UnifiedC4RServer();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        server.shutdown();
    });
    
    process.on('SIGTERM', () => {
        server.shutdown();
    });
    
    // Start the server
    server.initialize().catch(console.error);
}

module.exports = UnifiedC4RServer;