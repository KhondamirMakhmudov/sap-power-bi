"use client";

import React from "react";

const Badge = React.forwardRef(
  (
    { className, variant = "default", size = "md", icon, children, ...props },
    ref,
  ) => {
    const variants = {
      default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      success: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
      error: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    };

    const sizes = {
      sm: "px-2 py-1 text-xs rounded",
      md: "px-3 py-1 text-sm rounded-md",
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1 font-medium ${variants[variant]} ${sizes[size]} ${className || ""}`}
        {...props}
      >
        {icon}
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";

export default Badge;
