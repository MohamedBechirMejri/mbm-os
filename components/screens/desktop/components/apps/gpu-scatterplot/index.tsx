"use client";

import { Minus, Plus, Settings } from "lucide-react";
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

const INITIAL_DATASET = generateSyntheticDataset(100_000, {
  name: "Demo Dataset",
  clusters: 5,
  noise: 0.4,
});

export function GpuScatterplot({ instanceId: _ }: { instanceId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataset] = useState<ScatterDataset>(INITIAL_DATASET);
  const [viewport, setViewport] = useState({
    centerX: 50,
    centerY: 50,
    zoom: 8,
  });
  const [pointSize, setPointSize] = useState(2);
  const [colorRampId, setColorRampId] = useState("viridis");
  const [showSettings, setShowSettings] = useState(false);

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
                {/* Point size */}
                <div className="space-y-2">
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
                </div>

                {/* Color ramp */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-white/80">
                    Color Ramp
                  </div>
                  <div className="space-y-2">
                    {COLOR_RAMPS.map((ramp) => (
                      <button
                        key={ramp.id}
                        type="button"
                        onClick={() => setColorRampId(ramp.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg p-2 transition-colors",
                          colorRampId === ramp.id
                            ? "bg-white/10"
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
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1">
        {error ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-medium text-red-400">
                WebGPU Error
              </div>
              <div className="mt-1 text-xs text-white/50">{error}</div>
              <div className="mt-3 text-xs text-white/40">
                WebGPU requires a compatible browser and GPU
              </div>
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="h-full w-full cursor-move"
            style={{ imageRendering: "pixelated" }}
          />
        )}
      </div>
    </div>
  );
}
