/**
 * C4R Unified Logging Infrastructure
 * Optimized for 3-developer team + LLM usage
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

class C4RLogger {
    constructor() {
        this.logDir = path.join(process.cwd(), 'logs');
        this.ensureLogDirectory();
        
        // Create different loggers for different contexts
        this.setupLoggers();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
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