"use client";

type AvatarSize = "xs" | "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
  xs: "w-7 h-7 text-xs",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

const avatarColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-rose-500",
];

function nameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface AvatarProps {
  name?: string;
  size?: AvatarSize;
  color?: string;
  border?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function Avatar({
  name,
  size = "sm",
  color,
  border = false,
  children,
  className = "",
}: AvatarProps) {
  const bgColor = color || (name ? nameToColor(name) : "bg-gray-400");
  const borderClass = border ? "border-2 border-white dark:border-gray-800" : "";

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 ${sizeClasses[size]} ${bgColor} ${borderClass} ${className}`}
    >
      {children || (name ? getInitials(name) : null)}
    </div>
  );
}
