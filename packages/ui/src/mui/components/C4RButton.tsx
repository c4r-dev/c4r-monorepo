'use client';

import React from 'react';
import { Button, ButtonProps } from '@mui/material';

export interface C4RButtonProps extends Omit<ButtonProps, 'variant'> {
  /** Button variant using C4R design system */
  variant?: 'c4rPrimary' | 'c4rSecondary' | 'c4rAccent' | 'contained' | 'outlined' | 'text';
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether button should take full width */
  fullWidth?: boolean;
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
 * <C4RButton variant="c4rPrimary">Primary Action</C4RButton>
 * <C4RButton variant="c4rSecondary">Secondary Action</C4RButton>
 * <C4RButton variant="c4rAccent">Success Action</C4RButton>
 * 
 * // Standard MUI variants still available
 * <C4RButton variant="outlined">Outlined</C4RButton>
 * ```
 */
export default function C4RButton({
  variant = 'c4rPrimary',
  size = 'medium',
  children,
  ...props
}: C4RButtonProps) {
  return (
    <Button
      variant={variant as any}
      size={size}
      {...props}
    >
      {children}
    </Button>
  );
}