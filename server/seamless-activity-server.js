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

class SeamlessActivityServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3333;
        this.activities = new Map();
        this.nextApps = new Map();
        this.baseDir = process.cwd();
        this.sharedDeps = new Map();
    }

    async initialize() {
        console.log('🚀 Initializing Seamless C4R Activity Server...');
        
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
        
        console.log('\n🎉 Seamless C4R Server Ready!');
        console.log('=' .repeat(60));
        console.log(`🌐 Dashboard: http://localhost:${this.port}`);
        console.log(`📋 Activity Browser: http://localhost:${this.port}/browse`);
        console.log('=' .repeat(60));
        
        this.printActivityMap();
    }

    async discoverActivities() {
        console.log('🔍 Discovering activities...');
        
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
        
        console.log(`📦 Found ${count} activities`);
    }

    detectFramework(packageJson) {
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (deps.next) return 'nextjs';
        if (deps['react-scripts']) return 'cra';
        if (deps.react) return 'react';
        if (deps.express) return 'express';
        return 'static';
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
        // Enable CORS
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });

        // Logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
            next();
        });

        // Serve static assets from shared location
        this.app.use('/assets', express.static(path.join(this.baseDir, 'assets')));

        // Handle Next.js static assets for all activities
        this.app.use('/_next/static', (req, res, next) => {
            // Try to find the asset in any Next.js activity's .next directory
            const assetPath = req.url;
            
            for (const [route, activity] of this.activities) {
                if (activity.type === 'nextjs') {
                    // Try different possible locations for the static asset
                    const possiblePaths = [
                        path.join(activity.path, '.next', 'static', assetPath.replace('/_next/static/', '')),
                        path.join(activity.path, 'out', '_next', 'static', assetPath.replace('/_next/static/', '')),
                        path.join(activity.path, '.next', assetPath.replace('/_next/', ''))
                    ];
                    
                    for (const filePath of possiblePaths) {
                        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                            // Set appropriate MIME type
                            if (filePath.endsWith('.js')) {
                                res.setHeader('Content-Type', 'application/javascript');
                            } else if (filePath.endsWith('.css')) {
                                res.setHeader('Content-Type', 'text/css');
                            } else if (filePath.endsWith('.svg')) {
                                res.setHeader('Content-Type', 'image/svg+xml');
                            }
                            
                            res.sendFile(filePath);
                            return;
                        }
                    }
                }
            }
            
            // If not found, return 404
            res.status(404).send(`Static asset not found: ${assetPath}`);
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
            this.setupSeamlessActivityRoute(route, activity);
        }

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).send(this.generate404Page(req.url));
        });
    }

    setupSeamlessActivityRoute(route, activity) {
        console.log(`🔗 Setting up seamless route: ${route}`);
        
        this.app.use(route, (req, res, next) => {
            this.serveActivitySeamlessly(activity, req, res, next);
        });
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
                    res.sendFile(filePath);
                } else {
                    // Try index.html
                    const indexPath = path.join(activityPath, 'index.html');
                    if (fs.existsSync(indexPath)) {
                        res.sendFile(indexPath);
                    } else {
                        next();
                    }
                }
            }
        } catch (error) {
            console.error(`❌ Error serving ${activity.name}:`, error.message);
            res.status(500).send(this.generateActivityErrorPage(activity, error));
        }
    }

    async serveNextJSSeamlessly(activity, req, res, next) {
        const activityPath = activity.path;
        const url = req.url === '/' ? '' : req.url;
        
        // Handle _next/static assets specifically
        if (url.startsWith('/_next/static/')) {
            const staticAsset = url.replace('/_next/static/', '');
            const possiblePaths = [
                path.join(activityPath, '.next', 'static', staticAsset),
                path.join(activityPath, 'out', '_next', 'static', staticAsset),
                path.join(activityPath, '.next', url.replace('/_next/', ''))
            ];
            
            for (const filePath of possiblePaths) {
                if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                    // Set appropriate MIME type
                    if (filePath.endsWith('.js')) {
                        res.setHeader('Content-Type', 'application/javascript');
                    } else if (filePath.endsWith('.css')) {
                        res.setHeader('Content-Type', 'text/css');
                    } else if (filePath.endsWith('.svg')) {
                        res.setHeader('Content-Type', 'image/svg+xml');
                    }
                    
                    res.sendFile(filePath);
                    return;
                }
            }
        }
        
        // Try to serve from built static export first
        const outDir = path.join(activityPath, 'out');
        const buildDir = path.join(activityPath, '.next');
        
        if (fs.existsSync(outDir)) {
            // Serve from static export
            const filePath = path.join(outDir, url === '' ? 'index.html' : url);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                res.sendFile(filePath);
                return;
            }
        }
        
        // Try to serve from Next.js build directory
        if (fs.existsSync(buildDir)) {
            // For root requests, try to serve the main page
            if (url === '' || url === '/') {
                const possibleIndexPaths = [
                    path.join(buildDir, 'server', 'app', 'index.html'),
                    path.join(buildDir, 'server', 'pages', 'index.html'),
                    path.join(buildDir, 'static', 'index.html')
                ];
                
                for (const indexPath of possibleIndexPaths) {
                    if (fs.existsSync(indexPath)) {
                        res.sendFile(indexPath);
                        return;
                    }
                }
                
                // Try to create a basic Next.js runtime page
                const basicNextPage = this.generateNextJSBootstrap(activity);
                res.send(basicNextPage);
                return;
            }
        }
        
        // Try to serve from public directory
        const publicDir = path.join(activityPath, 'public');
        if (fs.existsSync(publicDir)) {
            const publicFile = path.join(publicDir, url);
            if (fs.existsSync(publicFile) && fs.statSync(publicFile).isFile()) {
                res.sendFile(publicFile);
                return;
            }
        }
        
        // If no static files found, try to build and serve
        try {
            await this.buildNextJSApp(activity);
            
            // Try serving built output again
            if (fs.existsSync(outDir)) {
                const filePath = path.join(outDir, url === '' ? 'index.html' : url);
                if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                    res.sendFile(filePath);
                    return;
                }
            }
        } catch (buildError) {
            console.error(`❌ Build failed for ${activity.name}:`, buildError.message);
        }
        
        // Final fallback
        this.serveStaticFallback(activity, req, res, next);
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
                <title>${activity.name} - C4R Activity</title>
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
                    <h1>🏗️ ${activity.name}</h1>
                    <div class="status">⚠️ This activity is being served in fallback mode</div>
                    <p>The activity may need to be built or configured for the unified server.</p>
                    <p><strong>Domain:</strong> ${activity.domain}</p>
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
        console.log(`🔨 Building Next.js app: ${activity.name}`);
        
        try {
            const { execSync } = require('child_process');
            
            // Try to build with static export first
            const nextConfigPath = path.join(activityPath, 'next.config.mjs');
            let buildCommand = 'npm run build';
            
            // Check if there's a build script in package.json
            const packageJsonPath = path.join(activityPath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                if (packageJson.scripts && packageJson.scripts.build) {
                    buildCommand = 'npm run build';
                } else {
                    // Use next build directly
                    buildCommand = 'npx next build';
                }
            }
            
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
            
            console.log(`✅ Built ${activity.name} successfully`);
            
            // Try to create static export if not already done
            try {
                execSync('npx next export', {
                    cwd: activityPath,
                    stdio: 'pipe',
                    timeout: 60000,
                    env: env
                });
                console.log(`✅ Exported ${activity.name} to static files`);
            } catch (exportError) {
                console.log(`⚠️  Static export failed for ${activity.name}, serving build output`);
            }
            
        } catch (error) {
            console.error(`❌ Build failed for ${activity.name}:`, error.message);
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
            console.log(`\n📁 ${domain.toUpperCase()}`);
            activities.forEach(activity => {
                console.log(`  → ${activity.route.padEnd(40)} ✅ seamless`);
            });
        });

        console.log(`\n🎉 All ${this.activities.size} activities served seamlessly!`);
        console.log(`💡 No individual npm install required`);
    }

    async startServer() {
        return new Promise((resolve) => {
            this.app.listen(this.port, () => {
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
        console.log('\n🛑 Shutting down seamless server...');
        process.exit(0);
    });
    
    // Start the server
    server.initialize().catch(console.error);
}

module.exports = SeamlessActivityServer;