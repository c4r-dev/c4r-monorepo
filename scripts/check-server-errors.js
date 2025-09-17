const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function checkServerErrors() {
    console.log('🔍 Checking for server errors in real-time...');
    console.log('This will monitor server output for error patterns\n');
    
    // Create error log
    const errorLogPath = path.join(__dirname, 'server-error-log.txt');
    const logStream = fs.createWriteStream(errorLogPath, { flags: 'a' });
    
    function logError(type, message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${type}: ${message}\n`;
        console.log(`🔴 ${logEntry.trim()}`);
        logStream.write(logEntry);
    }
    
    // First, check if server is already running
    console.log('📋 Checking server status...');
    
    try {
        const response = await fetch('http://localhost:3333/api/activities');
        if (response.ok) {
            console.log('✅ Server is running on port 3333');
            
            // Test a few activities to see current error state
            const activities = await response.json();
            console.log(`📦 Found ${activities.length} activities\n`);
            
            console.log('🧪 Testing sample activities for immediate errors...');
            
            // Test first 5 activities for quick error check
            for (let i = 0; i < Math.min(5, activities.length); i++) {
                const activity = activities[i];
                const url = activity.url;
                
                console.log(`\n🔗 Testing: ${activity.route}`);
                
                try {
                    const activityResponse = await fetch(url, { 
                        timeout: 5000,
                        headers: { 'User-Agent': 'C4R-Error-Checker/1.0' }
                    });
                    
                    const status = activityResponse.status;
                    console.log(`   📊 HTTP ${status}`);
                    
                    if (status >= 400) {
                        logError('HTTP_ERROR', `${status} ${activityResponse.statusText} for ${url}`);
                        
                        // Try to get error details
                        const text = await activityResponse.text();
                        if (text.length < 1000) {
                            console.log(`   📄 Error response: ${text.substring(0, 200)}...`);
                            logError('ERROR_DETAILS', text.substring(0, 500));
                        }
                    } else if (status === 200) {
                        // Check for error content in successful responses
                        const html = await activityResponse.text();
                        const htmlLower = html.toLowerCase();
                        
                        if (htmlLower.includes('error') || htmlLower.includes('failed') || htmlLower.includes('cannot')) {
                            console.log('   ⚠️  Success response but contains error indicators');
                            
                            // Extract error messages
                            const errorMatches = html.match(/(error[^<>\n]{0,100}|failed[^<>\n]{0,100}|cannot[^<>\n]{0,100})/gi);
                            if (errorMatches) {
                                errorMatches.slice(0, 3).forEach(match => {
                                    console.log(`      • ${match.trim()}`);
                                    logError('CONTENT_ERROR', match.trim());
                                });
                            }
                        } else {
                            console.log('   ✅ Working');
                        }
                    }
                    
                } catch (fetchError) {
                    console.log(`   ❌ Fetch error: ${fetchError.message}`);
                    logError('FETCH_ERROR', `${fetchError.message} for ${url}`);
                }
            }
            
            console.log('\n✅ Quick error check complete!');
            console.log(`📄 Errors logged to: ${errorLogPath}`);
            
            // Show recent server logs if available
            console.log('\n📋 Recent server activity (if available):');
            
            // Try to read recent server output from common log locations
            const possibleLogPaths = [
                path.join(__dirname, 'server.log'),
                path.join(__dirname, 'npm-debug.log'),
                path.join(__dirname, '.next', 'server', 'server.log')
            ];
            
            for (const logPath of possibleLogPaths) {
                if (fs.existsSync(logPath)) {
                    console.log(`📄 Found log: ${logPath}`);
                    try {
                        const logContent = fs.readFileSync(logPath, 'utf8');
                        const recentLines = logContent.split('\n').slice(-10);
                        recentLines.forEach(line => {
                            if (line.trim() && (line.toLowerCase().includes('error') || line.toLowerCase().includes('warn'))) {
                                console.log(`   🔴 ${line.trim()}`);
                                logError('SERVER_LOG_ERROR', line.trim());
                            }
                        });
                    } catch (e) {
                        console.log(`   ⚠️  Could not read log: ${e.message}`);
                    }
                }
            }
            
        } else {
            console.log('❌ Server not responding on port 3333');
            logError('SERVER_DOWN', 'Server not responding on port 3333');
        }
        
    } catch (error) {
        console.log('❌ Could not connect to server:', error.message);
        logError('CONNECTION_ERROR', error.message);
        
        console.log('\n🚀 Server might not be running. You can start it with:');
        console.log('   npm run dev');
        console.log('   or');
        console.log('   node server/seamless-activity-server.js');
    }
    
    // Instructions for further debugging
    console.log('\n🛠️  DEBUGGING SUGGESTIONS:');
    console.log('1. Visual Error Detection:');
    console.log('   node test-activities-error-detection.js');
    console.log('');
    console.log('2. Live Browser Monitoring:');
    console.log('   node live-error-monitor.js');
    console.log('');
    console.log('3. Check specific activity:');
    console.log('   Open browser to http://localhost:3333/[domain]/[activity-name]');
    console.log('   Open DevTools (F12) → Console tab to see JavaScript errors');
    console.log('');
    console.log('4. Server-side debugging:');
    console.log('   Check terminal running npm run dev for server errors');
    console.log('   Add console.log statements in server/seamless-activity-server.js');
    
    logStream.end();
}

checkServerErrors().catch(console.error);