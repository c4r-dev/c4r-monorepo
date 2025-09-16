/**
 * Activity Loader - Dynamically loads and serves activities without individual npm installs
 * Handles different framework types and provides fallback mechanisms
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ActivityLoader {
    constructor() {
        this.loadedModules = new Map();
        this.buildCache = new Map();
    }

    /**
     * Load an activity dynamically based on its type
     */
    async loadActivity(activityConfig) {
        const { path: activityPath, type, name } = activityConfig;
        
        try {
            switch (type) {
                case 'nextjs':
                    return await this.loadNextJSActivity(activityPath, name);
                case 'cra':
                    return await this.loadCreateReactAppActivity(activityPath, name);
                case 'react':
                    return await this.loadReactActivity(activityPath, name);
                case 'static':
                    return await this.loadStaticActivity(activityPath, name);
                default:
                    return await this.loadGenericActivity(activityPath, name);
            }
        } catch (error) {
            console.error(`❌ Error loading ${name}:`, error.message);
            return this.createErrorHandler(name, error);
        }
    }

    async loadNextJSActivity(activityPath, name) {
        const nextConfigPath = path.join(activityPath, 'next.config.mjs');
        const packageJsonPath = path.join(activityPath, 'package.json');
        
        // Check if built version exists
        const buildPath = path.join(activityPath, '.next');
        
        if (!fs.existsSync(buildPath)) {
            console.log(`🔨 Building Next.js app: ${name}`);
            try {
                // Build the app using our shared dependencies
                await this.buildNextJSApp(activityPath);
            } catch (buildError) {
                console.warn(`⚠️  Build failed for ${name}, serving development version`);
            }
        }

        // Return middleware function
        return (req, res, next) => {
            try {
                // Serve static files from .next/static
                const staticPath = path.join(activityPath, '.next/static');
                if (req.url.startsWith('/_next/static') && fs.existsSync(staticPath)) {
                    const filePath = path.join(activityPath, req.url);
                    if (fs.existsSync(filePath)) {
                        return res.sendFile(filePath);
                    }
                }

                // For development, try to serve the pages directly
                this.serveNextJSPage(activityPath, req, res, next);
                
            } catch (error) {
                console.error(`Error serving ${name}:`, error.message);
                res.status(500).send(this.generateErrorPage(name, error));
            }
        };
    }

    async loadCreateReactAppActivity(activityPath, name) {
        const buildPath = path.join(activityPath, 'build');
        
        if (!fs.existsSync(buildPath)) {
            console.log(`🔨 Building Create React App: ${name}`);
            try {
                await this.buildCRAApp(activityPath);
            } catch (buildError) {
                console.warn(`⚠️  Build failed for ${name}, serving source files`);
                return this.loadReactActivity(activityPath, name);
            }
        }

        // Serve built files
        const express = require('express');
        return express.static(buildPath, {
            index: 'index.html',
            fallthrough: true
        });
    }

    async loadReactActivity(activityPath, name) {
        // For React apps without build, we'll need to set up a basic server
        // This is a simplified approach - in production, you'd want webpack dev server
        
        const srcPath = path.join(activityPath, 'src');
        const publicPath = path.join(activityPath, 'public');
        
        return (req, res, next) => {
            // Serve public files
            if (req.url === '/' || req.url === '/index.html') {
                const indexPath = path.join(publicPath, 'index.html');
                if (fs.existsSync(indexPath)) {
                    res.sendFile(indexPath);
                    return;
                }
            }
            
            // Serve other static files from public
            const filePath = path.join(publicPath, req.url);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                res.sendFile(filePath);
                return;
            }
            
            // For React routing, serve index.html for unmatched routes
            const indexPath = path.join(publicPath, 'index.html');
            if (fs.existsSync(indexPath)) {
                res.sendFile(indexPath);
            } else {
                next();
            }
        };
    }

    async loadStaticActivity(activityPath, name) {
        const express = require('express');
        return express.static(activityPath, {
            index: ['index.html', 'index.htm', 'default.html'],
            fallthrough: true
        });
    }

    async loadGenericActivity(activityPath, name) {
        // Generic loader that tries to serve common file types
        return (req, res, next) => {
            const filePath = path.join(activityPath, req.url === '/' ? 'index.html' : req.url);
            
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                res.sendFile(filePath);
            } else {
                // Try common index files
                const indexFiles = ['index.html', 'index.htm', 'default.html', 'main.html'];
                for (const indexFile of indexFiles) {
                    const indexPath = path.join(activityPath, indexFile);
                    if (fs.existsSync(indexPath)) {
                        res.sendFile(indexPath);
                        return;
                    }
                }
                next();
            }
        };
    }

    async buildNextJSApp(activityPath) {
        const packageJsonPath = path.join(activityPath, 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            // Create a temporary package.json that uses our shared dependencies
            const tempPackageJson = {
                ...packageJson,
                dependencies: {
                    // Use shared dependencies from root
                    "next": "^15.0.0",
                    "react": "^19.0.0",
                    "react-dom": "^19.0.0",
                    ...packageJson.dependencies
                }
            };
            
            // Write temporary package.json
            const originalContent = fs.readFileSync(packageJsonPath, 'utf8');
            fs.writeFileSync(packageJsonPath, JSON.stringify(tempPackageJson, null, 2));
            
            try {
                // Build using shared node_modules
                const rootDir = process.cwd();
                process.env.NODE_PATH = path.join(rootDir, 'node_modules');
                
                execSync('npm run build', {
                    cwd: activityPath,
                    stdio: 'pipe',
                    timeout: 60000 // 1 minute timeout
                });
                
                console.log(`✅ Built ${path.basename(activityPath)}`);
            } finally {
                // Restore original package.json
                fs.writeFileSync(packageJsonPath, originalContent);
            }
        }
    }

    async buildCRAApp(activityPath) {
        // Similar approach for Create React App
        execSync('npm run build', {
            cwd: activityPath,
            stdio: 'pipe',
            timeout: 60000
        });
        
        console.log(`✅ Built CRA app: ${path.basename(activityPath)}`);
    }

    serveNextJSPage(activityPath, req, res, next) {
        // Simplified Next.js page serving
        // In a real implementation, you'd want to use Next.js's built-in server
        
        const pagesPath = path.join(activityPath, 'app');
        const pagePath = req.url === '/' ? 'page.js' : `${req.url}/page.js`;
        const fullPagePath = path.join(pagesPath, pagePath);
        
        if (fs.existsSync(fullPagePath)) {
            // For now, serve a basic HTML response
            // In production, you'd render the React component server-side
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${path.basename(activityPath)}</title>
                    <script src="https://unpkg.com/react@19/umd/react.development.js"></script>
                    <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
                </head>
                <body>
                    <div id="root">
                        <h1>Loading ${path.basename(activityPath)}...</h1>
                        <p>This activity is being served in development mode.</p>
                        <p>Some features may not work exactly as in production.</p>
                    </div>
                </body>
                </html>
            `);
        } else {
            next();
        }
    }

    createErrorHandler(name, error) {
        return (req, res, next) => {
            res.status(500).send(this.generateErrorPage(name, error));
        };
    }

    generateErrorPage(name, error) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error Loading ${name}</title>
                <style>
                    body { font-family: monospace; padding: 2rem; background: #1a1a1a; color: #ff6b6b; }
                    .error-container { max-width: 800px; margin: 0 auto; }
                    .error-title { color: #ffd93d; margin-bottom: 1rem; }
                    .error-message { background: #2d2d2d; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
                    .suggestion { color: #6bcf7f; margin-top: 1rem; }
                    a { color: #74b9ff; }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1 class="error-title">❌ Error Loading "${name}"</h1>
                    <div class="error-message">
                        <strong>Error:</strong> ${error.message}
                    </div>
                    <div class="suggestion">
                        <strong>💡 Suggestions:</strong>
                        <ul>
                            <li>Check if the activity's package.json is valid</li>
                            <li>Ensure the activity follows the expected structure</li>
                            <li>Check the console logs for more details</li>
                            <li>Try running the activity individually</li>
                        </ul>
                    </div>
                    <p><a href="/">← Back to Dashboard</a></p>
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = ActivityLoader;