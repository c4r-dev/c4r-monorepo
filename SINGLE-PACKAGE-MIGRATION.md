# C4R Monorepo: Single Package.json Migration

## Current Status
✅ All dependencies synchronized to stable versions (React 18.x + Next.js 15.x)
✅ Individual activity package.json files updated
✅ Root package.json contains all consolidated dependencies
✅ package-lock.json regenerated successfully

## Migration to Single Package Architecture

### Phase 1: Validation (CURRENT)
```bash
# Test current system
npm run dev
node test-all-activities.js

# Validate dependencies
node validate-single-package.js
```

### Phase 2: Backup and Prepare
```bash
# Create comprehensive backup
node backup-individual-packages.js

# Replace root package.json with single package version
cp package-single.json package.json
npm install --legacy-peer-deps
```

### Phase 3: Remove Individual Package Files
```bash
# Remove all individual package.json files (CAREFUL!)
find activities -name "package.json" -delete

# Update .gitignore to ignore any new package.json in activities
echo "activities/**/package.json" >> .gitignore
```

### Phase 4: Update Seamless Server
Update `server/seamless-activity-server.js` to skip package.json discovery:
- Remove package.json file existence checks
- Use shared node_modules for all activities
- Simplify activity detection logic

### Phase 5: Test and Validate
```bash
# Test the new architecture
npm run dev
npm run pkg:test
npm run pkg:validate
```

## Benefits of Single Package Architecture
- **Simplified Dependency Management**: One package.json for all 71+ activities
- **Faster Installs**: No duplicate dependencies across activities
- **Version Consistency**: Guaranteed compatible versions across all activities
- **Easier Maintenance**: Single point of dependency updates
- **Reduced Disk Usage**: Shared node_modules instead of 69+ individual ones

## Rollback Plan
If issues occur:
1. Restore from backup-individual-packages/
2. Revert to backup-package-jsons/
3. Run `npm install --legacy-peer-deps`

## Key Files Created
- `package-single.json` - The consolidated single package.json
- `backup-individual-packages.js` - Backup script
- `validate-single-package.js` - Validation script
- `SINGLE-PACKAGE-MIGRATION.md` - This instruction file
