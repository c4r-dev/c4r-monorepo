
# Font Size Violation Fix Report

## Summary
- **Files processed**: 36
- **Violations found**: 251
- **Violations fixed**: 31
- **Errors encountered**: 0

## Font Size Mappings Used
- `12px` → `text-xs`
- `14px` → `text-sm`
- `16px` → `text-base`
- `18px` → `text-lg`
- `20px` → `text-xl`
- `24px` → `text-2xl`
- `32px` → `text-3xl`
- `0.75rem` → `text-xs`
- `0.875rem` → `text-sm`
- `1rem` → `text-base`
- `1.125rem` → `text-lg`
- `1.25rem` → `text-xl`
- `1.5rem` → `text-2xl`
- `2rem` → `text-3xl`
- `0.7rem` → `text-xs`
- `0.8rem` → `text-xs`
- `0.85rem` → `text-sm`
- `0.9rem` → `text-sm`
- `1.1rem` → `text-lg`
- `1.2rem` → `text-xl`
- `0.75em` → `text-xs`
- `0.875em` → `text-sm`
- `1em` → `text-base`
- `1.125em` → `text-lg`
- `1.25em` → `text-xl`
- `1.5em` → `text-2xl`
- `2em` → `text-3xl`
- `0.8em` → `text-xs`
- `0.9em` → `text-sm`
- `1.1em` → `text-lg`
- `1.2em` → `text-xl`

## Manual Actions Required
After running this script, you need to:
1. **Review commented violations** in JSX/JS files
2. **Replace inline styles** with proper className usage
3. **Update CSS files** to use Tailwind classes instead
4. **Test all activities** to ensure styling still works

## Common Patterns to Fix Manually:

### React Components:
```jsx
// Before:
<div style={{ fontSize: '1.2rem' }}>Text</div>

// After: 
<div className="text-xl">Text</div>
```

### Material-UI Components:
```jsx
// Before:
<Typography sx={{ fontSize: '0.8rem' }}>Text</Typography>

// After:
<Typography className="text-xs">Text</Typography>
```

### CSS Files:
```css
/* Before: */
.my-class {
  font-size: 1.2rem;
}

/* After: Use Tailwind class instead */
.my-class {
  @apply text-xl;
}
```



Generated: 2025-09-18T12:28:56.265Z
