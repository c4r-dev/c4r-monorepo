# CLAUDE.md

> AI maintainer guidance for Claude Code (claude.ai/code) - optimized for autonomous code understanding and modification.

## 🤖 Quick AI Context

**What this is:** C4R - Educational research activities monorepo  
**Stack:** Node.js + Express + Next.js + React + Vite  
**Key Features:** Unified server, shared dependencies, Vite HMR

## 🗺️ Repository Map

- **`server/seamless-activity-server.js`** - Main unified server
- **`activities/`** - Research activities by domain (causality, randomization, coding-practices)
- **`apps/`** - Migrated activities with individual package.json
- **`packages/ui/`** - Shared UI components
- **`scripts/local-dev-server.js`** - Development server manager

## 🎯 Most Common AI Tasks

### Start Development Server
```bash
npm run local                  # Kill existing servers, start seamless server on port 3333
npm run dev                    # Start seamless server on port 3333
npm run dev:unified           # Start alternative unified server
npm run browse                # Open activity browser
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