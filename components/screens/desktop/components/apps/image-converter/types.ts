// Core image editing types

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  blur: number; // 0 to 20
}

export interface FilterOptions extends ImageAdjustments {
  temperature: number; // -100 to 100 (warm/cool)
  tint: number; // -100 to 100 (green/magenta)
  vignette: number; // 0 to 100 (edge darkening)
  grain: number; // 0 to 100 (noise)
  exposure: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
}

export interface ResizeOptions {
  width: number;
  height: number;
  maintainAspect: boolean;
}

export interface TransformOptions {
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
}

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HistoryState {
  adjustments: FilterOptions;
  resize: ResizeOptions;
  transform: TransformOptions;
  crop: CropOptions | null;
  timestamp: number;
}

export type ExportFormat = "png" | "jpeg" | "webp" | "avif";

export interface ExportOptions {
  format: ExportFormat;
  quality: number; // 0 to 1
}

export interface BatchItem {
  id: string;
  file: File;
  status: "pending" | "processing" | "complete" | "error";
  progress: number;
  result?: Blob;
  error?: string;
}

export type PresetName = "enhance" | "vintage" | "bw" | "sharpen" | "soft" | "vibrant";
