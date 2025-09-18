/**
 * React component that provides browser logging capabilities
 * Auto-loads the browser logger and provides easy tracking methods
 */
import { useEffect, useRef } from 'react';

interface ActivityLoggerProps {
  activityName: string;
  children?: React.ReactNode;
}

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
  const loggerRef = useRef<any>(null);

  useEffect(() => {
    loadBrowserLogger();
    
    // Wait for logger to be available
    const checkLogger = () => {
      if (window.c4rLogger) {
        loggerRef.current = window.c4rLogger;
        
        // Log activity load
        loggerRef.current.info('activity_loaded', {
          activity: activityName,
          timestamp: new Date().toISOString()
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
  const logUserAction = (action: string, data: any = {}) => {
    if (loggerRef.current) {
      loggerRef.current.trackUserAction(action, null, { activity: activityName, ...data });
    }
  };

  const logExperimentEvent = (phase: string, data: any = {}) => {
    if (loggerRef.current) {
      loggerRef.current.trackExperimentEvent(phase, { activity: activityName, ...data });
    }
  };

  const logError = (error: Error, context: string = '') => {
    if (loggerRef.current) {
      loggerRef.current.error('activity_error', {
        activity: activityName,
        context,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      });
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

  return <>{children}</>;
}

// Hook for using logger in components
export function useActivityLogger() {
  const logUserAction = (action: string, data: any = {}) => {
    if (window.c4rLogger) {
      window.c4rLogger.trackUserAction(action, null, data);
    }
  };

  const logExperimentEvent = (phase: string, data: any = {}) => {
    if (window.c4rLogger) {
      window.c4rLogger.trackExperimentEvent(phase, data);
    }
  };

  const logButtonClick = (buttonId: string, data: any = {}) => {
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
declare global {
  interface Window {
    c4rLogger: any;
    logUserAction: (action: string, data?: any) => void;
    logExperimentEvent: (phase: string, data?: any) => void;
    logError: (error: Error, context?: string) => void;
  }
}

export default ActivityLogger;