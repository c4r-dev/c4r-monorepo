/**
 * C4R Design System - Standardized Colors, Fonts, and Typography
 * 
 * This file defines the complete design system for all C4R activities.
 * Use these values consistently across all activities for unified branding.
 */

// 8 Standardized Colors
const colors = {
  // Primary Brand Colors
  primary: '#6366f1',     // Indigo - main brand color
  secondary: '#8b5cf6',   // Purple - secondary actions
  
  // Semantic Colors  
  success: '#10b981',     // Green - success states
  warning: '#f59e0b',     // Amber - warnings
  danger: '#ef4444',      // Red - errors/danger
  
  // Neutral Colors
  neutral: '#6b7280',     // Gray - text and borders
  light: '#f8fafc',       // Light gray - backgrounds
  dark: '#1f2937',        // Dark gray - text and headers
};

// 5 Font Sizes (with Inter font family)
const typography = {
  xs: ['0.75rem', { lineHeight: '1rem' }],     // 12px - small labels
  sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px - body text small  
  base: ['1rem', { lineHeight: '1.5rem' }],    // 16px - body text
  lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px - headings small
  xl: ['1.25rem', { lineHeight: '1.75rem' }],  // 20px - headings large
};

// Font Family (already standardized to Inter)
const fontFamily = {
  sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
};

// Complete Tailwind Config Export
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: colors,
      fontSize: typography,
      fontFamily: fontFamily,
    },
  },
  plugins: [],
};

// CSS Custom Properties for non-Tailwind usage
const cssVariables = `
:root {
  /* Colors */
  --c4r-primary: ${colors.primary};
  --c4r-secondary: ${colors.secondary};
  --c4r-success: ${colors.success};
  --c4r-warning: ${colors.warning};
  --c4r-danger: ${colors.danger};
  --c4r-neutral: ${colors.neutral};
  --c4r-light: ${colors.light};
  --c4r-dark: ${colors.dark};
  
  /* Typography */
  --c4r-font-xs: 0.75rem;
  --c4r-font-sm: 0.875rem;
  --c4r-font-base: 1rem;
  --c4r-font-lg: 1.125rem;
  --c4r-font-xl: 1.25rem;
  
  /* Font Family */
  --c4r-font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
}
`;

// Utility Classes Reference
const utilityClasses = {
  // Color Classes
  'bg-primary': `background-color: ${colors.primary}`,
  'bg-secondary': `background-color: ${colors.secondary}`,
  'bg-success': `background-color: ${colors.success}`,
  'bg-warning': `background-color: ${colors.warning}`,
  'bg-danger': `background-color: ${colors.danger}`,
  'bg-neutral': `background-color: ${colors.neutral}`,
  'bg-light': `background-color: ${colors.light}`,
  'bg-dark': `background-color: ${colors.dark}`,
  
  'text-primary': `color: ${colors.primary}`,
  'text-secondary': `color: ${colors.secondary}`,
  'text-success': `color: ${colors.success}`,
  'text-warning': `color: ${colors.warning}`,
  'text-danger': `color: ${colors.danger}`,
  'text-neutral': `color: ${colors.neutral}`,
  'text-light': `color: ${colors.light}`,
  'text-dark': `color: ${colors.dark}`,
  
  // Typography Classes
  'text-xs': `font-size: ${typography.xs[0]}; line-height: ${typography.xs[1].lineHeight}`,
  'text-sm': `font-size: ${typography.sm[0]}; line-height: ${typography.sm[1].lineHeight}`,
  'text-base': `font-size: ${typography.base[0]}; line-height: ${typography.base[1].lineHeight}`,
  'text-lg': `font-size: ${typography.lg[0]}; line-height: ${typography.lg[1].lineHeight}`,
  'text-xl': `font-size: ${typography.xl[0]}; line-height: ${typography.xl[1].lineHeight}`,
};

// Export for documentation and reference
module.exports.designSystem = {
  colors,
  typography, 
  fontFamily,
  cssVariables,
  utilityClasses,
};

/*
USAGE EXAMPLES:

1. In Tailwind classes:
   <button className="bg-primary text-light text-base">Click me</button>
   <h1 className="text-dark text-xl">Heading</h1>
   <p className="text-neutral text-sm">Body text</p>

2. In CSS with custom properties:
   .my-button {
     background-color: var(--c4r-primary);
     color: var(--c4r-light);
     font-size: var(--c4r-font-base);
     font-family: var(--c4r-font-family);
   }

3. Available color options:
   - primary (indigo)
   - secondary (purple) 
   - success (green)
   - warning (amber)
   - danger (red)
   - neutral (gray)
   - light (light gray)
   - dark (dark gray)

4. Available font sizes:
   - text-xs (12px)
   - text-sm (14px) 
   - text-base (16px)
   - text-lg (18px)
   - text-xl (20px)
*/