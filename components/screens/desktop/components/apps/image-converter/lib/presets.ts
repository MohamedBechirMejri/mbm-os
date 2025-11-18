import type { FilterOptions } from "../types";

export type PresetName = "enhance" | "vintage" | "bw" | "sharpen" | "soft" | "vibrant";

// Default values for all filter options (neutral state)
const NEUTRAL_FILTERS: FilterOptions = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  temperature: 0,
  tint: 0,
  vignette: 0,
  grain: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
};

export const PRESETS: Record<PresetName, FilterOptions> = {
  enhance: {
    ...NEUTRAL_FILTERS,
    brightness: 5,
    contrast: 15,
    saturation: 10,
    exposure: 5,
  },

  vintage: {
    ...NEUTRAL_FILTERS,
    saturation: -30,
    temperature: 20,
    grain: 8,
    vignette: 15,
    contrast: -5,
  },

  bw: {
    ...NEUTRAL_FILTERS,
    saturation: -100,
    contrast: 20,
    brightness: -5,
  },

  sharpen: {
    ...NEUTRAL_FILTERS,
    contrast: 25,
    brightness: 5,
  },

  soft: {
    ...NEUTRAL_FILTERS,
    blur: 1,
    contrast: -10,
    saturation: -5,
  },

  vibrant: {
    ...NEUTRAL_FILTERS,
    saturation: 40,
    contrast: 15,
    brightness: 5,
    exposure: 10,
  },
};

export const DEFAULT_ADJUSTMENTS: FilterOptions = NEUTRAL_FILTERS;
