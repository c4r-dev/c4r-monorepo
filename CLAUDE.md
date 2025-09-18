# CLAUDE.md

> AI maintainer guidance for Claude Code (claude.ai/code) - optimized for autonomous code understanding and modification.

## 🤖 Quick AI Context

**What this is:** C4R - Educational research activities monorepo  
**Stack:** Node.js + Express + Next.js + React + Vite  
**Key Features:** Unified server, shared dependencies, Vite HMR

## 🗺️ Repository Map

- **`server/seamless-activity-server.js`** - Main unified server
- **`server/seamless-activity-server-with-logging.js`** - Enhanced server with full logging infrastructure
- **`activities/`** - Research activities by domain (causality, randomization, coding-practices)
- **`apps/`** - Migrated activities with individual package.json
- **`packages/ui/`** - Shared UI components
- **`packages/logging/`** - Comprehensive logging system (browser + server)
- **`scripts/local-dev-server.js`** - Development server manager
- **`scripts/analyze-logs.js`** - Log analysis tool for LLM consumption
- **`logs/`** - Structured log files (app.jsonl, browser.jsonl, errors.jsonl, etc.)
- **`LOGGING.md`** - Complete logging documentation

## 🎯 Most Common AI Tasks

### Start Development Server
```bash
npm run local                  # Kill existing servers, start seamless server on port 3333
npm run dev                    # Start seamless server on port 3333
npm run dev:unified           # Start alternative unified server
npm run browse                # Open activity browser

# Enhanced logging server
node server/seamless-activity-server-with-logging.js  # Full logging infrastructure
```

### ⚡ Vite Hot Module Replacement (HMR)
Most development activities use **Vite** which provides **instant hot reloading**:
- ✅ **Code changes**: Auto-reload without server restart
- ✅ **CSS/styling**: Instant updates in browser
- ✅ **Component changes**: Hot swap React components
- ✅ **Configuration tweaks**: Most config changes apply immediately

**Server restart only needed for**:
- Package.json dependency changes
- Next.js configuration changes
- Server-side route modifications
- Environment variable updates

**Development workflow**: Just code and see changes instantly - no manual refreshing!

### Debug Activities
```bash
node debug-nextjs.js           # Debug with Puppeteer
```

### 📊 Logging & Analytics
```bash
# Generate daily analysis reports
node scripts/analyze-logs.js report              # LLM-friendly markdown report
node scripts/analyze-logs.js summary            # JSON summary for analysis

# Monitor logs in real-time
tail -f logs/*.jsonl                            # All logs
tail -f logs/browser.jsonl                      # Browser events only
tail -f logs/errors.jsonl                       # Errors only

# Access live metrics
curl http://localhost:3333/api/metrics          # Server metrics
curl http://localhost:3333/api/logs/errors      # Recent errors
curl http://localhost:3333/api/logs/browser     # Recent browser events
```

**Key Features:**
- ✅ **Dual Output**: Console logs for development + structured files for LLM analysis
- ✅ **Browser + Server Correlation**: Complete user journey tracking
- ✅ **Automatic Analysis**: Daily reports with actionable insights
- ✅ **Zero Setup**: Works seamlessly with existing activities

**See `LOGGING.md` for complete documentation.**

## 🔧 Server Architecture

Main server auto-discovers and serves activities on port 3333. Supports Next.js, React, and static files with shared dependencies.

## 🐛 Common Issues

- **Assets not loading**: Check asset routing in seamless server
- **Dependency issues**: Verify `NODE_PATH` setup and root `package.json`
- **Build failures**: Add missing dependencies to root package

## 🛠️ Development Commands

```bash
npm run local                # Kill servers + restart on 3333
npm run dev                  # Start seamless server
npm run browse               # Open activity browser
```

**URLs**:
- Dashboard: `http://localhost:3333/`
- Activity Browser: `http://localhost:3333/browse`

## 📁 Adding New Activities

1. Create directory under `activities/domain/` or `apps/`
2. Add `package.json` with dependencies
3. Add dependencies to root `package.json`
4. Restart server to auto-discover
5. Test at `/browse`