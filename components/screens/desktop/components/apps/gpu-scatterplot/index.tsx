"use client";

import { Info, Minus, Plus, Settings } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { COLOR_RAMPS } from "./color-ramps";
import {
  DATASET_PRESETS,
  DEFAULT_PRESET_ID,
  formatPoints,
  generatePresetDataset,
} from "./dataset";
import type { RendererConfig, ScatterDataset } from "./types";
import { useScatterRenderer } from "./use-scatter-renderer";

function computeFittedViewport(
  bounds: ScatterDataset["bounds"],
  canvas: HTMLCanvasElement | null,
) {
  const width = canvas?.clientWidth ?? 800;
  const height = canvas?.clientHeight ?? 600;
  const rangeX = Math.max(bounds.maxX - bounds.minX, 1);
  const rangeY = Math.max(bounds.maxY - bounds.minY, 1);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const scaleX = width / rangeX;
  const scaleY = height / rangeY;
  const fittedZoom = Math.max(
    0.1,
    Math.min(100, Math.min(scaleX, scaleY) * 0.9),
  );

  return { centerX, centerY, zoom: fittedZoom };
}

export function GpuScatterplot({ instanceId: _ }: { instanceId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const regenerateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const activeGenerationRef = useRef(0);
  const datasetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialPreset =
    DATASET_PRESETS.find((preset) => preset.id === DEFAULT_PRESET_ID) ??
    DATASET_PRESETS[0];
  const initialPresetId = initialPreset?.id ?? DEFAULT_PRESET_ID;

  const [dataset, setDataset] = useState<ScatterDataset>(() =>
    generatePresetDataset(initialPresetId, 100_000),
  );
  const [presetId, setPresetId] = useState(initialPresetId);
  const [sliderValue, setSliderValue] = useState(() => dataset.pointCount);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [viewport, setViewport] = useState(() =>
    computeFittedViewport(dataset.bounds, canvasRef.current ?? null),
  );

  const [pointSize, setPointSize] = useState(2);
  const [colorRampId, setColorRampId] = useState(
    initialPreset?.recommendedRamp ?? COLOR_RAMPS[0]?.id ?? "viridis",
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const activePresetRef = useRef(initialPresetId);

  const colorRamp =
    COLOR_RAMPS.find((r) => r.id === colorRampId) ?? COLOR_RAMPS[0];

  const config: RendererConfig = {
    viewport,
    mode: { type: "points", pointSize },
    colorRamp: colorRamp ??
      COLOR_RAMPS[0] ?? {
        id: "default",
        name: "Default",
        colors: ["#000000", "#ffffff"],
      },
    backgroundColor: "#0d0d0d",
  };

  const { initialized, error, stats } = useScatterRenderer(
    canvasRef as React.RefObject<HTMLCanvasElement>,
    config,
    dataset,
  );

  useEffect(() => {
    return () => {
      if (regenerateTimeoutRef.current) {
        clearTimeout(regenerateTimeoutRef.current);
      }
      if (datasetTimeoutRef.current) {
        clearTimeout(datasetTimeoutRef.current);
      }
    };
  }, []);

  // Regenerate dataset when point count changes (debounced)
  const handleSliderChange = (newCount: number) => {
    setSliderValue(newCount);

    // Clear existing timeout
    if (regenerateTimeoutRef.current) {
      clearTimeout(regenerateTimeoutRef.current);
    }

    // Debounce regeneration
    regenerateTimeoutRef.current = setTimeout(() => {
      handleRegenerateDataset(newCount);
    }, 300);
  };

  const handlePresetChange = (nextPresetId: string) => {
    if (!nextPresetId || nextPresetId === activePresetRef.current) {
      return;
    }

    const nextPreset = DATASET_PRESETS.find(
      (preset) => preset.id === nextPresetId,
    );

    setPresetId(nextPresetId);
    if (nextPreset) {
      setColorRampId(nextPreset.recommendedRamp);
    }

    handleRegenerateDataset(sliderValue, nextPresetId);
  };

  // Regenerate dataset when point count changes
  const handleRegenerateDataset = (
    newCount: number,
    presetOverride?: string,
  ) => {
    setIsRegenerating(true);
    const targetPresetId = presetOverride ?? activePresetRef.current;
    activePresetRef.current = targetPresetId;
    const generationId = activeGenerationRef.current + 1;
    activeGenerationRef.current = generationId;
    if (datasetTimeoutRef.current) {
      clearTimeout(datasetTimeoutRef.current);
    }

    // Use timeout to allow UI to update before heavy computation
    datasetTimeoutRef.current = setTimeout(() => {
      if (activeGenerationRef.current !== generationId) return;
      const newDataset = generatePresetDataset(targetPresetId, newCount);
      if (activeGenerationRef.current !== generationId) return;
      setDataset(newDataset);
      setSliderValue(newDataset.pointCount);
      // Reset viewport to show all points
      const fittedViewport = computeFittedViewport(
        newDataset.bounds,
        canvasRef.current,
      );
      setViewport(fittedViewport);
      requestAnimationFrame(() => {
        if (activeGenerationRef.current === generationId) {
          setIsRegenerating(false);
        }
      });
    }, 50);
  };

  // Pan/zoom interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setViewport((prev) => ({
        ...prev,
        zoom: Math.max(0.1, Math.min(100, prev.zoom * delta)),
      }));
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.clientX, y: e.clientY };

      setViewport((prev) => ({
        ...prev,
        centerX: prev.centerX - dx / prev.zoom,
        centerY: prev.centerY - dy / prev.zoom,
      }));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#0d0d0d]">
      {/* Info Banner */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="overflow-hidden border-b border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Info className="size-4 text-white/80" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">
                    GPU-Accelerated Visualization
                  </h3>
                  <p className="text-xs leading-relaxed text-white/70">
                    This sandbox ships curated GPU data stories: a spiral
                    galaxy, a neural telemetry field, and a liquidity stress
                    cascade. Each scene streams through WebGPU at 60fps so you
                    can pitch analytics that look as fast as they run. Drag to
                    pan, scroll to zoom, and flex the renderer with real-time
                    tuning.
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowInfo(false)}
                className="size-7 shrink-0 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <Plus className="size-4 rotate-45" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl">
        <div className="flex min-w-60 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-sm font-semibold text-white/90">
              {dataset.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <span className="font-mono">
                {dataset.pointCount.toLocaleString()}
              </span>
              <span>points</span>
            </div>
          </div>
          {dataset.meta?.headline ? (
            <p className="text-xs text-white/45">{dataset.meta.headline}</p>
          ) : null}
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-center gap-1.5 md:justify-start">
          {DATASET_PRESETS.map((preset) => {
            const isActive = preset.id === presetId;
            return (
              <Button
                key={preset.id}
                type="button"
                size="sm"
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "rounded-full border border-white/10 bg-white/5 px-4 text-xs text-white/70 backdrop-blur-sm hover:bg-white/10",
                  isActive && "border-white/20 bg-white/15 text-white",
                )}
                onClick={() => handlePresetChange(preset.id)}
              >
                {preset.name}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {initialized && (
            <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-1.5 font-mono text-xs text-white/60 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>
                  {stats.fps} <span className="text-white/40">fps</span>
                </span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <span>
                {stats.frameTime.toFixed(1)}{" "}
                <span className="text-white/40">ms</span>
              </span>
              <div className="h-3 w-px bg-white/10" />
              <span>
                {dataset.pointCount.toLocaleString()}{" "}
                <span className="text-white/40">pts</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1 backdrop-blur-sm">
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() =>
                setViewport((prev) => ({
                  ...prev,
                  zoom: Math.max(0.1, prev.zoom * 0.8),
                }))
              }
            >
              <Minus className="size-3.5" />
            </Button>
            <div className="px-2 font-mono text-xs text-white/60">
              {Math.round(viewport.zoom * 10)}%
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() =>
                setViewport((prev) => ({
                  ...prev,
                  zoom: Math.min(100, prev.zoom * 1.25),
                }))
              }
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          <Sheet open={showSettings} onOpenChange={setShowSettings}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <Settings className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80 border-white/10 bg-black/90 backdrop-blur-2xl">
              <SheetHeader>
                <SheetTitle className="text-white">
                  Renderer Settings
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Point count */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="space-y-2"
                >
                  <div className="text-sm font-medium text-white/80">
                    Point Count
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={sliderValue}
                      onChange={handleSliderChange}
                      min={10_000}
                      max={2_000_000}
                      step={10_000}
                      className="flex-1"
                    />
                    <span className="w-16 text-right font-mono text-sm text-white/60">
                      {formatPoints(sliderValue)}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    Regenerates after you stop dragging. Max 2M points for
                    smooth performance.
                  </p>
                </motion.div>

                {/* Point size */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <div className="text-sm font-medium text-white/80">
                    Point Size
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={pointSize}
                      onChange={(v) => setPointSize(v)}
                      min={1}
                      max={10}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="w-8 text-right font-mono text-sm text-white/60">
                      {pointSize}
                    </span>
                  </div>
                </motion.div>

                {/* Color ramp */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-2"
                >
                  <div className="text-sm font-medium text-white/80">
                    Color Ramp
                  </div>
                  <div className="space-y-2">
                    {COLOR_RAMPS.map((ramp, idx) => (
                      <motion.button
                        key={ramp.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.05 }}
                        type="button"
                        onClick={() => setColorRampId(ramp.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg p-2 transition-all",
                          colorRampId === ramp.id
                            ? "scale-[1.02] bg-white/10 ring-1 ring-white/20"
                            : "hover:bg-white/5",
                        )}
                      >
                        <div
                          className="h-6 flex-1 rounded"
                          style={{
                            background: `linear-gradient(to right, ${ramp.colors.join(", ")})`,
                          }}
                        />
                        <span className="text-sm text-white/70">
                          {ramp.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1">
        {error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="flex h-full items-center justify-center"
          >
            <div className="text-center">
              <div className="text-sm font-medium text-red-400">
                WebGPU Error
              </div>
              <div className="mt-1 text-xs text-white/50">{error}</div>
              <div className="mt-3 text-xs text-white/40">
                WebGPU requires a compatible browser and GPU
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className="h-full w-full cursor-move"
              style={{ imageRendering: "pixelated" }}
            />
            <AnimatePresence mode="wait">
              {dataset.meta && (
                <motion.div
                  key={dataset.meta.presetId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ type: "spring", damping: 24, stiffness: 260 }}
                  className="pointer-events-none absolute bottom-6 left-6 max-w-xs"
                >
                  <div className="pointer-events-auto rounded-2xl border border-white/12 bg-black/55 p-4 backdrop-blur-2xl">
                    <div className="flex flex-wrap gap-2">
                      {dataset.meta?.tags.map((tag) => (
                        <span
                          key={`${dataset.meta?.presetId}-${tag}`}
                          className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.2em] text-white/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="mt-3 text-sm font-semibold text-white">
                      {dataset.meta.headline}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-white/70">
                      {dataset.meta.description}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-white/70">
                      {dataset.meta?.stats.map((stat) => (
                        <div
                          key={`${dataset.meta?.presetId}-${stat.label}`}
                          className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 backdrop-blur-sm"
                        >
                          <div className="text-[0.6rem] uppercase tracking-[0.18em] text-white/40">
                            {stat.label}
                          </div>
                          <div className="font-semibold text-white/90">
                            {stat.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {isRegenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 text-white/70">
                    <div className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
                    <span className="text-sm">Synthesizing scenario...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
