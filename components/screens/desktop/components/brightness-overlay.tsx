"use client";

import { useBrightnessStore } from "@/lib/brightness-store";

export function BrightnessOverlay() {
  const brightness = useBrightnessStore((state) => state.brightness);

  // Calculate opacity - 100% brightness = 0 opacity, minimum brightness = max darkness
  // Minimum brightness is 10%, so max opacity is 0.9 (90% black overlay)
  const opacity = 1 - brightness / 100;

  return (
    <div
      className="fixed inset-0 bg-black pointer-events-none z-[9999]"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
