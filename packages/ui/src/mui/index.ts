// C4R MUI Components - Pre-configured Material-UI components with C4R theming
// This centralizes MUI usage across all 90+ activities with enhanced TypeScript support

// Core MUI re-exports with C4R theming
export { default as C4RThemeProvider } from './ThemeProvider';
export { default as C4RTheme, createC4RTheme, c4rColors } from './theme';

// Form Components (most commonly used across activities)
export { default as C4RButton } from './components/C4RButton';
export { default as C4RTextField } from './components/C4RTextField';
export { default as C4RSelect } from './components/C4RSelect';
export { default as C4RCheckbox } from './components/C4RCheckbox';
export { default as C4RRadio } from './components/C4RRadio';
export { default as C4RSwitch } from './components/C4RSwitch';

// Layout Components (replaces 85+ Box/Grid imports)
export { default as C4RBox } from './components/C4RBox';
export { default as C4RGrid } from './components/C4RGrid';
export { default as C4RContainer } from './components/C4RContainer';
export { default as C4RPaper } from './components/C4RPaper';
export { default as C4RCard } from './components/C4RCard';

// Feedback Components (alerts, dialogs, snackbars)
export { default as C4RAlert } from './components/C4RAlert';
export { default as C4RDialog } from './components/C4RDialog';
export { default as C4RSnackbar } from './components/C4RSnackbar';
export { default as C4RTooltip } from './components/C4RTooltip';

// Data Display (tables, lists, chips)
export { default as C4RTable } from './components/C4RTable';
export { default as C4RList } from './components/C4RList';
export { default as C4RChip } from './components/C4RChip';
export { default as C4RBadge } from './components/C4RBadge';

// Navigation Components
export { default as C4RTabs } from './components/C4RTabs';
export { default as C4RBreadcrumbs } from './components/C4RBreadcrumbs';
export { default as C4RStepper } from './components/C4RStepper';

// Progress & Loading
export { default as C4RProgress } from './components/C4RProgress';
export { default as C4RSkeleton } from './components/C4RSkeleton';

// Icons (centralized icon management)
export { default as C4RIcon } from './components/C4RIcon';
export * from './icons';

// Enhanced Activity-specific compound components
export { default as C4RActivityLayout } from './components/C4RActivityLayout';
export { default as C4RDataTable } from './components/C4RDataTable';
export { default as C4RQuestionCard } from './components/C4RQuestionCard';
export { default as SessionConfigDialog } from './components/SessionConfigDialog';

// Typography (enforces 7-size font system)
export { default as C4RTypography } from './components/C4RTypography';

// Hooks for MUI integration
export { default as useC4RTheme } from './hooks/useC4RTheme';
export { default as useC4RBreakpoints } from './hooks/useC4RBreakpoints';
export { default as useC4RMediaQuery } from './hooks/useC4RMediaQuery';

// Types
export type { C4RButtonProps } from './components/C4RButton';
export type { C4RTextFieldProps } from './components/C4RTextField';
export type { C4RThemeType } from './theme';