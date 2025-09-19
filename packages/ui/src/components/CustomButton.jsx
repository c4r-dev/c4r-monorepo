'use client';

import React from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {Object} CustomButtonProps
 * @property {*} /** Button click handler */
  onClick?
 * @property {*} /** Whether the button is disabled */
  disabled?
 * @property {*} /** Button content */
  children
 * @property {*} /** Accessibility label */
  ariaLabel
 * @property {*} /** Button variant for styling */
  variant?
 * @property {*} /** Button size */
  size?
 * @property {*} /** Button type for forms */
  type?
 * @property {*} /** Additional CSS classes */
  className?
 * @property {*} /** Custom inline styles */
  style?
 * @property {*} /** Full width button */
  fullWidth?
 */

export default function CustomButton({
  onClick = () => {},
  disabled = false,
  children,
  ariaLabel,
  variant = 'primary',
  size = 'default',
  type = 'button',
  className = '',
  style = {},
  fullWidth = false
}: CustomButtonProps) {
  
  // Base classes for all buttons
  const baseClasses = "font-semibold rounded-lg transition-all duration-200 focus= {
    primary,
    secondary,
    tertiary,
    grey,
    blue,
    success,
    warning,
    error= {
    sm,
    default,
    lg= fullWidth ? "w-full" : "w-fit";

  // Combine all classes
  const combinedClassName = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    
      {children}
    
  );
}

// PropTypes for runtime validation
CustomButton.propTypes = {
  onClick,
  disabled,
  children,
  ariaLabel,
  variant, 'secondary', 'tertiary', 'grey', 'blue', 'success', 'warning', 'error']),
  size, 'default', 'lg']),
  type, 'submit', 'reset']),
  className,
  style,
  fullWidth