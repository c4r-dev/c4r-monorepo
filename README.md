# C4R Monorepo

Community for Rigor (C4R) - Educational Research Activities Monorepo

## Structure

```
c4r-monorepo/
├── activities/
│   ├── causality/          # Causal inference activities (jhu-*)
│   ├── randomization/      # Randomization activities (smi-ran-*)
│   ├── coding-practices/   # Clean coding activities (hms-*)
│   ├── collaboration/      # Collaboration tools (r2r-*)
│   └── tools/             # Utility tools and widgets
├── templates/             # Reusable activity templates
├── packages/
│   ├── shared-components/ # Shared UI components
│   └── shared-infrastructure/ # Common utilities and configs
└── docs/                  # Documentation
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development servers for all apps
npm run dev

# Build all apps
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

## Working with Individual Activities

```bash
# Start a specific activity
cd activities/causality/jhu-flu-dag-v1
npm run dev

# Build a specific activity  
cd activities/randomization/smi-ran-why-ran-v4
npm run build
```

## Adding New Activities

1. Choose the appropriate category in `activities/`
2. Copy from `templates/activity-template-v1`
3. Update the package.json name and dependencies
4. Add any new dependencies to root workspace

## Technology Stack

- **Framework**: Next.js 15.x
- **Runtime**: React 19
- **Language**: TypeScript (migrating from JavaScript)
- **Database**: MongoDB with Mongoose
- **Styling**: Material-UI + Emotion
- **Build Tool**: Turbo (monorepo orchestration)
- **Deployment**: Vercel

## Contributing

1. Make changes in the appropriate subdirectory
2. Run tests: `npm run test`
3. Run linting: `npm run lint`
4. Build to verify: `npm run build`
5. Submit PR

## Repository Organization

### Activities
- **Causality**: Educational modules for causal inference concepts
- **Randomization**: Interactive tools for understanding randomization
- **Coding Practices**: Activities teaching clean coding principles  
- **Collaboration**: Tools for research collaboration workflows
- **Tools**: Utility applications and supporting tools

### Packages
- **shared-components**: Reusable React components
- **shared-infrastructure**: Database connections, API helpers, types

## License

MIT License - see individual package.json files for specific licensing.