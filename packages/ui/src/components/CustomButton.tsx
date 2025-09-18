'use client';

import React from 'react';
import PropTypes from 'prop-types';

interface CustomButtonProps {
  /** Button click handler */
  onClick?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button content */
  children: React.ReactNode;
  /** Accessibility label */
  ariaLabel: string;
  /** Button variant for styling */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'grey' | 'blue' | 'success' | 'warning' | 'error';
  /** Button size */
  size?: 'sm' | 'default' | 'lg';
  /** Button type for forms */
  type?: 'button' | 'submit' | 'reset';
  /** Additional CSS classes */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Full width button */
  fullWidth?: boolean;
}

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
  const baseClasses = "font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed";
  
  // Variant styling with C4R purple branding
  const variantClasses = {
    primary: "bg-c4r-purple text-white hover:bg-c4r-purple-hover focus:ring-c4r-purple disabled:bg-gray-400 disabled:text-gray-600",
    secondary: "bg-white text-c4r-purple border-2 border-c4r-purple hover:bg-c4r-purple hover:text-white focus:ring-c4r-purple disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-300",
    tertiary: "bg-white text-gray-800 hover:bg-gray-100 focus:ring-gray-300 border border-gray-300 disabled:bg-gray-50 disabled:text-gray-400",
    grey: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-400 disabled:text-gray-600",
    blue: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-400 disabled:text-gray-600",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-gray-400 disabled:text-gray-600",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400 disabled:bg-gray-400 disabled:text-gray-600",
    error: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-400 disabled:text-gray-600"
  };

  // Size variants
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  // Width classes
  const widthClasses = fullWidth ? "w-full" : "w-fit";

  // Combine all classes
  const combinedClassName = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={combinedClassName}
      style={style}
    >
      {children}
    </button>
  );
}

// PropTypes for runtime validation
CustomButton.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'tertiary', 'grey', 'blue', 'success', 'warning', 'error']),
  size: PropTypes.oneOf(['sm', 'default', 'lg']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  style: PropTypes.object,
  fullWidth: PropTypes.bool
};