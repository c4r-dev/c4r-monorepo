#!/usr/bin/env node

/**
 * CustomButton Migration Test Script
 * 
 * This script tests a sample of migrated activities to ensure CustomButton imports
 * and functionality work correctly after migration to the shared component.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Sample activities to test (representative of different patterns)
const testActivities = [
  'activities/coding-practices/hms-wason-246-v2',
  'activities/randomization/smi-ran-simple-ran-v1',
  'apps/hms-bias-map-v0',
  'apps/duq-finer-v1',
  'apps/c4r-component-test'
];

// Test if activity has @c4r/ui dependency
function checkDependency(activityPath) {
  const packageJsonPath = path.join(activityPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return { hasPackageJson: false, hasUIDependency: false };
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const hasUIDependency = packageJson.dependencies && packageJson.dependencies['@c4r/ui'];
    
    return { hasPackageJson: true, hasUIDependency: !!hasUIDependency };
  } catch (error) {
    return { hasPackageJson: true, hasUIDependency: false };
  }
}

// Test if files import from @c4r/ui correctly
function checkImports(activityPath) {
  const importingFiles = [];
  const errors = [];
  
  function searchForImports(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.next', 'build', 'dist'].includes(item)) {
          searchForImports(fullPath);
        }
      } else if (/\.(js|jsx|ts|tsx)$/.test(item)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Check for @c4r/ui imports
          if (content.includes("from '@c4r/ui'") || content.includes('from "@c4r/ui"')) {
            importingFiles.push(fullPath);
          }
          
          // Check for old local CustomButton imports (these should be gone)
          const badImportPatterns = [
            /import\s+.*CustomButton.*from\s+['"]\.\//,
            /import\s+.*CustomButton.*from\s+['"]\.\.\//
          ];
          
          badImportPatterns.forEach(pattern => {
            if (pattern.test(content)) {
              errors.push({
                file: fullPath,
                issue: 'Still has local CustomButton import'
              });
            }
          });
          
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
  }
  
  searchForImports(activityPath);
  return { importingFiles, errors };
}

// Test build process for an activity
function testBuild(activityPath) {
  try {
    log('blue', `    Testing build for ${activityPath}...`);
    
    // Change to activity directory and run build
    const originalCwd = process.cwd();
    process.chdir(activityPath);
    
    // Try to build (with timeout)
    execSync('npm run build', { 
      stdio: 'pipe', 
      timeout: 30000,
      encoding: 'utf8'
    });
    
    process.chdir(originalCwd);
    return { success: true, error: null };
    
  } catch (error) {
    process.chdir(process.cwd()); // Ensure we're back to original directory
    return { 
      success: false, 
      error: error.message.includes('timeout') ? 'Build timeout' : error.stdout || error.message 
    };
  }
}

// Main test function
async function testCustomButtonMigration() {
  log('blue', '🧪 Testing CustomButton migration...\n');
  
  let testResults = {
    totalTested: 0,
    dependencyTests: { passed: 0, failed: 0 },
    importTests: { passed: 0, failed: 0 },
    buildTests: { passed: 0, failed: 0 },
    errors: []
  };
  
  for (const activityPath of testActivities) {
    testResults.totalTested++;
    
    log('blue', `\n📦 Testing: ${activityPath}`);
    
    // Check if activity exists
    if (!fs.existsSync(activityPath)) {
      log('red', `  ❌ Activity not found: ${activityPath}`);
      testResults.errors.push(`Activity not found: ${activityPath}`);
      continue;
    }
    
    // Test 1: Check dependencies
    const depResult = checkDependency(activityPath);
    if (depResult.hasPackageJson && depResult.hasUIDependency) {
      log('green', '  ✅ Has @c4r/ui dependency');
      testResults.dependencyTests.passed++;
    } else {
      log('red', '  ❌ Missing @c4r/ui dependency');
      testResults.dependencyTests.failed++;
      testResults.errors.push(`${activityPath}: Missing @c4r/ui dependency`);
    }
    
    // Test 2: Check imports
    const importResult = checkImports(activityPath);
    if (importResult.errors.length === 0) {
      log('green', `  ✅ Import statements correct (${importResult.importingFiles.length} files use @c4r/ui)`);
      testResults.importTests.passed++;
    } else {
      log('red', `  ❌ Import errors found:`);
      importResult.errors.forEach(error => {
        log('red', `    - ${path.relative('.', error.file)}: ${error.issue}`);
      });
      testResults.importTests.failed++;
      testResults.errors.push(`${activityPath}: Import errors`);
    }
    
    // Test 3: Test build (only for a few to save time)
    if (['apps/hms-bias-map-v0', 'apps/c4r-component-test'].includes(activityPath)) {
      const buildResult = testBuild(activityPath);
      if (buildResult.success) {
        log('green', '  ✅ Build successful');
        testResults.buildTests.passed++;
      } else {
        log('red', `  ❌ Build failed: ${buildResult.error}`);
        testResults.buildTests.failed++;
        testResults.errors.push(`${activityPath}: Build failed`);
      }
    }
  }
  
  // Print test summary
  console.log('\n' + '='.repeat(60));
  log('bold', '📊 Test Summary:');
  log('green', `  ✅ Activities tested: ${testResults.totalTested}`);
  log('green', `  ✅ Dependency tests passed: ${testResults.dependencyTests.passed}/${testResults.dependencyTests.passed + testResults.dependencyTests.failed}`);
  log('green', `  ✅ Import tests passed: ${testResults.importTests.passed}/${testResults.importTests.passed + testResults.importTests.failed}`);
  log('green', `  ✅ Build tests passed: ${testResults.buildTests.passed}/${testResults.buildTests.passed + testResults.buildTests.failed}`);
  
  if (testResults.errors.length > 0) {
    log('red', `\n❌ Errors found: ${testResults.errors.length}`);
    testResults.errors.forEach(error => log('red', `  - ${error}`));
  }
  
  console.log('\n' + '='.repeat(60));
  
  const totalTests = testResults.dependencyTests.passed + testResults.dependencyTests.failed + 
                     testResults.importTests.passed + testResults.importTests.failed +
                     testResults.buildTests.passed + testResults.buildTests.failed;
  const totalPassed = testResults.dependencyTests.passed + testResults.importTests.passed + testResults.buildTests.passed;
  
  if (testResults.errors.length === 0) {
    log('green', '🎉 All tests passed! CustomButton migration appears successful.');
  } else {
    log('yellow', `⚠️  ${totalPassed}/${totalTests} tests passed. Some issues found - please review.`);
  }
  
  return testResults;
}

// Run tests
if (require.main === module) {
  testCustomButtonMigration().catch(error => {
    log('red', `Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { testCustomButtonMigration };