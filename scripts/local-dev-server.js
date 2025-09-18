#!/usr/bin/env node

/**
 * Local Development Server Manager
 * 
 * This script handles all local development server management:
 * 1. Kills all running servers in the 3300-3500 port range
 * 2. Starts the seamless activity server on port 3333
 * 3. Provides comprehensive logging and error handling
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

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

// Kill processes on ports 3300-3399 (optimized with parallel checking)
function killPortRange(startPort = 3300, endPort = 3399) {
  log('blue', `🔍 Quickly scanning ports ${startPort}-${endPort}...`);
  
  return new Promise((resolve) => {
    try {
      // Use a single lsof command to check all ports at once
      const lsofOutput = execSync(`lsof -ti tcp:${startPort}-${endPort}`, { 
        encoding: 'utf8', 
        stdio: 'pipe' 
      }).trim();
      
      if (lsofOutput) {
        const pids = lsofOutput.split('\n').filter(pid => pid.trim());
        let killedProcesses = 0;
        
        for (const pid of pids) {
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'pipe' });
            log('yellow', `  ⚡ Killed process ${pid}`);
            killedProcesses++;
          } catch (killError) {
            // Process might have already died
          }
        }
        
        log('green', `✅ Killed ${killedProcesses} processes in port range ${startPort}-${endPort}`);
      } else {
        log('green', `✅ No processes found in port range ${startPort}-${endPort}`);
      }
    } catch (error) {
      // No processes in the range, which is fine
      log('green', `✅ No processes found in port range ${startPort}-${endPort}`);
    }
    
    // Wait a moment for processes to fully terminate
    setTimeout(resolve, 500);
  });
}

// Check and install dependencies if needed
function ensureDependencies() {
  log('blue', '🔍 Checking dependencies...');
  
  try {
    // Check if node_modules exists and has express
    require.resolve('express');
    log('green', '✅ Dependencies are ready');
    return true;
  } catch (error) {
    log('yellow', '⚠️  Dependencies missing, running automated installer...');
    
    try {
      // Run our dedicated dependency installer
      execSync('node scripts/install-deps.js', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      log('green', '✅ Dependencies installed successfully');
      return true;
    } catch (installError) {
      log('red', `❌ Failed to install dependencies: ${installError.message}`);
      log('yellow', '⚠️  Try running: npm run install-deps');
      return false;
    }
  }
}

// Start the seamless activity server
function startSeamlessServer(port = 3333) {
  return new Promise((resolve, reject) => {
    log('blue', `🚀 Starting seamless activity server on port ${port}...`);
    
    // Set environment variables
    process.env.PORT = port;
    process.env.NODE_PATH = path.join(process.cwd(), 'node_modules');
    
    // Start the server
    const serverPath = path.join(process.cwd(), 'server', 'seamless-activity-server.js');
    
    const serverProcess = spawn('node', [serverPath], {
      stdio: 'pipe', // Change from 'inherit' to 'pipe' to avoid hanging
      detached: true, // Run detached so it continues after script exits
      env: {
        ...process.env,
        PORT: port,
        NODE_PATH: path.join(process.cwd(), 'node_modules')
      }
    });
    
    // Allow the server to continue running independently
    serverProcess.unref();
    
    // Give the server a moment to start and then resolve
    setTimeout(() => {
      log('green', `✅ Seamless server started on port ${port}`);
      log('cyan', `📱 Visit: http://localhost:${port}`);
      log('cyan', `📱 Activity Browser: http://localhost:${port}/browse`);
      log('green', `🎉 Server is running in the background`);
      resolve(serverProcess);
    }, 2000);
    
    serverProcess.on('error', (error) => {
      log('red', `❌ Failed to start server: ${error.message}`);
      reject(error);
    });
  });
}

// Main function
async function startLocalDevelopment() {
  logger.app.info(`${colors.bold}${colors.blue}🏗️  C4R Local Development Server Manager${colors.reset}\n`);
  
  try {
    // Step 1: Kill existing servers
    await killPortRange(3300, 3399);
    
    // Step 2: Ensure dependencies are available
    const depsReady = ensureDependencies();
    if (!depsReady) {
      log('red', '❌ Cannot start server without proper dependencies');
      process.exit(1);
    }
    
    // Step 3: Start seamless server on port 3333
    await startSeamlessServer(3333);
    
    // Exit successfully after starting the server
    process.exit(0);
    
  } catch (error) {
    log('red', `❌ Error during startup: ${error.message}`);
    
    // Fallback: try to start individual activity servers
    log('yellow', '⚠️  Attempting fallback to individual activity servers...');
    
    try {
      const fallbackScript = path.join(process.cwd(), 'scripts', 'start-all-activities.js');
      if (require('fs').existsSync(fallbackScript)) {
const logger = require('../packages/logging/logger.js');
        log('blue', '🔄 Starting individual activity servers as fallback...');
        spawn('node', [fallbackScript], { stdio: 'inherit' });
      } else {
        log('red', '❌ No fallback option available');
        process.exit(1);
      }
    } catch (fallbackError) {
      log('red', `❌ Fallback failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
}

// Run the script
if (require.main === module) {
  startLocalDevelopment().catch(error => {
    log('red', `Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { startLocalDevelopment, killPortRange };