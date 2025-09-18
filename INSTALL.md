# 🚀 C4R Quick Install Guide

**Having trouble installing? This guide fixes common issues.**

## ⚡ One-Command Install

```bash
# Clone and auto-install (recommended)
git clone https://github.com/c4r-dev/c4r-monorepo.git
cd c4r-monorepo
npm run quick-install
```

## 🔧 Manual Install (if auto-install fails)

```bash
# 1. Install core dependencies only
npm install --production

# 2. Start the server (will auto-install missing deps)
npm run local
```

## 🚨 Common Issues & Fixes

### "npm install taking forever"
```bash
# Use faster npm settings
npm config set fetch-retries 2
npm config set fetch-retry-factor 10
npm config set fetch-retry-mintimeout 10000
npm install
```

### "Permission denied errors"
```bash
# Fix npm permissions (Mac/Linux)
sudo chown -R $(whoami) ~/.npm
npm install
```

### "Out of memory during install"
```bash
# Increase memory limit
export NODE_OPTIONS="--max_old_space_size=4096"
npm install
```

### "Python/build errors"
```bash
# Skip optional dependencies that need compilation
npm install --ignore-scripts --no-optional
```

## ✅ Verify Installation

```bash
# Should start server on http://localhost:3333
npm run local

# If working, you'll see:
# ✅ Seamless server started on port 3333
# 📱 Visit: http://localhost:3333
```

## 💡 Alternative: Docker Install

```bash
# If npm install keeps failing, use Docker
docker build -t c4r-dev .
docker run -p 3333:3333 c4r-dev
```

## 🆘 Still Having Issues?

1. **Clear npm cache**: `npm cache clean --force`
2. **Delete node_modules**: `rm -rf node_modules && npm install`
3. **Use yarn instead**: `yarn install`
4. **Check Node version**: `node --version` (needs >= 18.0.0)

**Get help**: Open an issue with your error message at [github.com/c4r-dev/c4r-monorepo/issues](https://github.com/c4r-dev/c4r-monorepo/issues)