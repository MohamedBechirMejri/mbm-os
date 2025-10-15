import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BrightnessStore {
  brightness: number;
  setBrightness: (brightness: number) => void;
}

const MIN_BRIGHTNESS = 10; // Prevent complete blackout

export const useBrightnessStore = create<BrightnessStore>()(
  persist(
    (set) => ({
      brightness: 100,
      setBrightness: (brightness) =>
        set({ brightness: Math.max(MIN_BRIGHTNESS, brightness) }),
    }),
    {
      name: "brightness-storage",
    },
  ),
);
