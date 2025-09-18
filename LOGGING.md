# 📊 C4R Logging Infrastructure

Complete browser + server logging system designed for 3-developer teams with heavy LLM usage.

## 🎯 Overview

This logging infrastructure provides:
- **Dual Output**: Console logs for development + structured files for LLM analysis
- **Browser + Server Correlation**: Complete user journey tracking
- **Automatic Analysis**: Daily reports with actionable insights
- **Zero Setup**: Works seamlessly with existing C4R activities

## 🏗️ Architecture

```
├── packages/logging/
│   ├── logger.js              # Server-side Winston logger
│   ├── browser-logger.js      # Client-side logging
│   └── package.json
├── packages/ui/src/components/
│   └── ActivityLogger.tsx     # React logging component
├── scripts/
│   └── analyze-logs.js        # Log analysis & LLM reports
├── logs/                      # Generated log files
│   ├── app.jsonl             # Server events & requests
│   ├── browser.jsonl         # Client-side events
│   ├── errors.jsonl          # All errors
│   ├── activities.jsonl      # Activity-specific events
│   ├── performance.jsonl     # Performance metrics
│   └── analysis/
│       ├── daily-summary-*.json
│       └── llm-report-*.md
└── server/
    └── seamless-activity-server-with-logging.js
```

## 🚀 Quick Start

### 1. Server Logging (Already Active)

The enhanced server automatically logs:

```javascript
// Server events
logger.app.info('User action completed', { 
  userId: 123, 
  action: 'create_activity',
  duration_ms: 450 
});

// Errors with context
logger.llmError('nextjs_init', error, 'user_clicked_start');

// Performance tracking
logger.perf.warn('Slow database query', { 
  query: 'SELECT * FROM activities',
  duration_ms: 2300 
});
```

**Console Output**: Colorized, human-readable
**File Output**: Structured JSONL for LLM analysis

### 2. Browser Logging (Add to Activities)

**Simple Integration** - Add to any activity's layout:

```javascript
import { ActivityLogger } from '@c4r/ui/components/ActivityLogger';

export default function Layout({ children }) {
  return (
    <ActivityLogger activityName="your-activity-name">
      <div>{children}</div>
    </ActivityLogger>
  );
}
```

**Manual Tracking** - Use anywhere in your components:

```javascript
// Track user actions
window.logUserAction('button_clicked', { button: 'start_experiment' });

// Track experiment phases
window.logExperimentEvent('experiment_started', { condition: 'A' });

// Track errors
window.logError(new Error('Something went wrong'), 'form_submission');
```

**Hook-based Approach**:

```javascript
import { useActivityLogger } from '@c4r/ui/components/ActivityLogger';

export default function ExperimentComponent() {
  const { logUserAction, logExperimentEvent, logButtonClick } = useActivityLogger();
  
  const handleStart = () => {
    logExperimentEvent('experiment_started', { 
      condition: 'A',
      participant_id: userId 
    });
    // your existing code
  };

  const handleButtonClick = (buttonId) => {
    logButtonClick(buttonId, { timestamp: Date.now() });
    // your existing code
  };
}
```

### 3. Automatic Browser Tracking

The browser logger automatically captures:

- **Page Views**: URL, title, referrer
- **User Actions**: Clicks, form submissions, navigation
- **Errors**: JavaScript errors, unhandled promises
- **Performance**: Load times, response times
- **Session Data**: User sessions with correlation IDs
- **Connectivity**: Online/offline status changes

## 📋 Log File Structure

### Server Logs (`app.jsonl`)
```json
{
  "timestamp": "2025-09-18T13:14:37.851Z",
  "level": "info",
  "message": "Server initialization started",
  "event": "server_init_start",
  "service": "c4r-app",
  "port": 3333,
  "baseDir": "/Users/user/c4r-dev"
}
```

### Browser Logs (`browser.jsonl`)
```json
{
  "timestamp": "2025-09-18T13:15:22.123Z",
  "level": "info",
  "event": "user_action",
  "sessionId": "1726672522abc123",
  "userId": "anon-1726672522xyz789",
  "activity": "smi-ran-ran-lit-v1",
  "action": "button_click",
  "element": {
    "tag": "BUTTON",
    "id": "start-experiment",
    "className": "btn btn-primary"
  },
  "source": "browser"
}
```

### Error Logs (`errors.jsonl`)
```json
{
  "timestamp": "2025-09-18T13:16:45.789Z",
  "level": "error",
  "message": "LLM-trackable error",
  "event": "llm_error",
  "context": "nextjs_init",
  "userAction": "user_started_activity",
  "error": {
    "message": "Module not found: @c4r/ui/mui",
    "stack": "Error: Module not found...",
    "name": "ModuleNotFoundError"
  },
  "service": "c4r-app"
}
```

## 🔗 Browser-Server Correlation

The system automatically correlates browser and server events using:

- **Session IDs**: Unique identifiers for user sessions
- **Activity Names**: Links browser events to server activity routes
- **Timestamp Correlation**: Events within 5-second windows
- **Request IDs**: Server requests linked to browser actions

Example correlated events:
```
Browser: user_action (button_click) → Server: request_start → Server: request_end
```

## 📊 Daily Analysis

### Generate Reports

```bash
# Generate LLM-friendly daily report
node scripts/analyze-logs.js report

# Generate JSON summary for specific date
node scripts/analyze-logs.js summary 2025-09-18

# View recent logs
tail -f logs/*.jsonl
```

### Sample Analysis Output

```json
{
  "date": "2025-09-18",
  "overview": {
    "total_requests": 1247,
    "total_errors": 3,
    "activities_accessed": 12,
    "unique_users": 45
  },
  "browser_analysis": {
    "total_sessions": 52,
    "average_session_duration_ms": 180000,
    "user_actions": {
      "button_click": 156,
      "form_submit": 23,
      "page_view": 89
    },
    "browser_errors": []
  },
  "correlation_analysis": {
    "total_correlations": 234,
    "browser_server_sync_rate": 0.87,
    "correlation_patterns": [
      { "pattern": "user_action → request_start,request_end", "count": 89 }
    ]
  },
  "user_journey_analysis": {
    "total_journeys": 52,
    "completed_journeys": 47,
    "journey_completion_rate": 0.90,
    "common_journey_patterns": [
      { "pattern": "session_start → page_view → user_action → session_end", "count": 23 }
    ]
  },
  "recommendations": [
    {
      "type": "performance",
      "priority": "medium",
      "issue": "Average session duration is high",
      "suggestion": "Consider optimizing user workflows"
    }
  ]
}
```

## 🛠️ Development Workflow

### Daily Development
```bash
# Start enhanced server with logging
node server/seamless-activity-server-with-logging.js

# Monitor logs in real-time
tail -f logs/*.jsonl

# Check server metrics
curl http://localhost:3333/api/metrics
```

### LLM Analysis Sessions
```bash
# Before starting Claude session
node scripts/analyze-logs.js report

# Share with LLM:
# 1. Daily summary: logs/analysis/daily-summary-YYYY-MM-DD.json
# 2. Performance metrics: http://localhost:3333/api/metrics
# 3. Recent errors: http://localhost:3333/api/logs/errors
```

## 🎯 Common Use Cases

### 1. Track Experiment Phases
```javascript
// In your experiment component
const { logExperimentEvent } = useActivityLogger();

const phases = ['intro', 'practice', 'main', 'debrief'];
let currentPhase = 0;

const nextPhase = () => {
  logExperimentEvent('phase_transition', {
    from: phases[currentPhase],
    to: phases[currentPhase + 1],
    participant_id: userId,
    elapsed_time: Date.now() - experimentStart
  });
  currentPhase++;
};
```

### 2. Track User Interactions
```javascript
// Button clicks
const handleChoice = (choice) => {
  window.logUserAction('choice_made', {
    choice,
    reaction_time: Date.now() - stimulusStart,
    trial_number: currentTrial
  });
};

// Form submissions
const handleSubmit = (formData) => {
  window.logUserAction('form_submit', {
    form_type: 'survey',
    fields_completed: Object.keys(formData).length,
    completion_time: Date.now() - formStart
  });
};
```

### 3. Track Performance Issues
```javascript
// Measure component render time
const ComponentWithLogging = () => {
  const { logUserAction } = useActivityLogger();
  
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const renderTime = performance.now() - start;
      if (renderTime > 1000) { // Log slow renders
        logUserAction('slow_render', {
          component: 'ExperimentView',
          render_time: renderTime
        });
      }
    };
  }, []);
};
```

### 4. Error Boundaries with Logging
```javascript
class ErrorBoundaryWithLogging extends React.Component {
  componentDidCatch(error, errorInfo) {
    window.logError(error, 'react_error_boundary');
    
    // Also log to server
    fetch('/api/browser-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'react_error',
        error: {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        },
        timestamp: new Date().toISOString()
      })
    });
  }
}
```

## 🔍 LLM Query Patterns

The structured logs answer common questions:

### "What errors occurred today?"
```bash
# Query: logs/errors.jsonl
cat logs/errors.jsonl | jq '.event, .context, .error.message'
```

### "Which activities are users struggling with?"
```bash
# Query: Daily summary → browser_analysis → browser_errors
node scripts/analyze-logs.js summary | jq '.browser_analysis.browser_errors'
```

### "How are users navigating through experiments?"
```bash
# Query: Daily summary → user_journey_analysis
node scripts/analyze-logs.js summary | jq '.user_journey_analysis.common_journey_patterns'
```

### "What's the correlation between browser actions and server performance?"
```bash
# Query: Daily summary → correlation_analysis
node scripts/analyze-logs.js summary | jq '.correlation_analysis'
```

## 🚨 Alerting & Monitoring

### Critical Patterns Detected
- Repeated error messages (>5 occurrences)
- Framework initialization failures  
- Performance degradation (>2s response times)
- High browser error rates
- Low journey completion rates

### Real-time Monitoring
```bash
# Live metrics dashboard
curl http://localhost:3333/api/metrics

# Error monitoring
curl http://localhost:3333/api/logs/errors

# Browser event stream
curl http://localhost:3333/api/logs/browser
```

## 🔧 Configuration

### Adjust Log Levels
Edit `packages/logging/logger.js`:
```javascript
// More verbose logging
level: 'debug'  // vs 'info'

// Less console output  
level: 'warn'   // Only warnings and errors
```

### Adjust Browser Tracking
Edit `packages/logging/browser-logger.js`:
```javascript
// Disable automatic page tracking
// Comment out: this.trackPageView();

// Adjust correlation time window
const timeWindow = 10000; // 10 seconds vs 5 seconds
```

### Custom Log Analysis
Add methods to `scripts/analyze-logs.js`:
```javascript
analyzeCustomMetrics(logs) {
  // Your custom analysis logic
}
```

## 📈 Best Practices

### For Developers
1. **Use structured logging** with consistent event types
2. **Include context** in every log entry (user action, activity, phase)
3. **Log user actions** that preceded errors
4. **Use appropriate log levels** (debug for development, info for production events)

### For LLM Sessions  
1. **Start with daily summary** for high-level overview
2. **Drill down to specific logs** for detailed analysis
3. **Cross-reference error patterns** with performance metrics
4. **Use log timestamps** to correlate events

### For Production
1. **Monitor error rates** - Set alerts for >10 errors/hour
2. **Track performance trends** - Alert on >500ms average response time
3. **Review daily reports** - Automated analysis highlights issues
4. **Archive old logs** - Keep 7 days for active analysis

## 🎉 Benefits

- **🔍 Complete Visibility**: See exactly what users do and how the system responds
- **🤖 LLM-Ready**: Structured data perfect for AI analysis and insights
- **⚡ Real-time**: Both console output for development and file logging for analysis
- **🔗 Correlated**: Browser and server events linked for complete user journeys
- **📊 Automated**: Daily reports with actionable recommendations
- **🚀 Zero Setup**: Works with existing C4R activities without modification

This logging infrastructure transforms debugging from reactive firefighting into proactive issue prevention, with LLMs as intelligent analysis partners! 🚀

## 🆘 Troubleshooting

### Browser Logger Not Working
```javascript
// Check if logger loaded
console.log(window.c4rLogger); // Should not be undefined

// Manually load logger
const script = document.createElement('script');
script.src = '/packages/logging/browser-logger.js';
document.head.appendChild(script);
```

### Log Files Not Created
```bash
# Check permissions
ls -la logs/

# Create logs directory
mkdir -p logs

# Check server startup logs for errors
```

### Correlation Not Working
```bash
# Check if session IDs are generated
grep "sessionId" logs/browser.jsonl

# Check if activities match between browser and server
grep "activity" logs/browser.jsonl logs/app.jsonl
```

### Performance Impact
The logging system is designed for minimal overhead:
- **File I/O**: Asynchronous, non-blocking
- **Memory**: Streaming writes, no accumulation
- **Network**: Browser logs batched and queued
- **CPU**: Negligible impact on application performance

---

*Happy Logging! 📊✨*