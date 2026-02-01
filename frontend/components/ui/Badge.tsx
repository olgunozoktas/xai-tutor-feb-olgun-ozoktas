"use client";

type BadgeVariant = "pending" | "completed" | "refunded" | "default";

const variantClasses: Record<BadgeVariant, string> = {
  pending: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  completed: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  refunded: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  default: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  const classes = variantClasses[variant] || variantClasses.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${classes} ${className}`}
    >
      {children}
    </span>
  );
}
