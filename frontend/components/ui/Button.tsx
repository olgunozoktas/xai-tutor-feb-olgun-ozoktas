"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "danger-outline"
  | "ghost"
  | "outline"
  | "dark";

type ButtonSize = "sm" | "md" | "icon-sm" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50",
  secondary:
    "text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600",
  danger:
    "text-white bg-red-600 rounded-lg hover:bg-red-700",
  "danger-outline":
    "text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30",
  ghost:
    "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700",
  outline:
    "text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700",
  dark:
    "text-white bg-gray-900 dark:bg-orange-500 rounded-lg hover:bg-gray-800 dark:hover:bg-orange-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  "icon-sm": "p-1.5",
  icon: "p-2",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 font-medium cursor-pointer transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
