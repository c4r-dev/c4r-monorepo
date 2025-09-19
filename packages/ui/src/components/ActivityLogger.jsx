/**
 * React component that provides browser logging capabilities
 * Auto-loads the browser logger and provides easy tracking methods
 */
import { useEffect, useRef } from 'react';

/**
 * @typedef {Object} ActivityLoggerProps
 * @property {*} activityName
 * @property {*} children?
 */

// Load browser logger script
const loadBrowserLogger = () => {
  if (typeof window !== 'undefined' && !window.c4rLogger) {
    const script = document.createElement('script');
    script.src = '/packages/logging/browser-logger.js';
    script.async = true;
    document.head.appendChild(script);
  }
};

export function ActivityLogger({ activityName, children }: ActivityLoggerProps) {
  const loggerRef = useRef(null);

  useEffect(() => {
    loadBrowserLogger();
    
    // Wait for logger to be available
    const checkLogger = () => {
      if (window.c4rLogger) {
        loggerRef.current = window.c4rLogger;
        
        // Log activity load
        loggerRef.current.info('activity_loaded', {
          activity,
          timestamp).toISOString()
        });
        
        // Track performance
        loggerRef.current.trackLoadTimes();
        loggerRef.current.trackTimeOnPage();
      } else {
        setTimeout(checkLogger, 100);
      }
    };
    
    checkLogger();
  }, [activityName]);

  // Provide logging methods to child components
  const logUserAction = (action, data= {}) => {
    if (loggerRef.current) {
      loggerRef.current.trackUserAction(action, null, { activity, ...data });
    }
  };

  const logExperimentEvent = (phase, data= {}) => {
    if (loggerRef.current) {
      loggerRef.current.trackExperimentEvent(phase, { activity, ...data });
    }
  };

  const logError = (error, context= '') => {
    if (loggerRef.current) {
      loggerRef.current.error('activity_error', {
        activity,
        context,
        error,
          stack,
          name);
    }
  };

  // Add logging methods to window for easy access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.logUserAction = logUserAction;
      window.logExperimentEvent = logExperimentEvent;
      window.logError = logError;
    }
  }, []);

  return <>{children};
}

// Hook for using logger in components
export function useActivityLogger() {
  const logUserAction = (action, data= {}) => {
    if (window.c4rLogger) {
      window.c4rLogger.trackUserAction(action, null, data);
    }
  };

  const logExperimentEvent = (phase, data= {}) => {
    if (window.c4rLogger) {
      window.c4rLogger.trackExperimentEvent(phase, data);
    }
  };

  const logButtonClick = (buttonId, data= {}) => {
    if (window.c4rLogger) {
      const button = document.getElementById(buttonId);
      window.c4rLogger.trackButtonClick(button, data);
    }
  };

  return {
    logUserAction,
    logExperimentEvent,
    logButtonClick
  };
}

// TypeScript declarations
global {
  /**
 * @typedef {Object} Window
 * @property {*} c4rLogger
 * @property {*} logUserAction
 * @property {*} logExperimentEvent
 * @property {*} logError
 */
}

export default ActivityLogger;