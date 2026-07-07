"use client";

import React from "react";

/**
 * @typedef {Object} ButtonProps
 * @property {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} [variant]
 * @property {'sm' | 'md' | 'lg'} [size]
 * @property {boolean} [isLoading]
 * @property {boolean} [fullWidth]
 */

const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      fullWidth,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:disabled:bg-gray-800",
      outline:
        "border border-gray-300 text-gray-900 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700",
      ghost: "text-gray-900 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-100 dark:hover:bg-gray-700",
      danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-md",
      md: "px-4 py-2 text-sm rounded-lg",
      lg: "px-6 py-3 text-base rounded-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed ${
          variants[variant]
        } ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className || ""}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
