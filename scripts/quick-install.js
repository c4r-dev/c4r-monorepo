#!/usr/bin/env node

/**
 * C4R Quick Install Script
 * 
 * Handles common installation issues and provides smart fallbacks
 * when npm install fails or takes too long.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../packages/logging/logger.js');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  logger.app.info(`${colors[color]}${message}${colors.reset}`);
}

function checkRequirements() {
  log('blue', '🔍 Checking system requirements...');
  
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    
    if (majorVersion < 18) {
      log('red', `❌ Node.js ${nodeVersion} is too old. Please install Node.js 18+ from https://nodejs.org`);
      process.exit(1);
    }
    
    log('green', `✅ Node.js ${nodeVersion} is compatible`);
  } catch (error) {
    log('red', '❌ Node.js not found. Please install from https://nodejs.org');
    process.exit(1);
  }
}

function optimizeNpmSettings() {
  log('blue', '⚙️ Optimizing npm settings for faster install...');
  
  try {
    execSync('npm config set fetch-retries 2', { stdio: 'pipe' });
    execSync('npm config set fetch-retry-factor 10', { stdio: 'pipe' });
    execSync('npm config set fetch-retry-mintimeout 10000', { stdio: 'pipe' });
    execSync('npm config set audit false', { stdio: 'pipe' });
    log('green', '✅ npm settings optimized');
  } catch (error) {
    log('yellow', '⚠️ Could not optimize npm settings, continuing anyway...');
  }
}

function installDependencies() {
  log('blue', '📦 Installing dependencies...');
  log('cyan', 'This may take 2-5 minutes for the first install...');
  
  const installCommands = [
    // Try normal install first
    'npm install',
    // If that fails, try without optional deps
    'npm install --no-optional',
    // If that fails, try without scripts
    'npm install --ignore-scripts --no-optional',
    // Last resort: production only
    'npm install --production'
  ];
  
  for (const command of installCommands) {
    try {
      log('blue', `🔄 Trying: ${command}`);
      execSync(command, { 
        stdio: 'inherit',
        timeout: 300000 // 5 minute timeout
      });
      log('green', '✅ Dependencies installed successfully!');
      return true;
    } catch (error) {
      log('yellow', `⚠️ Command failed: ${command}`);
      continue;
    }
  }
  
  log('red', '❌ All install attempts failed');
  return false;
}

function startServer() {
  log('blue', '🚀 Starting C4R development server...');
  
  try {
    // Check if our install script exists
    const installScript = path.join(process.cwd(), 'scripts', 'install-deps.js');
    if (fs.existsSync(installScript)) {
      log('blue', '🔧 Running dependency installer...');
      execSync('node scripts/install-deps.js', { stdio: 'inherit' });
    }
    
    // Start the local dev server
    log('blue', '🌐 Starting server on port 3333...');
    const serverProcess = spawn('npm', ['run', 'local'], {
      stdio: 'inherit',
      detached: false
    });
    
    // Give server time to start
    setTimeout(() => {
      log('green', '🎉 Server should be starting...');
      log('cyan', '📱 Visit: http://localhost:3333');
      log('cyan', '📱 Activity Browser: http://localhost:3333/browse');
      log('green', '✨ Installation complete! Press Ctrl+C to stop server.');
    }, 3000);
    
    // Keep the process alive
    process.on('SIGINT', () => {
      log('yellow', '👋 Stopping server...');
      serverProcess.kill();
      process.exit(0);
    });
    
  } catch (error) {
    log('red', `❌ Failed to start server: ${error.message}`);
    log('yellow', '💡 Try running manually: npm run local');
    process.exit(1);
  }
}

function createDockerFallback() {
  const dockerfileContent = `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3333
CMD ["npm", "run", "local"]`;

  fs.writeFileSync('Dockerfile', dockerfileContent);
  
  log('blue', '🐳 Created Dockerfile as fallback option');
  log('cyan', '   To use Docker instead:');
  log('cyan', '   docker build -t c4r-dev .');
  log('cyan', '   docker run -p 3333:3333 c4r-dev');
}

async function main() {
  logger.app.info(`${colors.bold}${colors.blue}🎓 C4R Quick Install${colors.reset}\n`);
  
  checkRequirements();
  optimizeNpmSettings();
  
  const installSuccess = installDependencies();
  
  if (!installSuccess) {
    log('yellow', '🐳 Creating Docker fallback...');
    createDockerFallback();
    log('red', '❌ npm install failed. Please try:');
    log('cyan', '   1. Clear cache: npm cache clean --force');
    log('cyan', '   2. Delete node_modules: rm -rf node_modules');
    log('cyan', '   3. Try again: npm run quick-install');
    log('cyan', '   4. Or use Docker (see Dockerfile created above)');
    process.exit(1);
  }
  
  startServer();
}

// Run the installer
if (require.main === module) {
  main().catch(error => {
    log('red', `Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main };