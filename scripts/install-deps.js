#!/usr/bin/env node

/**
 * Simplified Dependency Installer
 * 
 * Fixes the recurring Express dependency issue by ensuring proper npm install
 * without workspace complications.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function installDependencies() {
  log('blue', '🔧 C4R Dependency Installer');
  console.log();
  
  try {
    // Check if node_modules exists
    const nodeModulesExists = fs.existsSync('./node_modules');
    const packageLockExists = fs.existsSync('./package-lock.json');
    
    log('blue', '📋 Checking current state...');
    log(nodeModulesExists ? 'green' : 'yellow', `  node_modules/: ${nodeModulesExists ? 'EXISTS' : 'MISSING'}`);
    log(packageLockExists ? 'green' : 'yellow', `  package-lock.json: ${packageLockExists ? 'EXISTS' : 'MISSING'}`);
    
    // If node_modules is missing but package-lock exists, we have a structural issue
    if (!nodeModulesExists && packageLockExists) {
      log('yellow', '⚠️  Structural issue detected: package-lock.json exists but node_modules/ missing');
      log('blue', '🔄 Attempting to restore from package-lock.json...');
      
      try {
        // Try npm ci first (faster, uses existing lock file)
        execSync('npm ci', { stdio: 'inherit' });
        log('green', '✅ Dependencies restored using npm ci');
      } catch (ciError) {
        log('yellow', '⚠️  npm ci failed, trying npm install...');
        
        try {
          execSync('npm install', { stdio: 'inherit' });
          log('green', '✅ Dependencies installed using npm install');
        } catch (installError) {
          log('red', '❌ Both npm ci and npm install failed');
          throw installError;
        }
      }
    } else if (!nodeModulesExists && !packageLockExists) {
      log('blue', '🔄 Fresh install needed...');
      execSync('npm install', { stdio: 'inherit' });
      log('green', '✅ Fresh dependencies installed');
    } else if (nodeModulesExists) {
      log('green', '✅ Dependencies already installed');
      
      // Quick check if Express is available
      try {
        require.resolve('express');
        log('green', '✅ Express is available');
      } catch (expressError) {
        log('yellow', '⚠️  Express missing, reinstalling...');
        execSync('npm install express', { stdio: 'inherit' });
        log('green', '✅ Express installed');
      }
    }
    
    // Verify critical dependencies
    log('blue', '🔍 Verifying critical dependencies...');
    const criticalDeps = ['express', 'next', 'react', 'react-dom'];
    
    for (const dep of criticalDeps) {
      try {
        require.resolve(dep);
        log('green', `  ✅ ${dep}`);
      } catch (error) {
        log('red', `  ❌ ${dep} - MISSING`);
        throw new Error(`Critical dependency ${dep} is missing`);
      }
    }
    
    log('green', '\n🎉 All dependencies are ready!');
    log('blue', '📝 You can now run: npm run local');
    
  } catch (error) {
    log('red', `\n❌ Installation failed: ${error.message}`);
    log('yellow', '\n🛠️  Troubleshooting suggestions:');
    log('yellow', '  1. Delete node_modules and package-lock.json, then run this script again');
    log('yellow', '  2. Check if you have sufficient disk space');
    log('yellow', '  3. Verify npm/node versions are compatible');
    process.exit(1);
  }
}

// Run the installer
if (require.main === module) {
  installDependencies().catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { installDependencies };