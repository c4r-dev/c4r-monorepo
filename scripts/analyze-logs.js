#!/usr/bin/env node

/**
 * LLM-Friendly Log Analysis Tool
 * Generates structured summaries for LLM consumption
 */

const fs = require('fs');
const path = require('path');

class LogAnalyzer {
    constructor(logDir = './logs') {
        this.logDir = logDir;
        this.analysisDir = path.join(logDir, 'analysis');
        
        if (!fs.existsSync(this.analysisDir)) {
            fs.mkdirSync(this.analysisDir, { recursive: true });
        }
    }

    // Read and parse JSONL log files
    readLogFile(filename) {
        const filePath = path.join(this.logDir, filename);
        if (!fs.existsSync(filePath)) {
            return [];
        }
        
        return fs.readFileSync(filePath, 'utf8')
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return null;
                }
            })
            .filter(Boolean);
    }

    // Generate daily summary for LLM analysis
    generateDailySummary(date = new Date().toISOString().split('T')[0]) {
        const logs = {
            app: this.readLogFile('app.jsonl'),
            errors: this.readLogFile('errors.jsonl'),
            activities: this.readLogFile('activities.jsonl'),
            performance: this.readLogFile('performance.jsonl'),
            browser: this.readLogFile('browser.jsonl')
        };

        // Filter logs for the specified date
        const dayLogs = {};
        for (const [type, logList] of Object.entries(logs)) {
            dayLogs[type] = logList.filter(log => 
                log.timestamp && log.timestamp.startsWith(date)
            );
        }

        const summary = {
            date,
            generated_at: new Date().toISOString(),
            overview: {
                total_requests: dayLogs.app.filter(l => l.event === 'request_end').length,
                total_errors: dayLogs.errors.length,
                activities_accessed: new Set(
                    dayLogs.activities.filter(l => l.event === 'activity_registered')
                        .map(l => l.name)
                ).size,
                server_restarts: dayLogs.app.filter(l => l.event === 'server_init_complete').length
            },
            error_analysis: this.analyzeErrors(dayLogs.errors),
            performance_analysis: this.analyzePerformance(dayLogs.performance, dayLogs.app),
            activity_analysis: this.analyzeActivities(dayLogs.activities),
            framework_issues: this.analyzeFrameworkIssues(dayLogs.app, dayLogs.errors),
            browser_analysis: this.analyzeBrowserEvents(dayLogs.browser),
            user_journey_analysis: this.analyzeUserJourneys(dayLogs.browser, dayLogs.app),
            correlation_analysis: this.correlateBrowserServerLogs(dayLogs.browser, dayLogs.app, dayLogs.errors),
            recommendations: this.generateRecommendations(dayLogs)
        };

        // Save summary
        const summaryPath = path.join(this.analysisDir, `daily-summary-${date}.json`);
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

        return summary;
    }

    analyzeErrors(errorLogs) {
        const errorsByType = {};
        const errorsByContext = {};
        const recentErrors = errorLogs.slice(-10);

        errorLogs.forEach(log => {
            const errorType = log.error?.name || 'Unknown';
            const context = log.context || 'Unknown';

            errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
            errorsByContext[context] = (errorsByContext[context] || 0) + 1;
        });

        return {
            total_errors: errorLogs.length,
            errors_by_type: errorsByType,
            errors_by_context: errorsByContext,
            recent_errors: recentErrors.map(log => ({
                timestamp: log.timestamp,
                context: log.context,
                message: log.error?.message,
                user_action: log.userAction
            })),
            critical_patterns: this.identifyErrorPatterns(errorLogs)
        };
    }

    analyzePerformance(perfLogs, appLogs) {
        const slowRequests = perfLogs.filter(l => l.event === 'slow_request');
        const requestTimes = appLogs
            .filter(l => l.event === 'request_end' && l.duration_ms)
            .map(l => l.duration_ms);

        const avgResponseTime = requestTimes.length > 0 
            ? requestTimes.reduce((a, b) => a + b, 0) / requestTimes.length 
            : 0;

        return {
            slow_requests_count: slowRequests.length,
            average_response_time_ms: Math.round(avgResponseTime),
            slowest_request: Math.max(...requestTimes, 0),
            fastest_request: Math.min(...requestTimes, 0),
            slow_endpoints: this.getSlowEndpoints(slowRequests),
            performance_trends: this.calculatePerformanceTrends(appLogs)
        };
    }

    analyzeActivities(activityLogs) {
        const activitiesByType = {};
        const activitiesByDomain = {};
        const initTimes = {};

        activityLogs.forEach(log => {
            if (log.event === 'activity_registered') {
                const type = log.type;
                const domain = log.domain;

                activitiesByType[type] = (activitiesByType[type] || 0) + 1;
                activitiesByDomain[domain] = (activitiesByDomain[domain] || 0) + 1;
            }

            if (log.event === 'nextjs_init' && log.duration_ms) {
                initTimes[log.activity] = log.duration_ms;
            }
        });

        const avgInitTime = Object.values(initTimes).length > 0
            ? Object.values(initTimes).reduce((a, b) => a + b, 0) / Object.values(initTimes).length
            : 0;

        return {
            activities_by_type: activitiesByType,
            activities_by_domain: activitiesByDomain,
            nextjs_init_times: initTimes,
            average_init_time_ms: Math.round(avgInitTime),
            slowest_init: Math.max(...Object.values(initTimes), 0)
        };
    }

    analyzeFrameworkIssues(appLogs, errorLogs) {
        const frameworkErrors = errorLogs.filter(log => 
            log.context && ['nextjs_init', 'nextjs_asset_handler', 'framework_detection'].includes(log.context)
        );

        const frameworkDetectionIssues = appLogs.filter(log => 
            log.event === 'framework_unknown'
        );

        return {
            framework_related_errors: frameworkErrors.length,
            unknown_framework_detections: frameworkDetectionIssues.length,
            common_framework_issues: this.categorizeFrameworkIssues(frameworkErrors),
            detection_failures: frameworkDetectionIssues.map(log => ({
                path: log.path,
                timestamp: log.timestamp
            }))
        };
    }

    identifyErrorPatterns(errorLogs) {
        // Look for recurring error patterns
        const patterns = [];
        const errorMessages = errorLogs.map(log => log.error?.message).filter(Boolean);
        
        const messageCounts = {};
        errorMessages.forEach(msg => {
            messageCounts[msg] = (messageCounts[msg] || 0) + 1;
        });

        // Identify patterns that occur more than once
        Object.entries(messageCounts).forEach(([message, count]) => {
            if (count > 1) {
                patterns.push({
                    message,
                    occurrences: count,
                    severity: count > 5 ? 'high' : count > 2 ? 'medium' : 'low'
                });
            }
        });

        return patterns.sort((a, b) => b.occurrences - a.occurrences);
    }

    getSlowEndpoints(slowRequests) {
        const endpointCounts = {};
        slowRequests.forEach(req => {
            const endpoint = req.url || 'unknown';
            endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
        });

        return Object.entries(endpointCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([endpoint, count]) => ({ endpoint, count }));
    }

    calculatePerformanceTrends(appLogs) {
        const hourlyPerformance = {};
        
        appLogs
            .filter(log => log.event === 'request_end' && log.duration_ms)
            .forEach(log => {
                const hour = new Date(log.timestamp).getHours();
                if (!hourlyPerformance[hour]) {
                    hourlyPerformance[hour] = [];
                }
                hourlyPerformance[hour].push(log.duration_ms);
            });

        const trends = {};
        Object.entries(hourlyPerformance).forEach(([hour, times]) => {
            trends[hour] = {
                avg_response_time: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
                request_count: times.length
            };
        });

        return trends;
    }

    categorizeFrameworkIssues(frameworkErrors) {
        const categories = {
            'nextjs_init_failures': 0,
            'asset_loading_issues': 0,
            'detection_failures': 0,
            'configuration_issues': 0
        };

        frameworkErrors.forEach(error => {
            if (error.context === 'nextjs_init') {
                categories.nextjs_init_failures++;
            } else if (error.context === 'nextjs_asset_handler') {
                categories.asset_loading_issues++;
            } else if (error.context === 'framework_detection') {
                categories.detection_failures++;
            }

            if (error.error?.message.includes('config')) {
                categories.configuration_issues++;
            }
        });

        return categories;
    }

    generateRecommendations(dayLogs) {
        const recommendations = [];

        // Performance recommendations
        const slowRequests = dayLogs.performance.filter(l => l.event === 'slow_request');
        if (slowRequests.length > 5) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                issue: `${slowRequests.length} slow requests detected`,
                suggestion: 'Consider caching strategies or optimize slow endpoints'
            });
        }

        // Error recommendations
        if (dayLogs.errors.length > 10) {
            recommendations.push({
                type: 'reliability',
                priority: 'high',
                issue: `${dayLogs.errors.length} errors occurred`,
                suggestion: 'Review error patterns and implement better error handling'
            });
        }

        // Framework recommendations
        const unknownFrameworks = dayLogs.app.filter(l => l.event === 'framework_unknown');
        if (unknownFrameworks.length > 0) {
            recommendations.push({
                type: 'framework',
                priority: 'medium',
                issue: `${unknownFrameworks.length} activities with unknown framework`,
                suggestion: 'Review framework detection logic or add activity.config.json files'
            });
        }

        return recommendations;
    }

    analyzeBrowserEvents(browserLogs) {
        const userSessions = new Map();
        const userActions = {};
        const pageViews = {};
        const errors = [];
        const performanceMetrics = [];

        browserLogs.forEach(log => {
            const sessionId = log.sessionId || log.correlationId;
            const userId = log.userId;
            const activity = log.activity;

            // Track user sessions
            if (sessionId) {
                if (!userSessions.has(sessionId)) {
                    userSessions.set(sessionId, {
                        sessionId,
                        userId,
                        activity,
                        startTime: log.timestamp,
                        endTime: log.timestamp,
                        events: []
                    });
                }
                const session = userSessions.get(sessionId);
                session.endTime = log.timestamp;
                session.events.push(log);
            }

            // Track user actions
            if (log.event === 'user_action') {
                const action = log.action || 'unknown';
                userActions[action] = (userActions[action] || 0) + 1;
            }

            // Track page views
            if (log.event === 'page_view') {
                const url = log.url || 'unknown';
                pageViews[url] = (pageViews[url] || 0) + 1;
            }

            // Track browser errors
            if (log.level === 'error') {
                errors.push({
                    timestamp: log.timestamp,
                    event: log.event,
                    message: log.message,
                    activity: log.activity,
                    sessionId: sessionId
                });
            }

            // Track performance metrics
            if (log.event === 'performance_metric') {
                performanceMetrics.push({
                    metric: log.metric,
                    value: log.value,
                    activity: log.activity,
                    timestamp: log.timestamp
                });
            }
        });

        // Calculate session statistics
        const sessionStats = Array.from(userSessions.values()).map(session => {
            const duration = new Date(session.endTime) - new Date(session.startTime);
            return {
                sessionId: session.sessionId,
                duration_ms: duration,
                eventCount: session.events.length,
                activity: session.activity
            };
        });

        const avgSessionDuration = sessionStats.length > 0 
            ? sessionStats.reduce((sum, s) => sum + s.duration_ms, 0) / sessionStats.length 
            : 0;

        return {
            total_sessions: userSessions.size,
            total_browser_events: browserLogs.length,
            unique_users: new Set(browserLogs.map(l => l.userId).filter(Boolean)).size,
            user_actions: userActions,
            page_views: pageViews,
            browser_errors: errors,
            performance_metrics: performanceMetrics,
            average_session_duration_ms: Math.round(avgSessionDuration),
            session_statistics: sessionStats
        };
    }

    analyzeUserJourneys(browserLogs, appLogs) {
        const journeys = new Map();

        // Group events by session
        browserLogs.forEach(log => {
            const sessionId = log.sessionId || log.correlationId;
            if (!sessionId) return;

            if (!journeys.has(sessionId)) {
                journeys.set(sessionId, {
                    sessionId,
                    userId: log.userId,
                    activity: log.activity,
                    events: []
                });
            }
            journeys.get(sessionId).events.push({
                timestamp: log.timestamp,
                source: 'browser',
                event: log.event,
                data: log
            });
        });

        // Add correlated server events
        appLogs.forEach(log => {
            if (log.event === 'request_start' || log.event === 'request_end') {
                // Try to correlate with browser sessions based on timing and activity
                const requestTime = new Date(log.timestamp);
                const activity = this.extractActivityFromUrl(log.url);

                for (const journey of journeys.values()) {
                    if (journey.activity === activity) {
                        const sessionEvents = journey.events.filter(e => e.source === 'browser');
                        const hasRecentBrowserActivity = sessionEvents.some(e => {
                            const eventTime = new Date(e.timestamp);
                            return Math.abs(requestTime - eventTime) < 30000; // 30 seconds
                        });

                        if (hasRecentBrowserActivity) {
                            journey.events.push({
                                timestamp: log.timestamp,
                                source: 'server',
                                event: log.event,
                                data: log
                            });
                        }
                    }
                }
            }
        });

        // Analyze journey patterns
        const journeyPatterns = {};
        const completedJourneys = [];

        for (const journey of journeys.values()) {
            // Sort events by timestamp
            journey.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            // Create journey signature
            const eventSequence = journey.events.map(e => e.event).join(' → ');
            journeyPatterns[eventSequence] = (journeyPatterns[eventSequence] || 0) + 1;

            // Mark completed journeys (sessions that ended normally)
            const hasSessionEnd = journey.events.some(e => e.event === 'session_end');
            if (hasSessionEnd) {
                const startTime = new Date(journey.events[0].timestamp);
                const endTime = new Date(journey.events[journey.events.length - 1].timestamp);
                completedJourneys.push({
                    sessionId: journey.sessionId,
                    duration_ms: endTime - startTime,
                    eventCount: journey.events.length,
                    activity: journey.activity
                });
            }
        });

        return {
            total_journeys: journeys.size,
            completed_journeys: completedJourneys.length,
            average_events_per_journey: journeys.size > 0 
                ? Array.from(journeys.values()).reduce((sum, j) => sum + j.events.length, 0) / journeys.size 
                : 0,
            common_journey_patterns: Object.entries(journeyPatterns)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([pattern, count]) => ({ pattern, count })),
            journey_completion_rate: journeys.size > 0 ? completedJourneys.length / journeys.size : 0
        };
    }

    correlateBrowserServerLogs(browserLogs, appLogs, errorLogs) {
        const correlations = [];
        const timeWindow = 5000; // 5 seconds

        // Find browser events that correlate with server events
        browserLogs.forEach(browserLog => {
            const browserTime = new Date(browserLog.timestamp);
            const activity = browserLog.activity;
            const sessionId = browserLog.sessionId;

            // Look for server events within time window
            const correlatedServerEvents = appLogs.filter(serverLog => {
                const serverTime = new Date(serverLog.timestamp);
                const timeDiff = Math.abs(browserTime - serverTime);
                const matchesActivity = this.extractActivityFromUrl(serverLog.url) === activity;
                
                return timeDiff <= timeWindow && matchesActivity;
            });

            // Look for errors that might be related
            const correlatedErrors = errorLogs.filter(errorLog => {
                const errorTime = new Date(errorLog.timestamp);
                const timeDiff = Math.abs(browserTime - errorTime);
                
                return timeDiff <= timeWindow;
            });

            if (correlatedServerEvents.length > 0 || correlatedErrors.length > 0) {
                correlations.push({
                    browser_event: {
                        timestamp: browserLog.timestamp,
                        event: browserLog.event,
                        sessionId: sessionId,
                        activity: activity
                    },
                    server_events: correlatedServerEvents.map(e => ({
                        timestamp: e.timestamp,
                        event: e.event,
                        url: e.url,
                        duration_ms: e.duration_ms
                    })),
                    errors: correlatedErrors.map(e => ({
                        timestamp: e.timestamp,
                        context: e.context,
                        message: e.error?.message
                    }))
                });
            }
        });

        // Analyze correlation patterns
        const correlationTypes = {};
        correlations.forEach(corr => {
            const key = `${corr.browser_event.event} → ${corr.server_events.map(e => e.event).join(',')}`;
            correlationTypes[key] = (correlationTypes[key] || 0) + 1;
        });

        return {
            total_correlations: correlations.length,
            correlation_patterns: Object.entries(correlationTypes)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([pattern, count]) => ({ pattern, count })),
            detailed_correlations: correlations.slice(0, 20), // Limit for readability
            browser_server_sync_rate: browserLogs.length > 0 ? correlations.length / browserLogs.length : 0
        };
    }

    extractActivityFromUrl(url) {
        if (!url) return null;
        const match = url.match(/^\/([^\/]+)\/([^\/]+)/);
        return match ? match[2] : null;
    }

    // Generate LLM-friendly report
    generateLLMReport(date = new Date().toISOString().split('T')[0]) {
        const summary = this.generateDailySummary(date);
        
        const report = `# C4R Activity Server Daily Report - ${date}

## Executive Summary
- **Total Requests**: ${summary.overview.total_requests}
- **Error Count**: ${summary.overview.total_errors}
- **Activities Accessed**: ${summary.overview.activities_accessed}
- **Server Restarts**: ${summary.overview.server_restarts}

## Performance Metrics
- **Average Response Time**: ${summary.performance_analysis.average_response_time_ms}ms
- **Slow Requests**: ${summary.performance_analysis.slow_requests_count}
- **Slowest Request**: ${summary.performance_analysis.slowest_request}ms

## Error Analysis
${summary.error_analysis.critical_patterns.length > 0 ? 
`### Critical Error Patterns:
${summary.error_analysis.critical_patterns.map(p => 
`- **${p.message}** (${p.occurrences} occurrences, ${p.severity} severity)`
).join('\n')}` : 'No critical error patterns detected.'}

## Framework Health
- **Framework Errors**: ${summary.framework_issues.framework_related_errors}
- **Detection Failures**: ${summary.framework_issues.unknown_framework_detections}

## Activity Statistics
${Object.entries(summary.activity_analysis.activities_by_type).map(([type, count]) => 
`- **${type}**: ${count} activities`
).join('\n')}

## Recommendations
${summary.recommendations.map(rec => 
`### ${rec.type.toUpperCase()} (${rec.priority} priority)
**Issue**: ${rec.issue}
**Suggestion**: ${rec.suggestion}`
).join('\n\n')}

---
*Generated at: ${summary.generated_at}*
*Analysis covers: ${date}*
`;

        const reportPath = path.join(this.analysisDir, `llm-report-${date}.md`);
        fs.writeFileSync(reportPath, report);

        return { report, summary, reportPath };
    }

    // CLI interface
    static cli() {
        const analyzer = new LogAnalyzer();
        const command = process.argv[2];
        const date = process.argv[3] || new Date().toISOString().split('T')[0];

        switch (command) {
            case 'summary':
                const summary = analyzer.generateDailySummary(date);
                console.log(`Daily summary generated for ${date}`);
                console.log(JSON.stringify(summary, null, 2));
                break;

            case 'report':
                const { report, reportPath } = analyzer.generateLLMReport(date);
                console.log(`LLM report generated: ${reportPath}`);
                console.log('\n' + report);
                break;

            default:
                console.log(`
Usage: node analyze-logs.js <command> [date]

Commands:
  summary [date]  - Generate JSON summary for specified date
  report [date]   - Generate LLM-friendly markdown report

Examples:
  node analyze-logs.js summary 2024-01-15
  node analyze-logs.js report
                `);
        }
    }
}

// CLI execution
if (require.main === module) {
    LogAnalyzer.cli();
}

module.exports = LogAnalyzer;