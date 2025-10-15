"use client";

import Image from "next/image";
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
      <Image
        className="size-3 shadow"
        src="/assets/icons/status/switch.2.svg"
        alt="Control Center"
        width={12}
        height={12}
        priority
      />
    </button>
  );
}
