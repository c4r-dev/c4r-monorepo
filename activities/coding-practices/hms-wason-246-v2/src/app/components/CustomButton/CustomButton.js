"use client";

import PropTypes from "prop-types";
import { cn } from "@/lib/utils"; // Utility for className merging

export default function CustomButton({
    onClick = () => {},
    disabled = false,
    children,
    ariaLabel,
    variant = 'primary',
    type = 'button',
    className,
    size = 'default'
}) {
    // Tailwind class variants
    const baseClasses = "font-sans-semibold w-fit rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantClasses = {
        primary: "bg-brand-primary text-white hover:bg-brand-primary-hover focus:ring-brand-primary disabled:bg-gray-400 disabled:text-gray-600",
        grey: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-400 disabled:text-gray-600", 
        blue: "bg-brand-primary text-white hover:bg-brand-primary-hover focus:ring-brand-primary disabled:bg-gray-400 disabled:text-gray-600",
        tertiary: "bg-white text-gray-800 hover:bg-gray-100 focus:ring-gray-300 border border-gray-300 disabled:bg-gray-50 disabled:text-gray-400",
        success: "bg-success text-white hover:bg-success-light focus:ring-success",
        warning: "bg-warning text-white hover:bg-yellow-500 focus:ring-warning",
        error: "bg-error text-white hover:bg-red-600 focus:ring-error"
    };

    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        default: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
    };

    const combinedClassName = cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
    );

    return (
        <button 
            type={type}
            onClick={onClick} 
            disabled={disabled} 
            aria-label={ariaLabel}
            className={combinedClassName}
        >
            {children}
        </button>
    );
}

CustomButton.propTypes = {
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    children: PropTypes.node.isRequired,
    ariaLabel: PropTypes.string.isRequired,
    variant: PropTypes.string,
    customStyles: PropTypes.object,
};