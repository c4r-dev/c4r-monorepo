// C4R UI Component Library
// Consolidated from 33 Material-UI implementations across the monorepo

// Core Components (extracted from common patterns)
export { default as Header } from './components/Header';
export { default as ActivityLayout } from './components/ActivityLayout';
export { default as QRCodeDisplay } from './components/QRCodeDisplay';
export { default as FeedbackButtons } from './components/FeedbackButtons';
export { default as StudentInput } from './components/StudentInput';

// Form Components
export { default as CustomButton } from './components/CustomButton';
export { default as CustomModal } from './components/CustomModal';
export { default as CustomSwitch } from './components/CustomSwitch';

// Visualization Components
export { default as DAGNode } from './components/DAGNode';
export { default as FlowChart } from './components/FlowChart';

// Layout Components
export { default as Sidebar } from './components/Sidebar';
export { default as MainContent } from './components/MainContent';

// Game Components
export { default as GameBoard } from './components/GameBoard';
export { default as ScoreDisplay } from './components/ScoreDisplay';

// Types
export type { HeaderProps } from './components/Header';
export type { ActivityLayoutProps } from './components/ActivityLayout';
export type { QRCodeDisplayProps } from './components/QRCodeDisplay';
export type { FeedbackButtonsProps } from './components/FeedbackButtons';
export type { StudentInputProps } from './components/StudentInput';

// Theme
export { default as theme } from './theme';
export type { C4RTheme } from './theme';