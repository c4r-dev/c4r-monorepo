# 🤖 Logging Infrastructure for LLM Analysis

## Overview
This logging infrastructure is specifically designed for a 3-developer team with heavy LLM usage, providing both human-readable and machine-parseable logs.

## Architecture

### 📁 Log Files Structure
```
logs/
├── app.jsonl              # Main application events (structured JSON)
├── errors.jsonl           # Error-only logs for quick issue identification  
├── activities.jsonl       # Activity-specific events and metrics
├── performance.jsonl      # Performance metrics and slow request tracking
├── dev.jsonl              # Development/debug information
├── analysis/
│   ├── daily-summary-YYYY-MM-DD.json    # Daily aggregated metrics
│   └── llm-report-YYYY-MM-DD.md          # LLM-friendly reports
```

### 🎯 Log Categories

#### 1. **Application Logs** (`app.jsonl`)
- Server startup/shutdown events
- Request/response tracking with timing
- Framework detection results
- Route setup and initialization

#### 2. **Error Logs** (`errors.jsonl`)
- All errors with full stack traces
- Contextual information (user action, component)
- LLM-trackable error patterns
- Categorized by severity and frequency

#### 3. **Activity Logs** (`activities.jsonl`)
- Activity registration and startup
- Framework-specific initialization timing
- Next.js app creation and preparation
- Activity access patterns

#### 4. **Performance Logs** (`performance.jsonl`)
- Slow request detection (>1s)
- Response time distribution
- Resource usage patterns
- Bottleneck identification

## 🚀 Quick Start

### Basic Usage
```javascript
const logger = require('./packages/logging/logger');

// Application events
logger.app.info('User action completed', { 
  userId: 123, 
  action: 'create_activity',
  duration_ms: 450 
});

// Activity tracking
logger.activityStart('my-activity', { framework: 'nextjs' });
logger.activityEnd('my-activity', 1200, { success: true });

// LLM-friendly error logging
logger.llmError('nextjs_init', error, 'user_clicked_start');

// Performance tracking
logger.perf.warn('Slow database query', { 
  query: 'SELECT * FROM activities',
  duration_ms: 2300 
});
```

### Enhanced Server Integration
```javascript
// Replace seamless-activity-server.js with:
const EnhancedServer = require('./server/seamless-activity-server-with-logging');
const server = new EnhancedServer();
server.initialize();
```

## 🤖 LLM-Optimized Features

### Structured Event Logging
Every log entry includes:
- **timestamp**: ISO 8601 format
- **event**: Machine-readable event type
- **service**: Component identifier
- **requestId**: For request correlation
- **context**: Semantic context for LLMs

### Event Types for LLM Analysis
```javascript
// Server lifecycle
"server_init_start", "server_init_complete", "shutdown"

// Request tracking
"request_start", "request_end", "slow_request"

// Activity management
"activity_registered", "framework_detection", "nextjs_init"

// Error categorization
"llm_error", "404", "asset_not_found"

// Performance monitoring
"slow_request", "asset_served", "static_fallback"
```

### Automated Daily Analysis
```bash
# Generate LLM-ready daily report
npm run daily-report

# Generate structured summary
node scripts/analyze-logs.js summary

# Tail logs in real-time
npm run tail-logs
```

## 📊 Log Analysis Tools

### 1. **Daily Summary Generator**
Produces structured JSON summaries perfect for LLM consumption:
```json
{
  "date": "2024-01-15",
  "overview": {
    "total_requests": 1247,
    "total_errors": 3,
    "activities_accessed": 12
  },
  "error_analysis": {
    "critical_patterns": [...],
    "errors_by_context": {...}
  },
  "recommendations": [...]
}
```

### 2. **LLM-Friendly Reports**
Generates markdown reports with:
- Executive summary
- Error pattern analysis
- Performance bottlenecks
- Actionable recommendations

### 3. **Real-time Monitoring**
- `/api/metrics` - Live performance metrics
- `/api/logs/errors` - Recent error feed
- WebSocket integration for real-time updates

## 👥 Developer Workflow

### For Development
```bash
# Start enhanced server with full logging
npm run dev:enhanced

# Monitor logs in separate terminal
npm run tail-logs

# Debug specific issues
logger.dev.debug('Investigating import issue', { 
  activity: 'smi-ran-ran-lit-v1',
  import_path: '@c4r/ui/mui',
  resolved: false 
});
```

### For LLM Analysis Sessions
```bash
# Before starting Claude session
npm run daily-report

# Share with LLM:
# 1. Recent error logs: /api/logs/errors
# 2. Performance metrics: /api/metrics  
# 3. Daily summary: logs/analysis/daily-summary-YYYY-MM-DD.json
```

### For Production Debugging
```bash
# Generate comprehensive report
node scripts/analyze-logs.js report $(date -d "yesterday" +%Y-%m-%d)

# Clean old logs (keeps 7 days)
npm run clean-logs
```

## 🔍 LLM Query Patterns

### Common LLM Questions This Logging Answers:

1. **"What errors occurred today?"**
   - Query: `logs/errors.jsonl` or `/api/logs/errors`
   - Structured by context and frequency

2. **"Which activities are slow to load?"**
   - Query: `logs/performance.jsonl` 
   - Filtered by `event: "slow_request"`

3. **"What frameworks are having issues?"**
   - Query: Daily summary `framework_issues` section
   - Categorized by error type

4. **"How is server performance trending?"**
   - Query: Performance analysis with hourly breakdowns
   - Includes response time distribution

5. **"What should we fix first?"**
   - Query: Recommendations section in daily reports
   - Prioritized by impact and frequency

## 🚨 Alert Integration

### Critical Error Patterns
The system automatically identifies:
- Repeated error messages (>5 occurrences)
- Framework initialization failures
- Performance degradation (>2s response times)
- Activity loading failures

### Example Alert Log Entry
```json
{
  "timestamp": "2024-01-15T14:30:00.000Z",
  "level": "error",
  "message": "Critical error pattern detected",
  "event": "llm_error",
  "context": "nextjs_init",
  "pattern": "Module not found: @c4r/ui/mui",
  "occurrences": 7,
  "activities_affected": ["smi-ran-ran-lit-v1", "hms-bias-map-v0"],
  "suggested_action": "Fix import paths or create missing component"
}
```

## 📈 Metrics Dashboard

Access real-time metrics at: `http://localhost:3333/api/metrics`

```json
{
  "requestCount": 1247,
  "errorCount": 3,
  "activitiesLoaded": 85,
  "averageResponseTime": 234,
  "uptime_ms": 86400000,
  "slowRequests": 12,
  "frameworkBreakdown": {
    "nextjs": 45,
    "react": 25,
    "static": 15
  }
}
```

## 🎯 Best Practices

### For Developers
1. **Use structured logging** with consistent event types
2. **Include context** in every log entry
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

This logging infrastructure transforms debugging from reactive firefighting into proactive issue prevention, with LLMs as intelligent analysis partners! 🚀