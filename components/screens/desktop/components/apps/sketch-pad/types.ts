// Tool types for the sketch pad
export type Tool = "brush" | "eraser" | "pan";

// Layer data structure
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
}

// Brush configuration
export interface BrushSettings {
  size: number;
  color: string;
}

// Point on canvas for drawing
export interface Point {
  x: number;
  y: number;
}

// A single stroke (line drawn without lifting)
export interface Stroke {
  id: string;
  points: Point[];
  size: number;
  color: string;
  layerId: string;
}

// Viewport for pan/zoom (infinite canvas)
export interface Viewport {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

// History entry for undo/redo
export interface HistoryEntry {
  layerId: string;
  imageData: ImageData;
}

// Stroke-based history entry for undo/redo
export interface StrokeHistoryEntry {
  type: "add" | "delete";
  strokes: Stroke[];
}
