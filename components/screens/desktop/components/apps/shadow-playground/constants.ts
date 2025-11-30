import { ShadowLayer } from "./types";

export const DEFAULT_LAYER: Omit<ShadowLayer, "id"> = {
  x: 0,
  y: 4,
  blur: 12,
  spread: 0,
  color: "#000000",
  opacity: 0.1,
  inset: false,
};

export const PRESETS = [
  {
    name: "Soft Drop",
    layers: [
      {
        x: 0,
        y: 4,
        blur: 6,
        spread: -1,
        color: "#000000",
        opacity: 0.1,
        inset: false,
      },
      {
        x: 0,
        y: 2,
        blur: 4,
        spread: -1,
        color: "#000000",
        opacity: 0.06,
        inset: false,
      },
    ],
  },
  {
    name: "Hard Edge",
    layers: [
      {
        x: 4,
        y: 4,
        blur: 0,
        spread: 0,
        color: "#000000",
        opacity: 1,
        inset: false,
      },
    ],
  },
  {
    name: "Glow",
    layers: [
      {
        x: 0,
        y: 0,
        blur: 20,
        spread: 5,
        color: "#3b82f6",
        opacity: 0.5,
        inset: false,
      },
    ],
  },
  {
    name: "Neumorphism",
    layers: [
      {
        x: -5,
        y: -5,
        blur: 10,
        spread: 0,
        color: "#ffffff",
        opacity: 0.1,
        inset: false,
      },
      {
        x: 5,
        y: 5,
        blur: 10,
        spread: 0,
        color: "#000000",
        opacity: 0.3,
        inset: false,
      },
    ],
  },
  {
    name: "Inner Depth",
    layers: [
      {
        x: 2,
        y: 2,
        blur: 5,
        spread: 0,
        color: "#000000",
        opacity: 0.2,
        inset: true,
      },
    ],
  },
];
