# CLAUDE.md

> AI maintainer guidance for Claude Code (claude.ai/code) - optimized for autonomous code understanding and modification.

## 🤖 Quick AI Context

**What this is:** C4R (Community for Rigor) - Educational research activities monorepo serving 91+ activities seamlessly  
**Stack:** Node.js + Express + Next.js + React + shared dependencies architecture  
**Key Features:** Single server, no individual npm installs, unified development environment  
**Current state:** Production-ready unified server with seamless activity serving

## 🗺️ Repository Map

- **`server/`** - Express server implementations
  - `server/seamless-activity-server.js` - Main unified server (serves all 91+ activities)
  - `server/unified-dev-server.js` - Alternative server approach
  - `server/activity-loader.js` - Dynamic activity loading utilities
- **`activities/`** - All research activities organized by domain
  - `activities/causality/` - Causality & reasoning activities
  - `activities/randomization/` - Randomization & statistics activities
  - `activities/coding-practices/` - Coding practices activities
  - `activities/collaboration/` - Collaboration tools
  - `activities/tools/` - Tools & utilities
- **`scripts/`** - Development automation (start-dev-server.js, build tools)
- **`packages/`** - Shared component library (UI components)
- **`templates/`** - Activity templates for new development

## 🎯 Most Common AI Tasks

### Start Development Server
```bash
npm run dev                     # Start seamless server on port 3333
npm run dev:unified            # Start alternative unified server
npm run browse                 # Open activity browser
```

### Debug Activities
```bash
node debug-nextjs.js           # Debug Next.js activities with Puppeteer
npm run dev:list              # List all available activities
```

### Activity Management
```bash
npm run dev:all               # Start all activities individually (old approach)
npm run dev:stop              # Stop all individual servers
```

**Working Directory**: `/Users/konrad_1/c4r-dev/c4r-dev`

## 🔧 Server Architecture

### Seamless Activity Server (`server/seamless-activity-server.js`)
- **Purpose**: Serves all 91+ activities from a single Express server
- **Port**: 3333 (configurable via PORT env var)
- **Key Features**:
  - Auto-discovers activities from standardized directory structure
  - Serves Next.js, Create React App, React, and static activities
  - Shared dependency resolution (no individual npm installs)
  - Framework detection and intelligent routing
  - Fallback mechanisms for failed activities

### Activity Discovery
Activities are auto-discovered from these directories:
- `activities/causality/`
- `activities/randomization/`
- `activities/coding-practices/`
- `activities/collaboration/`
- `activities/tools/`
- `templates/`

### Framework Support
- **Next.js**: Server-side rendering with shared dependencies
- **Create React App**: Static build serving
- **React**: Source-based serving
- **Static**: Direct file serving

## 🐛 Common Issues & Solutions

### Next.js Static Assets Not Loading
**Problem**: 404 errors for `/_next/static/` assets  
**Solution**: Ensure proper asset routing in `serveNextJSSeamlessly` method

### Dependency Resolution Issues
**Problem**: Activities can't find shared dependencies  
**Solution**: Check `package-lock.json` exists in root, verify `NODE_PATH` setup

### Build Failures
**Problem**: Next.js builds failing due to missing dependencies  
**Solution**: Add missing deps to root `package.json`, run `npm install`

## 📊 Monitoring & Debugging

### Server Logs
- Real-time request logging: `${timestamp} ${method} ${url}`
- Activity initialization: `🚀 Initializing Next.js app: ${name}`
- Success indicators: `✅ Next.js app ready: ${name}`
- Error tracking: `❌ Error serving ${name}: ${error}`

### Browser Debug
```bash
node debug-nextjs.js          # Puppeteer-based browser debugging
```

### Activity Status
- Dashboard: `http://localhost:3333/`
- Activity Browser: `http://localhost:3333/browse`
- API endpoint: `http://localhost:3333/api/activities`

## 🛠️ Development Commands

```bash
# Server management
npm run dev                   # Start seamless server
npm run dev:unified          # Start unified server (alternative)

# Activity management  
npm run dev:list             # List all activities
npm run browse               # Open activity browser

# Debugging
node debug-nextjs.js         # Debug with Puppeteer
npm run test                 # Run tests (if available)
npm run build               # Build all activities
```

## 📝 File Structure Conventions

### Activity Structure
```
activities/domain/activity-name/
├── package.json              # Activity dependencies
├── src/                      # Source code
├── public/                   # Static assets
├── .next/                    # Next.js build output
├── build/                    # CRA build output
└── out/                      # Static export output
```

### Shared Dependencies
All dependencies are managed in root `package.json` to enable seamless serving without individual npm installs.

## 🔄 Adding New Activities

1. Create activity directory under appropriate domain
2. Add `package.json` with dependencies
3. Ensure framework follows existing patterns
4. Restart seamless server to auto-discover
5. Test via activity browser at `/browse`

## 🎯 Current Status

- ✅ 71 activities served seamlessly
- ✅ Unified dependency management
- ✅ Auto-discovery and routing
- ✅ Multiple framework support
- 🔄 Next.js static asset optimization in progress
- 📋 Puppeteer debugging integration added

## 🚀 Performance Notes

- Server startup: ~1-2 seconds for activity discovery
- Next.js initialization: ~2-3 seconds per app (lazy loaded)
- Memory usage: Shared dependencies reduce overall footprint
- Build caching: Static exports cached for faster serving