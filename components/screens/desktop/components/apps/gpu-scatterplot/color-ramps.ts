import type { ColorRamp } from "./types";

export const COLOR_RAMPS: ColorRamp[] = [
  {
    id: "viridis",
    name: "Viridis",
    colors: [
      "#440154",
      "#482878",
      "#3e4989",
      "#31688e",
      "#26828e",
      "#1f9e89",
      "#35b779",
      "#6ece58",
      "#b5de2b",
      "#fde724",
    ],
  },
  {
    id: "plasma",
    name: "Plasma",
    colors: [
      "#0d0887",
      "#46039f",
      "#7201a8",
      "#9c179e",
      "#bd3786",
      "#d8576b",
      "#ed7953",
      "#fb9f3a",
      "#fdca26",
      "#f0f921",
    ],
  },
  {
    id: "turbo",
    name: "Turbo",
    colors: [
      "#30123b",
      "#4662d7",
      "#36a2eb",
      "#1ae4b6",
      "#72fe5e",
      "#c8ef34",
      "#faba39",
      "#f66b19",
      "#ca2a04",
      "#7a0403",
    ],
  },
  {
    id: "cool-warm",
    name: "Cool-Warm",
    colors: [
      "#3b4cc0",
      "#6788ee",
      "#9abbff",
      "#c9d7f0",
      "#dddddd",
      "#f0c9c9",
      "#f49b9b",
      "#dd6464",
      "#b40426",
    ],
  },
  {
    id: "grayscale",
    name: "Grayscale",
    colors: [
      "#000000",
      "#1a1a1a",
      "#333333",
      "#4d4d4d",
      "#666666",
      "#808080",
      "#999999",
      "#b3b3b3",
      "#cccccc",
      "#e6e6e6",
      "#ffffff",
    ],
  },
];

/**
 * Convert hex color to RGBA values (0-1 range)
 */
export function hexToRgba(hex: string): [number, number, number, number] {
  const cleaned = hex.replace("#", "");
  const r = Number.parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = Number.parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = Number.parseInt(cleaned.substring(4, 6), 16) / 255;
  return [r, g, b, 1.0];
}

/**
 * Sample a color from a ramp at position t (0-1)
 */
export function sampleColorRamp(
  ramp: ColorRamp,
  t: number,
): [number, number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  const index = clamped * (ramp.colors.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const frac = index - lower;

  const c1 = hexToRgba(ramp.colors[lower] ?? "#000000");
  const c2 = hexToRgba(ramp.colors[upper] ?? "#ffffff");

  return [
    c1[0] + (c2[0] - c1[0]) * frac,
    c1[1] + (c2[1] - c1[1]) * frac,
    c1[2] + (c2[2] - c1[2]) * frac,
    c1[3] + (c2[3] - c1[3]) * frac,
  ];
}

/**
 * Generate a gradient texture (1D) for GPU usage
 */
export function generateRampTexture(
  ramp: ColorRamp,
  resolution = 256,
): Uint8Array {
  const data = new Uint8Array(resolution * 4);
  for (let i = 0; i < resolution; i++) {
    const t = i / (resolution - 1);
    const [r, g, b, a] = sampleColorRamp(ramp, t);
    data[i * 4 + 0] = Math.round(r * 255);
    data[i * 4 + 1] = Math.round(g * 255);
    data[i * 4 + 2] = Math.round(b * 255);
    data[i * 4 + 3] = Math.round(a * 255);
  }
  return data;
}
