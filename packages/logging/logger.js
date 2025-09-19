/**
 * C4R Unified Logging Infrastructure
 * Optimized for 3-developer team + LLM usage
 */

// Detect if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Only require Node.js modules if not in browser
let winston, path, fs;
if (!isBrowser) {
    winston = require('winston');
    path = require('path');
    fs = require('fs');
}

class C4RLogger {
    constructor() {
        this.isBrowser = isBrowser;
        
        if (this.isBrowser) {
            // Browser-compatible setup
            this.setupBrowserLoggers();
        } else {
            // Server setup
            this.logDir = '/Users/konrad_1/c4r-dev/logs';
            this.ensureLogDirectory();
            this.setupLoggers();
        }
    }

    ensureLogDirectory() {
        if (!this.isBrowser && !fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    setupLoggers() {
        // Common format for all loggers
        const baseFormat = winston.format.combine(
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss.SSS'
            }),
            winston.format.errors({ stack: true }),
            winston.format.json()
        );

        // Human-readable console format
        const consoleFormat = winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaStr = Object.keys(meta).length ? 
                    ` ${JSON.stringify(meta, null, 0)}` : '';
                return `${timestamp} ${level}: ${message}${metaStr}`;
            })
        );

        // Main application logger
        this.app = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: baseFormat,
            defaultMeta: { service: 'c4r-app' },
            transports: [
                // Console for development
                new winston.transports.Console({
                    format: consoleFormat,
                    level: 'info'
                }),
                // Structured logs for LLM analysis
                new winston.transports.File({
                    filename: path.join(this.logDir, 'app.jsonl'),
                    format: baseFormat,
                    level: 'debug'
                }),
                // Errors only
                new winston.transports.File({
                    filename: path.join(this.logDir, 'errors.jsonl'),
                    level: 'error',
                    format: baseFormat
                })
            ]
        });

        // Activity-specific logger
        this.activity = winston.createLogger({
            level: 'debug',
            format: baseFormat,
            defaultMeta: { service: 'activity' },
            transports: [
                new winston.transports.File({
                    filename: path.join(this.logDir, 'activities.jsonl'),
                    format: baseFormat
                })
            ]
        });

        // Development/Debug logger
        this.dev = winston.createLogger({
            level: 'debug',
            format: baseFormat,
            defaultMeta: { service: 'dev' },
            transports: [
                new winston.transports.Console({
                    format: consoleFormat,
                    level: 'debug'
                }),
                new winston.transports.File({
                    filename: path.join(this.logDir, 'dev.jsonl'),
                    format: baseFormat
                })
            ]
        });

        // Performance logger for monitoring
        this.perf = winston.createLogger({
            level: 'info',
            format: baseFormat,
            defaultMeta: { service: 'performance' },
            transports: [
                new winston.transports.File({
                    filename: path.join(this.logDir, 'performance.jsonl'),
                    format: baseFormat
                })
            ]
        });

        // Browser logger for client-side events
        this.browser = winston.createLogger({
            level: 'info',
            format: baseFormat,
            defaultMeta: { service: 'browser' },
            transports: [
                new winston.transports.File({
                    filename: path.join(this.logDir, 'browser.jsonl'),
                    format: baseFormat
                })
            ]
        });
    }

    setupBrowserLoggers() {
        // Create browser-compatible loggers using console methods
        const createBrowserLogger = (name, color = '#007bff') => ({
            debug: (message, meta = {}) => this.browserLog('debug', name, message, meta, color),
            info: (message, meta = {}) => this.browserLog('info', name, message, meta, color),
            warn: (message, meta = {}) => this.browserLog('warn', name, message, meta, '#ffc107'),
            error: (message, meta = {}) => this.browserLog('error', name, message, meta, '#dc3545'),
        });

        // Create the same logger structure as server
        this.app = createBrowserLogger('c4r-app', '#007bff');
        this.activity = createBrowserLogger('activity', '#fd7e14');
        this.perf = createBrowserLogger('performance', '#6f42c1');
        this.dev = createBrowserLogger('dev', '#28a745');
        this.browser = createBrowserLogger('browser', '#17a2b8');
    }

    browserLog(level, service, message, meta = {}, color = '#007bff') {
        const timestamp = new Date().toISOString();
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta, null, 0)}` : '';
        
        // Format message for console
        const formattedMessage = `%c[${timestamp}] [${service}] ${message}${metaStr}`;
        const styles = `color: ${color}; font-weight: bold;`;
        
        // Use appropriate console method
        switch (level) {
            case 'debug':
                console.debug(formattedMessage, styles);
                break;
            case 'info':
                console.info(formattedMessage, styles);
                break;
            case 'warn':
                console.warn(formattedMessage, styles);
                break;
            case 'error':
                console.error(formattedMessage, styles);
                break;
            default:
                console.log(formattedMessage, styles);
        }

        // Try to send to server for unified logging if possible
        this.sendToServerIfPossible(level, service, message, meta, timestamp);
    }

    sendToServerIfPossible(level, service, message, meta, timestamp) {
        // Only try in browser environment
        if (this.isBrowser && typeof fetch !== 'undefined') {
            try {
                // Send browser events to server for unified logging
                fetch('/api/logs/browser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        timestamp,
                        level,
                        service,
                        message,
                        meta,
                        url: window.location.href,
                        userAgent: navigator.userAgent,
                    }),
                }).catch(() => {
                    // Silently fail if server logging is not available
                });
            } catch (error) {
                // Silently fail - don't break the app if logging fails
            }
        }
    }

    // Helper methods for common logging patterns
    activityStart(activityName, meta = {}) {
        this.activity.info('Activity started', {
            activity: activityName,
            event: 'start',
            ...meta
        });
    }

    activityEnd(activityName, duration, meta = {}) {
        this.activity.info('Activity completed', {
            activity: activityName,
            event: 'end',
            duration_ms: duration,
            ...meta
        });
    }

    frameworkDetection(activityPath, detectedType, meta = {}) {
        this.app.info('Framework detected', {
            path: activityPath,
            framework: detectedType,
            event: 'framework_detection',
            ...meta
        });
    }

    nextjsInit(activityName, success, duration, meta = {}) {
        const level = success ? 'info' : 'error';
        this.app[level]('Next.js initialization', {
            activity: activityName,
            success,
            duration_ms: duration,
            event: 'nextjs_init',
            ...meta
        });
    }

    requestTracker(req, res, next) {
        const start = Date.now();
        const requestId = Math.random().toString(36).substr(2, 9);
        
        req.requestId = requestId;
        req.startTime = start;

        this.app.info('Request start', {
            requestId,
            method: req.method,
            url: req.url,
            userAgent: req.get('User-Agent'),
            event: 'request_start'
        });

        // Override res.end to log completion
        const originalEnd = res.end;
        res.end = (...args) => {
            const duration = Date.now() - start;
            
            this.app.info('Request end', {
                requestId,
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                duration_ms: duration,
                event: 'request_end'
            });

            // Log slow requests to performance logger
            if (duration > 1000) {
                this.perf.warn('Slow request', {
                    requestId,
                    method: req.method,
                    url: req.url,
                    duration_ms: duration,
                    event: 'slow_request'
                });
            }

            originalEnd.apply(res, args);
        };

        next();
    }

    // LLM-friendly error logging
    llmError(context, error, userAction = null, meta = {}) {
        this.app.error('LLM-trackable error', {
            context,
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            },
            userAction,
            event: 'llm_error',
            ...meta
        });
    }

    // Development debugging
    debug(message, meta = {}) {
        this.dev.debug(message, {
            event: 'debug',
            ...meta
        });
    }

    // Generate daily summary for LLM analysis
    generateDailySummary() {
        const today = new Date().toISOString().split('T')[0];
        const summaryPath = path.join(this.logDir, `summary-${today}.json`);
        
        // This would analyze logs and create a summary
        // Implementation would read the JSONL files and aggregate stats
        return summaryPath;
    }
}

// Singleton instance
const logger = new C4RLogger();

module.exports = logger;