"use client";

import React from "react";

const Card = React.forwardRef(
  (
    {
      className,
      variant = "default",
      padding = "md",
      interactive,
      children,
      ...props
    },
    ref,
  ) => {
    const variants = {
      default: "bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700",
      elevated: "bg-white shadow-lg dark:bg-gray-800",
      outlined: "bg-gray-50 border border-gray-300 dark:bg-gray-900 dark:border-gray-600",
    };

    const paddings = {
      sm: "p-3",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={`rounded-xl ${variants[variant]} ${paddings[padding]} transition-all ${
          interactive
            ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            : ""
        } ${className || ""}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export default Card;
