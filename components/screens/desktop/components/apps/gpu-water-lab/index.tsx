"use client";

import { Droplet, Plus, Settings, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import type { RendererStats, SimulationBounds, WaterConfig } from "./types";
import { useWaterRenderer } from "./use-water-renderer";

type SimulationPreset = {
  id: string;
  name: string;
  description: string;
  config: Partial<WaterConfig>;
};

const INITIAL_CONFIG: WaterConfig = {
  particleCount: 100_000,
  gravity: 300,
  viscosity: 0.2,
  particleSize: 3,
  mouseForce: 5_000,
  colorMode: "depth",
};

const COLOR_MODES: Array<{
  id: WaterConfig["colorMode"];
  name: string;
  description: string;
}> = [
  {
    id: "depth",
    name: "Depth",
    description:
      "Gradient emphasis on vertical displacement for topography cues.",
  },
  {
    id: "velocity",
    name: "Velocity",
    description: "Energy visualization where hotter hues track faster motion.",
  },
  {
    id: "pressure",
    name: "Pressure",
    description: "Pressure differential overlay to reveal compression pockets.",
  },
];

const PRESETS: SimulationPreset[] = [
  {
    id: "balanced",
    name: "Balanced Lab",
    description: "Default mix tuned for responsive interaction and clarity.",
    config: {
      particleCount: 100_000,
      gravity: 300,
      viscosity: 0.2,
      particleSize: 3,
      mouseForce: 5_000,
      colorMode: "depth",
    },
  },
  {
    id: "glacier",
    name: "Glacier Flow",
    description: "Chilled, slow-moving water with viscous ribbons of motion.",
    config: {
      particleCount: 85_000,
      gravity: 200,
      viscosity: 0.45,
      particleSize: 3.5,
      mouseForce: 4_500,
      colorMode: "pressure",
    },
  },
  {
    id: "storm",
    name: "Storm Surge",
    description: "High-energy scenario with aggressive forces and streaks.",
    config: {
      particleCount: 220_000,
      gravity: 560,
      viscosity: 0.12,
      particleSize: 2.6,
      mouseForce: 11_000,
      colorMode: "velocity",
    },
  },
];

const INFO_TRANSITION = {
  type: "spring" as const,
  damping: 24,
  stiffness: 260,
};

const CONTROL_TRANSITION = {
  type: "spring" as const,
  damping: 28,
  stiffness: 300,
};

const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toString();
};

export function GpuWaterLab({ instanceId: _ }: { instanceId: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const canvasSize = useResponsiveCanvas(containerRef);

  const [config, setConfig] = useState<WaterConfig>(INITIAL_CONFIG);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>("balanced");

  const { initialized, error, stats, setMousePosition } = useWaterRenderer(
    canvasRef,
    config,
    canvasSize,
  );

  const handleConfigUpdate = useCallback((updates: Partial<WaterConfig>) => {
    setActivePreset(null);
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setActivePreset(presetId);
    setConfig((prev) => ({ ...prev, ...preset.config }));
  }, []);

  const handlePointerUpdate = useCallback(
    (x: number, y: number, active: boolean) => {
      setMousePosition(x, y, active);
    },
    [setMousePosition],
  );

  usePointerInteraction(canvasRef, {
    enabled: initialized,
    onChange: handlePointerUpdate,
  });

  const triggerSurfacePulse = useCallback(() => {
    if (!initialized) return;

    const { width, height } = canvasSize;
    if (!width || !height) return;

    const pulseX = width * 0.5;
    const pulseY = height * 0.35;

    setMousePosition(pulseX, pulseY, true);
    requestAnimationFrame(() => {
      setMousePosition(pulseX, pulseY, false);
    });
  }, [canvasSize, initialized, setMousePosition]);

  const surfaceSubtitle = useMemo(
    () =>
      `GPU-accelerated particle simulation with adaptive ${formatNumber(
        config.particleCount,
      )} particle core`,
    [config.particleCount],
  );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#0b0e11]">
      <AnimatePresence>
        {showInfo && <InfoBanner onDismiss={() => setShowInfo(false)} />}
      </AnimatePresence>

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
          <p className="text-xs text-white/45">{surfaceSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {initialized && <StatsPanel stats={stats} />}

          <Button
            size="sm"
            variant="ghost"
            onClick={triggerSurfacePulse}
            disabled={!initialized}
            className="gap-2 text-white/75 hover:bg-white/10 hover:text-white"
          >
            <Sparkles className="size-4" />
            Pulse Surface
          </Button>

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
              <SettingsPanel
                config={config}
                onConfigChange={handleConfigUpdate}
                onPresetSelect={handlePresetSelect}
                activePreset={activePreset}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

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

function InfoBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={INFO_TRANSITION}
      className="overflow-hidden border-b border-white/10 bg-white/5 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 ring-1 ring-sky-500/30">
            <Droplet className="size-4 text-sky-300" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">
              GPU Water Simulation
            </h3>
            <p className="text-xs leading-relaxed text-white/70">
              Real-time fluid dynamics powered by WebGPU compute shaders. Drag
              to sculpt wavefields, spike impulses, and watch a six-figure
              particle set obey pressure, viscosity, and gravity budgets in real
              time.
            </p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDismiss}
          className="size-7 shrink-0 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <Plus className="size-4 rotate-45" />
        </Button>
      </div>
    </motion.div>
  );
}

function StatsPanel({ stats }: { stats: RendererStats }) {
  const items = useMemo(
    () => [
      { label: "fps", value: stats.fps.toString() },
      { label: "frame", value: `${stats.frameTime.toFixed(1)} ms` },
      { label: "compute", value: `${stats.computeTime.toFixed(1)} ms` },
      { label: "render", value: `${stats.renderTime.toFixed(1)} ms` },
    ],
    [stats],
  );

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white/60 backdrop-blur-sm">
      {items.flatMap((item, index) => {
        const block = (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="text-white/80">{item.value}</span>
            <span className="text-white/40">{item.label}</span>
          </div>
        );

        if (index === items.length - 1) {
          return [block];
        }

        return [
          block,
          <div
            key={`${item.label}-separator`}
            className="h-3 w-px bg-white/15"
          />,
        ];
      })}
    </div>
  );
}

interface SettingsPanelProps {
  config: WaterConfig;
  onConfigChange: (updates: Partial<WaterConfig>) => void;
  onPresetSelect: (presetId: string) => void;
  activePreset: string | null;
}

function SettingsPanel({
  config,
  onConfigChange,
  onPresetSelect,
  activePreset,
}: SettingsPanelProps) {
  return (
    <div className="mt-6 space-y-6">
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.18rem] text-white/40">
          Quick Presets
        </div>
        <div className="space-y-2">
          {PRESETS.map((preset, index) => (
            <motion.button
              key={preset.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.05 }}
              type="button"
              onClick={() => onPresetSelect(preset.id)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-all",
                activePreset === preset.id
                  ? "border-white/30 bg-white/10 shadow-[0_0.5rem_1.5rem_rgba(12,14,18,0.45)]"
                  : "border-white/5 hover:border-white/15 hover:bg-white/5",
              )}
            >
              <div className="flex items-center justify-between text-sm font-medium text-white/90">
                <span>{preset.name}</span>
                {activePreset === preset.id && (
                  <span className="text-xs font-semibold uppercase tracking-[0.08rem] text-sky-300">
                    Active
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-white/60">{preset.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <SettingSlider
          label="Particle Count"
          value={config.particleCount}
          min={10_000}
          max={500_000}
          step={10_000}
          valueLabel={formatNumber(config.particleCount)}
          helperText="More particles increase fidelity at a GPU cost."
          delay={0.05}
          onValueChange={(value) => onConfigChange({ particleCount: value })}
        />
        <SettingSlider
          label="Gravity"
          value={config.gravity}
          min={0}
          max={1_000}
          step={10}
          valueLabel={`${config.gravity}`}
          delay={0.1}
          onValueChange={(value) => onConfigChange({ gravity: value })}
        />
        <SettingSlider
          label="Viscosity"
          value={config.viscosity}
          min={0}
          max={1}
          step={0.01}
          valueLabel={config.viscosity.toFixed(2)}
          helperText="Higher viscosity yields thicker, slower waveforms."
          delay={0.15}
          onValueChange={(value) => onConfigChange({ viscosity: value })}
        />
        <SettingSlider
          label="Particle Size"
          value={config.particleSize}
          min={1}
          max={10}
          step={0.5}
          valueLabel={config.particleSize.toFixed(1)}
          delay={0.2}
          onValueChange={(value) => onConfigChange({ particleSize: value })}
        />
        <SettingSlider
          label="Interaction Force"
          value={config.mouseForce}
          min={0}
          max={20_000}
          step={100}
          valueLabel={formatNumber(config.mouseForce)}
          helperText="Strength applied when interacting with the surface."
          delay={0.25}
          onValueChange={(value) => onConfigChange({ mouseForce: value })}
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-white/80">Color Mode</div>
        <div className="space-y-2">
          {COLOR_MODES.map((mode, index) => (
            <ColorModeOption
              key={mode.id}
              mode={mode}
              selected={config.colorMode === mode.id}
              delay={0.05 + index * 0.04}
              onSelect={() => onConfigChange({ colorMode: mode.id })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SettingSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  valueLabel?: string;
  helperText?: string;
  delay?: number;
  onValueChange: (value: number) => void;
}

function SettingSlider({
  label,
  value,
  min,
  max,
  step,
  valueLabel,
  helperText,
  delay = 0,
  onValueChange,
}: SettingSliderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...CONTROL_TRANSITION, delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-white/80">{label}</div>
        <span className="font-mono text-sm text-white/60">
          {valueLabel ?? value}
        </span>
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onValueChange}
        className="w-full"
      />
      {helperText ? (
        <p className="text-xs text-white/50">{helperText}</p>
      ) : null}
    </motion.div>
  );
}

interface ColorModeOptionProps {
  mode: {
    id: WaterConfig["colorMode"];
    name: string;
    description: string;
  };
  selected: boolean;
  delay: number;
  onSelect: () => void;
}

function ColorModeOption({
  mode,
  selected,
  delay,
  onSelect,
}: ColorModeOptionProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...CONTROL_TRANSITION, delay }}
      whileHover={{ scale: selected ? 1.02 : 1.01 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all",
        selected
          ? "border-white/30 bg-white/10 shadow-[0_0.5rem_1.5rem_rgba(12,14,18,0.45)]"
          : "border-white/5 hover:border-white/15 hover:bg-white/5",
      )}
    >
      <span className="text-sm font-medium text-white/90">{mode.name}</span>
      <span className="text-xs text-white/60">{mode.description}</span>
    </motion.button>
  );
}

function useResponsiveCanvas(
  containerRef: React.RefObject<HTMLDivElement | null>,
): SimulationBounds {
  const [size, setSize] = useState<SimulationBounds>({
    width: 800,
    height: 600,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const next = {
        width: Math.max(1, Math.floor(rect.width * dpr)),
        height: Math.max(1, Math.floor(rect.height * dpr)),
      };

      setSize((prev) =>
        prev.width === next.width && prev.height === next.height ? prev : next,
      );
    };

    updateSize();

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(container);

    const handleWindowResize = () => updateSize();
    window.addEventListener("resize", handleWindowResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [containerRef]);

  return size;
}

interface PointerInteractionOptions {
  enabled: boolean;
  onChange: (x: number, y: number, active: boolean) => void;
}

function usePointerInteraction(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  { enabled, onChange }: PointerInteractionOptions,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) {
      return;
    }

    let pointerActive = false;

    const toDeviceCoords = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
      const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;

      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    };

    const endInteraction = (event: PointerEvent) => {
      if (!pointerActive) {
        return;
      }
      pointerActive = false;
      onChange(0, 0, false);
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      pointerActive = true;
      canvas.setPointerCapture(event.pointerId);
      const { x, y } = toDeviceCoords(event);
      onChange(x, y, true);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerActive) {
        return;
      }
      if (event.buttons === 0 && event.pressure === 0) {
        endInteraction(event);
        return;
      }
      const { x, y } = toDeviceCoords(event);
      onChange(x, y, true);
    };

    const handlePointerUp = (event: PointerEvent) => {
      endInteraction(event);
    };

    const handlePointerCancel = (event: PointerEvent) => {
      endInteraction(event);
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerCancel);
    canvas.addEventListener("pointerleave", handlePointerCancel);

    return () => {
      pointerActive = false;
      onChange(0, 0, false);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerCancel);
      canvas.removeEventListener("pointerleave", handlePointerCancel);
    };
  }, [canvasRef, enabled, onChange]);
}
