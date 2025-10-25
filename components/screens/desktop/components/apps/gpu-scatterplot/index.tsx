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
import { generateSyntheticDataset } from "./dataset";
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

  const [dataset, setDataset] = useState<ScatterDataset>(() =>
    generateSyntheticDataset(100_000, {
      name: "Demo Dataset",
      clusters: 5,
      noise: 0.4,
    }),
  );
  const [sliderValue, setSliderValue] = useState(() => dataset.pointCount);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [viewport, setViewport] = useState(() =>
    computeFittedViewport(dataset.bounds, canvasRef.current ?? null),
  );

  const [pointSize, setPointSize] = useState(2);
  const [colorRampId, setColorRampId] = useState("viridis");
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

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

  // Regenerate dataset when point count changes
  const handleRegenerateDataset = (newCount: number) => {
    setIsRegenerating(true);
    const generationId = activeGenerationRef.current + 1;
    activeGenerationRef.current = generationId;
    if (datasetTimeoutRef.current) {
      clearTimeout(datasetTimeoutRef.current);
    }

    // Use timeout to allow UI to update before heavy computation
    datasetTimeoutRef.current = setTimeout(() => {
      if (activeGenerationRef.current !== generationId) return;
      const newDataset = generateSyntheticDataset(newCount, {
        name: `Dataset (${newCount.toLocaleString()} points)`,
        clusters: 5,
        noise: 0.4,
      });
      if (activeGenerationRef.current !== generationId) return;
      setDataset(newDataset);
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
            className="overflow-hidden border-b border-white/10 bg-linear-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl"
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
                    This app renders up to <strong>10 million points</strong> at
                    60fps using WebGPU compute shaders. Drag to pan, scroll to
                    zoom, and tweak settings to see real-time GPU performance.
                    Perfect for exploring large datasets without melting your
                    CPU.
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
      <div className="flex items-center justify-between border-b border-white/10 bg-black/30 px-4 py-2 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-medium text-white/90">{dataset.name}</h1>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <span className="font-mono">
              {dataset.pointCount.toLocaleString()}
            </span>
            <span>points</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Stats HUD */}
          {initialized && (
            <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-1.5 font-mono text-xs backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-white/60">
                  {stats.fps} <span className="text-white/40">fps</span>
                </span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <span className="text-white/60">
                {stats.frameTime.toFixed(1)}{" "}
                <span className="text-white/40">ms</span>
              </span>
            </div>
          )}

          {/* Zoom controls */}
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

          {/* Settings */}
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
                      {(sliderValue / 1_000).toFixed(0)}K
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
                    <span className="text-sm">Regenerating dataset…</span>
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
