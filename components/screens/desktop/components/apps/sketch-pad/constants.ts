import type { BrushSettings, Layer } from "./types";

// Maximum number of layers allowed
export const MAX_LAYERS = 10;

// Maximum history entries for undo/redo
export const MAX_HISTORY = 50;

// Default brush settings
export const DEFAULT_BRUSH: BrushSettings = {
  size: 8,
  color: "#ffffff",
};

// Creates a new layer with default values
export const createDefaultLayer = (index: number): Omit<Layer, "id"> => ({
  name: `Layer ${index}`,
  visible: true,
  opacity: 1,
});

// Color palette for quick selection
export const COLOR_PALETTE = [
  "#ffffff", // White
  "#000000", // Black
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
];

// Brush size range
export const BRUSH_SIZE = {
  min: 1,
  max: 100,
  step: 1,
};
