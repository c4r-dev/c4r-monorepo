// C4R MUI Components - Pre-configured Material-UI components with C4R theming
// This centralizes MUI usage across all 90+ activities with enhanced TypeScript support

// Core MUI re-exports with C4R theming
export { default as C4RThemeProvider } from './ThemeProvider';
export { default as C4RTheme } from './theme';

// Form Components (most commonly used across activities)
export { default as C4RButton } from './components/C4RButton';

// Components that actually exist:

// Enhanced Activity-specific compound components
export { default as C4RActivityLayout } from './components/C4RActivityLayout';
export { default as C4RDataTable } from './components/C4RDataTable';
export { default as C4RQuestionCard } from './components/C4RQuestionCard';
export { default as SessionConfigDialog } from './components/SessionConfigDialog';

// Types
export type { C4RButtonProps } from './components/C4RButton';