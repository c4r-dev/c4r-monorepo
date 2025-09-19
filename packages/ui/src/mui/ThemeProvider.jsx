'use client';

import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider } from '@mui/material/styles';
import c4rTheme from './theme';

/**
 * @typedef {Object} C4RThemeProviderProps
 * @property {React.ReactNode} children
 * @property {*} theme - Override default C4R theme
 * @property {boolean} includeCssBaseline - Whether to include CssBaseline for global styles
 */

/**
 * C4R Theme Provider
 * 
 * Provides C4R-branded MUI theme to all child components.
 * Should wrap the entire application or individual activities.
 * 
 * Features:
 * - C4R brand colors (#6E00FF purple, #FF5A00 orange, #00C802 green)
 * - 7-size typography system (matches Tailwind config)
 * - GeneralSans font family
 * - Consistent component styling
 * 
 * @example
 * ```jsx
 * import { C4RThemeProvider } from '@c4r/ui/mui';
 * 
 * export default function App({ children }) {
 *   return (
 *     <C4RThemeProvider>
 *       {children}
 *     </C4RThemeProvider>
 *   );
 * }
 * ```
 */
export default function C4RThemeProvider({
  children,
  theme = c4rTheme,
  includeCssBaseline = true,
}) {
  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        {includeCssBaseline && <CssBaseline />}
        {children}
      </MuiThemeProvider>
    </StyledEngineProvider>
  );
}