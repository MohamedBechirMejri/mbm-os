"use client";

import type { PointerEvent } from "react";

type ControlCenterProps = {
  isActive: boolean;
  onToggle: () => void;
};

export function ControlCenter({ isActive, onToggle }: ControlCenterProps) {
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggle();
  };

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      className={`flex items-center px-2 rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
        isActive ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/90"
      }`}
      aria-label="Control Center"
      aria-haspopup="dialog"
      aria-expanded={isActive}
      aria-pressed={isActive}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" />
      </svg>
    </button>
  );
}
