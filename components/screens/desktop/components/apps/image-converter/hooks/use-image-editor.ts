import { useState, useMemo, useCallback, useEffect } from "react";
import { ImageProcessor } from "../components/image-processor";
import { HistoryManager } from "../lib/history-manager";
import { PRESETS, DEFAULT_ADJUSTMENTS } from "../lib/presets";
import type {
  FilterOptions,
  ResizeOptions,
  TransformOptions,
  CropOptions,
  HistoryState,
  PresetName,
  ExportFormat,
} from "../types";

interface UseImageEditorResult {
  // State
  processor: ImageProcessor;
  previewUrl: string;
  adjustments: FilterOptions;
  resize: ResizeOptions;
  transform: TransformOptions;
  crop: CropOptions | null;
  originalSize: { width: number; height: number };
  isLoaded: boolean;

  // History
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  setAdjustments: (adjustments: Partial<FilterOptions>) => void;
  setResize: (resize: Partial<ResizeOptions>) => void;
  setTransform: (transform: Partial<TransformOptions>) => void;
  setCrop: (crop: CropOptions | null) => void;
  rotate: (direction: "cw" | "ccw") => void;
  flip: (axis: "h" | "v") => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  applyPreset: (preset: PresetName) => void;

  // Export
  exportImage: (format: ExportFormat, quality: number) => Promise<Blob | null>;
  exportFavicons: () => Promise<Blob | null>;
}

const DEFAULT_TRANSFORM: TransformOptions = {
  rotation: 0,
  flipH: false,
  flipV: false,
};

export function useImageEditor(file: File): UseImageEditorResult {
  // Core state
  const [processor] = useState(() => new ImageProcessor());
  const [history] = useState(() => new HistoryManager());

  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  // Editor state
  const [adjustments, setAdjustmentsState] = useState<FilterOptions>(DEFAULT_ADJUSTMENTS);
  const [resize, setResizeState] = useState<ResizeOptions>({
    width: 0,
    height: 0,
    maintainAspect: true
  });
  const [transform, setTransformState] = useState<TransformOptions>(DEFAULT_TRANSFORM);
  const [crop, setCropState] = useState<CropOptions | null>(null);

  // History state
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Helper to push current state to history
  const pushToHistory = useCallback(() => {
    const state: HistoryState = {
      adjustments,
      resize,
      transform,
      crop,
      timestamp: Date.now(),
    };
    history.push(state);
    setCanUndo(history.canUndo());
    setCanRedo(history.canRedo());
  }, [adjustments, resize, transform, crop, history]);

  // Load image when file changes - useEffect is appropriate here
  useEffect(() => {
    let cancelled = false;

    const loadImage = async () => {
      try {
        const img = await processor.loadImage(file);
        if (cancelled) return;

        const dims = { width: img.width, height: img.height };
        setOriginalSize(dims);
        setResizeState({
          width: dims.width,
          height: dims.height,
          maintainAspect: true
        });
        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to load image:", err);
      }
    };

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [file, processor]);

  // Generate preview URL
  const previewUrl = useMemo(() => {
    if (!isLoaded) return "";
    return processor.process(adjustments, resize, transform, crop);
  }, [isLoaded, adjustments, resize, transform, crop, processor]);

  // Actions with history
  const setAdjustments = useCallback((newAdjustments: Partial<FilterOptions>) => {
    setAdjustmentsState((prev) => ({ ...prev, ...newAdjustments }));
    // Push to history after state updates
    setTimeout(() => pushToHistory(), 0);
  }, [pushToHistory]);

  const setResize = useCallback((newResize: Partial<ResizeOptions>) => {
    setResizeState((prev) => ({ ...prev, ...newResize }));
    setTimeout(() => pushToHistory(), 0);
  }, [pushToHistory]);

  const setTransform = useCallback((newTransform: Partial<TransformOptions>) => {
    setTransformState((prev) => ({ ...prev, ...newTransform }));
    setTimeout(() => pushToHistory(), 0);
  }, [pushToHistory]);

  const setCrop = useCallback((newCrop: CropOptions | null) => {
    setCropState(newCrop);
    setTimeout(() => pushToHistory(), 0);
  }, [pushToHistory]);

  // Transform helpers
  const rotate = useCallback((direction: "cw" | "ccw") => {
    setTransformState((prev) => {
      const increment = direction === "cw" ? 90 : -90;
      const newRotation = (prev.rotation + increment + 360) % 360;
      return { ...prev, rotation: newRotation as 0 | 90 | 180 | 270 };
    });
    setTimeout(() => pushToHistory(), 0);
  }, [pushToHistory]);

  const flip = useCallback((axis: "h" | "v") => {
    setTransformState((prev) => ({
      ...prev,
      flipH: axis === "h" ? !prev.flipH : prev.flipH,
      flipV: axis === "v" ? !prev.flipV : prev.flipV,
    }));
    setTimeout(() => pushToHistory(), 0);
  }, [pushToHistory]);

  // History actions
  const undo = useCallback(() => {
    const state = history.undo();
    if (state) {
      setAdjustmentsState(state.adjustments);
      setResizeState(state.resize);
      setTransformState(state.transform);
      setCropState(state.crop);
      setCanUndo(history.canUndo());
      setCanRedo(history.canRedo());
    }
  }, [history]);

  const redo = useCallback(() => {
    const state = history.redo();
    if (state) {
      setAdjustmentsState(state.adjustments);
      setResizeState(state.resize);
      setTransformState(state.transform);
      setCropState(state.crop);
      setCanUndo(history.canUndo());
      setCanRedo(history.canRedo());
    }
  }, [history]);

  const reset = useCallback(() => {
    setAdjustmentsState(DEFAULT_ADJUSTMENTS);
    setTransformState(DEFAULT_TRANSFORM);
    setCropState(null);
    setResizeState({
      width: originalSize.width,
      height: originalSize.height,
      maintainAspect: true
    });
    setTimeout(() => pushToHistory(), 0);
  }, [originalSize, pushToHistory]);

  const applyPreset = useCallback((preset: PresetName) => {
    const presetAdjustments = PRESETS[preset];
    setAdjustmentsState(presetAdjustments);
    setTimeout(() => pushToHistory(), 0);
  }, [pushToHistory]);

  // Export actions
  const exportImage = useCallback(async (
    format: ExportFormat,
    quality: number
  ): Promise<Blob | null> => {
    // Process with current settings
    processor.process(adjustments, resize, transform, crop);
    return await processor.getBlob(format, quality);
  }, [processor, adjustments, resize, transform, crop]);

  const exportFavicons = useCallback(async (): Promise<Blob | null> => {
    const JSZip = (await import("jszip")).default;

    const zip = new JSZip();
    const configs = [
      { name: "favicon-16x16.png", size: 16 },
      { name: "favicon-32x32.png", size: 32 },
      { name: "apple-touch-icon.png", size: 180 },
      { name: "android-chrome-192x192.png", size: 192 },
      { name: "android-chrome-512x512.png", size: 512 },
    ];

    // Generate PNGs
    for (const config of configs) {
      processor.process(
        adjustments,
        { width: config.size, height: config.size, maintainAspect: false },
        transform,
        crop
      );
      const blob = await processor.getBlob("png");
      if (blob) zip.file(config.name, blob);
    }

    // Generate ICO
    const icoBlob = await processor.generateIco(adjustments, transform);
    if (icoBlob) zip.file("favicon.ico", icoBlob);

   // Generate HTML snippet
    const html = `
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
    `.trim();
    zip.file("head-tags.html", html);

    return await zip.generateAsync({ type: "blob" });
  }, [processor, adjustments, resize, transform, crop]);

  return {
    processor,
    previewUrl,
    adjustments,
    resize,
    transform,
    crop,
    originalSize,
    isLoaded,
    canUndo,
    canRedo,
    setAdjustments,
    setResize,
    setTransform,
    setCrop,
    rotate,
    flip,
    undo,
    redo,
    reset,
    applyPreset,
    exportImage,
    exportFavicons,
  };
}
