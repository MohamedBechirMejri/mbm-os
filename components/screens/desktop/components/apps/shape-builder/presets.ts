import type { ShapeDefinition } from "./types";

// Helper to generate unique IDs
let idCounter = 0;
const uid = () => `preset-${++idCounter}`;

/**
 * Preset shapes for quick start
 * All coordinates are in percentages for responsiveness
 */
export const PRESETS: Record<string, { name: string; shape: ShapeDefinition }> =
  {
    triangle: {
      name: "Triangle",
      shape: {
        start: { x: 50, y: 0, xPercent: true, yPercent: true },
        commands: [
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 100, y: 100, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 0, y: 100, xPercent: true, yPercent: true },
          },
          { id: uid(), type: "close" },
        ],
      },
    },

    pentagon: {
      name: "Pentagon",
      shape: {
        start: { x: 50, y: 0, xPercent: true, yPercent: true },
        commands: [
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 100, y: 38, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 81, y: 100, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 19, y: 100, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 0, y: 38, xPercent: true, yPercent: true },
          },
          { id: uid(), type: "close" },
        ],
      },
    },

    hexagon: {
      name: "Hexagon",
      shape: {
        start: { x: 25, y: 0, xPercent: true, yPercent: true },
        commands: [
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 75, y: 0, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 100, y: 50, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 75, y: 100, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 25, y: 100, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 0, y: 50, xPercent: true, yPercent: true },
          },
          { id: uid(), type: "close" },
        ],
      },
    },

    star: {
      name: "Star",
      shape: {
        start: { x: 50, y: 0, xPercent: true, yPercent: true },
        commands: [
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 61, y: 35, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 98, y: 35, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 68, y: 57, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 79, y: 91, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 50, y: 70, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 21, y: 91, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 32, y: 57, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 2, y: 35, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 39, y: 35, xPercent: true, yPercent: true },
          },
          { id: uid(), type: "close" },
        ],
      },
    },

    heart: {
      name: "Heart",
      shape: {
        start: { x: 50, y: 20, xPercent: true, yPercent: true },
        commands: [
          {
            id: uid(),
            type: "curve",
            mode: "to",
            end: { x: 10, y: 40, xPercent: true, yPercent: true },
            control1: { x: 50, y: 0, xPercent: true, yPercent: true },
            control2: { x: 0, y: 10, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "curve",
            mode: "to",
            end: { x: 50, y: 90, xPercent: true, yPercent: true },
            control1: { x: 0, y: 60, xPercent: true, yPercent: true },
            control2: { x: 50, y: 70, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "curve",
            mode: "to",
            end: { x: 90, y: 40, xPercent: true, yPercent: true },
            control1: { x: 50, y: 70, xPercent: true, yPercent: true },
            control2: { x: 100, y: 60, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "curve",
            mode: "to",
            end: { x: 50, y: 20, xPercent: true, yPercent: true },
            control1: { x: 100, y: 10, xPercent: true, yPercent: true },
            control2: { x: 50, y: 0, xPercent: true, yPercent: true },
          },
          { id: uid(), type: "close" },
        ],
      },
    },

    arrow: {
      name: "Arrow Right",
      shape: {
        start: { x: 0, y: 35, xPercent: true, yPercent: true },
        commands: [
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 60, y: 35, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 60, y: 0, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 100, y: 50, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 60, y: 100, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 60, y: 65, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 0, y: 65, xPercent: true, yPercent: true },
          },
          { id: uid(), type: "close" },
        ],
      },
    },

    speechBubble: {
      name: "Speech Bubble",
      shape: {
        start: { x: 10, y: 0, xPercent: true, yPercent: true },
        commands: [
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 90, y: 0, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "arc",
            mode: "to",
            end: { x: 100, y: 10, xPercent: true, yPercent: true },
            rx: 10,
            sweep: "cw",
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 100, y: 60, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "arc",
            mode: "to",
            end: { x: 90, y: 70, xPercent: true, yPercent: true },
            rx: 10,
            sweep: "cw",
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 30, y: 70, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 10, y: 100, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 20, y: 70, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 10, y: 70, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "arc",
            mode: "to",
            end: { x: 0, y: 60, xPercent: true, yPercent: true },
            rx: 10,
            sweep: "cw",
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 0, y: 10, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "arc",
            mode: "to",
            end: { x: 10, y: 0, xPercent: true, yPercent: true },
            rx: 10,
            sweep: "cw",
          },
          { id: uid(), type: "close" },
        ],
      },
    },

    roundedRect: {
      name: "Rounded Rectangle",
      shape: {
        start: { x: 15, y: 0, xPercent: true, yPercent: true },
        commands: [
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 85, y: 0, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "arc",
            mode: "to",
            end: { x: 100, y: 15, xPercent: true, yPercent: true },
            rx: 15,
            sweep: "cw",
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 100, y: 85, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "arc",
            mode: "to",
            end: { x: 85, y: 100, xPercent: true, yPercent: true },
            rx: 15,
            sweep: "cw",
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 15, y: 100, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "arc",
            mode: "to",
            end: { x: 0, y: 85, xPercent: true, yPercent: true },
            rx: 15,
            sweep: "cw",
          },
          {
            id: uid(),
            type: "line",
            mode: "to",
            point: { x: 0, y: 15, xPercent: true, yPercent: true },
          },
          {
            id: uid(),
            type: "arc",
            mode: "to",
            end: { x: 15, y: 0, xPercent: true, yPercent: true },
            rx: 15,
            sweep: "cw",
          },
          { id: uid(), type: "close" },
        ],
      },
    },
  };

// Get all preset keys
export const PRESET_KEYS = Object.keys(PRESETS) as Array<keyof typeof PRESETS>;
