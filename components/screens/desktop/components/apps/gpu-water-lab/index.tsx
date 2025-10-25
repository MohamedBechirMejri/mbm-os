"use client";

import { Droplet, Plus, Settings } from "lucide-react";
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
import type { WaterConfig } from "./types";
import { useWaterRenderer } from "./use-water-renderer";

const COLOR_MODES: Array<{
  id: WaterConfig["colorMode"];
  name: string;
  description: string;
}> = [
  {
    id: "depth",
    name: "Depth",
    description: "Blue gradient based on vertical position",
  },
  {
    id: "velocity",
    name: "Velocity",
    description: "Color intensity based on particle speed",
  },
  {
    id: "pressure",
    name: "Pressure",
    description: "Simulated pressure visualization",
  },
];

export function GpuWaterLab({ instanceId: _ }: { instanceId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const [config, setConfig] = useState<WaterConfig>({
    particleCount: 100_000,
    gravity: 300,
    viscosity: 0.2,
    particleSize: 3,
    mouseForce: 5000,
    colorMode: "depth",
  });

  const { initialized, error, stats, setMousePosition } = useWaterRenderer(
    canvasRef,
    config,
    canvasSize,
  );

  // Handle canvas resize
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const next = {
        width: Math.max(1, Math.floor(rect.width * dpr)),
        height: Math.max(1, Math.floor(rect.height * dpr)),
      };

      setCanvasSize((prev) => {
        if (prev.width === next.width && prev.height === next.height) {
          return prev;
        }
        return next;
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Handle mouse interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !initialized) return;

    let isInteracting = false;

    const handleStart = (x: number, y: number) => {
      isInteracting = true;
      setMousePosition(x, y, true);
    };

    const handleMove = (x: number, y: number) => {
      if (isInteracting) {
        setMousePosition(x, y, true);
      }
    };

    const handleEnd = () => {
      isInteracting = false;
      setMousePosition(0, 0, false);
    };

    const toDeviceCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
      const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      const { x, y } = toDeviceCoords(e.clientX, e.clientY);
      handleStart(x, y);
    };

    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = toDeviceCoords(e.clientX, e.clientY);
      handleMove(x, y);
    };

    const onMouseUp = () => handleEnd();

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const { x, y } = toDeviceCoords(touch.clientX, touch.clientY);
      handleStart(x, y);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const { x, y } = toDeviceCoords(touch.clientX, touch.clientY);
      handleMove(x, y);
    };

    const onTouchEnd = () => handleEnd();

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [initialized, setMousePosition]);

  const updateConfig = (updates: Partial<WaterConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toString();
  };

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
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
                  <Droplet className="size-4 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">
                    GPU Water Simulation
                  </h3>
                  <p className="text-xs leading-relaxed text-white/70">
                    Real-time fluid dynamics powered by WebGPU compute shaders.
                    Click and drag to create waves and watch millions of
                    particles interact with physics-based forces. This isn't
                    just pretty pixels—it's showing actual computational muscle
                    running entirely on your GPU.
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
              Interactive Water Physics
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <span className="font-mono">
                {formatNumber(config.particleCount)}
              </span>
              <span>particles</span>
            </div>
          </div>
          <p className="text-xs text-white/45">
            GPU-accelerated particle simulation with real-time interaction
          </p>
        </div>

        <div className="flex items-center gap-2">
          {initialized && (
            <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-1.5 font-mono text-xs text-white/60 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    stats.fps >= 55
                      ? "bg-emerald-400"
                      : stats.fps >= 30
                        ? "bg-yellow-400"
                        : "bg-red-400",
                  )}
                />
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
                {stats.computeTime.toFixed(1)}{" "}
                <span className="text-white/40">compute</span>
              </span>
            </div>
          )}

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
                  Simulation Settings
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Particle count */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="space-y-2"
                >
                  <div className="text-sm font-medium text-white/80">
                    Particle Count
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={config.particleCount}
                      onChange={(v) => updateConfig({ particleCount: v })}
                      min={10_000}
                      max={500_000}
                      step={10_000}
                      className="flex-1"
                    />
                    <span className="w-16 text-right font-mono text-sm text-white/60">
                      {formatNumber(config.particleCount)}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    More particles = more realistic but slower performance
                  </p>
                </motion.div>

                {/* Gravity */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <div className="text-sm font-medium text-white/80">
                    Gravity
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={config.gravity}
                      onChange={(v) => updateConfig({ gravity: v })}
                      min={0}
                      max={1000}
                      step={10}
                      className="flex-1"
                    />
                    <span className="w-12 text-right font-mono text-sm text-white/60">
                      {config.gravity}
                    </span>
                  </div>
                </motion.div>

                {/* Viscosity */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-2"
                >
                  <div className="text-sm font-medium text-white/80">
                    Viscosity
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={config.viscosity}
                      onChange={(v) => updateConfig({ viscosity: v })}
                      min={0}
                      max={1}
                      step={0.01}
                      className="flex-1"
                    />
                    <span className="w-12 text-right font-mono text-sm text-white/60">
                      {config.viscosity.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    Higher = thicker, slower-moving fluid
                  </p>
                </motion.div>

                {/* Particle size */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <div className="text-sm font-medium text-white/80">
                    Particle Size
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={config.particleSize}
                      onChange={(v) => updateConfig({ particleSize: v })}
                      min={1}
                      max={10}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="w-8 text-right font-mono text-sm text-white/60">
                      {config.particleSize}
                    </span>
                  </div>
                </motion.div>

                {/* Mouse force */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-2"
                >
                  <div className="text-sm font-medium text-white/80">
                    Interaction Force
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={config.mouseForce}
                      onChange={(v) => updateConfig({ mouseForce: v })}
                      min={0}
                      max={20000}
                      step={100}
                      className="flex-1"
                    />
                    <span className="w-16 text-right font-mono text-sm text-white/60">
                      {formatNumber(config.mouseForce)}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    Strength of mouse/touch interaction with particles
                  </p>
                </motion.div>

                {/* Color mode */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <div className="text-sm font-medium text-white/80">
                    Color Mode
                  </div>
                  <div className="space-y-2">
                    {COLOR_MODES.map((mode, idx) => (
                      <motion.button
                        key={mode.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + idx * 0.05 }}
                        type="button"
                        onClick={() => updateConfig({ colorMode: mode.id })}
                        className={cn(
                          "flex w-full flex-col items-start gap-1 rounded-lg p-3 text-left transition-all",
                          config.colorMode === mode.id
                            ? "scale-[1.02] bg-white/10 ring-1 ring-white/20"
                            : "hover:bg-white/5",
                        )}
                      >
                        <span className="text-sm font-medium text-white/90">
                          {mode.name}
                        </span>
                        <span className="text-xs text-white/50">
                          {mode.description}
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
      <div ref={containerRef} className="relative flex-1">
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
              width={canvasSize.width}
              height={canvasSize.height}
              className="h-full w-full cursor-crosshair"
            />

            {!initialized && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 text-white/70">
                  <div className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
                  <span className="text-sm">Initializing GPU...</span>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
