/**
 * Browser-side logging client for C4R activities
 * Correlates with server-side logs for complete LLM analysis
 */

class BrowserLogger {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.activityName = this.getActivityName();
        this.logQueue = [];
        this.isOnline = navigator.onLine;
        this.setupEventHandlers();
        this.startSession();
    }

    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getUserId() {
        // Try to get from localStorage, sessionStorage, or generate
        let userId = localStorage.getItem('c4r-user-id') || 
                    sessionStorage.getItem('c4r-user-id');
        
        if (!userId) {
            userId = 'anon-' + this.generateSessionId();
            sessionStorage.setItem('c4r-user-id', userId);
        }
        return userId;
    }

    getActivityName() {
        // Extract activity name from URL or meta tag
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1] || 
               document.querySelector('meta[name="activity"]')?.content ||
               'unknown';
    }

    setupEventHandlers() {
        // Auto-track page navigation
        this.trackPageView();
        
        // Track errors
        window.addEventListener('error', (event) => {
            this.error('javascript_error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.error('unhandled_promise_rejection', {
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack
            });
        });

        // Track visibility changes (user switching tabs)
        document.addEventListener('visibilitychange', () => {
            this.info('visibility_change', {
                visibility: document.visibilityState,
                hidden: document.hidden
            });
        });

        // Track online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.info('connectivity_change', { status: 'online' });
            this.flushQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.info('connectivity_change', { status: 'offline' });
        });

        // Track beforeunload for session end
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
    }

    startSession() {
        this.info('session_start', {
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            url: window.location.href,
            referrer: document.referrer
        });
    }

    endSession() {
        this.info('session_end', {
            duration_ms: Date.now() - parseInt(this.sessionId, 36)
        });
        this.flushQueue();
    }

    trackPageView() {
        this.info('page_view', {
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString()
        });
    }

    // Core logging methods
    log(level, event, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            event,
            sessionId: this.sessionId,
            userId: this.userId,
            activity: this.activityName,
            url: window.location.href,
            source: 'browser',
            ...data
        };

        this.sendLog(logEntry);
    }

    info(event, data) {
        this.log('info', event, data);
    }

    warn(event, data) {
        this.log('warn', event, data);
    }

    error(event, data) {
        this.log('error', event, data);
    }

    debug(event, data) {
        this.log('debug', event, data);
    }

    // High-level tracking methods
    trackUserAction(action, element = null, data = {}) {
        this.info('user_action', {
            action,
            element: element ? {
                tag: element.tagName,
                id: element.id,
                className: element.className,
                text: element.textContent?.substring(0, 100)
            } : null,
            ...data
        });
    }

    trackButtonClick(button, data = {}) {
        this.trackUserAction('button_click', button, data);
    }

    trackFormSubmit(form, data = {}) {
        this.trackUserAction('form_submit', form, {
            formId: form.id,
            formAction: form.action,
            ...data
        });
    }

    trackTimeOnPage() {
        const startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            this.info('time_on_page', {
                duration_ms: Date.now() - startTime
            });
        });
    }

    trackExperimentEvent(experimentPhase, data = {}) {
        this.info('experiment_event', {
            phase: experimentPhase,
            ...data
        });
    }

    // Performance tracking
    trackPerformance(metric, value, data = {}) {
        this.info('performance_metric', {
            metric,
            value,
            ...data
        });
    }

    trackLoadTimes() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                this.trackPerformance('page_load', perfData.loadEventEnd - perfData.loadEventStart, {
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    totalTime: perfData.loadEventEnd - perfData.fetchStart
                });
            }
        });
    }

    // Send logs to server
    async sendLog(logEntry) {
        if (!this.isOnline) {
            this.logQueue.push(logEntry);
            return;
        }

        try {
            const response = await fetch('/api/browser-logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logEntry)
            });

            if (!response.ok) {
                throw new Error(`Logging failed: ${response.status}`);
            }
        } catch (error) {
            // If sending fails, queue for retry
            this.logQueue.push(logEntry);
            console.warn('Failed to send log:', error);
        }
    }

    flushQueue() {
        if (this.logQueue.length === 0) return;

        const logsToSend = [...this.logQueue];
        this.logQueue = [];

        // Send queued logs
        fetch('/api/browser-logs/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ logs: logsToSend })
        }).catch(error => {
            // If batch send fails, put them back in queue
            this.logQueue.unshift(...logsToSend);
            console.warn('Failed to send queued logs:', error);
        });
    }
}

// Auto-initialize browser logger
const browserLogger = new BrowserLogger();

// Export for manual usage
window.c4rLogger = browserLogger;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserLogger;
}