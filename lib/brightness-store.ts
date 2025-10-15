import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BrightnessStore {
  brightness: number;
  setBrightness: (brightness: number) => void;
}

export const useBrightnessStore = create<BrightnessStore>()(
  persist(
    (set) => ({
      brightness: 100,
      setBrightness: (brightness) => set({ brightness }),
    }),
    {
      name: "brightness-storage",
    },
  ),
);
