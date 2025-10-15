"use client";

import { useBrightnessStore } from "@/lib/brightness-store";

export function BrightnessOverlay() {
  const brightness = useBrightnessStore((state) => state.brightness);

  // Calculate opacity - 100% brightness = 0 opacity, 0% brightness = full black
  const opacity = 1 - brightness / 100;

  return (
    <div
      className="fixed inset-0 bg-black pointer-events-none z-[9999] transition-opacity duration-200"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
