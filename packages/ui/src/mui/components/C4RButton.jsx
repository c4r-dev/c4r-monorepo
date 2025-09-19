'use client';

import React from 'react';
import { Button, ButtonProps } from '@mui/material';

export interface C4RButtonProps extends Omit {
  /** Button variant using C4R design system */
  variant: 'c4rPrimary' | 'c4rSecondary' | 'c4rAccent' | 'contained' | 'outlined' | 'text';
  /** Size variant */
  size: 'small' | 'medium' | 'large';
  /** Whether button should take full width */
  fullWidth: boolean;
}

/**
 * C4R Button Component
 * 
 * Pre-configured MUI Button with C4R brand colors and styling.
 * Replaces hardcoded button styling across all activities.
 * 
 * @example
 * ```tsx
 * // C4R branded buttons
 * Primary Action
 * Secondary Action
 * Success Action
 * 
 * // Standard MUI variants still available
 * Outlined
 * ```
 */
export default function C4RButton({
  variant = 'c4rPrimary',
  size = 'medium',
  children,
  ...props
}: C4RButtonProps) {
  return (
    
      {children}
    
  );
}