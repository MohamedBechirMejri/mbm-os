"use client";

import { cn } from "@/lib/utils";

type SearchIconProps = {
  isActive: boolean;
  onToggle: () => void;
};

export function SearchIcon({ isActive, onToggle }: SearchIconProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isActive}
      aria-label="Open search"
      className={cn(
        "flex items-center rounded-md px-2 text-white/85 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        isActive
          ? "bg-white/25 text-white"
          : "hover:bg-white/15 hover:text-white",
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10.5 10.5L13.5 13.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
