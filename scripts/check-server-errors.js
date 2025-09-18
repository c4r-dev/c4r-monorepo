const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../packages/logging/logger.js');

async function checkServerErrors() {
    logger.app.info('🔍 Checking for server errors in real-time...');
    logger.app.info('This will monitor server output for error patterns\n');
    
    // Create error log
    const errorLogPath = path.join(__dirname, 'server-error-log.txt');
    const logStream = fs.createWriteStream(errorLogPath, { flags: 'a' });
    
    function logError(type, message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${type}: ${message}\n`;
        logger.app.info(`🔴 ${logEntry.trim()}`);
        logStream.write(logEntry);
    }
    
    // First, check if server is already running
    logger.app.info('📋 Checking server status...');
    
    try {
        const response = await fetch('http://localhost:3333/api/activities');
        if (response.ok) {
            logger.app.info('✅ Server is running on port 3333');
            
            // Test a few activities to see current error state
            const activities = await response.json();
            logger.app.info(`📦 Found ${activities.length} activities\n`);
            
            logger.app.info('🧪 Testing sample activities for immediate errors...');
            
            // Test first 5 activities for quick error check
            for (let i = 0; i < Math.min(5, activities.length); i++) {
                const activity = activities[i];
                const url = activity.url;
                
                logger.app.info(`\n🔗 Testing: ${activity.route}`);
                
                try {
                    const activityResponse = await fetch(url, { 
                        timeout: 5000,
                        headers: { 'User-Agent': 'C4R-Error-Checker/1.0' }
                    });
                    
                    const status = activityResponse.status;
                    logger.app.info(`   📊 HTTP ${status}`);
                    
                    if (status >= 400) {
                        logError('HTTP_ERROR', `${status} ${activityResponse.statusText} for ${url}`);
                        
                        // Try to get error details
                        const text = await activityResponse.text();
                        if (text.length < 1000) {
                            logger.app.info(`   📄 Error response: ${text.substring(0, 200)}...`);
                            logError('ERROR_DETAILS', text.substring(0, 500));
                        }
                    } else if (status === 200) {
                        // Check for error content in successful responses
                        const html = await activityResponse.text();
                        const htmlLower = html.toLowerCase();
                        
                        if (htmlLower.includes('error') || htmlLower.includes('failed') || htmlLower.includes('cannot')) {
                            logger.app.info('   ⚠️  Success response but contains error indicators');
                            
                            // Extract error messages
                            const errorMatches = html.match(/(error[^<>\n]{0,100}|failed[^<>\n]{0,100}|cannot[^<>\n]{0,100})/gi);
                            if (errorMatches) {
                                errorMatches.slice(0, 3).forEach(match => {
                                    logger.app.info(`      • ${match.trim()}`);
                                    logError('CONTENT_ERROR', match.trim());
                                });
                            }
                        } else {
                            logger.app.info('   ✅ Working');
                        }
                    }
                    
                } catch (fetchError) {
                    logger.app.info(`   ❌ Fetch error: ${fetchError.message}`);
                    logError('FETCH_ERROR', `${fetchError.message} for ${url}`);
                }
            }
            
            logger.app.info('\n✅ Quick error check complete!');
            logger.app.info(`📄 Errors logged to: ${errorLogPath}`);
            
            // Show recent server logs if available
            logger.app.info('\n📋 Recent server activity (if available):');
            
            // Try to read recent server output from common log locations
            const possibleLogPaths = [
                path.join(__dirname, 'server.log'),
                path.join(__dirname, 'npm-debug.log'),
                path.join(__dirname, '.next', 'server', 'server.log')
            ];
            
            for (const logPath of possibleLogPaths) {
                if (fs.existsSync(logPath)) {
                    logger.app.info(`📄 Found log: ${logPath}`);
                    try {
                        const logContent = fs.readFileSync(logPath, 'utf8');
                        const recentLines = logContent.split('\n').slice(-10);
                        recentLines.forEach(line => {
                            if (line.trim() && (line.toLowerCase().includes('error') || line.toLowerCase().includes('warn'))) {
                                logger.app.info(`   🔴 ${line.trim()}`);
                                logError('SERVER_LOG_ERROR', line.trim());
                            }
                        });
                    } catch (e) {
                        logger.app.info(`   ⚠️  Could not read log: ${e.message}`);
                    }
                }
            }
            
        } else {
            logger.app.info('❌ Server not responding on port 3333');
            logError('SERVER_DOWN', 'Server not responding on port 3333');
        }
        
    } catch (error) {
        logger.app.info('❌ Could not connect to server:', error.message);
        logError('CONNECTION_ERROR', error.message);
        
        logger.app.info('\n🚀 Server might not be running. You can start it with:');
        logger.app.info('   npm run dev');
        logger.app.info('   or');
        logger.app.info('   node server/seamless-activity-server.js');
    }
    
    // Instructions for further debugging
    logger.app.info('\n🛠️  DEBUGGING SUGGESTIONS:');
    logger.app.info('1. Visual Error Detection:');
    logger.app.info('   node test-activities-error-detection.js');
    logger.app.info('');
    logger.app.info('2. Live Browser Monitoring:');
    logger.app.info('   node live-error-monitor.js');
    logger.app.info('');
    logger.app.info('3. Check specific activity:');
    logger.app.info('   Open browser to http://localhost:3333/[domain]/[activity-name]');
    logger.app.info('   Open DevTools (F12) → Console tab to see JavaScript errors');
    logger.app.info('');
    logger.app.info('4. Server-side debugging:');
    logger.app.info('   Check terminal running npm run dev for server errors');
    logger.app.info('   Add console.log statements in server/seamless-activity-server.js');
    
    logStream.end();
}

checkServerErrors().catch(console.error);