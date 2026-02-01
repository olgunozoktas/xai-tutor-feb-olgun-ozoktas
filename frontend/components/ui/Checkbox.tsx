"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", ...props }, ref) => {
    const input = (
      <input
        ref={ref}
        type="checkbox"
        className={`w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500 cursor-pointer ${className}`}
        {...props}
      />
    );

    if (label) {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          {input}
          <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        </label>
      );
    }

    return (
      <label className="flex items-center cursor-pointer">
        {input}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
