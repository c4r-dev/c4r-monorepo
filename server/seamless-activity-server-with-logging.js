#!/usr/bin/env node

/**
 * Enhanced Seamless C4R Activity Server with Comprehensive Logging
 * Optimized for 3-developer team + LLM analysis
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const logger = require('../packages/logging/logger');

class EnhancedSeamlessActivityServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3333;
        this.activities = new Map();
        this.nextApps = new Map();
        this.baseDir = process.cwd();
        this.startTime = Date.now();
        
        // Performance metrics
        this.metrics = {
            requestCount: 0,
            errorCount: 0,
            activitiesLoaded: 0,
            averageResponseTime: 0
        };
    }

    async initialize() {
        const initStart = Date.now();
        
        logger.app.info('Server initialization started', {
            event: 'server_init_start',
            port: this.port,
            baseDir: this.baseDir
        });
        
        try {
            await this.discoverActivities();
            this.setupMiddleware();
            this.setupRoutes();
            await this.startServer();
            
            const initDuration = Date.now() - initStart;
            logger.app.info('Server initialization completed', {
                event: 'server_init_complete',
                duration_ms: initDuration,
                activities_count: this.activities.size,
                port: this.port
            });
            
            this.printStartupSummary();
            
        } catch (error) {
            logger.llmError('server_initialization', error, 'server_startup');
            throw error;
        }
    }

    async discoverActivities() {
        const discoveryStart = Date.now();
        logger.app.info('Activity discovery started', { event: 'discovery_start' });
        
        const searchDirs = [
            'activities/causality',
            'activities/randomization', 
            'activities/coding-practices',
            'activities/collaboration',
            'activities/tools',
            'templates',
            'apps'
        ];

        let count = 0;
        for (const searchDir of searchDirs) {
            const fullPath = path.join(this.baseDir, searchDir);
            if (fs.existsSync(fullPath)) {
                logger.dev.debug('Searching directory', { 
                    directory: searchDir,
                    fullPath 
                });
                
                if (searchDir === 'apps') {
                    count += this.discoverNestedApps(fullPath);
                } else {
                    count += this.discoverDirectoryActivities(fullPath, searchDir);
                }
            }
        }
        
        const discoveryDuration = Date.now() - discoveryStart;
        logger.app.info('Activity discovery completed', {
            event: 'discovery_complete',
            duration_ms: discoveryDuration,
            activities_found: count
        });
        
        this.metrics.activitiesLoaded = count;
    }

    discoverDirectoryActivities(fullPath, searchDir) {
        let count = 0;
        const subdirs = fs.readdirSync(fullPath);
        
        for (const subdir of subdirs) {
            const activityPath = path.join(fullPath, subdir);
            
            if (subdir.startsWith('.') || !fs.statSync(activityPath).isDirectory()) {
                continue;
            }
            
            count += this.processActivityDirectory(activityPath, subdir, searchDir);
        }
        
        return count;
    }

    discoverNestedApps(appsPath) {
        let count = 0;
        const items = fs.readdirSync(appsPath);
        
        for (const item of items) {
            const itemPath = path.join(appsPath, item);
            
            if (item.startsWith('.') || !fs.statSync(itemPath).isDirectory()) {
                continue;
            }
            
            let type = this.detectFrameworkByStructure(itemPath);
            if (type !== 'unknown') {
                count += this.processActivityDirectory(itemPath, item, 'apps', 'apps');
            } else {
                // Search nested
                const nestedItems = fs.readdirSync(itemPath);
                for (const nestedItem of nestedItems) {
                    const nestedPath = path.join(itemPath, nestedItem);
                    
                    if (nestedItem.startsWith('.') || !fs.statSync(nestedPath).isDirectory()) {
                        continue;
                    }
                    
                    let nestedType = this.detectFrameworkByStructure(nestedPath);
                    if (nestedType !== 'unknown') {
                        if (item === 'activities') {
                            // Handle apps/activities/domain/activity structure
                            const domainItems = fs.readdirSync(nestedPath);
                            for (const activityItem of domainItems) {
                                const activityPath = path.join(nestedPath, activityItem);
                                
                                if (activityItem.startsWith('.') || !fs.statSync(activityPath).isDirectory()) {
                                    continue;
                                }
                                
                                let activityType = this.detectFrameworkByStructure(activityPath);
                                if (activityType !== 'unknown') {
                                    count += this.processActivityDirectory(activityPath, activityItem, `apps/${item}/${nestedItem}`, nestedItem);
                                }
                            }
                        } else {
                            count += this.processActivityDirectory(nestedPath, nestedItem, `apps/${item}`, item);
                        }
                    }
                }
            }
        }
        
        return count;
    }

    detectFrameworkByStructure(activityPath) {
        const detectionStart = Date.now();
        
        // Check for Next.js indicators
        if (fs.existsSync(path.join(activityPath, 'next.config.mjs')) ||
            fs.existsSync(path.join(activityPath, 'next.config.js')) ||
            fs.existsSync(path.join(activityPath, 'pages')) ||
            fs.existsSync(path.join(activityPath, 'app'))) {
            
            logger.frameworkDetection(activityPath, 'nextjs', {
                indicators: ['next.config', 'pages', 'app']
            });
            return 'nextjs';
        }
        
        // Check for Vite indicators
        if (fs.existsSync(path.join(activityPath, 'vite.config.js')) ||
            fs.existsSync(path.join(activityPath, 'vite.config.ts'))) {
            
            logger.frameworkDetection(activityPath, 'vite', {
                indicators: ['vite.config']
            });
            return 'vite';
        }
        
        // Check for Create React App indicators
        if (fs.existsSync(path.join(activityPath, 'build/static')) ||
            fs.existsSync(path.join(activityPath, 'public/manifest.json'))) {
            
            logger.frameworkDetection(activityPath, 'cra', {
                indicators: ['build/static', 'public/manifest.json']
            });
            return 'cra';
        }
        
        // Check for React indicators
        if (fs.existsSync(path.join(activityPath, 'src')) &&
            (fs.existsSync(path.join(activityPath, 'src/App.js')) ||
             fs.existsSync(path.join(activityPath, 'src/App.jsx')) ||
             fs.existsSync(path.join(activityPath, 'src/index.js')))) {
            
            logger.frameworkDetection(activityPath, 'react', {
                indicators: ['src/App.js', 'src/index.js']
            });
            return 'react';
        }
        
        // Check for static site indicators
        if (fs.existsSync(path.join(activityPath, 'index.html')) ||
            fs.existsSync(path.join(activityPath, 'public/index.html'))) {
            
            logger.frameworkDetection(activityPath, 'static', {
                indicators: ['index.html', 'public/index.html']
            });
            return 'static';
        }
        
        logger.dev.debug('Framework detection failed', {
            path: activityPath,
            event: 'framework_unknown'
        });
        
        return 'unknown';
    }

    processActivityDirectory(activityPath, activityName, searchDir, domain = null) {
        const processStart = Date.now();
        
        let type = this.detectFrameworkByStructure(activityPath);
        
        if (type === 'unknown') {
            type = 'static';
        }
        
        if (!type) {
            return 0;
        }
        
        // Handle domain and route
        let finalDomain, route;
        if (domain) {
            finalDomain = domain;
            route = `/${domain}/${activityName}`;
        } else if (searchDir === 'apps') {
            finalDomain = 'apps';
            route = `/apps/${activityName}`;
        } else {
            finalDomain = searchDir.split('/')[1] || 'tools';
            route = `/${finalDomain}/${activityName}`;
        }
        
        // Optional per-activity metadata
        let meta = null;
        const metaPath = path.join(activityPath, 'activity.config.json');
        if (fs.existsSync(metaPath)) {
            try {
                meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            } catch (error) {
                logger.dev.debug('Failed to parse activity metadata', {
                    path: metaPath,
                    error: error.message
                });
                meta = null;
            }
        }

        const finalType = meta?.forceType || type;

        this.activities.set(route, {
            name: activityName,
            path: activityPath,
            domain: finalDomain,
            type: finalType,
            route: route,
            meta
        });
        
        const processDuration = Date.now() - processStart;
        logger.activity.info('Activity registered', {
            name: activityName,
            route,
            type: finalType,
            domain: finalDomain,
            path: activityPath,
            duration_ms: processDuration,
            event: 'activity_registered'
        });
        
        return 1;
    }

    setupMiddleware() {
        // Request tracking middleware
        this.app.use(logger.requestTracker.bind(logger));
        
        // CORS
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });

        // Enhanced static asset handler with logging
        this.app.use('/_next', async (req, res, next) => {
            const assetStart = Date.now();
            const referer = req.headers.referer || '';
            
            logger.dev.debug('Static asset request', {
                url: req.url,
                referer,
                event: 'asset_request'
            });
            
            try {
                const urlObj = new URL(referer);
                const m = urlObj.pathname.match(/^\/([^\/]+)\/([^\/]+)/);
                if (m) {
                    const route = `/${m[1]}/${m[2]}`;
                    const activity = this.activities.get(route);
                    if (activity && activity.type === 'nextjs') {
                        const nextApp = await this.getOrCreateNextApp(activity);
                        if (nextApp) {
                            logger.dev.debug('Asset served by Next.js app', {
                                activity: activity.name,
                                url: req.url
                            });
                            return nextApp.getRequestHandler()(req, res);
                        }
                    }
                }
            } catch (error) {
                logger.dev.debug('Asset routing error', { 
                    error: error.message,
                    url: req.url 
                });
            }
            
            // Fallback asset search
            const assetPath = req.url.split('?')[0];
            for (const activity of this.activities.values()) {
                if (activity.type === 'nextjs') {
                    const relativePath = assetPath.replace(/^\/_next\/static\//, '');
                    const possiblePaths = [
                        path.join(activity.path, '.next', 'static', relativePath),
                        path.join(activity.path, 'out', '_next', 'static', relativePath),
                        path.join(activity.path, 'build', '_next', 'static', relativePath)
                    ];
                    
                    for (const filePath of possiblePaths) {
                        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                            const assetDuration = Date.now() - assetStart;
                            logger.perf.info('Static asset served', {
                                path: filePath,
                                activity: activity.name,
                                duration_ms: assetDuration,
                                event: 'asset_served'
                            });
                            
                            // Set headers
                            if (filePath.endsWith('.css')) {
                                res.setHeader('Content-Type', 'text/css');
                            } else if (filePath.endsWith('.js')) {
                                res.setHeader('Content-Type', 'application/javascript');
                            }
                            res.setHeader('Cache-Control', 'public, max-age=31536000');
                            
                            return res.sendFile(filePath);
                        }
                    }
                }
            }
            
            logger.dev.debug('Asset not found', { 
                url: req.url,
                event: 'asset_not_found' 
            });
            res.status(404).send('Asset not found');
        });
    }

    setupRoutes() {
        // Dashboard with metrics
        this.app.get('/', (req, res) => {
            res.send(this.generateEnhancedDashboard());
        });

        // Enhanced API endpoint
        this.app.get('/api/activities', (req, res) => {
            const activitiesList = Array.from(this.activities.values()).map(activity => ({
                name: activity.meta?.name || activity.name,
                domain: activity.domain,
                route: activity.route,
                type: activity.type,
                tech: activity.meta?.tech,
                status: activity.meta?.status,
                description: activity.meta?.description,
                url: `http://localhost:${this.port}${activity.route}`
            }));
            
            logger.app.info('API request served', {
                endpoint: '/api/activities',
                count: activitiesList.length,
                event: 'api_request'
            });
            
            res.json({
                activities: activitiesList,
                metrics: this.getMetrics(),
                timestamp: new Date().toISOString()
            });
        });

        // Metrics endpoint for monitoring
        this.app.get('/api/metrics', (req, res) => {
            res.json(this.getMetrics());
        });

        // Logs endpoint for LLM analysis
        this.app.get('/api/logs/:type?', (req, res) => {
            const logType = req.params.type || 'app';
            const logPath = path.join(logger.logDir, `${logType}.jsonl`);
            
            if (fs.existsSync(logPath)) {
                const logs = fs.readFileSync(logPath, 'utf8')
                    .split('\n')
                    .filter(line => line.trim())
                    .slice(-100) // Last 100 entries
                    .map(line => JSON.parse(line));
                
                res.json({ logs, count: logs.length });
            } else {
                res.status(404).json({ error: 'Log file not found' });
            }
        });

        // Browser logging endpoints
        this.app.post('/api/browser-logs', express.json(), (req, res) => {
            const browserLog = req.body;
            const requestId = req.headers['x-request-id'] || res.locals.requestId;
            
            // Write to browser.jsonl log file
            logger.browser.info('Browser event', {
                ...browserLog,
                serverRequestId: requestId,
                event: 'browser_event',
                userAgent: req.headers['user-agent'],
                ip: req.ip,
                correlationId: browserLog.sessionId
            });
            
            res.json({ status: 'logged', requestId });
        });

        this.app.post('/api/browser-logs/batch', express.json(), (req, res) => {
            const { logs } = req.body;
            const requestId = req.headers['x-request-id'] || res.locals.requestId;
            
            logs.forEach(browserLog => {
                logger.browser.info('Browser event (batch)', {
                    ...browserLog,
                    serverRequestId: requestId,
                    event: 'browser_event_batch',
                    userAgent: req.headers['user-agent'],
                    ip: req.ip,
                    correlationId: browserLog.sessionId
                });
            });
            
            res.json({ status: 'logged', count: logs.length, requestId });
        });

        // Dynamic activity routes
        for (const [route, activity] of this.activities) {
            this.setupSeamlessActivityRoute(route, activity);
        }

        // 404 handler
        this.app.use((req, res) => {
            logger.app.warn('404 Not Found', {
                url: req.url,
                method: req.method,
                event: '404'
            });
            res.status(404).send(this.generate404Page(req.url));
        });
    }

    setupSeamlessActivityRoute(route, activity) {
        logger.app.info('Setting up route', {
            route,
            activity: activity.name,
            type: activity.type,
            event: 'route_setup'
        });

        if (activity.type === 'nextjs') {
            // Next.js specific routing with enhanced logging
            this.app.use(`${route}/_next`, async (req, res) => {
                try {
                    const nextApp = await this.getOrCreateNextApp(activity);
                    return nextApp.getRequestHandler()(req, res);
                } catch (error) {
                    logger.llmError('nextjs_asset_handler', error, 'asset_request', {
                        activity: activity.name,
                        url: req.url
                    });
                    res.status(404).end();
                }
            });

            this.app.use(route, async (req, res, next) => {
                try {
                    logger.activityStart(activity.name, {
                        route,
                        url: req.url,
                        method: req.method
                    });
                    
                    const nextApp = await this.getOrCreateNextApp(activity);
                    return nextApp.getRequestHandler()(req, res);
                } catch (error) {
                    logger.llmError('nextjs_request_handler', error, 'page_request', {
                        activity: activity.name,
                        url: req.url
                    });
                    this.serveStaticFallback(activity, req, res, next);
                }
            });
            return;
        }

        // Non-Next activities
        this.app.use(route, (req, res, next) => {
            logger.activityStart(activity.name, {
                route,
                url: req.url,
                method: req.method
            });
            this.serveActivitySeamlessly(activity, req, res, next);
        });
    }

    async getOrCreateNextApp(activity) {
        const activityKey = activity.name;
        
        if (this.nextApps.has(activityKey)) {
            return this.nextApps.get(activityKey);
        }
        
        const initStart = Date.now();
        
        try {
            logger.app.info('Initializing Next.js app', {
                activity: activity.name,
                path: activity.path,
                event: 'nextjs_init_start'
            });
            
            const originalCwd = process.cwd();
            process.chdir(activity.path);
            
            try {
                const next = require('next');
                
                const nextApp = next({
                    dev: true,
                    dir: activity.path,
                    quiet: false,
                    hostname: 'localhost',
                    port: null,
                    customServer: true,
                    conf: {
                        webpack: (config, { isServer, dev }) => {
                            config.resolve.modules = [
                                path.join(__dirname, '..', 'node_modules'),
                                path.join(activity.path, 'node_modules'),
                                'node_modules'
                            ];
                            
                            config.resolve.symlinks = false;
                            
                            if (!isServer) {
                                const activityName = path.basename(activity.path);
                                config.output.chunkFilename = `static/chunks/${activityName}-[name]-[contenthash].js`;
                                config.output.filename = `static/chunks/${activityName}-[name]-[contenthash].js`;
                            }
                            
                            config.resolve.fallback = {
                                ...config.resolve.fallback,
                                fs: false,
                                path: false,
                                os: false,
                                crypto: false,
                                stream: false,
                                http: false,
                                https: false,
                                zlib: false,
                                url: false
                            };
                            
                            return config;
                        }
                    }
                });
                
                await nextApp.prepare();
                
                const initDuration = Date.now() - initStart;
                logger.nextjsInit(activity.name, true, initDuration, {
                    path: activity.path
                });
                
                this.nextApps.set(activityKey, nextApp);
                return nextApp;
                
            } finally {
                process.chdir(originalCwd);
            }
            
        } catch (error) {
            const initDuration = Date.now() - initStart;
            logger.nextjsInit(activity.name, false, initDuration, {
                error: error.message,
                path: activity.path
            });
            
            return null;
        }
    }

    serveStaticFallback(activity, req, res, next) {
        logger.dev.debug('Serving static fallback', {
            activity: activity.name,
            url: req.url,
            event: 'static_fallback'
        });
        
        // Implementation continues...
        const fallbackHTML = this.generateActivityFallback(activity);
        res.send(fallbackHTML);
    }

    getMetrics() {
        const uptime = Date.now() - this.startTime;
        return {
            ...this.metrics,
            uptime_ms: uptime,
            uptime_formatted: this.formatDuration(uptime),
            timestamp: new Date().toISOString()
        };
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    generateEnhancedDashboard() {
        const metrics = this.getMetrics();
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>C4R Enhanced Activity Server</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #f5f7fa; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; }
                    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem; }
                    .metric-card { background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .metric-value { font-size: 2rem; font-weight: bold; color: #3498db; }
                    .logs-section { margin: 2rem; padding: 1rem; background: white; border-radius: 8px; }
                    .log-link { display: inline-block; margin: 0.5rem; padding: 0.5rem 1rem; background: #3498db; color: white; text-decoration: none; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🚀 C4R Enhanced Activity Server</h1>
                    <p>Comprehensive logging • LLM-ready • Developer-friendly</p>
                </div>
                
                <div class="metrics">
                    <div class="metric-card">
                        <div class="metric-value">${metrics.activitiesLoaded}</div>
                        <div>Activities Loaded</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${metrics.requestCount}</div>
                        <div>Total Requests</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${metrics.errorCount}</div>
                        <div>Errors</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${metrics.uptime_formatted}</div>
                        <div>Uptime</div>
                    </div>
                </div>
                
                <div class="logs-section">
                    <h3>📊 Log Analysis</h3>
                    <a href="/api/logs/app" class="log-link">Application Logs</a>
                    <a href="/api/logs/errors" class="log-link">Error Logs</a>
                    <a href="/api/logs/performance" class="log-link">Performance Logs</a>
                    <a href="/api/logs/activities" class="log-link">Activity Logs</a>
                    <a href="/api/metrics" class="log-link">Live Metrics</a>
                </div>
            </body>
            </html>
        `;
    }

    generateActivityFallback(activity) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${activity.name} - Fallback Mode</title>
                <style>
                    body { font-family: sans-serif; padding: 2rem; text-align: center; }
                    .container { max-width: 600px; margin: 0 auto; }
                    .status { color: #f39c12; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🏗️ ${activity.name}</h1>
                    <div class="status">⚠️ Fallback Mode</div>
                    <p>Activity: ${activity.route}</p>
                    <p>Type: ${activity.type}</p>
                    <p><a href="/">← Dashboard</a></p>
                </div>
            </body>
            </html>
        `;
    }

    generate404Page(url) {
        return `
            <!DOCTYPE html>
            <html>
            <head><title>404 - Not Found</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 2rem;">
                <h1>🔍 Not Found</h1>
                <p>Route <code>${url}</code> not found</p>
                <p><a href="/">← Dashboard</a></p>
            </body>
            </html>
        `;
    }

    printStartupSummary() {
        logger.app.info('\n🎉 Enhanced C4R Server Ready!');
        logger.app.info('=' .repeat(60));
        logger.app.info(`🌐 Dashboard: http://localhost:${this.port}`);
        logger.app.info(`📊 Metrics: http://localhost:${this.port}/api/metrics`);
        logger.app.info(`📋 API: http://localhost:${this.port}/api/activities`);
        logger.app.info(`📁 Logs Directory: ${logger.logDir}`);
        logger.app.info('=' .repeat(60));
    }

    async startServer() {
        return new Promise((resolve) => {
            const http = require('http');
            this.server = http.createServer(this.app);
            
            this.server.listen(this.port, () => {
                resolve();
            });
        });
    }
}

// CLI interface
if (require.main === module) {
    const server = new EnhancedSeamlessActivityServer();
    
    process.on('SIGINT', () => {
        logger.app.info('Server shutdown initiated', { event: 'shutdown' });
        logger.app.info('\n🛑 Shutting down server...');
        process.exit(0);
    });
    
    server.initialize().catch(error => {
        logger.llmError('server_startup', error, 'server_initialization');
        logger.app.error(error);
    });
}

module.exports = EnhancedSeamlessActivityServer;