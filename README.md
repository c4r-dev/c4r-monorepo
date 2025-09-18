# 🎓 C4R Unified Development Environment

**No more npm install hell!** All 91+ activities served from a single command.

## 🚀 Quick Start

```bash
# Install shared dependencies once
npm install

# Start unified development server
npm run dev

# Visit the dashboard
open http://localhost:3333
```

**That's it!** All activities are now accessible via:
- **Dashboard**: `http://localhost:3333`
- **Activity Browser**: `http://localhost:3333/browse`
- **Individual Activities**: `http://localhost:3333/[domain]/[activity-name]`

## 📁 Activity URLs

### 🧠 Causality & Reasoning
- `http://localhost:3333/causality/jhu-flu-dag-v1`
- `http://localhost:3333/causality/jhu-polio-ice-cream-v1`
- `http://localhost:3333/causality/jhu-polio-ice-cream-v2`

### 🎲 Randomization & Statistics  
- `http://localhost:3333/randomization/smi-ran-why-ran-v4`
- `http://localhost:3333/randomization/smi-ran-blk-ran-v4`
- `http://localhost:3333/randomization/smi-ran-ran-flo-v2`

### 💻 Coding Practices
- `http://localhost:3333/coding-practices/hms-aem-rig-fil-v1`
- `http://localhost:3333/coding-practices/hms-clean-code-comments-v0`
- `http://localhost:3333/coding-practices/hms-wason-246-v2`

### 🤝 Collaboration Tools
- `http://localhost:3333/collaboration/r2r-whiteboard-v1`
- `http://localhost:3333/collaboration/r2r-feed-back-v1`

### 🛠️ Tools & Utilities
- `http://localhost:3333/tools/c4r-email-api`
- `http://localhost:3333/tools/claude-chat`
- `http://localhost:3333/tools/D3Plots`

## 🎯 Key Features

### ✅ **Single Install Solution**
- **One `npm install`** installs dependencies for all activities
- **Shared node_modules** across all projects
- **No individual installs** required per activity

### 🎨 **Enhanced Design System**
- **C4R brand colors** integrated across all components (#6E00FF purple, #FF5A00 orange, #00C802 green)
- **Material-UI enhancement** with 85+ activities using unified theming
- **7-size font system** enforced (xs, sm, base, lg, xl, 2xl, 3xl)
- **Color violation detection** and automated fixing tools

### 🌐 **Unified Development Server**
- **Single port** (3000) serves all activities
- **Auto-discovery** of activities in the repo
- **Smart routing** based on directory structure
- **Framework detection** (Next.js, React, static)

### 🔍 **Activity Browser**
- **Visual dashboard** to explore all activities
- **Search & filter** by domain, technology, status
- **Direct links** to each activity
- **Status indicators** (Active, Archive, Latest)

### ⚡ **Smart Building**
- **On-demand building** for Next.js apps
- **Build caching** to avoid rebuilds
- **Fallback mechanisms** when builds fail
- **Development mode** with hot reloading

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Start unified server (recommended)
npm run dev:turbo        # Use Turbo for parallel development
npm run browse          # Open activity browser

# Legacy individual servers (not recommended)
npm run dev:all         # Start all activities on separate ports
npm run dev:stop        # Stop all individual servers
npm run dev:list        # List all available activities

# Production
npm run build           # Build all activities
npm run test            # Run all tests
npm run lint            # Lint all code

# Design System & Validation
npm run fix:font-sizes  # Fix font size violations across activities
npm run migrate:colors  # Migrate hardcoded colors to C4R brand system
npm run lint:font-sizes # Check for font size violations
npm run validate        # Comprehensive activity validation
```

## 📊 Architecture

### **Unified Server Structure**
```
server/
├── unified-dev-server.js    # Main server orchestrator
└── activity-loader.js       # Dynamic activity loading

activities/
├── causality/              # Auto-discovered
├── randomization/          # Auto-discovered  
├── coding-practices/       # Auto-discovered
├── collaboration/          # Auto-discovered
└── tools/                  # Auto-discovered
```

### **How It Works**
1. **Discovery**: Server scans directories for `package.json` files
2. **Classification**: Detects framework type (Next.js, React, etc.)
3. **Loading**: Dynamically loads activities without individual installs
4. **Routing**: Maps URLs to activities (`/domain/activity-name`)
5. **Building**: Builds on-demand using shared dependencies

### **Framework Support**
- ✅ **Next.js**: Full support with SSR/build optimization
- ✅ **Create React App**: Build and serve optimized bundles
- ✅ **React**: Direct serving with fallback mechanisms
- ✅ **Static**: Direct file serving
- ✅ **Generic**: Smart fallback for unknown types

## 🔧 Configuration

### **Environment Variables**
```bash
PORT=3333                    # Server port (default: 3333)
NODE_ENV=development         # Environment mode
BUILD_CACHE=true            # Enable build caching
```

### **Shared Dependencies**
All activities use these shared dependencies:
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1", 
  "next": "^14.2.18",
  "@mui/material": "^5.15.14",
  "@c4r/ui": "file:./packages/ui",
  "mongoose": "^8.15.1",
  "express": "^4.18.0"
}
```

## 🎨 C4R UI Component Library

### **Enhanced MUI Integration**
The `@c4r/ui` package provides production-ready components with C4R branding:

```tsx
import { 
  C4RThemeProvider,
  C4RActivityLayout,
  C4RButton,
  C4RDataTable,
  C4RQuestionCard 
} from '@c4r/ui/mui';

export default function MyActivity() {
  return (
    <C4RThemeProvider>
      <C4RActivityLayout title="Research Activity">
        <C4RButton variant="c4rPrimary">Take Action</C4RButton>
        <C4RDataTable data={results} searchable exportable />
      </C4RActivityLayout>
    </C4RThemeProvider>
  );
}
```

### **Component Features**
- **🎨 C4R Brand Colors**: Purple (#6E00FF), Orange (#FF5A00), Green (#00C802)
- **📱 Responsive Design**: Mobile-first with Tailwind integration
- **♿ Accessibility**: WCAG compliant with proper focus management
- **🔧 TypeScript**: Full type safety and IntelliSense support
- **📏 Typography**: 7-size font system enforcement
- **🚀 Activity Patterns**: Pre-built components for research workflows

### **Available Components**
- `C4RActivityLayout` - Standardized activity wrapper with navigation
- `C4RDataTable` - Feature-rich tables with sorting, search, export
- `C4RQuestionCard` - Interactive cards with drag-and-drop support
- `C4RButton` - Enhanced buttons with C4R brand variants
- `SessionConfigDialog` - Unified session configuration
- `ActivityHeader` - Consistent header with help integration

## 🚀 Development Workflow

### **Testing Activities During Refactor**
1. Start unified server: `npm run dev`
2. Open activity browser: `http://localhost:3333/browse`
3. Test specific activities while refactoring
4. Use search/filter to find consolidation candidates

### **Adding New Activities**
1. Create activity in appropriate domain folder
2. Add `package.json` with standard dependencies
3. Server auto-discovers and serves immediately
4. No additional configuration needed

### **Debugging Issues**
- Check console logs for build/serve errors
- Use `/api/activities` endpoint for activity metadata
- Individual activities show error pages with suggestions
- Fallback mechanisms handle most framework issues

## 📈 Performance Benefits

### **Before (Individual Installs)**
- 91 separate `npm install` commands
- 91 separate `node_modules` directories
- 5+ GB of duplicated dependencies
- 91 separate development servers

### **After (Unified System)**
- 1 `npm install` command
- 1 shared `node_modules` directory  
- ~500 MB of dependencies
- 1 unified development server
- **10x faster setup time**
- **90% less disk usage**

## 🎯 Perfect for Refactoring

This unified system provides:
- ✅ **Safe testing** during restructure
- ✅ **Quick iteration** on changes
- ✅ **Easy comparison** between activity versions
- ✅ **Consolidated dependency management**
- ✅ **Single source of truth** for all activities

**Ready to refactor with confidence!** 🎉