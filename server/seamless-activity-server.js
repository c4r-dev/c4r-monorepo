#!/usr/bin/env node

/**
 * Seamless C4R Activity Server
 * Serves all activities as if they were part of a single Next.js app
 * NO individual npm installs required!
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { exec } = require('child_process');
const { promisify } = require('util');
const logger = require('../packages/logging/logger');

const execAsync = promisify(exec);

class SeamlessActivityServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3333;
        this.activities = new Map();
        this.nextApps = new Map();
        this.baseDir = process.cwd();
        this.sharedDeps = new Map();
        
        // Fix memory leak warnings
        process.setMaxListeners(100);
        require('events').EventEmitter.defaultMaxListeners = 100;
    }

    async initialize() {
        const initStart = Date.now();
        logger.app.info('Server initialization started', {
            event: 'server_init_start',
            port: this.port
        });
        logger.app.info('🚀 Initializing Seamless C4R Activity Server...');
        
        // Discover all activities
        await this.discoverActivities();
        
        // Set up shared module resolution
        this.setupSharedModules();
        
        // Set up middleware
        this.setupMiddleware();
        
        // Set up routes
        this.setupRoutes();
        
        // Start server
        await this.startServer();
        
        const initDuration = Date.now() - initStart;
        logger.app.info('Server initialization completed', {
            event: 'server_init_complete',
            duration_ms: initDuration,
            activities_count: this.activities.size
        });
        
        logger.app.info('\n🎉 Seamless C4R Server Ready!');
        logger.app.info('=' .repeat(60));
        logger.app.info(`🌐 Dashboard: http://localhost:${this.port}`);
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
            'templates',
            'apps'
        ];

        let count = 0;
        for (const searchDir of searchDirs) {
            const fullPath = path.join(this.baseDir, searchDir);
            if (fs.existsSync(fullPath)) {
                if (searchDir === 'apps') {
                    // Special handling for apps directory - search recursively but carefully
                    count += this.discoverNestedApps(fullPath);
                } else {
                    // Regular search for other directories
                    const subdirs = fs.readdirSync(fullPath);
                    for (const subdir of subdirs) {
                        const activityPath = path.join(fullPath, subdir);
                        
                        // Check if this is a valid activity directory (skip hidden directories)
                        if (subdir.startsWith('.') || !fs.statSync(activityPath).isDirectory()) {
                            continue;
                        }
                        
                        count += this.processActivityDirectory(activityPath, subdir, searchDir);
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

    detectFrameworkByStructure(activityPath) {
        // Check for Next.js indicators
        if (fs.existsSync(path.join(activityPath, 'next.config.mjs')) ||
            fs.existsSync(path.join(activityPath, 'next.config.js')) ||
            fs.existsSync(path.join(activityPath, 'pages')) ||
            fs.existsSync(path.join(activityPath, 'app'))) {
            return 'nextjs';
        }
        
        // Check for Create React App indicators
        if (fs.existsSync(path.join(activityPath, 'build/static')) ||
            fs.existsSync(path.join(activityPath, 'public/manifest.json'))) {
            return 'cra';
        }
        
        // Check for React indicators
        if (fs.existsSync(path.join(activityPath, 'src')) &&
            (fs.existsSync(path.join(activityPath, 'src/App.js')) ||
             fs.existsSync(path.join(activityPath, 'src/App.jsx')) ||
             fs.existsSync(path.join(activityPath, 'src/index.js')))) {
            return 'react';
        }
        
        // Check for static site indicators
        if (fs.existsSync(path.join(activityPath, 'index.html')) ||
            fs.existsSync(path.join(activityPath, 'public/index.html'))) {
            return 'static';
        }
        
        return 'unknown';
    }

    discoverNestedApps(appsPath) {
        let count = 0;
        const items = fs.readdirSync(appsPath);
        
        for (const item of items) {
            const itemPath = path.join(appsPath, item);
            
            // Skip hidden directories and files
            if (item.startsWith('.') || !fs.statSync(itemPath).isDirectory()) {
                continue;
            }
            
            // First check if this directory itself is an activity
            let type = this.detectFrameworkByStructure(itemPath);
            if (type !== 'unknown') {
                // This is a direct app activity
                count += this.processActivityDirectory(itemPath, item, 'apps', 'apps');
            } else {
                // This might be a domain directory, search one level deeper
                const nestedItems = fs.readdirSync(itemPath);
                for (const nestedItem of nestedItems) {
                    const nestedPath = path.join(itemPath, nestedItem);
                    
                    // Skip hidden directories and files
                    if (nestedItem.startsWith('.') || !fs.statSync(nestedPath).isDirectory()) {
                        continue;
                    }
                    
                    // Check if this nested directory is an activity
                    let nestedType = this.detectFrameworkByStructure(nestedPath);
                    if (nestedType !== 'unknown') {
                        // This is a nested app activity
                        if (item === 'activities') {
                            // For apps/activities/domain/activity, we need to go one level deeper
                            // nestedItem is the domain (causality, randomization, etc.)
                            // We need to look inside this domain for actual activities
                            const domainItems = fs.readdirSync(nestedPath);
                            for (const activityItem of domainItems) {
                                const activityPath = path.join(nestedPath, activityItem);
                                
                                // Skip hidden directories and files
                                if (activityItem.startsWith('.') || !fs.statSync(activityPath).isDirectory()) {
                                    continue;
                                }
                                
                                // Check if this is an activity
                                let activityType = this.detectFrameworkByStructure(activityPath);
                                if (activityType !== 'unknown') {
                                    // Use the domain (nestedItem) as the final domain
                                    count += this.processActivityDirectory(activityPath, activityItem, `apps/${item}/${nestedItem}`, nestedItem);
                                }
                            }
                        } else {
                            // For other nested apps, use the parent directory as domain
                            count += this.processActivityDirectory(nestedPath, nestedItem, `apps/${item}`, item);
                        }
                    } else if (item === 'activities') {
                        // This is a domain directory under apps/activities/, search for activities inside
                        const domainItems = fs.readdirSync(nestedPath);
                        for (const activityItem of domainItems) {
                            const activityPath = path.join(nestedPath, activityItem);
                            
                            // Skip hidden directories and files
                            if (activityItem.startsWith('.') || !fs.statSync(activityPath).isDirectory()) {
                                continue;
                            }
                            
                            // Check if this is an activity
                            let activityType = this.detectFrameworkByStructure(activityPath);
                            if (activityType !== 'unknown') {
                                // Use the domain (nestedItem) as the final domain
                                count += this.processActivityDirectory(activityPath, activityItem, `apps/${item}/${nestedItem}`, nestedItem);
                            }
                        }
                    }
                }
            }
        }
        
        return count;
    }

    processActivityDirectory(activityPath, activityName, searchDir, domain = null) {
        // Detect framework by file structure
        let type = this.detectFrameworkByStructure(activityPath);
        
        // Treat unknown structures as static so they still mount
        if (type === 'unknown') {
            type = 'static';
        }
        
        if (!type) {
            return 0;
        }
        
        // Handle domain and route
        let finalDomain, route;
        if (domain) {
            // Use provided domain (for nested apps)
            finalDomain = domain;
            route = `/${domain}/${activityName}`;
        } else if (searchDir === 'apps') {
            // Direct app
            finalDomain = 'apps';
            route = `/apps/${activityName}`;
        } else {
            // Regular activity
            finalDomain = searchDir.split('/')[1] || 'tools';
            route = `/${finalDomain}/${activityName}`;
        }
        
        // Optional per-activity metadata
        let meta = null;
        const metaPath = path.join(activityPath, 'activity.config.json');
        if (fs.existsSync(metaPath)) {
            try {
                meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            } catch (_) {
                meta = null;
            }
        }

        // Respect optional forced type (e.g., serve as static demo)
        const finalType = meta?.forceType || type;

        this.activities.set(route, {
            name: activityName,
            path: activityPath,
            domain: finalDomain,
            packageJson: null, // No individual package.json in single-package architecture
            type: finalType,
            route: route,
            meta
        });
        
        return 1;
    }

    setupSharedModules() {
        // Create a shared require cache for all activities
        const originalRequire = require;
        const sharedNodeModules = path.join(this.baseDir, 'node_modules');
        
        // Extend module paths to include our shared node_modules
        process.env.NODE_PATH = `${sharedNodeModules}:${process.env.NODE_PATH || ''}`;
        require('module')._initPaths();
    }

    setupMiddleware() {
        // Request tracking middleware (replaces simple console.log)
        this.app.use(logger.requestTracker.bind(logger));
        
        // Enable CORS
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });

        // Serve static assets from shared location
        this.app.use('/assets', express.static(path.join(this.baseDir, 'assets')));
        
        // Serve favicon from public directory
        this.app.get('/favicon.ico', (req, res) => {
            const faviconPath = path.join(this.baseDir, 'public', 'favicon.ico');
            if (fs.existsSync(faviconPath)) {
                res.sendFile(faviconPath);
            } else {
                res.status(404).send('Favicon not found');
            }
        });

        // Global handler for root-level /_next requests in dev
        // Use the request Referer to route to the correct Next app instance
        this.app.use('/_next', async (req, res, next) => {
            const referer = req.headers.referer || '';
            try {
                const urlObj = new URL(referer);
                const m = urlObj.pathname.match(/^\/([^\/]+)\/([^\/]+)/);
                if (m) {
                    const route = `/${m[1]}/${m[2]}`;
                    const activity = this.activities.get(route);
                    if (activity && activity.type === 'nextjs') {
                        const nextApp = await this.getOrCreateNextApp(activity);
                        if (nextApp) {
                            return nextApp.getRequestHandler()(req, res);
                        }
                    }
                }
            } catch (_) {
                // ignore parse errors and fall back below
            }
            // Fallback: try to find a matching static asset among activities
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
                            logger.app.info(`📄 Serving static asset: ${assetPath} from ${filePath}`);
                            
                            // Set appropriate MIME type and cache headers
                            if (filePath.endsWith('.css')) {
                                res.setHeader('Content-Type', 'text/css');
                            } else if (filePath.endsWith('.js')) {
                                res.setHeader('Content-Type', 'application/javascript');
                            } else if (filePath.endsWith('.woff2')) {
                                res.setHeader('Content-Type', 'font/woff2');
                            } else if (filePath.endsWith('.woff')) {
                                res.setHeader('Content-Type', 'font/woff');
                            }
                            res.setHeader('Cache-Control', 'public, max-age=31536000');
                            
                            return res.sendFile(filePath);
                        }
                    }
                }
            }
            res.status(404).send('Asset not found');
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
                name: activity.meta?.name || activity.name,
                domain: activity.domain,
                route: activity.route,
                type: activity.type,
                tech: activity.meta?.tech,
                status: activity.meta?.status,
                description: activity.meta?.description,
                url: `http://localhost:${this.port}${activity.route}`
            }));
            res.json(activitiesList);
        });

        // Add debugging middleware to see all requests
        this.app.use((req, res, next) => {
            if (req.url.includes('_next')) {
                logger.app.info(`🔍 REQUEST DEBUG: ${req.method} ${req.url} (referer: ${req.get('Referer') || 'none'})`);
            }
            next();
        });

        // Global /_next handler for Next.js static assets (browser requests without activity path)
        this.app.use('/_next', (req, res) => {
            try {
                logger.app.info(`🎯 GLOBAL /_next HANDLER HIT: ${req.originalUrl}`);
                
                // Extract activity route from Referer header
                const referer = req.get('Referer');
                if (!referer) {
                    logger.app.info(`❌ No referer for /_next request: ${req.originalUrl}`);
                    return res.status(404).send('Asset not found - no referer');
                }

                // Parse the referer to get the activity route
                const refererUrl = new URL(referer);
                const activityRoute = refererUrl.pathname;
                
                // Find the activity for this route
                const activity = this.activities.get(activityRoute);
                if (!activity) {
                    logger.app.info(`❌ No activity found for route: ${activityRoute} (from referer: ${referer})`);
                    return res.status(404).send('Asset not found - no matching activity');
                }

                logger.app.info(`🔗 Global /_next handler: ${req.originalUrl} -> ${activity.name} (from ${activityRoute})`);
                
                // Serve the static asset using the activity's asset handler
                this.serveActivityStaticAsset(activity, req, res);
                
            } catch (e) {
                logger.app.error(`❌ Global /_next handler error:`, e.message);
                res.status(404).send('Asset not found');
            }
        });

        // Dynamic activity routes
        for (const [route, activity] of this.activities) {
            this.setupSeamlessActivityRoute(route, activity);
        }

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).send(this.generate404Page(req.url));
        });
    }

    setupSeamlessActivityRoute(route, activity) {
        logger.app.info(`🔗 Setting up seamless route: ${route}`);
        
        // Log structured route setup
        logger.app.info('Setting up activity route', {
            route,
            activity: activity.name,
            type: activity.type,
            domain: activity.domain,
            event: 'route_setup'
        });

        if (activity.type === 'nextjs') {
            // Dedicated Next.js static asset handler for this activity
            this.app.use(`${route}/_next`, (req, res) => {
                try {
                    this.serveActivityStaticAsset(activity, req, res);
                } catch (e) {
                    logger.app.error(`❌ Next asset handler error for ${activity.name}:`, e.message);
                    res.status(404).end();
                }
            });

            this.app.use(route, async (req, res, next) => {
                try {
                    const nextApp = await this.getOrCreateNextApp(activity);
                    // Mounted at route, so req.url is relative to the activity root already
                    return nextApp.getRequestHandler()(req, res);
                } catch (e) {
                    logger.app.error(`❌ Next request handler error for ${activity.name}:`, e.message);
                    this.serveStaticFallback(activity, req, res, next);
                }
            });
            return;
        }

        // Non-Next activities
        this.app.use(route, (req, res, next) => {
            this.serveActivitySeamlessly(activity, req, res, next);
        });
    }

    serveActivityStaticAsset(activity, req, res, next) {
        // Clean the asset path (remove query parameters)
        const assetPath = req.url.split('?')[0];
        logger.app.info(`🔍 Looking for static asset: ${assetPath} for activity: ${activity.name}`);
        
        // Extract the relative path after /_next/static/
        const relativePath = assetPath.replace(/^\/_next\/static\//, '');
        
        // Try different possible locations for the static asset in THIS activity only
        const possiblePaths = [
            // Standard Next.js static directory - correct path construction
            path.join(activity.path, '.next', 'static', relativePath),
            // Development mode paths - Next.js in dev mode uses /development/ subdirectory
            path.join(activity.path, '.next', 'static', 'development', relativePath),
            path.join(activity.path, '.next', 'static', 'production', relativePath),
            // Alternative patterns for different build modes
            path.join(activity.path, 'out', '_next', 'static', relativePath),
            path.join(activity.path, 'build', '_next', 'static', relativePath),
            // Development mode fallbacks
            path.join(activity.path, '.next', assetPath.replace('/_next/', ''))
        ];
        
        for (const filePath of possiblePaths) {
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                logger.app.info(`✅ Found static asset: ${filePath} for activity: ${activity.name}`);
                
                // Set appropriate MIME type and cache headers
                if (filePath.endsWith('.js')) {
                    res.setHeader('Content-Type', 'application/javascript');
                } else if (filePath.endsWith('.css')) {
                    res.setHeader('Content-Type', 'text/css');
                } else if (filePath.endsWith('.svg')) {
                    res.setHeader('Content-Type', 'image/svg+xml');
                } else if (filePath.endsWith('.woff') || filePath.endsWith('.woff2')) {
                    res.setHeader('Content-Type', 'font/woff');
                } else if (filePath.endsWith('.ttf')) {
                    res.setHeader('Content-Type', 'font/ttf');
                } else if (filePath.endsWith('.png')) {
                    res.setHeader('Content-Type', 'image/png');
                } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
                    res.setHeader('Content-Type', 'image/jpeg');
                }
                
                // Add cache headers for better performance
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                
                res.sendFile(filePath);
                return;
            }
        }
        
        logger.app.info(`❌ Static asset not found: ${assetPath} for activity: ${activity.name}`);
        // If not found, return 404
        res.status(404).send(`Static asset not found: ${assetPath}`);
    }

    async serveActivitySeamlessly(activity, req, res, next) {
        try {
            const activityPath = activity.path;
            const url = req.url === '/' ? '/index.html' : req.url;
            
            // Try to serve the activity content intelligently
            if (activity.type === 'nextjs') {
                await this.serveNextJSSeamlessly(activity, req, res, next);
            } else if (activity.type === 'cra') {
                await this.serveCRASeamlessly(activity, req, res, next);
            } else if (activity.type === 'react') {
                await this.serveReactSeamlessly(activity, req, res, next);
            } else {
                // Static or unknown - serve files directly
                const filePath = path.join(activityPath, url);
                if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                    return res.sendFile(filePath);
                }
                // Try public/index.html
                const publicIndex = path.join(activityPath, 'public', 'index.html');
                if (fs.existsSync(publicIndex)) {
                    return res.sendFile(publicIndex);
                }
                // Try root index.html
                const indexPath = path.join(activityPath, 'index.html');
                if (fs.existsSync(indexPath)) {
                    return res.sendFile(indexPath);
                }
                next();
            }
        } catch (error) {
            logger.app.error(`❌ Error serving ${activity.name}:`, error.message);
            res.status(500).send(this.generateActivityErrorPage(activity, error));
        }
    }

    async serveNextJSSeamlessly(activity, req, res, next) {
        try {
            // Get or create Next.js app instance for this activity
            const nextApp = await this.getOrCreateNextApp(activity);
            
            if (!nextApp) {
                logger.app.error(`❌ Failed to initialize Next.js app for ${activity.name}`);
                this.serveStaticFallback(activity, req, res, next);
                return;
            }
            
            // Rewrite URL so Next.js treats the activity route as its root
            const originalUrl = req.url;
            if (originalUrl.startsWith(activity.route)) {
                req.url = originalUrl.slice(activity.route.length) || '/';
            } else if (!originalUrl.startsWith('/_next')) {
                // For direct hit to the route without trailing slash
                req.url = '/';
            }
            // Mark forwarded prefix for awareness
            req.headers['x-forwarded-prefix'] = activity.route;
            
            await nextApp.getRequestHandler()(req, res);
            
        } catch (error) {
            logger.app.error(`❌ Error serving Next.js app ${activity.name}:`, error.message);
            this.serveStaticFallback(activity, req, res, next);
        }
    }

    async getOrCreateNextApp(activity) {
        const activityKey = activity.name;
        
        // Return cached app if already created
        if (this.nextApps.has(activityKey)) {
            return this.nextApps.get(activityKey);
        }
        
        try {
            logger.app.info(`🚀 Initializing Next.js app: ${activity.name}`);
            
            // Change to activity directory to ensure correct workspace root inference
            const originalCwd = process.cwd();
            process.chdir(activity.path);
            
            try {
                // Dynamically import Next.js
                const next = require('next');
                
                // Create Next.js app instance with proper configuration
                const nextApp = next({
                    dev: true, // Enable development mode
                    dir: activity.path, // Point to activity directory
                    quiet: false,
                    hostname: 'localhost',
                    port: null, // Don't bind to a specific port since we're using custom server
                    customServer: true,
                    conf: {
                        // Set assetPrefix to include activity route for seamless serving
                        assetPrefix: activity.route,
                        
                        // Webpack configuration for shared dependencies
                        webpack: (config, { isServer, dev }) => {
                            // Set proper resolve paths for shared dependencies
                            config.resolve.modules = [
                                path.join(__dirname, '..', 'node_modules'),
                                path.join(activity.path, 'node_modules'),
                                'node_modules'
                            ];
                            
                            // Ensure consistent module resolution
                            config.resolve.symlinks = false;
                            
                            // Prevent webpack chunk conflicts between activities
                            if (!isServer) {
                                // Use activity-specific chunk names to prevent conflicts
                                const activityName = path.basename(activity.path);
                                config.output.chunkFilename = `static/chunks/${activityName}-[name]-[contenthash].js`;
                                config.output.filename = `static/chunks/${activityName}-[name]-[contenthash].js`;
                                
                                // Configure publicPath to include the activity route
                                config.output.publicPath = `${activity.route}/_next/`;
                            }
                            
                            // Add fallbacks for Node.js modules in browser
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
                
                // Prepare the Next.js app
                await nextApp.prepare();
                
                logger.app.info(`✅ Next.js app ready: ${activity.name}`);
                
                // Cache the app instance
                this.nextApps.set(activityKey, nextApp);
                
                return nextApp;
                
            } finally {
                // Always restore original working directory
                process.chdir(originalCwd);
            }
            
        } catch (error) {
            logger.app.error(`❌ Failed to initialize Next.js app ${activity.name}:`, error.message);
            
            // If Next.js fails, try to serve as static export
            const outDir = path.join(activity.path, 'out');
            if (fs.existsSync(outDir)) {
                logger.app.info(`📁 Falling back to static export for ${activity.name}`);
                return null; // Will trigger static fallback
            }
            
            // Try to build static export
            try {
                logger.app.info(`🔨 Building static export for ${activity.name}...`);
                await this.buildStaticExport(activity);
                return null; // Will serve from static export
            } catch (buildError) {
                logger.app.error(`❌ Static export build failed for ${activity.name}:`, buildError.message);
                return null;
            }
        }
    }

    async buildStaticExport(activity) {
        const originalCwd = process.cwd();
        
        try {
            // Change to activity directory
            process.chdir(activity.path);
            
            // Build static export
            await execAsync('npm run build && npm run export', {
                timeout: 120000, // 2 minutes timeout
                env: { 
                    ...process.env,
                    NODE_PATH: path.join(this.baseDir, 'node_modules'),
                    NODE_ENV: 'production'
                }
            });
            
            logger.app.info(`✅ Static export built for ${activity.name}`);
            
        } finally {
            // Always restore original directory
            process.chdir(originalCwd);
        }
    }

    generateNextJSBootstrap(activity) {
        // Generate a basic Next.js runtime page that loads the built app
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${activity.name} - C4R Activity</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" href="/_next/static/css/app/layout.css">
                <link rel="stylesheet" href="/_next/static/css/app/page.css">
            </head>
            <body>
                <div id="__next">
                    <div style="padding: 2rem; text-align: center;">
                        <h1>🚀 ${activity.name}</h1>
                        <p>Loading Next.js application...</p>
                    </div>
                </div>
                <script src="/_next/static/chunks/webpack.js"></script>
                <script src="/_next/static/chunks/main-app.js"></script>
                <script src="/_next/static/chunks/app-pages-internals.js"></script>
                <script src="/_next/static/chunks/app/page.js"></script>
            </body>
            </html>
        `;
    }

    serveStaticFallback(activity, req, res, next) {
        const activityPath = activity.path;
        const url = req.url === '/' ? 'index.html' : req.url;
        
        // Try common static file locations
        const possiblePaths = [
            path.join(activityPath, 'public', url),
            path.join(activityPath, 'build', url), 
            path.join(activityPath, url),
            path.join(activityPath, 'dist', url)
        ];
        
        for (const filePath of possiblePaths) {
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                res.sendFile(filePath);
                return;
            }
        }
        
        // If no static files found, serve a basic page
        const fallbackHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${activity.meta?.name || activity.name} - C4R Activity</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: sans-serif; padding: 2rem; text-align: center; }
                    .container { max-width: 600px; margin: 0 auto; }
                    .status { color: #f39c12; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🏗️ ${activity.meta?.name || activity.name}</h1>
                    <div class="status">⚠️ This activity is being served in fallback mode</div>
                    <p>${activity.meta?.description || 'The activity may need to be built or configured for the unified server.'}</p>
                    <p><strong>Domain:</strong> ${activity.domain}</p>
                    <p><strong>Tech:</strong> ${activity.meta?.tech || activity.type}</p>
                    <p><strong>Path:</strong> <code>${activity.path}</code></p>
                    <div style="margin-top: 2rem;">
                        <a href="/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">← Dashboard</a>
                    </div>
                </div>
            </body>
            </html>
        `;
        res.send(fallbackHTML);
    }

    async buildNextJSApp(activity) {
        const activityPath = activity.path;
        logger.app.info(`🔨 Building Next.js app: ${activity.name}`);
        
        try {
            const { execSync } = require('child_process');
            
            // Try to build with static export first
            const nextConfigPath = path.join(activityPath, 'next.config.mjs');
            let buildCommand = 'npm run build';
            
            // In single-package architecture, always use npx next build
            buildCommand = 'npx next build';
            
            // Set environment to use shared node_modules
            const env = {
                ...process.env,
                NODE_PATH: path.join(this.baseDir, 'node_modules'),
                NODE_ENV: 'production'
            };
            
            execSync(buildCommand, {
                cwd: activityPath,
                stdio: 'pipe',
                timeout: 120000, // 2 minute timeout
                env: env
            });
            
            logger.app.info(`✅ Built ${activity.name} successfully`);
            
            // Try to create static export if not already done
            try {
                execSync('npx next export', {
                    cwd: activityPath,
                    stdio: 'pipe',
                    timeout: 60000,
                    env: env
                });
                logger.app.info(`✅ Exported ${activity.name} to static files`);
            } catch (exportError) {
                logger.app.info(`⚠️  Static export failed for ${activity.name}, serving build output`);
            }
            
        } catch (error) {
            logger.app.error(`❌ Build failed for ${activity.name}:`, error.message);
            throw error;
        }
    }

    async serveCRASeamlessly(activity, req, res, next) {
        const activityPath = activity.path;
        const buildDir = path.join(activityPath, 'build');
        const publicDir = path.join(activityPath, 'public');
        
        // Try built version first
        if (fs.existsSync(buildDir)) {
            const filePath = path.join(buildDir, req.url === '/' ? 'index.html' : req.url);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                res.sendFile(filePath);
                return;
            }
        }
        
        // Fall back to public directory
        if (fs.existsSync(publicDir)) {
            const filePath = path.join(publicDir, req.url === '/' ? 'index.html' : req.url);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                res.sendFile(filePath);
                return;
            }
        }
        
        // Generate a basic wrapper
        const activityHTML = this.generateCRAWrapper(activity);
        res.send(activityHTML);
    }

    async serveReactSeamlessly(activity, req, res, next) {
        const activityPath = activity.path;
        const publicDir = path.join(activityPath, 'public');
        const srcDir = path.join(activityPath, 'src');
        
        // Try to serve from public first
        if (fs.existsSync(publicDir)) {
            const filePath = path.join(publicDir, req.url === '/' ? 'index.html' : req.url);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                res.sendFile(filePath);
                return;
            }
        }
        
        // Generate a basic React wrapper
        const activityHTML = this.generateReactWrapper(activity);
        res.send(activityHTML);
    }

    generateNextJSWrapper(activity) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${activity.name} - C4R Activity</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', sans-serif; 
                        margin: 0; 
                        padding: 20px;
                        background: #f8f9fa;
                    }
                    .activity-container { 
                        max-width: 1200px; 
                        margin: 0 auto; 
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        padding: 2rem;
                    }
                    .activity-header {
                        border-bottom: 2px solid #e9ecef;
                        padding-bottom: 1rem;
                        margin-bottom: 2rem;
                    }
                    .activity-title { 
                        color: #2c3e50; 
                        margin: 0 0 0.5rem 0; 
                        font-size: 1.8rem;
                    }
                    .activity-meta { 
                        color: #6c757d; 
                        display: flex; 
                        gap: 1rem; 
                        flex-wrap: wrap;
                    }
                    .content-area {
                        min-height: 400px;
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 2rem;
                        text-align: center;
                    }
                    .status { 
                        color: #28a745; 
                        font-weight: bold; 
                    }
                    .instructions {
                        background: #d1ecf1;
                        border: 1px solid #bee5eb;
                        border-radius: 6px;
                        padding: 1rem;
                        margin: 1rem 0;
                    }
                    .nav-buttons {
                        display: flex;
                        gap: 1rem;
                        margin-top: 2rem;
                    }
                    .btn {
                        padding: 10px 20px;
                        border: none;
                        border-radius: 6px;
                        text-decoration: none;
                        font-weight: 500;
                        cursor: pointer;
                    }
                    .btn-primary { background: #007bff; color: white; }
                    .btn-secondary { background: #6c757d; color: white; }
                </style>
            </head>
            <body>
                <div class="activity-container">
                    <div class="activity-header">
                        <h1 class="activity-title">📱 ${activity.name}</h1>
                        <div class="activity-meta">
                            <span><strong>Domain:</strong> ${activity.domain}</span>
                            <span><strong>Type:</strong> ${activity.type}</span>
                            <span class="status">✅ Seamlessly Served</span>
                        </div>
                    </div>
                    
                    <div class="content-area">
                        <h2>🚀 Activity Loading...</h2>
                        <p>This ${activity.type} activity is being served seamlessly through the unified C4R server.</p>
                        
                        <div class="instructions">
                            <strong>🔧 Technical Details:</strong><br>
                            • Using shared dependencies from root node_modules<br>
                            • No individual npm install required<br>
                            • Served via unified development server<br>
                            • Path: <code>${activity.path}</code>
                        </div>
                        
                        <p><em>For this demo, we're showing the activity metadata. In a full implementation, 
                        the actual Next.js app would be rendered here using server-side rendering or 
                        client-side hydration with shared dependencies.</em></p>
                    </div>
                    
                    <div class="nav-buttons">
                        <a href="/" class="btn btn-primary">← Dashboard</a>
                        <a href="/browse" class="btn btn-secondary">📋 Browse Activities</a>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    generateCRAWrapper(activity) {
        return this.generateNextJSWrapper(activity).replace('Next.js', 'Create React App');
    }

    generateReactWrapper(activity) {
        return this.generateNextJSWrapper(activity).replace('Next.js', 'React');
    }

    generateActivityErrorPage(activity, error) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error - ${activity.name}</title>
                <style>
                    body { font-family: monospace; padding: 2rem; background: #2d3748; color: #fed7d7; }
                    .container { max-width: 800px; margin: 0 auto; }
                    .title { color: #f6e05e; margin-bottom: 1rem; }
                    .error { background: #4a5568; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
                    .actions { margin-top: 2rem; }
                    .btn { background: #4299e1; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="title">❌ Error Loading Activity: ${activity.name}</h1>
                    <div class="error">
                        <strong>Error:</strong> ${error.message}<br>
                        <strong>Path:</strong> ${activity.path}<br>
                        <strong>Type:</strong> ${activity.type}
                    </div>
                    <div class="actions">
                        <a href="/" class="btn">← Back to Dashboard</a>
                    </div>
                </div>
            </body>
            </html>
        `;
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
                    <p>${activities.length} activities • <span class="seamless">Seamlessly Served</span></p>
                    <ul class="activity-list">${activityList}</ul>
                </div>
            `;
        }).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>C4R Seamless Activity Server</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #f5f7fa; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; }
                    .container { max-width: 1200px; margin: 2rem auto; padding: 0 2rem; }
                    .domains { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
                    .domain-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .domain-card h3 { margin: 0 0 1rem 0; color: #2c3e50; }
                    .seamless { color: #28a745; font-weight: bold; font-size: 0.9rem; }
                    .activity-list { list-style: none; padding: 0; margin: 0; }
                    .activity-list li { margin: 0.5rem 0; display: flex; justify-content: space-between; align-items: center; }
                    .activity-link { text-decoration: none; color: #3498db; font-weight: 500; }
                    .activity-link:hover { color: #2980b9; }
                    .type-badge { background: #e8f5e8; color: #2d5a3d; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
                    .stats { display: flex; gap: 2rem; justify-content: center; margin: 1rem 0; }
                    .stat { text-align: center; }
                    .stat-number { font-size: 2rem; font-weight: bold; display: block; }
                    .quick-actions { text-align: center; margin: 2rem 0; }
                    .btn { display: inline-block; padding: 12px 24px; margin: 0 1rem; background: #3498db; color: white; text-decoration: none; border-radius: 6px; }
                    .btn:hover { background: #2980b9; }
                    .hero-text { font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.9; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎓 C4R Seamless Activity Server</h1>
                    <p class="hero-text">All activities served seamlessly - no individual setup required!</p>
                    <div class="stats">
                        <div class="stat">
                            <span class="stat-number">${this.activities.size}</span>
                            <span>Activities</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">1</span>
                            <span>npm install</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">0</span>
                            <span>Setup Required</span>
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
        return `
            <!DOCTYPE html>
            <html>
            <head><title>404 - Activity Not Found</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 2rem;">
                <h1>🔍 Activity Not Found</h1>
                <p>The route <code>${url}</code> doesn't exist in the seamless server.</p>
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
                logger.app.info(`  → ${activity.route.padEnd(40)} ✅ seamless`);
            });
        });

        logger.app.info(`\n🎉 All ${this.activities.size} activities served seamlessly!`);
        logger.app.info(`💡 No individual npm install required`);
    }

    async startServer() {
        return new Promise((resolve) => {
            const http = require('http');
            this.server = http.createServer(this.app);
            
            // Set up WebSocket upgrade handling at the server level
            this.server.on('upgrade', (request, socket, head) => {
                // Extract activity name from request URL
                const url = new URL(request.url, `http://${request.headers.host}`);
                const routeMatch = url.pathname.match(/^\/([^\/]+)\/([^\/]+)/);
                
                if (routeMatch) {
                    const [, category, activityName] = routeMatch;
                    const activity = this.activities.get(`/${category}/${activityName}`);
                    
                    if (activity && this.nextApps.has(activity.name)) {
                        const nextApp = this.nextApps.get(activity.name);
                        if (nextApp && nextApp.getUpgradeHandler) {
                            try {
                                nextApp.getUpgradeHandler()(request, socket, head);
                                return;
                            } catch (error) {
                                logger.app.error(`❌ WebSocket upgrade error for ${activity.name}:`, error.message);
                            }
                        }
                    }
                }
                
                // Close socket if no handler found
                socket.destroy();
            });
            
            this.server.listen(this.port, () => {
                resolve();
            });
        });
    }
}

// CLI interface
if (require.main === module) {
    const server = new SeamlessActivityServer();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        logger.app.info('\n🛑 Shutting down seamless server...');
        process.exit(0);
    });
    
    // Start the server
    server.initialize().catch(console.error);
}

module.exports = SeamlessActivityServer;
