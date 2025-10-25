export interface ScatterPoint {
  x: number;
  y: number;
  category: number;
}

export interface ScatterDatasetMeta {
  presetId: string;
  headline: string;
  description: string;
  tags: string[];
  stats: Array<{ label: string; value: string }>;
}

export interface ScatterDataset {
  points: ScatterPoint[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  name: string;
  pointCount: number;
  meta?: ScatterDatasetMeta;
}

export interface Viewport {
  centerX: number;
  centerY: number;
  zoom: number; // pixels per data unit
}

export interface RenderMode {
  type: "points" | "density";
  pointSize?: number; // for points mode
  densityRadius?: number; // for density mode
}

export interface ColorRamp {
  id: string;
  name: string;
  colors: string[]; // hex colors
}

export interface SelectionState {
  active: boolean;
  points: number[]; // indices of selected points
  lassoPath?: { x: number; y: number }[];
}

export interface RendererStats {
  fps: number;
  frameTime: number; // ms
  gpuMemoryMB?: number;
  pointsRendered: number;
}

export interface RendererConfig {
  viewport: Viewport;
  mode: RenderMode;
  colorRamp: ColorRamp;
  backgroundColor: string;
}
